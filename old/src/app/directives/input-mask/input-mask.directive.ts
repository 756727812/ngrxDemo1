'use strict';

/*
 让输入框输入时,屏蔽不合法的输入, 相当于最近一次非法输入没发生过
 <input input-mask="\d+" 表示只允许输入数字

 这个指令通过 $setViewValue 改变 <input 的dom 值 和 $viewValue

 提供一些简单的别名用法
 <input input-mask="POSITIVE_INTEGER" 表示只允许正整数

内置：

 - DEFAULT_TESTERS 正整数


 */

const DEFAULT_TESTERS = {
  POSITIVE_INTEGER: val => /^[1-9][0-9]*$/.test(val),
  NON_NEGATIVE_INT: val => /^(?:[1-9][0-9]*|0)$/.test(val),
  INTEGER_ONLY: val => /^-?\d*$/.test(val),
};

export default function inputMaskDirective() {
  const isValid = (inputMask, val) => {
    if (!inputMask) {
      return true;
    }

    if (DEFAULT_TESTERS[inputMask]) {
      return DEFAULT_TESTERS[inputMask](val);
    }
    return new RegExp(inputMask).test(val);
  };

  return {
    restrict: 'A',
    require: 'ngModel',
    link(scope, elem, attrs, ngModelCtrl) {
      let composing = false;
      elem.on('compositionstart', data => {
        composing = true;
      });

      elem.on('compositionend', data => {
        composing = false;
        // 输入法最后一次输入（选择）触发了 input 然后 再 compositionend
        elem.triggerHandler('input.inputmask');
      });

      let lastVal = '';

      // TODO 如果是在 focus 之后, 程序动态改了值, 怎么弄, focusin 和 out 之间 push viewchangelistener
      // 如果有初始值,那么缓存起来
      elem.on('focusin', e => {
        if (e.target && e.target.value) {
          lastVal = e.target.value;
        }
      });

      elem.on('input.inputmask', e => {
        if (composing) {
          return;
        }
        const target = e.target;
        const inputMaskAttr = attrs.inputMask;

        if (target.value && !isValid(attrs.inputMask, target.value)) {
          target.value = lastVal;
          ngModelCtrl.$setViewValue(lastVal);
        } else {
          lastVal = target.value;
        }
      });
    },
  };
}
