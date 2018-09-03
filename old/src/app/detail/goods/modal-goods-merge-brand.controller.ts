import { IDataService } from '../../services/data-service/data-service.interface';

// 手动合并品牌
ModalGoodsMergeBrandCtrl.$inject = ['$scope', '$timeout', '$uibModalInstance', 'dataService', 'brand'];
export function ModalGoodsMergeBrandCtrl($scope, $timeout, $uibModalInstance, dataService: IDataService, brand) {
  $scope.is_click = true;
  $scope.checkit = function () {
    $timeout(function () {
      dataService.brand_getBrandDetail({
        brand_id: $scope.to_brand_id,
      }).then(res => $scope.to_brand_name = res.data.brand_name);
    },       1000);
  };
  $scope.ok = function () {
    brand.to_brand_id = $scope.to_brand_id;
    $uibModalInstance.close(brand);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
