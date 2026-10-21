import type { TransactionRecord } from '../domain/model';
import { getService, type ServiceCatalog } from '../domain/services';
import type { Transaction } from '../types/presentation';
export function presentTransaction(
  record: TransactionRecord,
  catalog: ServiceCatalog,
): Transaction {
  const service = getService(catalog, record.serviceId);
  const employeeName = (id: string) =>
    catalog.employees.find((e) => e.id === id)?.label ?? 'غير متوفر';
  return {
    ...record,
    notes: record.notes.map((n) => ({
      ...n,
      author: employeeName(n.authorId),
    })),
    decisions: record.decisions.map((d) => ({
      ...d,
      author: employeeName(d.authorId),
    })),
    activity: record.activity.map((a) => ({
      ...a,
      actor: a.actorId === 'system' ? 'النظام' : employeeName(a.actorId),
    })),
    type: service.label,
    group: catalog.groups.find((g) => g.id === record.groupId)?.label ?? '',
    team: catalog.teams.find((t) => t.id === record.teamId)?.label ?? '',
    owner: catalog.employees.find((e) => e.id === record.ownerId)?.label ?? '',
    step: service.stages.find((s) => s.id === record.stageId)?.label ?? '',
    fields: service.fields.map((f) => {
      const value = record.serviceData.values.find((v) => v.id === f.id)?.value;
      return {
        id: f.id,
        label: f.label,
        kind: f.kind,
        value:
          value?.kind === 'boolean' ? (value.value ? 'نعم' : 'لا') : String(value?.value ?? ''),
      };
    }),
    requirements: service.documents.map((d) => ({
      id: d.id,
      label: d.label,
      optional: d.optional,
      provided: record.serviceData.requirements.find((r) => r.id === d.id)?.provided ?? false,
    })),
  };
}
