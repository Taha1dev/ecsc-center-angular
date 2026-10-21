import type { CenterId, DemoDefinition, Transaction } from '@workspace/domain';
import {
  calendarDays,
  date,
  previousCalendarRange,
  REFERENCE_DATE,
  shiftCalendarDate,
  type CalendarRange,
} from '@workspace/domain';
export type Granularity = 'day' | 'week' | 'month';
export const granularities: { id: Granularity; label: string }[] = [
  { id: 'day', label: 'يومي' },
  { id: 'week', label: 'أسبوعي' },
  { id: 'month', label: 'شهري' },
];
export const DEFAULT_RANGE: CalendarRange = {
  from: '2026-10-01',
  to: REFERENCE_DATE,
};
export const SAMPLE_COVERAGE: CalendarRange = {
  from: '2026-10-01',
  to: REFERENCE_DATE,
};
export const ACCOUNT_COVERAGE: CalendarRange = {
  from: '2026-01-01',
  to: REFERENCE_DATE,
};
export function scopedTransactions(rows: Transaction[], range: CalendarRange) {
  return rows.filter((t) => t.received >= range.from && t.received <= range.to);
}
export function accountFixtures(center: CenterId, demo: DemoDefinition) {
  const snapshot = demo.snapshot;
  return Array.from({ length: snapshot.users }, (_, i) => {
    const registered =
      i < snapshot.registrations
        ? REFERENCE_DATE
        : shiftCalendarDate(
            '2026-01-01',
            (i * 7 + demo.accountOffset) % (i < snapshot.active ? 278 : 230),
          );
    const activeAt = shiftCalendarDate(
      REFERENCE_DATE,
      -(i < snapshot.active ? i % 30 : 31 + (i % 60)),
    );
    return {
      id: `${center}-account-${i}`,
      registered,
      activeAt: activeAt < registered ? registered : activeAt,
    };
  });
}
export function dashboardSeries(
  rows: Transaction[],
  accounts: ReturnType<typeof accountFixtures>,
  range: CalendarRange,
  granularity: Granularity,
) {
  const buckets = new Map<
    string,
    {
      id: string;
      label: string;
      received: number;
      completed: number;
      users: number;
    }
  >();
  const bucketKey = (day: string) =>
    granularity === 'month'
      ? day.slice(0, 7)
      : granularity === 'week'
        ? shiftCalendarDate(
            range.from,
            Math.floor((calendarDays({ from: range.from, to: day }) - 1) / 7) * 7,
          )
        : day;
  for (let i = 0; i < calendarDays(range); i++) {
    const day = shiftCalendarDate(range.from, i),
      id = bucketKey(day);
    if (!buckets.has(id))
      buckets.set(id, {
        id,
        label: granularity === 'month' ? date(id + '-01') : date(id),
        received: 0,
        completed: 0,
        users: 0,
      });
  }
  scopedTransactions(rows, range).forEach((t) => {
    const bucket = buckets.get(bucketKey(t.received))!;
    bucket.received++;
    if (t.status === 'completed') bucket.completed++;
  });
  accounts
    .filter((a) => a.registered >= range.from && a.registered <= range.to)
    .forEach((a) => buckets.get(bucketKey(a.registered))!.users++);
  return Array.from(buckets.values());
}
export type Comparison = {
  previous?: number;
  delta?: number;
  percent?: number;
  reason?: string;
};
export function comparePeriod(
  current: number,
  range: CalendarRange,
  coverage: CalendarRange,
  calculate: (previous: CalendarRange) => number,
): Comparison {
  const previous = previousCalendarRange(range);
  if (previous.from < coverage.from || range.to > coverage.to || range.from < coverage.from)
    return { reason: 'المقارنة غير متاحة: الفترة السابقة خارج تغطية البيانات' };
  const value = calculate(previous);
  return {
    previous: value,
    delta: current - value,
    percent: value === 0 ? (current === 0 ? 0 : undefined) : ((current - value) / value) * 100,
    reason: value === 0 && current > 0 ? 'النسبة غير متاحة لأن الفترة السابقة صفر' : undefined,
  };
}
