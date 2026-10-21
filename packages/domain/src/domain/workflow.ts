import type { ActionId, Person, Status, TransactionRecord } from './model';
import { getService, parseFieldValue, validateValues, type ServiceCatalog } from './services';

export const lifecycle: Status[] = ['received', 'processing', 'waiting', 'completed', 'rejected'];
export const defaultSectionIds = [
  'overview',
  'applicants',
  'parties',
  'fields',
  'requirements',
  'attachments',
  'payments',
  'fees',
  'refunds',
  'decisions',
  'actions',
  'notes',
  'activity',
  'output',
];
export const defaultActionIds: ActionId[] = [
  'claim',
  'status',
  'completion',
  'transfer',
  'applicant',
  'field',
  'document',
  'payment',
  'fee',
  'refund',
  'decision',
  'note',
  'print',
  'activity',
];
export const standardWorkflow = {
  sections: defaultSectionIds,
  actions: defaultActionIds,
  stages: [
    { id: 'received', label: 'الاستقبال' },
    { id: 'review', label: 'تدقيق البيانات' },
    { id: 'processing', label: 'المعالجة' },
    { id: 'delivery', label: 'التسليم' },
  ],
  initialStageId: 'received',
  processingStageId: 'review',
  completedStageId: 'delivery',
  // The demo previously allowed all lifecycle choices. No financial prerequisites are inferred.
  transitions: lifecycle.map((from) => ({ from, to: [...lifecycle] })),
};
export type Capabilities = {
  disabledActions?: ActionId[];
  actionRules?: Partial<Record<ActionId, (record: TransactionRecord) => Availability>>;
};
export type Availability = {
  visible: boolean;
  enabled: boolean;
  reason?: string;
};
function defaultAvailability(
  action: ActionId,
  record: TransactionRecord,
  catalog: ServiceCatalog,
  capabilities: Capabilities = {},
): Availability {
  const service = getService(catalog, record.serviceId);
  if (!service.actions.includes(action) || capabilities.disabledActions?.includes(action))
    return {
      visible: false,
      enabled: false,
      reason: 'الإجراء غير متاح في هذه الخدمة',
    };
  switch (action) {
    case 'claim':
      return {
        visible: !record.ownerId,
        enabled: !record.ownerId && record.status !== 'completed' && record.status !== 'rejected',
        reason: record.ownerId ? 'المعاملة مستلمة بالفعل' : 'لا يمكن استلام معاملة مغلقة',
      };
    case 'status':
      return {
        visible: !!record.ownerId,
        enabled: !!record.ownerId,
        reason: 'استلم المعاملة أولاً',
      };
    case 'transfer':
      return {
        visible: true,
        enabled: record.status !== 'completed',
        reason: 'المعاملة المنجزة لا تقبل التحويل',
      };
    case 'completion':
      return {
        visible: record.status !== 'rejected',
        enabled: record.status !== 'completed' && record.status !== 'rejected',
        reason: 'المعاملة منجزة أو مرفوضة',
      };
    case 'payment':
      return {
        visible: record.fees.length > 0,
        enabled: record.status !== 'rejected' && record.fees.length > 0,
        reason: 'المعاملة مرفوضة أو لا تتضمن رسوماً',
      };
    default:
      return { visible: true, enabled: true };
  }
}
export function availability(
  action: ActionId,
  record: TransactionRecord,
  catalog: ServiceCatalog,
  capabilities: Capabilities = {},
): Availability {
  const base = defaultAvailability(action, record, catalog, capabilities);
  const custom = capabilities.actionRules?.[action]?.(record);
  return custom
    ? {
        visible: base.visible && custom.visible,
        enabled: base.enabled && custom.enabled,
        reason: !base.enabled ? base.reason : custom.reason,
      }
    : base;
}
export function allowedTransitions(record: TransactionRecord, catalog: ServiceCatalog) {
  return (
    getService(catalog, record.serviceId).transitions.find((t) => t.from === record.status)?.to ??
    []
  );
}
export type TransactionCommand =
  | { type: 'claim' }
  | { type: 'status'; status: Status }
  | { type: 'transfer'; employeeId: string }
  | { type: 'completion'; text: string }
  | { type: 'applicant'; person: Person }
  | { type: 'field'; fieldId: string; input: string }
  | {
      type: 'document';
      document: TransactionRecord['documents'][number];
      requirementId?: string;
    }
  | { type: 'payment'; payment: TransactionRecord['payments'][number] }
  | { type: 'toggle-payment'; paymentId: string }
  | { type: 'fee'; feeId: string; amount: number }
  | { type: 'refund'; amount: number; reason: string }
  | { type: 'decision'; text: string }
  | { type: 'note'; text: string; noteId?: string }
  | { type: 'resolve-note'; noteId: string };
export const commandAction = (command: TransactionCommand): ActionId =>
  command.type === 'toggle-payment'
    ? 'payment'
    : command.type === 'resolve-note'
      ? 'note'
      : command.type;
