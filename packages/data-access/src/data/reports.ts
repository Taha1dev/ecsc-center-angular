import type { FilterField, ReportDefinition, ServiceCatalog } from '@workspace/domain';
import { statuses } from '@workspace/domain';
const options = (values: string[]) => values.map((value) => ({ value, label: value }));
export function createReports(
  catalog: ServiceCatalog,
  specialty: { title: string; aliases: string[] }[],
): ReportDefinition[] {
  const p = {
    groups: catalog.groups.map((g) => g.label),
    teams: catalog.teams.map((t) => t.label),
    types: catalog.services.map((s) => s.label),
  };
  const employees = catalog.employees.map((e) => e.label);
  const range: FilterField = {
    id: 'range',
    kind: 'date-range',
    label: 'الفترة الزمنية',
    required: true,
  };
  const group: FilterField = {
    id: 'group',
    kind: 'select',
    label: 'مجموعة الخدمة',
    options: options(p.groups),
  };
  const team: FilterField = {
    id: 'team',
    kind: 'select',
    label: 'فريق المعالجة',
    options: options(p.teams),
  };
  const employee: FilterField = {
    id: 'owner',
    kind: 'select',
    label: 'الموظف',
    options: options(employees),
  };
  const status: FilterField = {
    id: 'status',
    kind: 'select',
    label: 'الحالة',
    options: Object.entries(statuses).map(([value, s]) => ({
      value,
      label: s.label,
    })),
  };
  const definitions: Omit<ReportDefinition, 'id'>[] = [
    {
      title: 'المعاملات اليومية',
      category: 'المعاملات',
      description: 'حركة الوارد والمنجز ضمن فترة محددة.',
      aliases: ['يومي', 'الوارد'],
      parameters: [range, group, status],
      preview: 'transactions',
    },
    {
      title: 'أحمال فرق المعالجة',
      category: 'الموظفون',
      description: 'توزيع المعاملات على الفرق والخدمات.',
      aliases: ['فريق', 'أحمال'],
      parameters: [team, group],
      preview: 'transactions',
    },
    {
      title: 'أداء الموظفين',
      category: 'الموظفون',
      description: 'المعاملات المسندة لكل موظف.',
      aliases: ['موظف', 'أداء'],
      parameters: [range, employee],
      preview: 'transactions',
    },
    {
      title: 'المعاملات المتأخرة',
      criteria: { overdue: true },
      category: 'المعاملات',
      description: 'معاملات تجاوزت الموعد المرجعي للإنجاز.',
      aliases: ['تأخير', 'موعد'],
      parameters: [team, status],
      preview: 'transactions',
    },
    {
      title: 'المستفيدون الفعليون',
      criteria: { status: 'completed' },
      category: 'المستفيدون',
      description: 'أصحاب المعاملات المنجزة في المركز.',
      aliases: ['مستفيد', 'أشخاص'],
      parameters: [group],
      preview: 'people',
    },
    {
      title: 'المسجلون الجدد',
      category: 'المستفيدون',
      description: 'مثال فارغ لفترة لا تتضمن تسجيلات.',
      aliases: ['تسجيل', 'مستخدم'],
      parameters: [range],
      preview: 'people',
      example: 'empty',
    },
    {
      title: 'تحصيل الرسوم',
      category: 'المالية',
      description: 'قائمة الرسوم والدفعات التوضيحية.',
      aliases: ['رسم', 'تحصيل'],
      parameters: [
        range,
        group,
        {
          id: 'paymentType',
          label: 'نوع الدفعة',
          kind: 'select',
          options: options(['دفعة أولية', 'دفعة نهائية']),
        },
      ],
      preview: 'fees',
    },
    {
      title: 'الدفعات والمبالغ المعادة',
      category: 'المالية',
      description: 'مثال لفشل قابل لإعادة المحاولة.',
      aliases: ['دفعات', 'استرداد'],
      parameters: [
        employee,
        {
          id: 'grouping',
          label: 'التجميع',
          kind: 'select',
          options: options(['حسب الموظف', 'حسب الخدمة']),
        },
      ],
      preview: 'fees',
      example: 'error',
    },
    {
      title: specialty[0].title,
      category: 'المعاملات',
      description: 'تحليل الخدمات التخصصية للمركز.',
      aliases: specialty[0].aliases,
      parameters: [
        range,
        group,
        {
          id: 'type',
          label: 'نوع المعاملة',
          kind: 'select',
          dependency: 'group',
          options: options(p.types),
        },
      ],
      preview: 'transactions',
    },
    {
      title: specialty[1].title,
      category: 'المعاملات',
      description: 'ملخص الطلبات التخصصية وحالات معالجتها.',
      aliases: specialty[1].aliases,
      parameters: [
        status,
        {
          id: 'type',
          label: 'نوع المعاملة',
          kind: 'select',
          options: options(p.types),
        },
      ],
      preview: 'transactions',
    },
  ];
  return definitions.map((r, i) => ({ ...r, id: `report-${i + 1}` }));
}
