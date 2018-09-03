/**
 * 待付款订单tab下的修改实付金额模态框
 */
modalModifyPriceController.$inject = ['$scope', '$uibModalInstance', 'total_fee'];
export function modalModifyPriceController($scope, $uibModalInstance, total_fee) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.total_fee = total_fee;

  $scope.ok = function() {
    $uibModalInstance.close($scope.curr_total_fee);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalModifyPrice = {
//   modalModifyPriceController: modalModifyPriceController
// }
