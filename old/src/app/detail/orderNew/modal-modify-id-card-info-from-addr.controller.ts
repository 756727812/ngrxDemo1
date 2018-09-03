modalModifyIDCardInfoFromAddrController.$inject = ['$scope', '$uibModalInstance', 'order_id', 'dataService'];
export function modalModifyIDCardInfoFromAddrController($scope, $uibModalInstance, order_id, dataService) {
  $scope.newChoice = {
    result: '',
  };
  dataService.orderv2_getAddrInfoByUid({
    order_id,
  }).then(res => $scope.addrInfo = res.data);

  $scope.ok = function () {
    $uibModalInstance.close($scope.newChoice.result);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
