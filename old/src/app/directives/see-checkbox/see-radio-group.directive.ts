'use strict';

/**
 *<see-radio-group
 * items="items" // required
 * ng-model="vm.gender" //required
 * name="xx" // optional
 * ></see-radio-group>
 *
 * items =  [{val:'2', text:'xx'}, {val:'1', text: '男'}]
 */
const radioGroup = () => {

  let COUNT = 0;

  return {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    scope: {
      items: '=',
      ngModel: '='
    },
    template: `
    <ul class="see-radio-group">
 <li
    ng-repeat="item in items track by item.val">
  <see-checkbox
    type="radio"
    name="{{name}}"
    ng-model="vm.val"
    ng-value="item.val"
    ng-change="onChange()"
  >
    <span>{{item.text}}</span>
    <img ng-src="{{item.imgurl}}" alt="" width="50px">
  </see-checkbox>
</li>
</ul>

    `,
    compile() {
      return function(scope, elem, attrs, ngModelCtrl) {
        scope.name = attrs.name || 'mulRadioId' + (COUNT++);
        scope.vm = {
          val: scope.ngModel
        };

        scope.onChange = () => {
          scope.ngModel = scope.vm.val;
        };

        scope.$watch('ngModel', (newVal, oldVal) => {
          if (newVal) {
            scope.vm.val = newVal;
          }
        });

        // scope.$watchCollection('items', (newVal, oldVal)=> {
        //   // 默认选中第一项
        //   if (newVal && !_.isEmpty(newVal.items)) {
        //     if(_.isEmpty(scope.ngModel)) {
        //       scope.vm.val = scope.ngModel = newVal.items[0].val;
        //     }
        //   }
        // });

        // scope.hasFlexClass = ()=>(attrs.dir === 'h');
      }
    }

  }
};

export default radioGroup;