export const commandLabels: Record<TransactionCommand['type'], string> = {
  claim: 'استلام المعاملة',
  status: 'تحديث الحالة',
  transfer: 'تحويل المعاملة',
  completion: 'طلب استكمال',
  applicant: 'بيانات مقدم الطلب',
  field: 'تعديل حقول المعاملة',
  document: 'إضافة مرفق محلي',
  payment: 'إدارة الدفعة',
  'toggle-payment': 'تأكيد حالة الدفعة',
  fee: 'تعديل رسم توضيحي',
  refund: 'إنشاء مبلغ معاد',
  decision: 'تسجيل قرار',
  note: 'ملاحظة داخلية',
  'resolve-note': 'تحديث حل الملاحظة',
};
function required(text: string) {
  if (!text.trim()) throw new Error('هذا الحقل مطلوب');
}
function positive(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('أدخل مبلغاً موجباً صالحاً');
}
function exists(items: { id: string }[], id: string) {
  if (!items.some((i) => i.id === id)) throw new Error('السجل المطلوب غير موجود');
}
export function applyCommand(
  record: TransactionRecord,
  command: TransactionCommand,
  catalog: ServiceCatalog,
  occurredAt: string,
  capabilities: Capabilities = {},
): TransactionRecord {
  const available = availability(commandAction(command), record, catalog, capabilities);
  if (!available.enabled || !available.visible)
    throw new Error(available.reason ?? 'الإجراء غير متاح');
  const employee = catalog.employees.find((e) => e.id === catalog.currentEmployeeId);
  if (!employee) throw new Error('Invalid current employee');
  const serial = (prefix: string, length: number) => `${prefix}-${record.id}-local-${length + 1}`;
  const service = getService(catalog, record.serviceId);
  let result = record;
  switch (command.type) {
    case 'claim':
      result = {
        ...record,
        ownerId: employee.id,
        status: 'processing',
        stageId: service.processingStageId,
      };
      break;
    case 'status':
      if (!allowedTransitions(record, catalog).includes(command.status))
        throw new Error('الانتقال المطلوب غير متاح');
      result = {
        ...record,
        status: command.status,
        stageId:
          command.status === 'completed' ? service.completedStageId : service.processingStageId,
      };
      break;
    case 'transfer':
      exists(catalog.employees, command.employeeId);
      result = { ...record, ownerId: command.employeeId };
      break;
    case 'completion':
      required(command.text);
      result = {
        ...record,
        status: 'waiting',
        notes: [
          ...record.notes,
          {
            id: serial('note', record.notes.length),
            text: `طلب استكمال: ${command.text}`,
            authorId: employee.id,
            resolved: false,
          },
        ],
      };
      break;
    case 'applicant': {
      required(command.person.name);
      required(command.person.identifier);
      if (!['فرد', 'شركة', 'جهة'].includes(command.person.kind))
        throw new Error('نوع مقدم الطلب غير صالح');
      const original = record.people.find((p) => p.id === command.person.id);
      const person = { ...command.person, lead: original?.lead ?? false };
      result = {
        ...record,
        applicant: original?.lead ? person.name : record.applicant,
        people: original
          ? record.people.map((p) => (p.id === person.id ? person : p))
          : [...record.people, person],
      };
      break;
    }
    case 'field': {
      const field = service.fields.find((f) => f.id === command.fieldId);
      if (!field) throw new Error('الحقل غير موجود');
      const values = [
        ...record.serviceData.values.filter((v) => v.id !== field.id),
        { id: field.id, value: parseFieldValue(field, command.input) },
      ];
      validateValues(service, values);
      result = { ...record, serviceData: { ...record.serviceData, values } };
      break;
    }
    case 'document':
      required(command.document.name);
      if (command.requirementId) exists(service.documents, command.requirementId);
      result = {
        ...record,
        documents: [...record.documents, command.document],
        serviceData: {
          ...record.serviceData,
          requirements: record.serviceData.requirements.map((r) =>
            r.id === command.requirementId ? { ...r, provided: true } : r,
          ),
        },
      };
      break;
    case 'payment':
      positive(command.payment.amount);
      required(command.payment.label);
      result = { ...record, payments: [...record.payments, command.payment] };
      break;
    case 'toggle-payment':
      exists(record.payments, command.paymentId);
      result = {
        ...record,
        payments: record.payments.map((p) =>
          p.id === command.paymentId ? { ...p, paid: !p.paid } : p,
        ),
      };
      break;
    case 'fee':
      positive(command.amount);
      exists(record.fees, command.feeId);
      result = {
        ...record,
        fees: record.fees.map((f) =>
          f.id === command.feeId ? { ...f, amount: command.amount } : f,
        ),
      };
      break;
    case 'refund':
      positive(command.amount);
      required(command.reason);
      result = {
        ...record,
        refunds: [
          ...record.refunds,
          {
            id: serial('refund', record.refunds.length),
            amount: command.amount,
            reason: command.reason,
            approved: false,
          },
        ],
      };
      break;
    case 'decision':
      required(command.text);
      result = {
        ...record,
        decisions: [
          ...record.decisions,
          {
            id: serial('decision', record.decisions.length),
            text: command.text,
            authorId: employee.id,
          },
        ],
      };
      break;
    case 'note':
      required(command.text);
      if (command.noteId) exists(record.notes, command.noteId);
      result = {
        ...record,
        notes: command.noteId
          ? record.notes.map((n) => (n.id === command.noteId ? { ...n, text: command.text } : n))
          : [
              ...record.notes,
              {
                id: serial('note', record.notes.length),
                text: command.text,
                authorId: employee.id,
                resolved: false,
              },
            ],
      };
      break;
    case 'resolve-note':
      exists(record.notes, command.noteId);
      result = {
        ...record,
        notes: record.notes.map((n) =>
          n.id === command.noteId ? { ...n, resolved: !n.resolved } : n,
        ),
      };
      break;
  }
  const date = new Intl.DateTimeFormat('ar-SY', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Damascus',
  }).format(new Date(occurredAt));
  return {
    ...result,
    activity: [
      {
        id: serial('event', record.activity.length),
        title: commandLabels[command.type],
        date: `${date} · جلسة تجريبية`,
        occurredAt,
        actorId: employee.id,
        kind: command.type === 'transfer' ? 'transfer' : 'edit',
      },
      ...record.activity,
    ],
  };
}
