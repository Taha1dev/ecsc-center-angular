import type { ReportDefinition } from './model';
import { mergeRegistry, type RegistryChanges } from './registry';
import {
  identifier,
  uniqueIds,
  validateCatalog,
  validateValues,
  type DemoDefinition,
  type ServiceCatalog,
} from './services';
import { defaultActionIds, defaultSectionIds } from './workflow';
export type CenterDefinition = {
  profile: { id: string };
  catalog: ServiceCatalog;
  demo: DemoDefinition;
  reports: ReportDefinition[];
  adapter: { centerId: string };
  routes?: { path: string }[];
  sections?: RegistryChanges<{ id: string }>;
  actions?: RegistryChanges<{ id: string }>;
  actionForms?: RegistryChanges<{ id: string }>;
};
export function validateCenterDefinition(module: CenterDefinition) {
  identifier(module.profile.id);
  validateCatalog(module.catalog);
  uniqueIds(module.reports, 'reports');
  if (module.adapter.centerId !== module.profile.id)
    throw new Error('Adapter center does not match module');
  if (!module.demo.names.length) throw new Error('Demo applicant names are required');
  uniqueIds(module.demo.services, 'demo services');
  for (const sample of module.demo.services) {
    const service = module.catalog.services.find((s) => s.id === sample.id);
    if (!service) throw new Error(`Unknown demo service: ${sample.id}`);
    // Template substitutions only affect text fields; numeric/boolean values remain typed.
    validateValues(service, sample.values);
  }
  for (const service of module.catalog.services)
    if (!module.demo.services.some((s) => s.id === service.id))
      throw new Error(`Missing demo: ${service.id}`);
  const sections = mergeRegistry(
    defaultSectionIds.map((id) => ({ id })),
    module.sections,
  );
  const actions = mergeRegistry(
    [
      'claim',
      'status',
      'transfer',
      'note',
      'completion',
      'payment',
      'decision',
      'print',
      'activity',
    ].map((id) => ({ id })),
    module.actions,
  );
  mergeRegistry(
    defaultActionIds.map((id) => ({ id })),
    module.actionForms,
  );
  for (const service of module.catalog.services) {
    if (service.sections.some((id) => !sections.some((s) => s.id === id)))
      throw new Error('Unregistered service section');
    if (
      service.actions.some(
        (id) => !defaultActionIds.includes(id) && !actions.some((a) => a.id === id),
      )
    )
      throw new Error('Unregistered service action');
  }
  const routes = module.routes ?? [];
  if (
    new Set(routes.map((r) => r.path)).size !== routes.length ||
    routes.some(
      (r) =>
        ['reports', 'design-system', 'inbox/:scope', 'transactions/:id', '*', ''].includes(
          r.path,
        ) || r.path.startsWith('/'),
    )
  )
    throw new Error('Conflicting route extension');
}
