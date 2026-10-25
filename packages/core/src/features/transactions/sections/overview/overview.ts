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
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-overview-section',
  imports: [AppPanel, AppEntityCard, AppKeyValues, AppActivityTimeline, HlmButton, AppIcon],
  templateUrl: './overview.html',
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
