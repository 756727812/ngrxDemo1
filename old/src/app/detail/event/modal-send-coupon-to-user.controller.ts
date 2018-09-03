/**
 * 手动发放优惠券给用户模态框
 */

modalSendCouponToUserController.$inject = ['$scope', '$uibModalInstance', 'limit_user_num', 'Notification'];
export function modalSendCouponToUserController($scope, $uibModalInstance, limit_user_num, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.type = 1;
  $scope.setType = function (_t) {
    $scope.type = _t;
  };
  $scope.limit_user_num = limit_user_num > 0 ? limit_user_num : '无限';

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function () {
    if (!$scope.mobile_list) {
      Notification.warn('请填写用户手机号!');
      return -1;
    } else {
      $uibModalInstance.close({
        type: $scope.type,
        mobile_list: $scope.mobile_list,
      });
    }

  };
}
