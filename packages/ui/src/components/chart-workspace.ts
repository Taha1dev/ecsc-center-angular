import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { HlmButton } from '../helm/button';
import type { ExportCell, ExportContext, ExportDataset } from '../lib/export-data';
import { AppChart, type ChartRow, type ChartSeries } from './chart';
import { AppDialog } from './dialog';
import { AppExportMenu } from './export-menu';
import { AppIcon } from './icon';
import { AppEmptyState, AppPanel } from './patterns';
@Component({
  selector: 'app-chart-data-table',
  template: `<div class="mt-4 overflow-x-auto rounded-inset border">
    <table class="w-full min-w-100 text-start text-sm">
      <caption class="border-b bg-surface-subtle p-3 text-start font-medium">
        {{
          dataset().title
        }}
        ·
        {{
          dataset().units
        }}
      </caption>
      <thead>
        <tr>
          @for (header of dataset().headers; track $index) {
            <th scope="col" class="px-3 py-3 text-start">{{ header }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of dataset().rows; track $index) {
          <tr class="border-t">
            @for (value of row; track $index) {
              <td class="px-3 py-3">
                <bdi>{{ format(value) }}</bdi>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
    @if (!dataset().rows.length) {
      <p class="p-4 text-sm">لا توجد بيانات ضمن الفترة المختارة</p>
    }
  </div>`,
})
export class ChartDataTable {
  readonly dataset = input.required<ExportDataset>();
  format(value: ExportCell) {
    return typeof value === 'number'
      ? new Intl.NumberFormat('ar-SY', { maximumFractionDigits: 2 }).format(value)
      : value instanceof Date
        ? new Intl.DateTimeFormat('ar-SY').format(value)
        : value;
  }
}
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
