import type {
  DashboardSnapshot,
  ReportDefinition,
  ServiceCatalog,
  Status,
  TransactionRecord,
} from '@workspace/domain';
import {
  applyCommand,
  availability,
  validateRecord,
  type Capabilities,
  type TransactionCommand,
} from '@workspace/domain';

export type TransactionQuery = {
  centerId: string;
  pageIndex?: number;
  pageSize?: number;
  sort?: { id: 'id' | 'received' | 'deadline'; descending: boolean };
  serviceId?: string;
  ownerId?: string;
  status?: Status;
};
export type TransactionPage = { rows: TransactionRecord[]; total: number };
export type DashboardData = {
  centerId: string;
  records: TransactionRecord[];
  snapshot: DashboardSnapshot;
  accounts: { id: string; registered: string; activeAt: string }[];
};
export type ReportQuery = {
  centerId: string;
  reportId: string;
  values: Readonly<Record<string, string>>;
  retry?: boolean;
};
export interface CenterDataAdapter {
  readonly centerId: string;
  listTransactions(query: TransactionQuery): Promise<TransactionPage>;
  getTransaction(centerId: string, id: string): Promise<TransactionRecord | null>;
  claim(centerId: string, ids: string[]): Promise<{ changed: number; skipped: number }>;
  transfer(centerId: string, id: string, employeeId: string): Promise<TransactionRecord>;
  changeStatus(centerId: string, id: string, status: Status): Promise<TransactionRecord>;
  execute(centerId: string, id: string, command: TransactionCommand): Promise<TransactionRecord>;
  getReport(query: ReportQuery): Promise<TransactionRecord[]>;
  getDashboard(centerId: string): Promise<DashboardData>;
  resetDemo(centerId: string): Promise<void>;
}
export function createMemoryAdapter({
  centerId,
  catalog,
  createRecords,
  snapshot,
  accounts,
  reports,
  capabilities = {},
  now = () => new Date().toISOString(),
}: {
  centerId: string;
  catalog: ServiceCatalog;
  createRecords: () => TransactionRecord[];
  snapshot: DashboardSnapshot;
  accounts: DashboardData['accounts'];
  reports: ReportDefinition[];
  capabilities?: Capabilities;
  now?: () => string;
}): CenterDataAdapter {
  const seed = () => {
    const rows = createRecords().map((r) => validateRecord(r, centerId, catalog));
    if (new Set(rows.map((r) => r.id)).size !== rows.length)
      throw new Error('Duplicate transaction IDs');
    return new Map(rows.map((r) => [r.id, r]));
  };
  let records = seed();
  const scope = (requested: string) => {
    if (requested !== centerId) throw new Error('العملية تخص مركزاً آخر');
  };
  const requireRecord = (requested: string, id: string) => {
    scope(requested);
    const record = records.get(id);
    if (!record) throw new Error('المعاملة غير موجودة في هذا المركز');
    return record;
  };
  const execute = async (requested: string, id: string, command: TransactionCommand) => {
    const current = requireRecord(requested, id);
    const updated = validateRecord(
      applyCommand(current, command, catalog, now(), capabilities),
      centerId,
      catalog,
    );
    records.set(id, updated);
    return structuredClone(updated);
  };
  return {
    centerId,
    async listTransactions(query) {
      scope(query.centerId);
      let rows = [...records.values()].filter(
        (r) =>
          (!query.serviceId || r.serviceId === query.serviceId) &&
          (!query.ownerId || r.ownerId === query.ownerId) &&
          (!query.status || r.status === query.status),
      );
      if (query.sort) {
        const sort = query.sort;
        rows = rows.toSorted(
          (a, b) => a[sort.id].localeCompare(b[sort.id]) * (sort.descending ? -1 : 1),
        );
      }
      const total = rows.length;
      if (query.pageSize !== undefined) {
        if (
          !Number.isInteger(query.pageSize) ||
          query.pageSize < 1 ||
          !Number.isInteger(query.pageIndex ?? 0) ||
          (query.pageIndex ?? 0) < 0
        )
          throw new Error('Invalid pagination');
        const start = (query.pageIndex ?? 0) * query.pageSize;
        rows = rows.slice(start, start + query.pageSize);
      }
      return structuredClone({ rows, total });
    },
    async getTransaction(requested, id) {
      scope(requested);
      return structuredClone(records.get(id) ?? null);
    },
    async claim(requested, ids) {
      scope(requested);
      // Check the complete request before accepting any record. Each claim re-evaluates the current record.
      for (const id of ids) requireRecord(requested, id);
      let changed = 0,
        skipped = 0;
      for (const id of new Set(ids)) {
        if (!availability('claim', requireRecord(requested, id), catalog, capabilities).enabled) {
          skipped++;
          continue;
        }
        await execute(requested, id, { type: 'claim' });
        changed++;
      }
      return { changed, skipped };
    },
    execute,
    transfer: (requested, id, employeeId) =>
      execute(requested, id, { type: 'transfer', employeeId }),
    changeStatus: (requested, id, status) => execute(requested, id, { type: 'status', status }),
    async getReport(query) {
      scope(query.centerId);
      const report = reports.find((r) => r.id === query.reportId);
      if (!report) throw new Error('التقرير غير موجود');
      if (report.example === 'empty') return [];
      if (report.example === 'error' && !query.retry)
        throw new Error('تعذر إنشاء المعاينة التجريبية. أعد المحاولة.');
      const values = query.values;
      const rows = [...records.values()].filter((r) => {
        const service = catalog.services.find((s) => s.id === r.serviceId);
        const labels = {
          group: catalog.groups.find((g) => g.id === r.groupId)?.label,
          team: catalog.teams.find((t) => t.id === r.teamId)?.label,
          owner: catalog.employees.find((e) => e.id === r.ownerId)?.label,
          status: r.status,
          type: service?.label,
        };
        return (
          Object.entries(labels).every(
            ([key, label]) => !values[key] || values[key] === 'all' || values[key] === label,
          ) &&
          (!values.rangeFrom || r.received >= values.rangeFrom) &&
          (!values.rangeTo || r.received <= values.rangeTo) &&
          (!report.criteria?.overdue || (r.deadline < '2026-10-06' && r.status !== 'completed')) &&
          (!report.criteria?.status || r.status === report.criteria.status)
        );
      });
      return structuredClone(rows);
    },
    async getDashboard(requested) {
      scope(requested);
      return structuredClone({
        centerId,
        records: [...records.values()],
        snapshot,
        accounts,
      });
    },
    async resetDemo(requested) {
      scope(requested);
      records = seed();
    },
  };
}
