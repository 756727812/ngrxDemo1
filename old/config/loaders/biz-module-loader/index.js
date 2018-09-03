const codeGen = require('./lib/codeGen');
module.exports = function bizModuleLoader(content) {
  return codeGen(this.resourcePath);
};
