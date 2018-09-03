import * as angular from 'angular';
import * as escapeStringRegexp from 'escape-string-regexp';
import { trim } from 'lodash';
/**
 * 用法
 */
import './highlight-keyword.less';

const splitWords = (text, keyword) => {
  // TODO cache map
  const reg = new RegExp(escapeStringRegexp(trim(keyword)), 'gi');
  let result = null;
  let lastIndex = 0;
  const arr = [];
  while ((result = reg.exec(text)) !== null) {
    lastIndex = reg.lastIndex;
    // 如果不是在开头匹配
    if (result.index !== 0) {
      arr.push({
        text: text.substring(0, result.index),
        match: false,
      });
    }
    console.log(result.index, reg.lastIndex);
    arr.push({
      text: text.substring(result.index, reg.lastIndex),
      match: true,
    });
  }
  // 如果最后一次匹配是尾巴，那么 lastIndex === length
  if (lastIndex !== text.length) {
    arr.push({
      text: text.substring(lastIndex),
      match: false,
    });
  }
  return arr;
};

const REG_CACHE = {};

const newReg = (str: string, mode: string = '') => {
  const modeKey = mode
    ? mode
        .split('')
        .sort()
        .join('')
    : 'nonMode';
  const regMap = REG_CACHE[modeKey] || (REG_CACHE[modeKey] = {});
  if (!regMap[str]) {
    regMap[str] = new RegExp(escapeStringRegexp(str), mode);
  }
  return regMap[str];
};

const highlightKeyword = () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      text: '<',
      keyword: '<',
    },
    transclude: true,
    template: require('./highlight-keyword.template.html'),
    compile(element, attr) {
      return function(scope, element, attr) {
        scope.isMatch = () => {
          const { text, keyword } = scope;
          if (!keyword || !text) {
            return false;
          }
          const reg = newReg(keyword, 'i');
          return reg.test(text);
        };
        const updateSplitWords = () => {
          if (scope.isMatch()) {
            const { text, keyword } = scope;
            scope.splitWords = splitWords(text, keyword);
          }
        };

        updateSplitWords();
        scope.$watch('keyword', (newVal, oldVal) => {
          if (newVal === oldVal || !scope.isMatch()) {
            return;
          }
          updateSplitWords();
        });
      };
    },
  };
};

export default highlightKeyword;
