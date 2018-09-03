import { IDataService } from '../../services/data-service/data-service.interface';

export const activeGoodsList: ng.IComponentOptions = {
  template: require('./active-goods-list.template.html'),
  controller: activeGoodsController,
};

activeGoodsController.$inject = ['$scope', '$location', '$routeParams', 'dataService'];
export function activeGoodsController($scope, $location, $routeParams, dataService: IDataService) {

  $scope.cond = {};
  Object.assign($scope.cond, $routeParams);
  $scope.cond.p = $routeParams.page || 1;

  $scope.getMyEventItemsStatus = function () {
    dataService.backend_event_getMyEventItemsStatus().then(res => $scope.status = res.data);
  };

  $scope.changeStatus = function (status) {
    $scope.cond.status = status;
    $scope.queryGoods();
  };

  $scope.submitSearch = function () {
    $scope.cond.p = 1;
    $location.search($scope.cond);
  };

  $scope.getBrandAndClass = function (cb) {
    dataService.couponmanager_getBrandAndClass().then(res => {
      $scope.brandList = res.data.brand;
      $scope.classList = res.data.class.concat(res.data.firstclass);
      cb && cb();
    });
  };

  $scope.queryGoods = function (cond) {
    cond = cond || $scope.cond;
    dataService.backend_event_getMyEventItems(cond).then(res => {
      $scope.items = res.data.items;
      $scope.total_items = res.data.count;
    });
  };
  $scope.getMyEventItemsStatus();
  $scope.getBrandAndClass(function () {
    $scope.queryGoods();
  });
}
