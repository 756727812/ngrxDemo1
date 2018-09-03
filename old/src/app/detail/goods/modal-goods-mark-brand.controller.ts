import { IDataService } from '../../services/data-service/data-service.interface';

// 查看品牌评分
ModalGoodsMarkBrandCtrl.$inject = ['$scope', '$timeout', '$uibModalInstance', 'dataService', 'Notification', 'brand'];
export function ModalGoodsMarkBrandCtrl($scope, $timeout, $uibModalInstance, dataService: IDataService, Notification, brand) {
  $scope.is_click = true;
  init();
  function init() {
    dataService.brand_getRate({
      brand_id: brand.brand_id,
    }).then(res => {
      $scope.brand_info = res.data.brand_info;
      $scope.rate_info = res.data.rate_info;
    },      err => $uibModalInstance.close(brand));
  }
  $scope.ok = function () {
    brand = $scope.rate_info;
    $uibModalInstance.close(brand);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
