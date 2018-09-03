import * as angular from 'angular';

const seeDateRangePickerDirective = ($parse) => {
  const jqLite = angular.element;
  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    transclude: true,
    template: `<div class="form-group date-picker-group m-b-10">
            <label class="control-label">
              <input date-range-picker class="form-control s-date-picker" type="text" placeholder="筛选日期" size="22">
              <i class="icon si si-calenda cal-icon"></i>
              <i class="icon si si-close cal-icon"></i>
            </label>
          </div>`,

    compile(element, attr) {
      const input = element.find('input');
      const dateOptions = attr.options || '{autoApply: true}'

      angular.forEach({
        'name': attr.name,
        'value': attr.value,
        'disabled': attr.disabled,
        'ng-value': attr.ngValue,
        'ng-model': attr.ngModel,
        'ng-disabled': attr.ngDisabled,
        'ng-change': attr.ngChange,
        'ng-required': attr.ngRequired,
        'required': attr.required,
        'options': dateOptions,
        'type': attr.type,
        'placeholder': attr.placeholder
      }, function(value, name) {
        if (angular.isDefined(value)) {
          input.attr(name, value);
        }
      });

      return function(scope, element, attr) {
        const calIcon = element.find('.si-calenda');
        const closeIcon = element.find('.si-close');
        closeIcon.css("display", "none");
        calIcon.mouseenter(function() {
          closeIcon.css("display", "block");
          calIcon.css("display", "none");
        })
        closeIcon.mouseleave(function() {
          closeIcon.css("display", "none");
          calIcon.css("display", "block");
        })
        closeIcon.on('click', function(e) {
          if (!attr.clearHandler) {
            $parse(attr.ngModel).assign(scope, { startDate: null, endDate: null });
          } else {
            $parse(attr.clearHandler)(scope);
          }
          scope.$apply();
          closeIcon.css("display", "none");
          calIcon.css("display", "block");
          return false;
        })
        scope.getValue = function() {
          return scope.ngValue || attr.value;
        };
      };
    }
  };
};
seeDateRangePickerDirective.$inject = ['$parse']
export default seeDateRangePickerDirective;
