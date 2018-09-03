/**
 * 旧订单完成下单
 */

modalCompleteOldOrderController.$inject = ['$scope', '$uibModalInstance', 'mid_order_id'];
export function modalCompleteOldOrderController($scope, $uibModalInstance, mid_order_id) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.waitBuyInfo = {};

  $scope.errMsg = null;

  $scope.ok = function() {
    var param = {
      order_id: mid_order_id,
      action: 'online_buy',
      out_order_id: $scope.waitBuyInfo.out_order_id || '',
      official_original_price: '',
      forecast_sendgood_time: ''
    };
    $uibModalInstance.close(param);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalCompleteOldOrder = {
//   modalCompleteOldOrderController: modalCompleteOldOrderController
// }
