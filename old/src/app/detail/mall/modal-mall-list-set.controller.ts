/**
 * 待付款订单tab下的修改实付金额模态框
 */
mallListSetController.$inject = ['$scope', '$uibModalInstance', 'params'];
export function mallListSetController($scope, $uibModalInstance, params) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }
  $scope.params = params;
  $scope.ok = function () {
    $uibModalInstance.close($scope.params);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalModifyPrice = {
//   modalModifyPriceController: modalModifyPriceController
// }
