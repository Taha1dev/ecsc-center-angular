import { Component, computed } from '@angular/core';
import { date } from '@workspace/domain';
import {
  AppActivityTimeline,
  AppEntityCard,
  AppIcon,
  AppKeyValues,
  AppPanel,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-overview-section',
  imports: [AppPanel, AppEntityCard, AppKeyValues, AppActivityTimeline, HlmButton, AppIcon],
  template: `<div class="space-y-5">
    <app-panel
      ><h2 class="mb-4 text-section-title font-semibold">بيانات الطلب</h2>
      <app-key-values [items]="details()"
    /></app-panel>
    <div class="grid gap-5 sm:grid-cols-2">
      <app-entity-card title="الشؤون المالية" icon="phosphorCurrencyCircleDollar" [actions]="false"
        ><app-key-values
          [items]="[
            { label: 'إجمالي الرسوم', value: money(total) },
            { label: 'المدفوع', value: money(paid) },
            { label: 'المتبقي', value: money(total - paid > 0 ? total - paid : 0) },
          ]" /><button hlmBtn variant="link" type="button" (click)="context().navigate('payments')">
          عرض الدفعات<app-icon name="phosphorArrowLeft" /></button></app-entity-card
      ><app-entity-card title="اكتمال المستندات" [actions]="false"
        ><p class="text-sm">{{ provided() }} من {{ t.requirements.length }} وثائق مقدمة</p>
        <button hlmBtn variant="link" type="button" (click)="context().navigate('requirements')">
          مراجعة المتطلبات<app-icon name="phosphorArrowLeft" /></button
      ></app-entity-card>
    </div>
    <app-panel
      ><h3 class="mb-4 text-section-title font-semibold">آخر النشاطات</h3>
      <app-activity-timeline [items]="t.activity.slice(0, 3)"
    /></app-panel>
  </div>`,
})
export class OverviewSection extends SectionBase {
  readonly provided = computed(() => this.t.requirements.filter((r) => r.provided).length);
  readonly details = computed(() => [
    { label: 'نوع المعاملة', value: this.t.type },
    { label: 'المركز المستلم', value: this.context().center.name },
    { label: 'مجموعة الخدمة', value: this.t.group },
    { label: 'فريق المعالجة', value: this.t.team },
    { label: 'المصدر', value: this.t.source },
    { label: 'تاريخ الورود', value: date(this.t.received) },
    { label: 'الموظف', value: this.t.owner || 'غير مسندة' },
    { label: 'الموعد', value: date(this.t.deadline) },
  ]);
}
