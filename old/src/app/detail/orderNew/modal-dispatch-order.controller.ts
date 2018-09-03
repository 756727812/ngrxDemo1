/**
 * 待派发订单tab下派发订单操作
 */
import * as angular from 'angular'

modalDispatchOrderController.$inject = ['$scope', '$uibModalInstance', 'mid_order_id', 'total_fee', 'dataService'];
export function modalDispatchOrderController($scope, $uibModalInstance, mid_order_id, total_fee, dataService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.originalTotalFee = total_fee;
  $scope.errMsg = null;    //  提示信息
  $scope.dispatchOrder = {
    buyer: '',
    total_fee: +total_fee,
    orderList: []
  };

  $scope.caculateTotalFee = function() {
    let sum = 0;
    angular.forEach($scope.litOrderList, function(order) {
      sum += $scope.dispatchOrder.orderList[order.lit_order_id]
    })
    if (sum > (+total_fee + 500)) {
      $scope.errMsg = '超过用户支付金额+500元!';
      $scope.btnDisable = true;
    } else {
      $scope.errMsg = null;
      $scope.btnDisable = false;
    }
    $scope.errMsg = sum > (+total_fee + 500) ? '超过用户支付金额+500元!' : sum <= 0 ? '请填写正确的派发金额' : null;
    $scope.dispatchOrder.total_fee = sum;
    return sum;
  };


  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function() {
    if (!$scope.dispatchOrder.buyer) {
      $scope.errMsg = '请填写买手在Seego后台的账号';
      return -1
      // } else if (typeof $scope.dispatchOrder.ship_fee == 'undefined') {   // 运费可能为0
      //     $scope.errMsg = '请填写运费';
      //     return -1
    } else {
      $scope.errMsg = null
    }
    let warnFlag = false;
    angular.forEach($scope.litOrderList, function(order) {
      if (typeof $scope.dispatchOrder.orderList[order.lit_order_id] == 'undefined' || $scope.dispatchOrder.orderList[order.lit_order_id] == null) {
        warnFlag = true;
      }
    });
    if (warnFlag) {
      $scope.errMsg = '请填写小订单派发金额';
      return -1
    }
    const _litOrderList = [];
    angular.forEach($scope.litOrderList, function(order) {
      _litOrderList.push({
        lit_order_id: order.lit_order_id,
        dispatch_price: $scope.dispatchOrder.orderList[order.lit_order_id]
      })
    });
    const param = {
      mid_order_id,
      buyer: $scope.dispatchOrder.buyer,
      total_fee: $scope.dispatchOrder.total_fee,
      // ship_fee: $scope.dispatchOrder.ship_fee,
      lit_order_list: JSON.stringify(_litOrderList)
    };
    $uibModalInstance.close(param);
  };

  (function() {
    getOrderDetail(mid_order_id);
  }());

  function getOrderDetail(mid_order_id) {
    return dataService.orderv2_getOrderDetail({ mid_order_id }).then(res => {
      $scope.litOrderList = res.data.order_list;
      // 为小订单的派发金额输入框填充值
      angular.forEach($scope.litOrderList, function(order) {
        $scope.dispatchOrder.orderList[order.lit_order_id] = order.total_fee
      });
    })
  }
}

// export const modalDispatchOrder = {
//   modalDispatchOrderController: modalDispatchOrderController
// }
