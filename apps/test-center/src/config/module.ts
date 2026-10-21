import { defineCenter } from '@workspace/core';
import { accountFixtures, createFixtures, createMemoryAdapter } from '@workspace/data-access';
import { extensions, pages } from '../routes';
import { center } from './center';
import { reports } from './reports';
import { catalog, demo } from './services';

export const centerModule = defineCenter({
  profile: center,
  catalog,
  demo,
  reports,
  routes: extensions,
  pages,
  adapter: createMemoryAdapter({
    centerId: center.id,
    catalog,
    reports,
    createRecords: () => createFixtures(center.id, catalog, demo),
    snapshot: demo.snapshot,
    accounts: accountFixtures(center.id, demo),
  }),
});
