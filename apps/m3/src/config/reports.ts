import { createReports } from '@workspace/data-access';
import { catalog } from './services';
export const reports = createReports(catalog, [
  { title: 'حركة السجل العقاري', aliases: ['عقار', 'قيد', 'صحيفة'] },
  {
    title: 'نقل الملكية والبيانات العقارية',
    aliases: ['ملكية', 'بيان', 'مساحة'],
  },
]);
