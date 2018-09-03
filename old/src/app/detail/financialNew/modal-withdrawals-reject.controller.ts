/**
 * 拒绝提现
 */
modalWithdrawalsRejectController.$inject = ['$scope', '$uibModalInstance', 'Notification'];
export function modalWithdrawalsRejectController($scope, $uibModalInstance, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.rejectReason = '';
  $scope.ok = function() {
    if (!$scope.rejectReason) {
      Notification.warn('请填写拒绝理由.');
      return -1;
    }
    $uibModalInstance.close($scope.rejectReason);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalRefund = {
//   modalRefundController: modalRefundController
// }
