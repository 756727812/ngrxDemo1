// 删除商品规则
ModalGoodsRuleDeleteCtrl.$inject = ['$scope', '$uibModalInstance', 'rule'];
export function ModalGoodsRuleDeleteCtrl($scope, $uibModalInstance, rule) {
  $scope.ok = function () {
    $uibModalInstance.close(rule);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
