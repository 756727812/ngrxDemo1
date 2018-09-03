import * as angular from 'angular';

export const lockItemList = {
  controller: lockItemListController,
  template: require('./lock-item-list.template.html')
}

lockItemListController.$inject = ['$scope', '$routeParams', 'dataService'];
function lockItemListController($scope, $routeParams, dataService) {
  const init = function() {
    const page = $routeParams.page || 1;
    const params = {};
    params['p'] = page;
    dataService.item_getLockItemList(params).then(function(res) {
      $scope.lockItemList = res.data.data;
      $scope.total_items = res.data.count;
    })
  }
  init();
}
