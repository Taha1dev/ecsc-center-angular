import { createReports } from '@workspace/data-access';
import { catalog } from './services';
export const reports = createReports(catalog, [
  { title: 'الطلبات التجريبية', aliases: ['طلب'] },
  { title: 'متابعة الخدمات التجريبية', aliases: ['متابعة'] },
]);
