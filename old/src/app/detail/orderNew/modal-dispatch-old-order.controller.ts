/**
 * 派发老订单
 */

modalDispatchOldOrderController.$inject = ['$scope', '$uibModalInstance', 'mid_order_id', 'total_fee'];
export function modalDispatchOldOrderController($scope, $uibModalInstance, mid_order_id, total_fee) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.dispatchOrder = {
    order_id: mid_order_id,
    total_fee: +total_fee, // 派发金额
    expressMethod: '1'  // 物流方式
  }

  $scope.$watch('dispatchOrder.total_fee', function() {
    $scope.errMsg = $scope.dispatchOrder.total_fee > (+total_fee + 500) ? '超过用户支付金额+500元!' : '';
  })

  $scope.ok = function() {
    console.log(111);
    if (!$scope.dispatchOrder.buyer || !$scope.dispatchOrder.total_fee) {
      $scope.errMsg('请填写必填项');
      return -1;
    }
    $uibModalInstance.close($scope.dispatchOrder);
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }
}

// export const modalDispatchOldOrder = {
//   modalDispatchOldOrderController: modalDispatchOldOrderController
// }
