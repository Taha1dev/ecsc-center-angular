import { identifier } from './services';
export type RegistryChanges<T extends { id: string }> = {
  add?: T[];
  override?: T[];
};
export function mergeRegistry<T extends { id: string }>(
  defaults: T[],
  changes: RegistryChanges<T> = {},
): T[] {
  const entries = new Map<string, T>();
  for (const entry of defaults) {
    identifier(entry.id);
    if (entries.has(entry.id)) throw new Error(`Duplicate default: ${entry.id}`);
    entries.set(entry.id, entry);
  }
  const seen = new Set<string>();
  for (const entry of changes.override ?? []) {
    identifier(entry.id);
    if (seen.has(entry.id) || !entries.has(entry.id))
      throw new Error(`Invalid override: ${entry.id}`);
    seen.add(entry.id);
    entries.set(entry.id, entry);
  }
  for (const entry of changes.add ?? []) {
    identifier(entry.id);
    if (entries.has(entry.id)) throw new Error(`Conflicting addition: ${entry.id}`);
    entries.set(entry.id, entry);
  }
  return [...entries.values()];
}
