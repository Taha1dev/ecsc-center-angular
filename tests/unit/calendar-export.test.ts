import { describe, expect, it } from 'vitest';
import {
  formatCalendarDate,
  parseCalendarDate,
  previousCalendarRange,
  rangeError,
  serializeCalendarDate,
  shiftCalendarDate,
} from '../../packages/domain/src/calendar-date';
import { csvText, safeSpreadsheetText } from '../../packages/ui/src/lib/export-data';
describe('calendar-only dates', () => {
  it.each(['2026-01-01', '2026-03-29', '2026-10-25', '2024-02-29'])(
    'round-trips %s without UTC conversion',
    (value) => {
      expect(serializeCalendarDate(parseCalendarDate(value)!)).toBe(value);
      expect(formatCalendarDate(value)).toBeTruthy();
    },
  );
  it('rejects invalid dates and half/inverted required ranges', () => {
    expect(parseCalendarDate('2026-02-29')).toBeUndefined();
    expect(rangeError({ from: '2026-10-06', to: '' }, true)).toBeTruthy();
    expect(rangeError({ from: '2026-10-06', to: '2026-10-01' }, true)).toBeTruthy();
    expect(rangeError({ from: '', to: '' }, false)).toBeFalsy();
  });
  it('shifts through year boundaries and computes the equal previous period', () => {
    expect(shiftCalendarDate('2026-01-01', -1)).toBe('2025-12-31');
    expect(previousCalendarRange({ from: '2026-10-01', to: '2026-10-06' })).toEqual({
      from: '2026-09-25',
      to: '2026-09-30',
    });
  });
});
describe('local exports', () => {
  it.each(['=SUM(A1:A2)', '+command', '-10', '@formula', ' \t=1', '\ntext'])(
    'escapes spreadsheet input %s',
    (value) => expect(safeSpreadsheetText(value)).toBe("'" + value),
  );
  it('retains numbers, quotes Arabic text and serializes date-only cells locally', () => {
    const text = csvText(
      {
        title: 'تقرير تجريبي',
        headers: ['رقم', 'تاريخ', 'نص'],
        rows: [[12500, new Date(2026, 9, 6, 12), 'قيمة "مقتبسة"']],
        units: 'ل.س',
      },
      { center: 'مركز البوابة', period: '2026-10-06', scope: 'عينة' },
    );
    expect(text.startsWith('\uFEFF')).toBe(true);
    expect(text).toContain('"12500","2026-10-06","قيمة ""مقتبسة"""');
    expect(text).toContain('مركز البوابة');
    expect(text).toContain('بيانات توضيحية وليست سجلاً إنتاجياً');
  });
});
