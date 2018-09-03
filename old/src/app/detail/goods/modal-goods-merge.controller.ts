ModalGoodsMergeCtrl.$inject = ['$scope', '$routeParams', '$uibModalInstance', 'brand', 'body'];
export function ModalGoodsMergeCtrl($scope, $routeParams, $uibModalInstance, brand, body) {
  $scope.body = (body == '0') ? '合并至' + brand.brand_name + '品牌' : '合并至标准品牌' + $routeParams.name;
  $scope.ok = function () {
    $uibModalInstance.close(brand);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
