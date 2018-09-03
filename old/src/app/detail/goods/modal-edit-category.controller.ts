editCatModalCtrl.$inject = ['$scope', '$uibModalInstance', 'old_name'];
export function editCatModalCtrl($scope, $uibModalInstance, old_name) {
  $scope.title = '修改品类名称';
  $scope.old_name = old_name;
  $scope.ok = function () {
    $uibModalInstance.close($scope.formData);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
