import * as _ from 'lodash';;

/**
 * 多选选项,绑定 ngModel, 值为多个选中的选项值用 "," 拼接
 *
 *<see-mul-check items="items" ng-model="vm.which"></see-mul-check>
 *
 * items=[{val:1, text:'选项1'},...]
 *
 */
const mulCheckDirective = () => {
  const SEPERATOR = ',';

  return {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    scope: {
      items: '=',
      ngModel: '='
    },
    template: `<ul class="see-mul-check ">
  <li  ng-repeat="item in items track by item.val">
  <see-checkbox
    ng-model="item.checked"
    ng-change="onChange()"
  >
    <span>{{item.text}}</span>
  </see-checkbox>
  </li>
</ul>`,
    compile() {
      return function(scope, elem, attrs, ngModelCtrl) {
        let checkedVals, item;

        //note: 暂不考虑初始化之后改变 items

        scope.onChange = () => {
          if (scope) {
            checkedVals = _.map(_.filter(scope.items, { checked: true }), 'val').join(SEPERATOR)
            ngModelCtrl.$setViewValue(checkedVals);
          }
        };

        // 主要为了根据 ngModel 初始值 来初始化选中选项
        scope.$watch('ngModel', (newVal = '') => {
          if (scope) {
            newVal.split(SEPERATOR).forEach(val => {
              item = _.find(scope.items, { val });
              if (item) {
                item.checked = true;
              }
            });
          }
        });
      }
    }
  }
};

export default mulCheckDirective;
