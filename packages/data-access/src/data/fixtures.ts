import type { CenterId, Status, TransactionRecord } from '@workspace/domain';
import {
  activityDate,
  getService,
  type DemoDefinition,
  type ServiceCatalog,
} from '@workspace/domain';
export function createFixtures(
  centerId: CenterId,
  catalog: ServiceCatalog,
  demo: DemoDefinition,
): TransactionRecord[] {
  const employees = catalog.employees.map((e) => e.label);
  const p = demo;
  const states: Status[] = [
    'received',
    'processing',
    'waiting',
    'completed',
    'processing',
    'rejected',
  ];
  return Array.from({ length: 48 }, (_, i) => {
    const category = i % catalog.services.length,
      service = catalog.services[category],
      sample = demo.services.find((s) => s.id === service.id),
      id = String(1001 + i),
      name = p.names[i % p.names.length],
      status = states[(i + Math.floor(i / 6)) % 6];
    if (!sample) throw new Error(`Missing demo service: ${service.id}`);
    getService(catalog, service.id);
    const rich = i < 3;
    const received = `2026-10-${String(1 + (i % 6)).padStart(2, '0')}`;
    const arrivalAt = `${received}T08:${String(15 + (i % 40)).padStart(2, '0')}:00+03:00`;
    const reviewAt = `${received}T09:${String(10 + (i % 48)).padStart(2, '0')}:00+03:00`;
    return {
      id,
      centerId,
      serviceId: service.id,
      groupId: service.groupId,
      teamId: service.teamId,
      applicant: name,
      ownerId: i % 5 === 0 ? null : catalog.employees[i % catalog.employees.length].id,
      status,
      priority: i % 5 === 0 ? 'urgent' : 'normal',
      received,
      deadline: `2026-10-${String(4 + (i % 12)).padStart(2, '0')}`,
      stageId:
        status === 'completed'
          ? service.completedStageId
          : status === 'received'
            ? service.initialStageId
            : service.processingStageId,
      source: i % 3 === 0 ? 'واردة من حاضر' : 'طلب مباشر',
      people: [
        {
          id: `person-${id}`,
          name,
          kind: i % 8 === 1 ? 'شركة' : i % 8 === 3 ? 'جهة' : 'فرد',
          identifier: `${demo.identifierPrefix}${2001 + (i % p.names.length)}99`,
          phone: i % 7 === 0 ? undefined : '0935123456',
          lead: true,
        },
        ...(rich
          ? [
              {
                id: `representative-${id}`,
                name: sample.representative,
                kind: 'فرد' as const,
                identifier: `0130${id}66`,
                phone: '0944123456',
                lead: false,
              },
            ]
          : []),
      ],
      parties: rich
        ? [
            {
              id: `party-${id}`,
              name: sample.party,
              kind: 'جهة',
              identifier: `AG-${id}`,
            },
            {
              id: `party-${id}-2`,
              name: demo.secondParty.label,
              kind: 'جهة',
              identifier: `${demo.secondParty.id}-${id}-02`,
            },
          ]
        : [],
      serviceData: {
        values: sample.values.map((v) => ({
          ...v,
          value:
            v.value.kind === 'text' || v.value.kind === 'date' || v.value.kind === 'select'
              ? { ...v.value, value: v.value.value.replace('{id}', id) }
              : { ...v.value },
        })),
        requirements: service.documents.map((d) => ({
          id: d.id,
          provided: d.id === 'identity' || (d.id === 'request' ? i % 4 !== 2 : rich),
        })),
      },
      documents: rich
        ? [
            {
              id: `doc-${id}-1`,
              name: `استمارة الطلب الموقعة — ${name}.pdf`,
              size: '٢٤٠ ك.ب',
              type: 'PDF',
            },
            {
              id: `doc-${id}-2`,
              name: 'صورة الإثبات والمستندات الداعمة.pdf',
              size: '٤٨٠ ك.ب',
              type: 'PDF',
            },
          ]
        : [
            {
              id: `doc-${id}-1`,
              name: `طلب-${id}.pdf`,
              size: '١٢٠ ك.ب',
              type: 'PDF',
            },
          ],
      payments: [
        {
          id: `pay-${id}-1`,
          label: 'دفعة أولية',
          amount: sample.initialPayment,
          paid: i % 3 !== 2,
          method: 'نقدي تجريبي',
        },
        ...(rich
          ? [
              {
                id: `pay-${id}-2`,
                label: 'دفعة نهائية',
                amount: 10000,
                paid: status === 'completed',
                method: 'تحويل تجريبي',
              },
            ]
          : []),
      ],
      fees: [
        {
          id: 'service',
          label: service.label,
          amount: sample.fee,
        },
        { id: 'stamp', label: 'رسم طابع توضيحي', amount: 3000 },
      ],
      refunds:
        i === 1
          ? [
              {
                id: `refund-${id}`,
                amount: 2000,
                reason: 'فرق رسم سابق',
                approved: false,
              },
              {
                id: `refund-${id}-2`,
                amount: demo.approvedRefundAmount,
                reason: 'إعادة رسم نسخة إضافية لم تُطلب',
                approved: true,
              },
            ]
          : [],
      decisions: rich
        ? [
            {
              id: `decision-${id}`,
              text: sample.decision,
              authorId: catalog.employees[2 % catalog.employees.length].id,
            },
          ]
        : [],
      notes: rich
        ? [
            {
              id: `note-${id}`,
              text: 'يرجى مراجعة البيانات مع مقدم الطلب قبل متابعة المعالجة.',
              authorId: catalog.currentEmployeeId,
              resolved: false,
            },
          ]
        : [],
      activity: [
        {
          id: `event-${id}-2`,
          title: 'مراجعة أولية للبيانات',
          date: activityDate(reviewAt),
          occurredAt: reviewAt,
          detail: employees[i % employees.length],
          kind: 'edit',
          actorId: catalog.employees[i % catalog.employees.length].id,
        },
        {
          id: `event-${id}-1`,
          title: 'ورود المعاملة إلى المركز',
          date: activityDate(arrivalAt),
          occurredAt: arrivalAt,
          detail: i % 3 === 0 ? 'واردة من حاضر' : 'طلب مباشر',
          kind: 'system',
          actorId: 'system',
        },
      ],
    } satisfies TransactionRecord;
  });
}
