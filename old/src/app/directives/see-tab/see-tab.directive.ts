import { normalizePermission } from '../../utils';

export default function seeTab() {
  // Usage:
  // <see-tabset see-access="Super-Admin See-Admin Elect-Admin">
  //   <see-tab heading="浏览热度榜" type="1"></see-tab>
  //   <see-tab heading="销量热度榜" type="2"></see-tab>
  // </see-tabset>
  const directive = {
    link,
    restrict: 'E',
    transclude: true,
    template: '<div role="tabpanel" ng-show="active" ng-transclude></div>',
    require: '^seeTabset',
    scope: {
      heading: '@',
      type: '@',
      access: '@',
      select: '&',
      count: '@',
    },
  };
  return directive;

  function link(scope, element, attrs, tabsetCtrl) {
    if (attrs.seeAccess) {
      const allowedAccess = attrs.seeAccess.split(' ');
      const list = normalizePermission(allowedAccess);
      const seller_privilege = (document.cookie.match(
        '(^|; )seller_privilege=([^;]*)',
      ) || 0)[2];

      let flag = false;
      for (const item of list) {
        if (Number(seller_privilege) === item) {
          flag = true;
        }
      }
      if (flag) {
        scope.active = false;
        tabsetCtrl.addTab(scope);
      }
      return;
    }
    scope.active = false;
    tabsetCtrl.addTab(scope);
  }
}
