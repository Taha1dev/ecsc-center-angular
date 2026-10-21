import { computed, DestroyRef, inject, Injectable, InjectionToken, signal } from '@angular/core';
import type { ServiceCatalog, TransactionCommand } from '@workspace/domain';
import type { CenterDataAdapter } from './data/adapter';
import { createDataClient } from './data/client';
export const CENTER_DATA_CONFIG = new InjectionToken<{
  adapter: CenterDataAdapter;
  catalog: ServiceCatalog;
}>('CENTER_DATA_CONFIG');
@Injectable({ providedIn: 'root' })
export class CenterDataService {
  private readonly config = inject(CENTER_DATA_CONFIG);
  readonly client = createDataClient(this.config.adapter, this.config.catalog);
  readonly snapshot = signal(this.client.getSnapshot());
  readonly transactions = computed(() => this.snapshot().data?.transactions ?? []);
  readonly dashboard = computed(() => this.snapshot().data?.dashboard);
  readonly pending = computed(() => this.snapshot().pending);
  readonly loading = computed(() => this.snapshot().loading);
  readonly error = computed(() => this.snapshot().error);
  readonly mutationError = computed(() => this.snapshot().mutationError);
  constructor() {
    const unsubscribe = this.client.subscribe(() => this.snapshot.set(this.client.getSnapshot()));
    inject(DestroyRef).onDestroy(unsubscribe);
    void this.client.refresh();
  }
  refresh() {
    return this.client.refresh();
  }
  execute(id: string, command: TransactionCommand) {
    return this.client.execute(id, command);
  }
  claim(ids: string[]) {
    return this.client.claim(this.config.adapter.centerId, ids);
  }
  reset() {
    return this.client.reset(this.config.adapter.centerId);
  }
  report(query: Parameters<typeof this.client.report>[0]) {
    return this.client.report(query);
  }
}
