/**
 * 售后订单审核退款申请
 */

modalAuditRefundController.$inject = [
  '$scope',
  '$uibModalInstance',
  'order_info',
  'refund_time',
  'refund_desc',
  'mid_order_id',
  'dataService',
];
export function modalAuditRefundController(
  $scope,
  $uibModalInstance,
  order_info,
  refund_time,
  refund_desc,
  mid_order_id,
  dataService,
) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }
  $scope.formData = {
    refund_desc,
    refund_time: refund_time * 1000,
    action_style: 'acceptRefund',
    refund_amount: '--',
  };

  $scope.cant_refund = 0;
  $scope.in_warehouse = 0;
  if (
    order_info !== false &&
    Number(order_info.summary_info.in_warehouse) === 1 &&
    Number(order_info.summary_info.outside_warehouse) === 1
  ) {
    $scope.in_warehouse = 1;
  }
  if (
    order_info !== false &&
    Number(order_info.summary_info.in_warehouse) === 1 &&
    Number(order_info.summary_info.outside_warehouse) === 1 &&
    (Number(order_info.summary_info.ex_warehouse_status) === 2 ||
      Number(order_info.summary_info.ex_warehouse_status) === 3 ||
      Number(order_info.summary_info.ex_warehouse_status) === 4)
  ) {
    $scope.cant_refund = 1;
  }

  if (Number($scope.cant_refund) === 1) {
    $scope.formData.action_style = 'rejectRefund';
    $scope.formData.reject_reason =
      '很抱歉，该订单已进入仓库出库流程，无法退款';
    $scope.formData.refund_desc = $scope.formData.reject_reason;
  } else {
    // 取退款金额
    dataService.orderv2_getRefundAmount({ mid_order_id }).then(res => {
      $scope.formData.refund_amount = res.data.refund_acount;
    });
  }
  $scope.ok = function(form) {
    if ($scope.formData.action_style === 'rejectRefund') {
      if (!$scope.formData.reject_reason) {
        form.reject_reason.$touched = form.reject_reason.$invalid = true;
        return -1;
      }
    }
    $uibModalInstance.close($scope.formData);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalAuditRefund = {
//   modalAuditRefundController: modalAuditRefundController
// }
