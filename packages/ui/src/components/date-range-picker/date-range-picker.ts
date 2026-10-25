import {
  afterNextRender,
  Component,
  computed,
  inject,
  Injector,
  input,
  model,
  signal,
} from '@angular/core';
import { BrnPopoverImports, provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import {
  formatCalendarDate,
  parseCalendarDate,
  rangeError,
  serializeCalendarDate,
  shiftCalendarDate,
  type CalendarRange,
} from '@workspace/domain';
import { HlmButton } from '../../helm/button';
import { HlmPopover } from '../../helm/popover';
import { AppIcon } from '../icon/icon';
let calendarSerial = 0;
@Component({
  selector: 'app-date-range-picker',
  host: { class: 'block min-w-0' },
  providers: [provideBrnPopoverDefaultOptions({ role: null })],
  imports: [BrnPopoverImports, HlmPopover, HlmButton, AppIcon],
  templateUrl: './date-range-picker.html',
})
export class AppDateRangePicker {
  readonly injector = inject(Injector);
  readonly calendarId = 'calendar-' + ++calendarSerial;
  readonly focused = signal('');
  readonly monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Intl.DateTimeFormat('ar-SY', { month: 'long' }).format(new Date(2026, i, 1, 12)),
  }));
  readonly years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  readonly number = (n: number) => new Intl.NumberFormat('ar-SY').format(n);
  readonly value = model<CalendarRange>({ from: '', to: '' });
  readonly label = input('الفترة الزمنية');
  readonly referenceDate = input('2026-10-06');
  readonly required = input(false);
  readonly error = input('');
  readonly opened = signal(false);
  readonly draft = signal<CalendarRange>({ from: '', to: '' });
  readonly feedback = signal('');
  readonly month = signal('2026-10-01');
  readonly format = formatCalendarDate;
  readonly weekdays = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  readonly months = computed(() =>
    [0, 1].map((offset) => {
      const base = parseCalendarDate(this.month())!;
      base.setMonth(base.getMonth() + offset);
      const year = base.getFullYear(),
        month = base.getMonth(),
        first = new Date(year, month, 1, 12);
      return {
        id: serializeCalendarDate(first),
        label: new Intl.DateTimeFormat('ar-SY', { month: 'long', year: 'numeric' }).format(first),
        weeks: Array.from(
          { length: Math.ceil((first.getDay() + new Date(year, month + 1, 0, 12).getDate()) / 7) },
          (_, index) => index,
        ),
        days: Array.from({ length: 42 }, (_, i) => {
          const date = new Date(year, month, 1 - first.getDay() + i, 12);
          return {
            id: serializeCalendarDate(date),
            day: date.getDate(),
            outside: date.getMonth() !== month,
          };
        }),
      };
    }),
  );
  readonly presets = computed(() => {
    const ref = this.referenceDate(),
      date = parseCalendarDate(ref)!;
    return [
      { label: 'اليوم', from: ref, to: ref },
      { label: 'آخر ٧ أيام', from: shiftCalendarDate(ref, -6), to: ref },
      { label: 'آخر ٣٠ يوماً', from: shiftCalendarDate(ref, -29), to: ref },
      { label: 'هذا الشهر', from: ref.slice(0, 7) + '-01', to: ref },
      {
        label: 'الشهر السابق',
        from: serializeCalendarDate(new Date(date.getFullYear(), date.getMonth() - 1, 1, 12)),
        to: serializeCalendarDate(new Date(date.getFullYear(), date.getMonth(), 0, 12)),
      },
    ];
  });
  open(state: string) {
    if (state === 'open' && !this.opened()) {
      this.draft.set({ ...this.value() });
      this.month.set(
        this.boundMonth((this.value().from || this.referenceDate()).slice(0, 7) + '-01'),
      );
      this.feedback.set('');
      this.focused.set(this.value().from || this.referenceDate());
    }
    this.opened.set(state === 'open');
  }
  pick(day: string) {
    this.focused.set(day);
    const d = this.draft();
    const next = !d.from
      ? { from: day, to: day }
      : d.from === day && d.to === day
        ? { from: '', to: '' }
        : day === d.from || day === d.to
          ? { from: day, to: day }
          : day < d.from
            ? { from: day, to: d.to || d.from }
            : { from: d.from, to: day };
    this.draft.set(next);
    this.feedback.set(rangeError(next, true) || '');
  }
  selected(day: string) {
    return (
      !!this.draft().from &&
      day >= this.draft().from &&
      day <= (this.draft().to || this.draft().from)
    );
  }
  changeMonth(offset: number, event: Event) {
    const date = parseCalendarDate(this.month())!;
    date.setMonth(Number((event.target as HTMLSelectElement).value) - offset);
    this.month.set(this.boundMonth(serializeCalendarDate(date)));
    this.focused.set(this.month());
  }
  changeYear(offset: number, event: Event) {
    const shown = parseCalendarDate(this.months()[offset].id)!;
    this.month.set(
      this.boundMonth(
        serializeCalendarDate(
          new Date(
            Number((event.target as HTMLSelectElement).value),
            shown.getMonth() - offset,
            1,
            12,
          ),
        ),
      ),
    );
    this.focused.set(this.month());
  }
  monthIndex(id: string) {
    return Number(id.slice(5, 7)) - 1;
  }
  year(id: string) {
    return Number(id.slice(0, 4));
  }
  keyboard(event: KeyboardEvent, day: string) {
    const offsets: Record<string, number> = {
      ArrowLeft: 1,
      ArrowRight: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    let target = day;
    if (event.key in offsets) target = shiftCalendarDate(day, offsets[event.key]);
    else if (event.key === 'Home')
      target = shiftCalendarDate(day, -parseCalendarDate(day)!.getDay());
    else if (event.key === 'End')
      target = shiftCalendarDate(day, 6 - parseCalendarDate(day)!.getDay());
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const date = parseCalendarDate(day)!;
      const current = date.getDate();
      date.setDate(1);
      date.setMonth(
        date.getMonth() + (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1),
      );
      const maximum = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12).getDate();
      date.setDate(Math.min(current, maximum));
      target = serializeCalendarDate(date);
    } else return;
    event.preventDefault();
    if (target < '2020-01-01' || target > '2030-12-31') return;
    this.focused.set(target);
    const last = window.matchMedia('(min-width:768px)').matches
      ? this.months()[1].id
      : this.month();
    if (target < this.month() || target.slice(0, 7) > last.slice(0, 7))
      this.month.set(target.slice(0, 7) + '-01');
    afterNextRender(
      () =>
        document
          .querySelector<HTMLElement>(
            '[data-calendar="' +
              this.calendarId +
              '"] button[data-date="' +
              target +
              '"][data-outside="false"]',
          )
          ?.focus(),
      { injector: this.injector },
    );
  }
  move(offset: number) {
    const date = parseCalendarDate(this.month())!;
    date.setMonth(date.getMonth() + offset);
    this.month.set(this.boundMonth(serializeCalendarDate(date)));
    this.focused.set(this.month());
  }
  canMove(offset: number) {
    const date = parseCalendarDate(this.month())!;
    date.setMonth(date.getMonth() + offset);
    const next = serializeCalendarDate(date);
    return next === this.boundMonth(next);
  }
  private boundMonth(month: string) {
    const last = window.matchMedia('(min-width:768px)').matches ? '2030-11-01' : '2030-12-01';
    return month < '2020-01-01' ? '2020-01-01' : month > last ? last : month;
  }
  preset(p: CalendarRange) {
    this.draft.set({ from: p.from, to: p.to });
    this.month.set(this.boundMonth(p.from.slice(0, 7) + '-01'));
    this.focused.set(p.from);
    this.feedback.set('');
  }
  apply() {
    const error = rangeError(this.draft(), this.required());
    if (error) {
      this.feedback.set(error);
      return;
    }
    this.value.set({ ...this.draft() });
    this.opened.set(false);
  }
  clear() {
    this.draft.set({ from: '', to: '' });
    this.feedback.set(this.required() ? 'الفترة مطلوبة؛ اختر بداية ونهاية' : '');
  }
}
