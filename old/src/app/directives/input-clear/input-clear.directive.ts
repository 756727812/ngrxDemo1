import * as autosize from 'autosize';

const inputClearDirective = () => {
  return {
    restrict: 'A',
    replace: true,
    require: '?ngModel',
    // transclude: true,
    // template: '<div class="input-clear-wrap"><ng-transclude></ng-transclude></div>',
    scope: {
      inputClear: '@',
    },
    link(scope, elem, attrs, ngModel: ng.INgModelController) {
      const wrapper = $('<div class="input-clear-wrap"></div>').css(
        'position',
        'relative',
      );
      const clearEl = $('<i class="si si-close clear-icon"></i>').hide();
      elem.after(wrapper).appendTo(wrapper);
      wrapper.append(clearEl);
      wrapper.hover(
        () => {
          ngModel.$viewValue !== '' &&
            ngModel.$viewValue !== void 0 &&
            clearEl.show();
        },
        () => clearEl.hide(),
      );

      clearEl.on('click', () => {
        ngModel.$setViewValue('');
        ngModel.$render();
        if (scope.inputClear === 'submit') {
          elem.closest('form').triggerHandler('submit');
        }
      });
      scope.$on('$destroy', () => {
        wrapper.off();
        clearEl.off();
        elem.off();
      });
    },
  };
};

export default inputClearDirective;
