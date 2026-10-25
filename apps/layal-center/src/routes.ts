import type { CenterPages, CenterRoute } from '@workspace/core';
import { Aurora } from './pages/aurora/aurora';
import { About } from './pages/about/about';
import { Team } from './pages/team/team';
import { Faq } from './pages/faq/faq';
import { Contact } from './pages/contact/contact';
import { ApiExamples } from './pages/api-examples/api-examples';
export const extensions: CenterRoute[] = [
  { path: 'api-examples', component: ApiExamples },
  {
    path: 'aurora',
    label: 'Aurora',
    icon: 'phosphorRocketLaunch',
    component: Aurora,
  },
  // Routes register pages; navigation.ts decides where their links appear.
  { path: 'about', component: About },
  { path: 'team', component: Team },
  { path: 'guide/contact', component: Contact },
  { path: 'guide/faq', component: Faq },
];
export const pages: CenterPages = {};
