import { standardWorkflow, type DemoDefinition, type ServiceCatalog } from '@workspace/domain';
export const catalog: ServiceCatalog = {
  groups: [
    {
      id: 'agency-group',
      label: 'خدمات الوكالات',
    },
    {
      id: 'vehicle-group',
      label: 'خدمات المركبات',
    },
    {
      id: 'entry-group',
      label: 'تصاريح الدخول',
    },
  ],
  teams: [
    {
      id: 'agency-team',
      label: 'فريق الاستقبال',
    },
    {
      id: 'vehicle-team',
      label: 'فريق الخدمات',
    },
    {
      id: 'entry-team',
      label: 'فريق التدقيق',
    },
  ],
  employees: [
    {
      id: 'employee-1',
      label: 'ليلى أحمد',
    },
    {
      id: 'employee-2',
      label: 'سامر الحسن',
    },
    {
      id: 'employee-3',
      label: 'نور الخطيب',
    },
    {
      id: 'employee-4',
      label: 'رامي مراد',
    },
  ],
  currentEmployeeId: 'employee-1',
  services: [
    {
      ...{
        id: 'agency',
        label: 'استعلام وكالة',
        groupId: 'agency-group',
        teamId: 'agency-team',
        fields: [
          {
            id: 'field-0',
            label: 'رقم الوكالة',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-1',
            label: 'كاتب العدل',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-2',
            label: 'تاريخ الوكالة',
            kind: 'date',
            required: true,
          },
        ],
        documents: [
          {
            id: 'identity',
            label: 'صورة الهوية أو سجل الشركة',
            optional: false,
          },
          {
            id: 'request',
            label: 'استمارة الطلب الموقعة',
            optional: false,
          },
          {
            id: 'authorization',
            label: 'تفويض مقدم الطلب',
            optional: false,
          },
        ],
      },
      ...standardWorkflow,
    },
    {
      ...{
        id: 'vehicle',
        label: 'خدمة مركبة',
        groupId: 'vehicle-group',
        teamId: 'vehicle-team',
        fields: [
          {
            id: 'field-0',
            label: 'رقم اللوحة',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-1',
            label: 'نوع المركبة',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-2',
            label: 'سنة الصنع',
            kind: 'number',
            required: true,
          },
        ],
        documents: [
          {
            id: 'identity',
            label: 'صورة الهوية أو سجل الشركة',
            optional: false,
          },
          {
            id: 'request',
            label: 'استمارة الطلب الموقعة',
            optional: false,
          },
          {
            id: 'authorization',
            label: 'وثيقة الملكية الأصلية',
            optional: false,
          },
        ],
      },
      ...standardWorkflow,
    },
    {
      ...{
        id: 'entry',
        label: 'تصريح دخول',
        groupId: 'entry-group',
        teamId: 'entry-team',
        fields: [
          {
            id: 'field-0',
            label: 'منفذ الدخول',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-1',
            label: 'الغرض من الزيارة',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-2',
            label: 'تاريخ الدخول',
            kind: 'date',
            required: true,
          },
        ],
        documents: [
          {
            id: 'identity',
            label: 'صورة الهوية أو سجل الشركة',
            optional: false,
          },
          {
            id: 'request',
            label: 'استمارة الطلب الموقعة',
            optional: false,
          },
          {
            id: 'authorization',
            label: 'تفويض مقدم الطلب',
            optional: true,
          },
        ],
      },
      ...standardWorkflow,
    },
  ],
};
export const demo: DemoDefinition = {
  names: [
    'محمد عبد الرحمن العلي',
    'شركة الشام للخدمات المحدودة',
    'هبة مصطفى النجار',
    'مؤسسة الأفق للتجارة',
    'ياسر نادر الصالح',
    'سارة عبد الله الخطيب',
    'أحمد وليد عثمان',
    'ريم فؤاد الحسن',
  ],
  identifierPrefix: '0124',
  secondParty: {
    id: 'SC',
    label: 'مكتب خدمات المراجعين',
  },
  approvedRefundAmount: 1000,
  snapshot: {
    total: 18462,
    month: 824,
    year: 7240,
    active: 126,
    users: 284,
    registrations: 12,
  },
  accountOffset: 3,
  services: [
    {
      id: 'agency',
      values: [
        {
          id: 'field-0',
          value: {
            kind: 'text',
            value: '2026/{id}',
          },
        },
        {
          id: 'field-1',
          value: {
            kind: 'text',
            value: 'دمشق · الكاتب بالعدل الأول',
          },
        },
        {
          id: 'field-2',
          value: {
            kind: 'date',
            value: '2026-09-28',
          },
        },
      ],
      representative: 'نورا عبد الكريم حسن',
      party: 'وكالة العدلية المركزية',
      decision: 'تمت المطابقة الأولية، يُستكمل التدقيق وفق الوثائق المرفقة.',
      initialPayment: 15000,
      fee: 25000,
    },
    {
      id: 'vehicle',
      values: [
        {
          id: 'field-0',
          value: {
            kind: 'text',
            value: 'دمشق {id}',
          },
        },
        {
          id: 'field-1',
          value: {
            kind: 'text',
            value: 'سيارة خاصة',
          },
        },
        {
          id: 'field-2',
          value: {
            kind: 'number',
            value: 2021.0,
          },
        },
      ],
      representative: 'مازن فؤاد السالم',
      party: 'مكتب التوثيق والمطابقة',
      decision: 'تُراجع وثيقة الملكية الأصلية قبل إصدار المخرج النهائي.',
      initialPayment: 20000,
      fee: 30000,
    },
    {
      id: 'entry',
      values: [
        {
          id: 'field-0',
          value: {
            kind: 'text',
            value: 'مطار دمشق الدولي',
          },
        },
        {
          id: 'field-1',
          value: {
            kind: 'text',
            value: 'زيارة عمل',
          },
        },
        {
          id: 'field-2',
          value: {
            kind: 'date',
            value: '2026-10-08',
          },
        },
      ],
      representative: 'نورا عبد الكريم حسن',
      party: 'الجهة المختصة بالتدقيق',
      decision: 'تمت المطابقة الأولية، يُستكمل التدقيق وفق الوثائق المرفقة.',
      initialPayment: 25000,
      fee: 35000,
    },
  ],
};
