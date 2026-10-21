import { z } from 'zod';
import type { TransactionRecord } from './model';
import { getService, uniqueIds, validateValues, type ServiceCatalog } from './services';

const id = z.string().min(1);
const money = z.number().finite().nonnegative();
const person = z.object({
  id,
  name: id,
  kind: z.enum(['فرد', 'شركة', 'جهة']),
  identifier: id,
  phone: z.string().optional(),
  lead: z.boolean().optional(),
});
const submitted = z.object({
  id,
  value: z.discriminatedUnion('kind', [
    z.object({ kind: z.enum(['text', 'date', 'select']), value: z.string() }),
    z.object({ kind: z.literal('number'), value: z.number().finite() }),
    z.object({ kind: z.literal('boolean'), value: z.boolean() }),
  ]),
});
const calendarDate = z.iso.date();
const schema: z.ZodType<TransactionRecord> = z.object({
  id,
  centerId: id,
  serviceId: id,
  groupId: id,
  teamId: id,
  ownerId: id.nullable(),
  stageId: id,
  applicant: id,
  status: z.enum(['received', 'processing', 'waiting', 'completed', 'rejected']),
  priority: z.enum(['normal', 'urgent']),
  received: calendarDate,
  deadline: calendarDate,
  source: id,
  serviceData: z.object({
    values: z.array(submitted),
    requirements: z.array(z.object({ id, provided: z.boolean() })),
  }),
  people: z.array(person),
  parties: z.array(person),
  documents: z.array(z.object({ id, name: id, size: id, type: id })),
  payments: z.array(z.object({ id, label: id, amount: money, paid: z.boolean(), method: id })),
  fees: z.array(z.object({ id, label: id, amount: money })),
  refunds: z.array(z.object({ id, amount: money, reason: id, approved: z.boolean() })),
  decisions: z.array(z.object({ id, text: id, authorId: id })),
  notes: z.array(z.object({ id, text: id, authorId: id, resolved: z.boolean() })),
  activity: z.array(
    z.object({
      id,
      title: id,
      date: id,
      occurredAt: id.refine((value) => Number.isFinite(Date.parse(value))),
      detail: z.string().optional(),
      kind: z.enum(['system', 'edit', 'transfer']),
      actorId: id,
    }),
  ),
});
export function validateRecord(
  input: unknown,
  centerId: string,
  catalog: ServiceCatalog,
): TransactionRecord {
  const record = schema.parse(input);
  if (record.centerId !== centerId) throw new Error('السجل يتبع مركزاً آخر');
  const service = getService(catalog, record.serviceId);
  if (
    service.groupId !== record.groupId ||
    service.teamId !== record.teamId ||
    !service.stages.some((s) => s.id === record.stageId) ||
    (record.ownerId && !catalog.employees.some((e) => e.id === record.ownerId))
  )
    throw new Error('Invalid transaction references');
  for (const authorId of [
    ...record.notes.map((n) => n.authorId),
    ...record.decisions.map((d) => d.authorId),
    ...record.activity.filter((a) => a.actorId !== 'system').map((a) => a.actorId),
  ])
    if (!catalog.employees.some((e) => e.id === authorId))
      throw new Error('Unknown transaction employee');
  validateValues(service, record.serviceData.values);
  uniqueIds(record.serviceData.requirements, 'requirements');
  if (record.serviceData.requirements.some((r) => !service.documents.some((d) => d.id === r.id)))
    throw new Error('Unknown document requirement');
  for (const [name, items] of Object.entries({
    people: record.people,
    parties: record.parties,
    documents: record.documents,
    payments: record.payments,
    fees: record.fees,
    refunds: record.refunds,
    decisions: record.decisions,
    notes: record.notes,
    activity: record.activity,
  })) {
    if (new Set(items.map((i) => i.id)).size !== items.length)
      throw new Error(`Duplicate record ${name}`);
  }
  return record;
}
