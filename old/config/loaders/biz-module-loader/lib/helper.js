const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const BASE_PREFIX = 'src/app/detail/';
const removeBasePrefix = str =>
  str.substring(str.indexOf(BASE_PREFIX) + BASE_PREFIX.length);
const getRelativePath = (base, file) => {
  const ret = path.relative(base, file);
  return ret.charAt(0) === '/' ? `.${ret}` : `./${ret}`;
};

const walkSync = (dir, reg, filelist) => {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    const fullFile = path.join(dir, file);
    if (fs.statSync(fullFile).isDirectory()) {
      filelist = walkSync(fullFile, reg, filelist);
    } else {
      if (!reg || reg.test(file)) {
        filelist.push(fullFile);
      }
    }
  });
  return filelist;
};

const assertComopnentExportStatement = (componentName, filepath) => {
  const strExport = `export const ${componentName}`;
  if (
    !fs
      .readFileSync(filepath)
      .toString()
      .match(new RegExp(strExport))
  ) {
    console.error(chalk.red(`${filepath} 文件没有 ${strExport}`));
  }
};

const parseComponentNames = componentFiles => {
  return componentFiles
    .map(s => [removeBasePrefix(s).replace('.component.ts', ''), s])
    .map(([segPath, fullFilePath]) => {
      // TODO windows?
      const segArr = segPath.split('/');
      const ln = segArr.length;
      if (ln < 2) {
        console.error(chalk.red('//TODO'));
      }
      // 如果文件名和目录一样 或者 文件名文 index，则忽略文件名
      if (segArr[ln - 1] === 'index' || segArr[ln - 1] === segArr[ln - 2]) {
        segArr.pop();
      }
      const componentName = _.camelCase(segArr.join('-'));
      assertComopnentExportStatement(componentName, fullFilePath);
      return componentName;
    });
};

module.exports = {
  walkSync,
  removeBasePrefix,
  getRelativePath,
  parseComponentNames,
};
