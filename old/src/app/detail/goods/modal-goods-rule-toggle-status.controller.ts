ModalGoodsRuleToggleStatusCtrl.$inject = ['$scope', '$uibModalInstance', 'rule'];
export function ModalGoodsRuleToggleStatusCtrl($scope, $uibModalInstance, rule) {
  $scope.titlewd = rule.is_active == 1 ? '暂停' : '启用';
  $scope.ok = function () {
    $uibModalInstance.close(rule);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
