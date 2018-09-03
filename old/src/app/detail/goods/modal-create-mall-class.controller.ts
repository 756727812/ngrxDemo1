createMallClassCtrl.$inject = ['$scope', '$uibModalInstance', 'class_info'];
export function createMallClassCtrl($scope, $uibModalInstance, class_info) {
  $scope.class_info = class_info;
  $scope.ok = function () {
    $uibModalInstance.close($scope.class_info);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
