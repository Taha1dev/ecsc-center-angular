import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import type { ExportContext, ExportDataset } from '../../lib/export-data';
import { AppChart, type ChartRow, type ChartSeries } from '../chart/chart';
import { AppDialog } from '../dialog/dialog';
import { AppEmptyState } from '../empty-state/empty-state';
import { AppExportMenu } from '../export-menu/export-menu';
import { AppIcon } from '../icon/icon';
import { AppPanel } from '../panel/panel';

import { ChartDataTable } from '../chart-data-table/chart-data-table';
@Component({
  selector: 'app-chart-workspace',
  imports: [
    NgTemplateOutlet,
    AppChart,
    AppPanel,
    AppEmptyState,
    AppDialog,
    AppExportMenu,
    AppIcon,
    HlmButton,
    ChartDataTable,
  ],
  host: { class: 'block min-w-0 self-start' },
  templateUrl: './chart-workspace.html',
})
export class ChartWorkspace {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly dataset = input.required<ExportDataset>();
  readonly context = input.required<ExportContext>();
  readonly kind = input<'area' | 'line' | 'donut' | 'radial' | 'bar'>('area');
  readonly data = input.required<ChartRow[]>();
  readonly series = input.required<ChartSeries[]>();
  readonly primary = input(false);
  readonly empty = input(false);
  readonly hidden = signal<string[]>([]);
  readonly table = signal(false);
  readonly expanded = signal(false);
  readonly drill = output<{ id: string; series?: string }>();
  readonly exportContext = computed(() => ({
    ...this.context(),
    visibility: this.hidden().length
      ? 'يشمل التصدير جميع السلاسل؛ إخفاء السلاسل يؤثر على العرض فقط'
      : 'جميع السلاسل ضمن الفترة المختارة',
  }));
  toggle(id: string) {
    this.hidden.update((v) => (v.includes(id) ? v.filter((k) => k !== id) : [...v, id]));
  }
}
