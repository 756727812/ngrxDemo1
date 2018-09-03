import * as XLSX from 'xlsx';
type AOA = any[][];

export class ExcelExport {
  constructor() {}
  static export2xlsx(data: AOA, options: any) {
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const { filename, sheetname } = options;
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetname ? sheetname : 'Sheet1');
    XLSX.writeFile(wb, filename + '.xlsx');
  }
}
