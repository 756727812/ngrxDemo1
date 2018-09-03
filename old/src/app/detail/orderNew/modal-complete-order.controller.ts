/**
 * 新订单完成备货
 */

modalCompleteOrderController.$inject = ['$scope', '$uibModalInstance', 'mid_order_id', 'ship_country'];
export function modalCompleteOrderController($scope, $uibModalInstance, mid_order_id, ship_country) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.purchaseMethod = 'online_buy';
  $scope.waitBuyInfo = {};
  $scope.errMsg = null;

  $scope.$watch('purchaseMethod', function(newValue) {
    $scope.errMsg = null;
  })

  $scope.ok = function() {
    var param = {
      order_id: mid_order_id,
      action: ship_country == '中国' ? 'native_ship_buy' : $scope.purchaseMethod,
      param: undefined,
      out_order_id: undefined,
      logistics_conf_id: undefined,
      official_original_price: undefined,
      forecast_sendgood_time: undefined,
    };
    if ($scope.purchaseMethod === 'online_buy') {

      if (!$scope.waitBuyInfo.expressDate) {
        $scope.errMsg = '请填写官网发货时间!';
        return -1
      }
      if (!$scope.waitBuyInfo.out_order_id) {
        $scope.errMsg = '请填写官网订单号!';
        return -1
      }
      param.logistics_conf_id = "1";
      param.out_order_id = $scope.waitBuyInfo.out_order_id || '';
      param.official_original_price = $scope.waitBuyInfo.originalPrice || '';
      param.forecast_sendgood_time = $scope.waitBuyInfo.expressDate || '';
    } else if ($scope.purchaseMethod === 'offline_buy') {
      param.logistics_conf_id = "14";
      param.out_order_id = '';
      param.official_original_price = '';
      param.forecast_sendgood_time = '';
    }
    $uibModalInstance.close(param);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalCompleteOrder = {
//   modalCompleteOrderController: modalCompleteOrderController
// }
