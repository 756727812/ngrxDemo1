const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const parse = require('./parse');
const confirmVar = require('./confirm-var');
// const genEventMap = require('./gen-event-map')
// const genModuleVar = require('./gen-module-var')

const parsedResult = parse();
// const map = genMap(parsedResult.pages)
const confirmResult = confirmVar(Object.values(parsedResult.pages));
if (!confirmResult) {
  throw new Error('变量还有 TODO');
} else {
  const varMap = confirmResult;
  const pages = parsedResult.pages;

  const CONTENT_ID_CN_MAP = {
    '小电铺id': 'shop_id'
  };

  const genCode = row => {
    return `${row.pageId}-${row.contentIdCn ? CONTENT_ID_CN_MAP[row.contentIdCn] : 'x'}-${row.moduleId}-${row.optId}`
  }

  const genModuleCode = row => {
    const { pageId, moduleId } = row
    const varModuleConfig = varMap[pageId].moduleMap[moduleId]
    const varName = varModuleConfig.VAR
    const ext1 = `-${varModuleConfig.ext1?varModuleConfig.ext1:'x'}`
    const ext2 = `-${varModuleConfig.ext2?varModuleConfig.ext2:'x'}`
    const ext3 = `-${varModuleConfig.ext3?varModuleConfig.ext3:'x'}`

    return `    ${varName}: { code: '${genCode(row)}${ext1}${ext2}${ext3}' }, // ${row.moduleCnName}`
  }
  const genPageCode = page => {
    const { pageId, pageCnName, modules } = page;
    return `${varMap[pageId].VAR}:{ // ${pageCnName}
${modules.map(row => genModuleCode(row)).join('\n')}
  }`;
  };
  const result = `export const EVENT_MAP = {
  ${Object.keys(pages).map(pageId => genPageCode(pages[pageId])).join(',\n  ')}
}`

  fs.writeFileSync(path.resolve(__dirname, '../event-map-dont-edit-manually.ts'), result);
}

// const eventMapResult = genEventMap(parsedResult.pages)
// const moduleVarMap = genModuleVar(parsedResult.moduleCnNameList)

// fs.writeFileSync(
//   path.resolve(__dirname, '../event-map-dont-edit-manually.ts'),
//   `export default ${eventMapResult}`
// )

// fs.writeFileSync(
//   path.resolve(__dirname, './module-name-var.json'),
//   JSON.stringify(moduleVarMap, null, 2)
// )
