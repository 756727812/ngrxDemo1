export const dashboardArrowIcon: ng.IComponentOptions = {
  template: `
  <i class="icon si" ng-class="{
    'si-arrow-right-up': $ctrl.flag === 1,
    'color-ff6b6b': $ctrl.flag === 1,
    'si-arrow-right-down': $ctrl.flag === 0,
    'color-b8e986': $ctrl.flag === 0,
  }"></i>
  `,
  bindings: {
    flag: '<'
  }
}
