// 修改商品权重模态框
modalChangeWeightCtrl.$inject = ['$scope', '$uibModalInstance', 'create_time', 'item_weight'];
export function modalChangeWeightCtrl($scope, $uibModalInstance, create_time, item_weight) {
  $scope.create_time = create_time;
  $scope.item_weight = item_weight;
  $scope.ok = function () {
    $uibModalInstance.close(encodeURIComponent($scope.new_item_weight));
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
