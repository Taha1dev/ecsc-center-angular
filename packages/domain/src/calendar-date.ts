export type CalendarRange = { from: string; to: string };
export function parseCalendarDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const result = new Date(year, month - 1, day, 12);
  return serializeCalendarDate(result) === value ? result : undefined;
}
export function serializeCalendarDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function shiftCalendarDate(value: string, days: number): string {
  const date = parseCalendarDate(value)!;
  date.setDate(date.getDate() + days);
  return serializeCalendarDate(date);
}
export function calendarDays(range: CalendarRange): number {
  const a = parseCalendarDate(range.from)!,
    b = parseCalendarDate(range.to)!;
  return (
    Math.round(
      (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
        Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
        86400000,
    ) + 1
  );
}
export function previousCalendarRange(range: CalendarRange): CalendarRange {
  return {
    from: shiftCalendarDate(range.from, -calendarDays(range)),
    to: shiftCalendarDate(range.from, -1),
  };
}
export function rangeError(range: CalendarRange, required = false): string | undefined {
  if (!range.from && !range.to) return required ? 'حدد تاريخ البداية والنهاية' : undefined;
  if (!parseCalendarDate(range.from) || !parseCalendarDate(range.to))
    return 'اختر بداية ونهاية الفترة';
  if (range.from > range.to) return 'تاريخ البداية يجب أن يسبق النهاية';
  return undefined;
}
export function formatCalendarDate(value: string): string {
  const date = parseCalendarDate(value);
  return date
    ? new Intl.DateTimeFormat('ar-SY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
    : 'غير محدد';
}
