import * as angular from 'angular';
import * as _ from 'lodash';;
/**
 * 用法
 *  <ui-select> 上面能用的都可以直接应用在 <see-select>
 */

const UI_SELECT_ATTRS = [
  // ui-select own
  'close-on-select',
  'append-to-body',
  'ng-disabled',
  'ng-model',
  'search-enabled',
  'reset-search-input',
  'theme',
  'tagging',
  'tagging-label',
  'tagging-tokens',
  'autofocus',
  'focus-on',
  'skip-focusser',
  'paste',
  'limit',
  'spinner-class',
  'input-id',

  // mine
  // 'value', // 默认值
  'name',
  'ng-model',
  'ng-change', // TODO 没测试
  'ng-required',
  'required',
]
const UI_SELECT_ATTRS_CAMEL_MAP = {};
UI_SELECT_ATTRS.forEach(attr => (UI_SELECT_ATTRS_CAMEL_MAP[attr] = _.camelCase(attr)));

const seeSelectDirective = () => {
  const jqLite = angular.element;

  return {
    restrict: 'E',
    // replace: true,
    // transclude: true,
    scope: {
      options: '<'
    },
    template: `<ui-select
            class="see-select"
            search-enabled="false"
          >
            <ui-select-match class="ui-select-match" placeholder="">{{$select.selected.name}}</ui-select-match>
            <ui-select-choices class="ui-select-choices" repeat="item in options track by $index">
              <span ng-bind="item.name"></span>
            </ui-select-choices>
          </ui-select>`,

    compile(element, attr) {
      $(element).css('width', '100%');
      // 由于不能 replace:true，导致 form 一些验证 classname 加载了外部的 dom 上岗
      // 要设置一些跟验证相关的样式的话，只能委屈这样了
      $(element).addClass('see-select-wrap');

      const uiSelectTag = element.find('ui-select');
      angular.forEach(UI_SELECT_ATTRS_CAMEL_MAP, (name, camelName) => {
        if (angular.isDefined(attr[camelName])) {
          uiSelectTag.attr(name, attr[camelName]);
        }
      });

      return function(scope, element, attr) {
        // scope.getValue = function () {
        //   return scope.ngValue || attr.value;
        // };
      };
    }
  };
};

export default seeSelectDirective;
