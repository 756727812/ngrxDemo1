createNewCatModalCtrl.$inject = ['$scope', '$uibModalInstance', 'lvl', 'parents'];
export function createNewCatModalCtrl($scope, $uibModalInstance, lvl, parents) {
  $scope.title = '新建' + lvl + '级品类';
  $scope.parents = parents;
  $scope.lvl = lvl;
  $scope.ok = function () {
    $uibModalInstance.close($scope.formData);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
