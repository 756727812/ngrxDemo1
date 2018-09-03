ModalGoodShowUpCtrl.$inject = ['$scope', '$uibModalInstance', 'good'];
export function ModalGoodShowUpCtrl($scope, $uibModalInstance, good) {
  $scope.good = good;
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
