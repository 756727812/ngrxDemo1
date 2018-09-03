
modalPriceAdjustController.$inject = ['$scope', '$uibModalInstance'];
export function modalPriceAdjustController($scope, $uibModalInstance) {

  $scope.formData = {

  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function() {
    $uibModalInstance.close($scope.formData);
  };
}

// export const modalCatactUser = {
//   modalCatactUserController: modalCatactUserController
// }
