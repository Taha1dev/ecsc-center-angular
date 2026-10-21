export type ExportCell = string | number | Date;
export type ExportDataset = {
  title: string;
  headers: string[];
  rows: ExportCell[][];
  units: string;
};
export type ExportContext = {
  center: string;
  period: string;
  scope: string;
  visibility?: string;
};
export function safeSpreadsheetText(value: string): string {
  let first = 0;
  while (first < value.length && (value.charCodeAt(first) <= 32 || /\s/.test(value[first])))
    first++;
  return (first < value.length && '=+@-'.includes(value[first])) ||
    value.startsWith('\t') ||
    value.startsWith('\r') ||
    value.startsWith('\n')
    ? "'" + value
    : value;
}
export function csvText(dataset: ExportDataset, context: ExportContext): string {
  const quote = (value: ExportCell) =>
    '"' +
    (typeof value === 'number'
      ? String(value)
      : safeSpreadsheetText(
          value instanceof Date
            ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
            : value,
        )
    ).replaceAll('"', '""') +
    '"';
  const rows: ExportCell[][] = [
    ['المركز', context.center],
    ['الفترة', context.period],
    ['العنوان', dataset.title],
    ['الوحدات', dataset.units],
    ['النطاق', context.scope],
    ['البيانات', 'بيانات توضيحية وليست سجلاً إنتاجياً'],
    ['السلاسل', context.visibility || 'جميع السلاسل ضمن الفترة المختارة'],
    [],
    dataset.headers,
    ...dataset.rows,
  ];
  return '\uFEFF' + rows.map((row) => row.map(quote).join(',')).join('\r\n');
}
export async function downloadDatasets(
  datasets: ExportDataset[],
  context: ExportContext,
  format: 'csv' | 'xlsx',
  filename: string,
): Promise<void> {
  let blob: Blob;
  if (format === 'csv') {
    blob = new Blob([datasets.map((dataset) => csvText(dataset, context)).join('\r\n\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
  } else {
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'مساحة موظفي المركز';
    datasets.forEach((dataset, index) => {
      const sheet = workbook.addWorksheet(
        `${index + 1} ${dataset.title}`.replace(/[\\/*?:[\]]/g, ' ').slice(0, 31),
        { views: [{ state: 'frozen', ySplit: 9, rightToLeft: true }] },
      );
      sheet.addRows([
        ['المركز', context.center],
        ['الفترة', context.period],
        ['العنوان', dataset.title],
        ['الوحدات', dataset.units],
        ['النطاق', context.scope],
        ['البيانات', 'بيانات توضيحية وليست سجلاً إنتاجياً'],
        ['السلاسل', context.visibility || 'جميع السلاسل ضمن الفترة المختارة'],
        [],
        dataset.headers,
      ]);
      dataset.rows.forEach((row) =>
        sheet.addRow(
          row.map((value) =>
            typeof value === 'string'
              ? safeSpreadsheetText(value)
              : value instanceof Date
                ? new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
                : value,
          ),
        ),
      );
      sheet.columns.forEach((column, index) => {
        column.width = index === 0 ? 30 : 24;
      });
      sheet.getRow(9).font = { bold: true };
      sheet.eachRow((row) =>
        row.eachCell((cell) => {
          cell.alignment = {
            horizontal: typeof cell.value === 'number' ? 'center' : 'right',
          };
          if (cell.value instanceof Date) cell.numFmt = 'yyyy-mm-dd';
        }),
      );
    });
    const buffer = await workbook.xlsx.writeBuffer();
    blob = new Blob([new Uint8Array(buffer)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  try {
    link.href = url;
    link.download = filename.replace(/[<>:"/\\|?*]/g, '-') + '.' + format;
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
