import type { ServiceCatalog, Transaction, TransactionCommand } from '@workspace/domain';
import { presentTransaction, userMessage, validateRecord } from '@workspace/domain';
import type { CenterDataAdapter, DashboardData, ReportQuery } from './adapter';

export type DataSnapshot = {
  data: {
    transactions: Transaction[];
    dashboard: Omit<DashboardData, 'records'>;
  } | null;
  loading: boolean;
  pending: boolean;
  error?: string;
  mutationError?: string;
};
export function createDataClient(adapter: CenterDataAdapter, catalog: ServiceCatalog) {
  const centerId = adapter.centerId;
  let snapshot: DataSnapshot = { data: null, loading: false, pending: false };
  const listeners = new Set<() => void>();
  let version = 0,
    mutations = 0;
  const publish = (change: Partial<DataSnapshot>) => {
    snapshot = { ...snapshot, ...change };
    listeners.forEach((listener) => listener());
  };
  const present = (record: unknown) =>
    presentTransaction(validateRecord(record, centerId, catalog), catalog);
  const message = (cause: unknown) => userMessage(cause, 'تعذر تحميل بيانات المركز');
  async function refresh() {
    const request = ++version;
    publish({ loading: true });
    try {
      const [page, dashboard] = await Promise.all([
        adapter.listTransactions({ centerId }),
        adapter.getDashboard(centerId),
      ]);
      const transactions = page.rows.map(present);
      if (dashboard.centerId !== centerId) throw new Error('بيانات المؤشرات تخص مركزاً آخر');
      dashboard.records.forEach((record) => validateRecord(record, centerId, catalog));
      if (request === version)
        publish({
          data: {
            transactions,
            dashboard: {
              centerId,
              snapshot: dashboard.snapshot,
              accounts: dashboard.accounts,
            },
          },
          loading: false,
          error: undefined,
        });
    } catch (cause) {
      if (request === version) publish({ loading: false, error: message(cause) });
    }
  }

  async function mutate<T>(operation: () => Promise<T>): Promise<T> {
    mutations++;
    publish({ pending: true, mutationError: undefined });
    try {
      const result = await operation();
      await refresh();
      return result;
    } catch (cause) {
      publish({ mutationError: message(cause) });
      throw cause;
    } finally {
      mutations--;
      publish({ pending: mutations > 0 });
    }
  }
  return {
    // This client belongs to one module. All adapter calls and cache snapshots carry its center ID.
    key: [centerId, 'transactions'] as const,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    refresh,
    execute: (id: string, command: TransactionCommand) =>
      mutate(async () => {
        await adapter.execute(centerId, id, command);
      }),
    claim: (requested: string, ids: string[]) => mutate(() => adapter.claim(requested, ids)),
    reset: (requested: string) => mutate(() => adapter.resetDemo(requested)),
    report: async (query: Omit<ReportQuery, 'centerId'>) =>
      (await adapter.getReport({ ...query, centerId })).map(present),
  };
}
