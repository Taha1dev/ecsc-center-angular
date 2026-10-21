import { createReports } from '@workspace/data-access';
import { catalog } from './services';
export const reports = createReports(catalog, [
  { title: 'خدمات الوكالات والمركبات', aliases: ['وكالة', 'مركبة'] },
  { title: 'تصاريح الدخول', aliases: ['تصريح', 'دخول'] },
]);
