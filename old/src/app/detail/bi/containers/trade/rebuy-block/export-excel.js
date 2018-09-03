function getExplorer() {
  const explorer = window.navigator.userAgent;
  // ie
  if (explorer.indexOf('MSIE') >= 0) {
    return 'ie';
  } else if (explorer.indexOf('Firefox') >= 0) {
    // firefox
    return 'Firefox';
  } else if (explorer.indexOf('Chrome') >= 0) {
    // Chrome
    return 'Chrome';
  } else if (explorer.indexOf('Opera') >= 0) {
    // Opera
    return 'Opera';
  } else if (explorer.indexOf('Safari') >= 0) {
    // Safari
    return 'Safari';
  }
}

export function exportExcel(table) {
  let idTmr;
  const uri = 'data:application/vnd.ms-excel;base64,';
  const format = function(s, c) {
    return s.replace(/{(\w+)}/g, (m, p) => c[p]);
  };
  const template =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';

  const base64 = function(s) {
    return window.btoa(unescape(encodeURIComponent(s)));
  };
  const ctx = {
    worksheet: name || 'Worksheet',
    table: table.innerHTML,
  };
  window.location.href = uri + base64(format(template, ctx));
  // 整个表格拷贝到EXCEL中
  //   if (getExplorer() === 'ie') {
  //     const curTbl = document.getElementById(tableid);
  //     const oXL = new (<any>window).ActiveXObject('Excel.Application');

  //     // 创建AX对象excel
  //     const oWB = oXL.Workbooks.Add();
  //     // 获取workbook对象
  //     const xlsheet = oWB.Worksheets(1);
  //     // 激活当前sheet
  //     const sel = (<any>document.body).createTextRange();
  //     sel.moveToElementText(curTbl);
  //     // 把表格中的内容移到TextRange中
  //     sel.select();
  //     // 全选TextRange中内容
  //     sel.execCommand('Copy');
  //     // 复制TextRange中内容
  //     xlsheet.Paste();
  //     // 粘贴到活动的EXCEL中
  //     oXL.Visible = true;
  //     // 设置excel可见属性

  //     try {
  //       const fname = oXL.Application.GetSaveAsFilename(
  //         'Excel.xls',
  //         'Excel Spreadsheets (*.xls), *.xls',
  //       );
  //       oWB.SaveAs(fname);

  //       oWB.Close((savechanges = false));
  //       // xls.visible = false;
  //       oXL.Quit();
  //       oXL = null;
  //       // 结束excel进程，退出完成
  //       // window.setInterval("Cleanup();",1);
  //       idTmr = window.setInterval('Cleanup();', 1);
  //     } catch (e) {}
  //   } else {
  //   }
  // }
  // function Cleanup() {
  //   window.clearInterval(idTmr);
  //   (<any>window).CollectGarbage();
  // }
}
