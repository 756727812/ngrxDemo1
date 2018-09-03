'use strict';

export default function inputDirtyDirective() {
  return {
    restrict: 'A',
    require: ['?ngModel', '?^form'],
    link(scope, elem, attrs, [ngModelCtrl, formCtrl]) {
      elem.on('change', function() {
        (ngModelCtrl || formCtrl) && scope.$applyAsync(() => {
          ngModelCtrl && ngModelCtrl.$setDirty();
          formCtrl && formCtrl.$setDirty();
        })
      });
    }
  }
};

