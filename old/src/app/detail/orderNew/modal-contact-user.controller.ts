/**
 * 联系用户确认弹框
 */

modalCatactUserController.$inject = ['$scope', '$uibModalInstance'];
export function modalCatactUserController($scope, $uibModalInstance) {

  $scope.formData = {

  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function() {
    console.log($scope.formData);
    var is_send_order = $scope.formData.is_send_order ? $scope.formData.is_send_order : 0;
    var params = {
      is_send_order: is_send_order
    }
    $uibModalInstance.close(params);
  };
}

// export const modalCatactUser = {
//   modalCatactUserController: modalCatactUserController
// }
