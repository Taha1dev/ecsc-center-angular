import { standardWorkflow, type DemoDefinition, type ServiceCatalog } from '@workspace/domain';

// Demonstration catalog only: replace with the center's approved services and rules.
export const catalog: ServiceCatalog = {
  groups: [{ id: 'general-group', label: 'خدمات تجريبية' }],
  teams: [{ id: 'reception-team', label: 'فريق الاستقبال التجريبي' }],
  employees: [
    { id: 'employee-1', label: 'ليلى أحمد' },
    { id: 'employee-2', label: 'سامر الحسن' },
    { id: 'employee-3', label: 'نور الخطيب' },
  ],
  currentEmployeeId: 'employee-1',
  services: [
    {
      ...standardWorkflow,
      id: 'sample-request',
      label: 'طلب تجريبي',
      groupId: 'general-group',
      teamId: 'reception-team',
      fields: [
        { id: 'reference', label: 'المرجع', kind: 'text', required: true },
        { id: 'request-date', label: 'تاريخ الطلب', kind: 'date', required: true },
      ],
      documents: [
        { id: 'identity', label: 'إثبات الهوية التجريبي', optional: false },
        { id: 'request', label: 'استمارة الطلب التجريبية', optional: false },
      ],
    },
  ],
};

export const demo: DemoDefinition = {
  names: ['عمر عبد الكريم الدرويش', 'هبة مصطفى النجار', 'سامر عادل حمود'],
  identifierPrefix: '0100',
  secondParty: { id: 'sample-office', label: 'جهة تجريبية' },
  approvedRefundAmount: 1000,
  snapshot: { total: 48, month: 48, year: 48, active: 3, users: 3, registrations: 1 },
  accountOffset: 0,
  services: [
    {
      id: 'sample-request',
      values: [
        { id: 'reference', value: { kind: 'text', value: 'طلب-{id}' } },
        { id: 'request-date', value: { kind: 'date', value: '2026-10-01' } },
      ],
      representative: 'نورا عبد الكريم حسن',
      party: 'جهة تجريبية',
      decision: 'قرار توضيحي للعرض التجريبي فقط.',
      initialPayment: 10000,
      fee: 15000,
    },
  ],
};
