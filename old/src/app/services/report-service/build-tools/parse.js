const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const COL = {
  PAGE_NAME: '页面名称',
  PAGE_ID: '页面ID',
  MODULE_NAME: '控件名',
  MODULE_ID: '控件ID',
  CONTENT_ID: '内容ID',
  OPT_ID: '操作ID'
};

module.exports = function () {
  const pages = {};
  const moduleNameSet = new Set();
  const workbook = XLSX.readFile('/Users/zhenyong/Desktop/官网+seego后台20170822.xlsx');
  XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1)
    .filter(row => row[COL.PAGE_ID] && row[COL.PAGE_NAME])
    .forEach(row => {
      const pageId = row[COL.PAGE_ID];
      const pageCnName = row[COL.PAGE_NAME].trim();
      const page = pages[pageId] || (pages[pageId] = { pageId, id: pageId, pageCnName, name: row[COL.PAGE_NAME] });
      const modules = page.modules || (page.modules = []);
      const moduleCnName = row[COL.MODULE_NAME].trim();
      const resultRow = {
        pageCnName, // 页面名称
        pageId, // 页面ID
        contentIdCn: row[COL.CONTENT_ID], // 内容ID
        moduleCnName, // 控件名称
        moduleId: row[COL.MODULE_ID], // 控件ID
        optId: row[COL.OPT_ID] // 操作 ID
      };
      modules.push(resultRow);
      moduleNameSet.add(moduleCnName);
    });
  return { pages };
};
