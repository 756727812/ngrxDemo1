/**
 * 待备货tab发起退款操作
 */
modalRefundController.$inject = ['$scope', '$uibModalInstance', 'Notification'];
export function modalRefundController($scope, $uibModalInstance, Notification) {

  $scope.refundData = { reason_type: '' };
  $scope.ok = function ok() {
    if (!$scope.refundData.reason_type) {
      Notification.warn('请选择退款原因！');
      return -1;
    }
    switch ($scope.refundData.reason_type) {
      case '1':
        $scope.refundData.reason = '用户因个人原因要求退款';
        break;
      case '2':
        $scope.refundData.reason = '缺货';
        break;
      case '0':
        $scope.refundData.reason = `其他：${$scope.refundData.otherReason}`;
    }
    $uibModalInstance.close($scope.refundData.reason);
  };

  $scope.cancel = function cancel() {
    $uibModalInstance.dismiss('cancel');
  };
}
