import * as angular from 'angular';
/**
 * 用法
 * <see-checkbox
 // 下列属性等同于直接在 <input> 应用
 'name': attr.name,
 'value': attr.value,
 'disabled': attr.disabled,
 'ng-value': attr.ngValue,
 'ng-model': attr.ngModel,
 'ng-disabled': attr.ngDisabled,
 'ng-change': attr.ngChange,
 'ng-required': attr.ngRequired,
 'required': attr.required,
 'type': attr.type
 * >label内容</see-checkbox>
 *
 * 如果要 radio box 则
 * <see-checkbox type="radio" name="groupName">1</see-checkbox>
 * <see-checkbox type="radio" name="groupName"/>2</see-checkbox>
 */
const seeCheckboxDirective = () => {
  const jqLite = angular.element;

  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    transclude: true,
    template:
      '<label class="see-checkbox">' +
      '<input type="checkbox">' +
      '<div class="content" ng-transclude></div>' +
      '</label>',

    compile(element, attr) {
      const input = element.find('input');
      angular.forEach(
        {
          name: attr.name,
          value: attr.value,
          disabled: attr.disabled,
          'ng-value': attr.ngValue,
          'ng-model': attr.ngModel,
          'ng-disabled': attr.ngDisabled,
          'ng-change': attr.ngChange,
          'ng-required': attr.ngRequired,
          required: attr.required,
          type: attr.type,
        },
        function(value, name) {
          if (angular.isDefined(value)) {
            input.attr(name, value);
          }
        },
      );

      return function(scope, element, attr) {
        scope.getValue = function() {
          return scope.ngValue || attr.value;
        };
      };
    },
  };
};

export default seeCheckboxDirective;
