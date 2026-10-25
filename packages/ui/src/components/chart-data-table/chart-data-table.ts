import { Component, input } from '@angular/core';
import type { ExportCell, ExportDataset } from '../../lib/export-data';
@Component({
  selector: 'app-chart-data-table',
  templateUrl: './chart-data-table.html',
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
