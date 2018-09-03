/**
 * 优惠券管理拒绝通过申请模态框
 */

modalRejectApplyCouponController.$inject = ['$scope', '$uibModalInstance', 'title', 'desc'];
export function modalRejectApplyCouponController($scope, $uibModalInstance, title, desc) {

  $scope.rejectReason = null;
  $scope.title = title;
  $scope.desc = desc;
  console.log(title, desc);

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.rejectReason);
  };
}
