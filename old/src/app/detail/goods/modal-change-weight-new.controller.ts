// 修改商品权重2.0
modalChangeWeightNewCtrl.$inject = ['$scope', '$uibModalInstance', 'score_info', 'list_set'];
export function modalChangeWeightNewCtrl($scope, $uibModalInstance, score_info, list_set) {
  $scope.score_info = score_info;
  $scope.list_set = list_set;
  $scope.ok = function () {
    $uibModalInstance.close($scope.score_info);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
