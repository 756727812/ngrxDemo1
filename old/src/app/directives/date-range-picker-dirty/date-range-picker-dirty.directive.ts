'use strict';

export default function dirtyDirective() {

  return {
    restrict: 'A',
    require: ['ngModel', '^form'],
    link: function postLink(scope, elem, attrs, [ngModelCtrl, formCtrl]: [ng.INgModelController, ng.IFormController]) {
      setTimeout(() => {
        $(elem).on('apply.daterangepicker', function() {
          scope.$applyAsync(() => {
            ngModelCtrl.$setDirty();
          })
        })
      }, 1)
    },
  }
};

