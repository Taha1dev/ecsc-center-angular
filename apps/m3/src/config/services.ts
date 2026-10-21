import { standardWorkflow, type DemoDefinition, type ServiceCatalog } from '@workspace/domain';
export const catalog: ServiceCatalog = {
  groups: [
    {
      id: 'registry-group',
      label: 'السجل العقاري',
    },
    {
      id: 'ownership-group',
      label: 'نقل الملكية',
    },
    {
      id: 'property-group',
      label: 'البيانات العقارية',
    },
  ],
  teams: [
    {
      id: 'registry-team',
      label: 'فريق السجل',
    },
    {
      id: 'ownership-team',
      label: 'فريق الملكية',
    },
    {
      id: 'property-team',
      label: 'فريق المطابقة',
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
        id: 'registry',
        label: 'إخراج قيد عقاري',
        groupId: 'registry-group',
        teamId: 'registry-team',
        fields: [
          {
            id: 'field-0',
            label: 'رقم العقار',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-1',
            label: 'المنطقة العقارية',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-2',
            label: 'رقم الصحيفة',
            kind: 'text',
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
        id: 'ownership',
        label: 'نقل ملكية عقار',
        groupId: 'ownership-group',
        teamId: 'ownership-team',
        fields: [
          {
            id: 'field-0',
            label: 'رقم العقد',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-1',
            label: 'حصة الملكية',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-2',
            label: 'تاريخ العقد',
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
            label: 'وثيقة الملكية الأصلية',
            optional: false,
          },
        ],
      },
      ...standardWorkflow,
    },
    {
      ...{
        id: 'property',
        label: 'بيان عقاري',
        groupId: 'property-group',
        teamId: 'property-team',
        fields: [
          {
            id: 'field-0',
            label: 'رقم المقسم',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-1',
            label: 'وصف العقار',
            kind: 'text',
            required: true,
          },
          {
            id: 'field-2',
            label: 'مساحة العقار',
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
    'عمر عبد الكريم الدرويش',
    'شركة البناء الحديث المساهمة',
    'دلال عادل حمود',
    'مؤسسة العمران العقارية',
    'خالد محمد الأطرش',
    'هدى فايز المصري',
    'فادي سمير إبراهيم',
    'ميساء عبد العزيز الطويل',
  ],
  identifierPrefix: '0178',
  secondParty: {
    id: 'RE',
    label: 'مديرية السجل العقاري',
  },
  approvedRefundAmount: 1500,
  snapshot: {
    total: 12840,
    month: 613,
    year: 5618,
    active: 94,
    users: 193,
    registrations: 7,
  },
  accountOffset: 8,
  services: [
    {
      id: 'registry',
      values: [
        {
          id: 'field-0',
          value: {
            kind: 'text',
            value: '{id}',
          },
        },
        {
          id: 'field-1',
          value: {
            kind: 'text',
            value: 'المزة · منطقة عقارية ثانية',
          },
        },
        {
          id: 'field-2',
          value: {
            kind: 'text',
            value: '214/7',
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
      id: 'ownership',
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
            value: '1200 / 2400 سهم',
          },
        },
        {
          id: 'field-2',
          value: {
            kind: 'date',
            value: '2026-09-30',
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
      id: 'property',
      values: [
        {
          id: 'field-0',
          value: {
            kind: 'text',
            value: '{id} / 8',
          },
        },
        {
          id: 'field-1',
          value: {
            kind: 'text',
            value: 'شقة سكنية · الطابق الثاني',
          },
        },
        {
          id: 'field-2',
          value: {
            kind: 'number',
            value: 120.0,
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
