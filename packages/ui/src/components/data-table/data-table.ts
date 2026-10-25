import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, model, output, signal, TemplateRef } from '@angular/core';
import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  injectTable,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  type ColumnDef,
  type ColumnVisibilityState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/angular-table';
import { HlmButton } from '@spartan-ng/helm/button';
import { AppActionMenu, type MenuAction } from '../action-menu/action-menu';
import { AppEmptyState } from '../empty-state/empty-state';
import { AppIcon } from '../icon/icon';
import { AppStatusBadge, type Intent } from '../status-badge/status-badge';
export type TableColumn<T> = {
  id: string;
  label: string;
  value?: (row: T) => string | number | boolean | null | undefined;
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  badge?: (row: T) => { label: string; intent: Intent };
  template?: TemplateRef<{ $implicit: T }>;
  onClick?: (row: T) => void;
  sortable?: boolean;
  hideable?: boolean;
};
const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns,
});
@Component({
  selector: 'app-data-table',
  host: { class: 'block min-w-0' },
  imports: [NgTemplateOutlet, HlmButton, AppIcon, AppStatusBadge, AppEmptyState, AppActionMenu],
  templateUrl: './data-table.html',
})
export class AppDataTable<T extends object> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly getRowId = input.required<(row: T) => string>();
  readonly selection = input(false);
  readonly bulkActionLabel = input('');
  readonly actions = input<((row: T) => readonly MenuAction[]) | null>(null);
  readonly actionTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
  readonly actionsHeader = input('الإجراءات');
  readonly actionsHideable = input(false);
  readonly serverMode = input(false);
  readonly totalRows = input<number>();
  readonly bulk = output<T[]>();
  readonly pagination = model<PaginationState>({ pageIndex: 0, pageSize: 10 });
  readonly sorting = model<SortingState>([]);
  readonly selectedRows = model<RowSelectionState>({});
  readonly visibility = signal<ColumnVisibilityState>({});
  readonly compact = signal(false);
  readonly tableData = computed(() => [...this.data()]);
  readonly columnDefs = computed<ColumnDef<typeof features, T>[]>(() =>
    this.columns().map((c) => ({
      id: c.id,
      header: c.label,
      accessorFn: (row: T) => c.sortValue?.(row) ?? c.value?.(row) ?? '',
      enableSorting: c.sortable !== false,
      enableHiding: c.hideable !== false,
    })),
  );
  readonly table = injectTable<typeof features, T>(() => ({
    features,
    columns: this.columnDefs(),
    data: this.tableData(),
    getRowId: this.getRowId(),
    manualPagination: this.serverMode(),
    manualSorting: this.serverMode(),
    rowCount: this.totalRows(),
    enableRowSelection: this.selection(),
    state: {
      pagination: this.pagination(),
      sorting: this.sorting(),
      rowSelection: this.selectedRows(),
      columnVisibility: this.visibility(),
    },
    onPaginationChange: (up) =>
      this.pagination.update((v) => (typeof up === 'function' ? up(v) : up)),
    onSortingChange: (up) => {
      this.sorting.update((v) => (typeof up === 'function' ? up(v) : up));
      this.pagination.update((v) => ({ ...v, pageIndex: 0 }));
    },
    onRowSelectionChange: (up) =>
      this.selectedRows.update((v) => (typeof up === 'function' ? up(v) : up)),
    onColumnVisibilityChange: (up) =>
      this.visibility.update((v) => (typeof up === 'function' ? up(v) : up)),
  }));
  readonly showActions = computed(
    () =>
      (!!this.actions() || !!this.actionTemplate()) &&
      (!this.actionsHideable() || this.visibility()['actions'] !== false),
  );
  readonly columnActions = computed<MenuAction[]>(() => [
    ...this.table
      .getAllLeafColumns()
      .filter((c) => c.getCanHide())
      .map((c) => ({
        id: c.id,
        label: (c.getIsVisible() ? '✓ ' : '○ ') + String(c.columnDef.header),
        onSelect: () => c.toggleVisibility(),
      })),
    ...(this.actionsHideable()
      ? [
          {
            id: 'actions',
            label: (this.showActions() ? '✓ ' : '○ ') + this.actionsHeader(),
            onSelect: () =>
              this.visibility.update((value) => ({ ...value, actions: !this.showActions() })),
          },
        ]
      : []),
  ]);
  readonly selected = computed(() =>
    this.data().filter((row) => this.selectedRows()[this.getRowId()(row)]),
  );
  column(id: string) {
    return this.columns().find((c) => c.id === id)!;
  }
  pageSize(event: Event) {
    this.table.setPageSize(Number((event.target as HTMLSelectElement).value));
  }
}
