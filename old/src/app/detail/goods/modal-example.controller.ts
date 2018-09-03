exampleModalCtrl.$inject = ['$scope', '$uibModalInstance'];
export function exampleModalCtrl($scope, $uibModalInstance) {
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
