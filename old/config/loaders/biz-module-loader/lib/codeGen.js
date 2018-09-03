// TODO windows 没测试过
/*
假设文件目录为

/src/app/detail/

  -/theme
    -/list
      /list.component.ts
      /item.component.ts
    -/modal-form
      /index.component.ts



import * as angular from 'angular'

import goodsThemeList from './list/list.component'
import goodsThemeModalForm from './list/index.component'

export default angular.module('seego.goods.theme', []) // #moduleName
  .component('goodsThemeList', goodsThemeList) // #componentName
  .component('goodsThemeListItem', goodsThemeListItem)
  .component('goodsThemeModalForm', goodsThemeModalForm)
  .name


生成规则

1. angular.module(`#moduleName`)

从 src/app/detail/ 下的目录开始到 index.biz.module 所在目录的目录名，然后前面拼上 `see`
`see.goods.theme`


2. #componentName

按照例子中 goodsThemeXxxx 的规律，`/detail` 下的目录开始到 `*.component.ts` 的各级目录和文件名组成（驼峰小写开头），
任意部分的下划线或者横线都转成驼峰

如果 `*.component.ts` 的名字跟他的目录一样，则忽略文件名部分，即
`list.component.ts` 和目录 `/list` 同名，所以最终只会出现一次 List

如果 `index.component.ts` 则直接忽略掉 index 文件名


 */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const helper = require('./helper');

const genImportComponents = (componentNames, componentFiles, moduleDir) =>
  componentNames
    .map(
      (compName, i) =>
        `import {${compName}} from '${helper
          .getRelativePath(moduleDir, componentFiles[i])
          .replace('.ts', '')}'`,
    )
    .join('\n');

const genRegisterComponents = componentNames =>
  componentNames
    .map(compName => `.component('${compName}', ${compName})`)
    .join('\n');

module.exports = function genModuleResigerCodes(moduleEntryFile) {
  if (process.env.NODE_ENV === 'development') {
    require('./watchThenTouch')(moduleEntryFile);
  }
  let ret = '';
  // moduleEntryFile = Users/zhenyong/seeapp/seego/src/app/detail/goods/theme/index.biz.module
  const moduleDir = path.dirname(moduleEntryFile);
  const componentFiles = helper.walkSync(moduleDir, /.*\.component.ts$/);
  const componentNames = helper.parseComponentNames(componentFiles);
  const moduleNs = helper
    .removeBasePrefix(moduleDir)
    .split('/')
    .join('.');
  ret = `
import * as angular from 'angular'
${genImportComponents(componentNames, componentFiles, moduleDir)}

export default angular
  .module('seego.${moduleNs}', [])
${genRegisterComponents(componentNames)}
  .name;`;
  return ret;
};
