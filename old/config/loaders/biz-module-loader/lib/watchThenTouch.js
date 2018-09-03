const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const _ = require('lodash')

const watcherMap = {}

const touch = (file) => fs.writeFileSync(file, fs.readFileSync(file))

const watch = (moduleEntryFile) => {
  if (watcherMap[moduleEntryFile]) {
    return
  }
  const moduleDir = path.dirname(moduleEntryFile)
  const watcher = chokidar.watch([
    `${moduleDir}/**/*.component.ts`,
    '${moduleDir}/**/*.template.html'], {
    persistent: true
  });
  watcherMap[moduleEntryFile] = watcher;
  const debounceTouch = _.debounce(() => {
    console.log('>>>touch')
    touch(moduleEntryFile)
  }, 500)

// TDOO 如果只是添加 js，还没有 tpl 则不 touch，。。。etc.
  watcher.on('add', path => {
    debounceTouch(path)
  })
  // .on('change', debounceTouch)
    .on('unlink', debounceTouch);
}


module.exports = (moduleEntryFile) => {
  process.on('__see_dev_build_complete__', () => {
    setTimeout(() => {
      watch(moduleEntryFile)
    }, 2000);
  })
}
