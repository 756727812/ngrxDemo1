
const fs = require('fs')
const path = require('path')

const confirmVar = pages => {
  const varMap = JSON.parse(fs.readFileSync(path.resolve(__dirname, './var.json')).toString() || '{}');
  /*
    pageCnName, // 页面名称
        pageId, // 页面ID
        contentIdCn: row[COL.CONTENT_ID], // 内容ID
        moduleCnName, // 控件名称
        moduleId: row[COL.MODULE_ID], // 控件ID
        optId: row[COL.OPT_ID] // 操作 ID
        */
  pages.forEach(page => {
    const { pageId, pageCnName, moduleCnName, moduleId } = page;
    if (!varMap[pageId]) {
      varMap[pageId] = {
        cn: pageCnName,
        VAR: 'TODO',
        moduleMap: {
        }
      };
    } else {
      // TODO 如果一些中文不一样，抛出异常，手动保证 var.json 里面跟 excel 一致

    }
    const moduleMap = varMap[pageId].moduleMap;
    page.modules.forEach(module => {
      if (!moduleMap[module.moduleId]) {
        moduleMap[module.moduleId] = {
          cn: module.moduleCnName,
          VAR: 'TODO'
        };
      } else {
        // TODO 如果一些中文不一样，抛出异常，那么要手动保证 var.json 里面跟 excel 一致
      }
    });
  });
  const strJson = JSON.stringify(varMap, null, 2);
  fs.writeFileSync(path.resolve(__dirname, './var.json'), strJson);
  return strJson.indexOf('TODO') === -1 ? varMap : false;
};

module.exports = confirmVar
