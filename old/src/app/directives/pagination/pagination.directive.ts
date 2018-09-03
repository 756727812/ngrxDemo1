pagination.$inject = ['$parse', 'seePaginationConfig']
function pagination($parse, seePaginationConfig) {
  return {
    scope: {
      totalItems: '=',
      ngDisabled: '=',
      isNotChangeUrl: '=',
      hideInput: '='
    },
    require: ['pagination'],
    restrict: 'E',
    replace: true,
    controller: 'seePaginationController',
    controllerAs: 'pagination',
    template: require('./pagination.template.html'),
    link: function(scope, element, attrs, ctrls) {
      element.addClass('pagination');
      var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];
      // if (!ngModelCtrl) {
      //   return; // do nothing if no ng-model
      // }

      paginationCtrl.init(seePaginationConfig);
    }
  }
}

export default pagination
