export const REFERENCE_DATE = '2026-10-06';
export const activityDate = (iso: string) =>
  new Intl.DateTimeFormat('ar-SY', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Damascus',
  }).format(new Date(iso));
export const REFERENCE_LABEL = '٦ تشرين الأول ٢٠٢٦ · توقيت دمشق';
export const number = (value: number) => new Intl.NumberFormat('ar-SY').format(value);
export const money = (value: number) => `${number(value)} ل.س`;
export const date = (value: string) =>
  new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Damascus',
  }).format(new Date(`${value}T12:00:00+03:00`));
export const normalize = (value: string) =>
  value.replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').trim().toLowerCase();
