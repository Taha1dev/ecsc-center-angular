import type { ActionId, SectionId, Status } from './model';

export type NamedEntity = { id: string; label: string };
export type FieldDefinition = NamedEntity &
  (
    | { kind: 'text' | 'number' | 'boolean' | 'date'; required?: boolean }
    | { kind: 'select'; required?: boolean; options: NamedEntity[] }
  );
export type FieldValue =
  | { kind: 'text' | 'date' | 'select'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean };
export type Submission = { id: string; value: FieldValue };
export type ServiceDefinition = NamedEntity & {
  groupId: string;
  teamId: string;
  fields: FieldDefinition[];
  documents: (NamedEntity & { optional: boolean })[];
  sections: SectionId[];
  actions: ActionId[];
  stages: NamedEntity[];
  initialStageId: string;
  processingStageId: string;
  completedStageId: string;
  transitions: { from: Status; to: Status[] }[];
};
export type ServiceCatalog = {
  groups: NamedEntity[];
  teams: NamedEntity[];
  employees: NamedEntity[];
  currentEmployeeId: string;
  services: ServiceDefinition[];
};
export type DashboardSnapshot = {
  total: number;
  month: number;
  year: number;
  active: number;
  users: number;
  registrations: number;
};
export type DemoDefinition = {
  names: string[];
  identifierPrefix: string;
  secondParty: NamedEntity;
  approvedRefundAmount: number;
  snapshot: DashboardSnapshot;
  accountOffset: number;
  services: {
    id: string;
    values: Submission[];
    representative: string;
    party: string;
    decision: string;
    initialPayment: number;
    fee: number;
  }[];
};

export function identifier(value: string): string {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(value)) throw new Error(`Invalid identifier: ${value}`);
  return value;
}
export function uniqueIds(items: { id: string }[], name: string) {
  const ids = new Set<string>();
  for (const item of items) {
    identifier(item.id);
    if (ids.has(item.id)) throw new Error(`Duplicate ${name}: ${item.id}`);
    ids.add(item.id);
  }
}
export function getService(catalog: ServiceCatalog, id: string) {
  const service = catalog.services.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}
export function validateCatalog(catalog: ServiceCatalog) {
  for (const [name, items] of Object.entries({
    groups: catalog.groups,
    teams: catalog.teams,
    employees: catalog.employees,
    services: catalog.services,
  }))
    uniqueIds(items, name);
  if (
    !catalog.services.length ||
    !catalog.employees.length ||
    !catalog.employees.some((e) => e.id === catalog.currentEmployeeId)
  )
    throw new Error('Services and a current employee are required');
  for (const service of catalog.services) {
    if (
      !catalog.groups.some((g) => g.id === service.groupId) ||
      !catalog.teams.some((t) => t.id === service.teamId)
    )
      throw new Error(`Invalid service references: ${service.id}`);
    uniqueIds(service.fields, 'fields');
    uniqueIds(service.documents, 'documents');
    uniqueIds(service.stages, 'stages');
    for (const stage of [
      service.initialStageId,
      service.processingStageId,
      service.completedStageId,
    ])
      if (!service.stages.some((s) => s.id === stage)) throw new Error(`Unknown stage: ${stage}`);
    if (
      new Set(service.sections).size !== service.sections.length ||
      new Set(service.actions).size !== service.actions.length
    )
      throw new Error('Duplicate service sections/actions');
    for (const field of service.fields)
      if (field.kind === 'select') uniqueIds(field.options, 'options');
  }
}
export function validateValues(service: ServiceDefinition, values: Submission[]) {
  uniqueIds(values, 'values');
  for (const submitted of values) {
    const field = service.fields.find((f) => f.id === submitted.id);
    if (!field || field.kind !== submitted.value.kind)
      throw new Error('الحقل غير موجود أو نوع القيمة غير صالح');
    const value = submitted.value.value;
    if (field.kind === 'number' && (typeof value !== 'number' || !Number.isFinite(value)))
      throw new Error('أدخل قيمة رقمية صالحة');
    if (field.kind === 'boolean' && typeof value !== 'boolean') throw new Error('اختر نعم أو لا');
    if (['text', 'date', 'select'].includes(field.kind) && typeof value !== 'string')
      throw new Error('أدخل قيمة نصية صالحة');
    if (field.required && ((typeof value === 'string' && !value.trim()) || value === undefined))
      throw new Error(`يرجى إدخال ${field.label}`);
    if (
      field.kind === 'date' &&
      (typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        new Date(value).toISOString().slice(0, 10) !== value)
    )
      throw new Error('أدخل تاريخاً صالحاً');
    if (field.kind === 'select' && !field.options.some((o) => o.id === value))
      throw new Error('اختر قيمة من الخيارات المتاحة');
  }
  for (const field of service.fields)
    if (field.required && !values.some((v) => v.id === field.id))
      throw new Error(`يرجى إدخال ${field.label}`);
}
export function parseFieldValue(field: FieldDefinition, input: string): FieldValue {
  switch (field.kind) {
    case 'number':
      return { kind: 'number', value: input.trim() ? Number(input) : NaN };
    case 'boolean':
      if (input !== 'true' && input !== 'false') throw new Error('اختر نعم أو لا');
      return { kind: 'boolean', value: input === 'true' };
    default:
      return { kind: field.kind, value: input };
  }
}
