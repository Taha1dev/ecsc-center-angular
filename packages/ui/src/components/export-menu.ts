import { Component, computed, inject, input, output, signal } from '@angular/core';
import { downloadDatasets, type ExportContext, type ExportDataset } from '../lib/export-data';
import { AppActionMenu, type MenuAction } from './action-menu';
import { AppIcon } from './icon';
import { ToastService } from './toast';
@Component({
  selector: 'app-export-menu',
  imports: [AppActionMenu, AppIcon],
  template:
    '<app-action-menu [disabled]="busy()" [label]="label()" [text]="busy()?\'جارٍ التصدير…\':compact()?\'تصدير\':label()" [actions]="actions()"><app-icon name="phosphorDownloadSimple" size="16px" /></app-action-menu>',
})
export class AppExportMenu {
  readonly datasets = input.required<ExportDataset[]>();
  readonly context = input.required<ExportContext>();
  readonly filename = input('تقرير');
  readonly label = input('تصدير وعرض البيانات');
  readonly busy = signal(false);
  readonly compact = input(false);
  readonly viewData = input(false);
  readonly view = output<void>();
  readonly toast = inject(ToastService);
  readonly actions = computed<MenuAction[]>(() => [
    {
      id: 'csv',
      label: 'تصدير CSV',
      icon: 'phosphorFileCsv',
      disabled: this.busy(),
      onSelect: () => {
        void this.download('csv');
      },
    },
    {
      id: 'xlsx',
      label: 'تصدير Excel',
      icon: 'phosphorFileXls',
      disabled: this.busy(),
      onSelect: () => {
        void this.download('xlsx');
      },
    },
    ...(this.viewData()
      ? [
          {
            id: 'view',
            label: 'عرض البيانات',
            icon: 'phosphorTable',
            onSelect: () => this.view.emit(),
          },
        ]
      : []),
  ]);
  async download(format: 'csv' | 'xlsx') {
    this.busy.set(true);
    try {
      await downloadDatasets(this.datasets(), this.context(), format, this.filename());
      this.toast.show('تم تجهيز تنزيل محلي ببيانات توضيحية');
    } catch {
      this.toast.show('تعذّر التصدير؛ حاول مرة أخرى', true);
    } finally {
      this.busy.set(false);
    }
  }
}
