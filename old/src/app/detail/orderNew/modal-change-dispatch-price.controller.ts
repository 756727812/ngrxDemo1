/**
* 小订单更改派发金额
*/

modalChangeDispatchPriceController.$inject = ['$scope', '$uibModalInstance', 'total_fee'];
export function modalChangeDispatchPriceController($scope, $uibModalInstance, total_fee) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.curr_dispatch_price = total_fee;

  $scope.ok = function() {
    var param = {
      curr_dispatch_price: $scope.curr_dispatch_price
    }
    $uibModalInstance.close(param);
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }
}

// export const modalChangeDispatchPrice = {
//   modalChangeDispatchPriceController: modalChangeDispatchPriceController
// }
