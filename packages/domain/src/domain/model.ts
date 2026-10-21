export type CenterId = string;
export type Status = 'received' | 'processing' | 'waiting' | 'completed' | 'rejected';
export type Person = {
  id: string;
  name: string;
  kind: 'فرد' | 'شركة' | 'جهة';
  identifier: string;
  phone?: string;
  lead?: boolean;
};
export type Payment = {
  id: string;
  label: string;
  amount: number;
  paid: boolean;
  method: string;
};
export type Document = { id: string; name: string; size: string; type: string };
export type Note = {
  id: string;
  text: string;
  authorId: string;
  resolved: boolean;
};
export type Activity = {
  id: string;
  title: string;
  date: string;
  occurredAt: string;
  detail?: string;
  kind: 'system' | 'edit' | 'transfer';
  actorId: string;
};
export type TransactionRecord = {
  serviceId: string;
  groupId: string;
  teamId: string;
  ownerId: string | null;
  stageId: string;
  serviceData: {
    values: import('./services').Submission[];
    requirements: { id: string; provided: boolean }[];
  };
  id: string;
  centerId: CenterId;
  applicant: string;
  status: Status;
  priority: 'normal' | 'urgent';
  received: string;
  deadline: string;
  source: string;
  people: Person[];
  parties: Person[];
  documents: Document[];
  payments: Payment[];
  fees: { id: string; label: string; amount: number }[];
  refunds: { id: string; amount: number; reason: string; approved: boolean }[];
  decisions: { id: string; text: string; authorId: string }[];
  notes: Note[];
  activity: Activity[];
};
type BaseFilter = {
  id: string;
  label: string;
  required?: boolean;
  dependency?: string;
};
export type FilterField =
  | (BaseFilter & { kind: 'text' | 'date' | 'boolean'; placeholder?: string })
  | (BaseFilter & {
      kind: 'select' | 'multiselect';
      options: { value: string; label: string }[];
    })
  | (BaseFilter & { kind: 'date-range' });
export type ActionId =
  | 'claim'
  | 'status'
  | 'completion'
  | 'transfer'
  | 'applicant'
  | 'field'
  | 'document'
  | 'payment'
  | 'fee'
  | 'refund'
  | 'decision'
  | 'note'
  | 'print'
  | 'activity';
export type SectionId = string;
export type BuiltinSectionId =
  | 'overview'
  | 'applicants'
  | 'parties'
  | 'fields'
  | 'requirements'
  | 'attachments'
  | 'payments'
  | 'fees'
  | 'refunds'
  | 'decisions'
  | 'actions'
  | 'notes'
  | 'activity'
  | 'output';
export type TransactionSectionDefinition = {
  id: SectionId;
  title: string;
  group: string;
  view: 'summary' | 'cards' | 'fields' | 'checklist' | 'table' | 'timeline';
  actions: ActionId[];
};
export type ReportDefinition = {
  id: string;
  title: string;
  category: string;
  description: string;
  aliases: string[];
  parameters: FilterField[];
  preview: 'transactions' | 'fees' | 'people';
  example?: 'empty' | 'error';
  criteria?: { overdue?: boolean; status?: Status };
};
