import type { CenterPages, CenterRoute } from '@workspace/core';
import { ApiExamples } from './pages/api-examples/api-examples';
export const extensions: CenterRoute[] = [
  { path: 'api-examples', label: 'تجربة API', icon: 'phosphorLightning', component: ApiExamples },
];
export const pages: CenterPages = {};
