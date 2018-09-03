/**
 * 缴纳关税模态框
 */
modalPayTaxController.$inject = ['$scope', '$uibModalInstance'];
export function modalPayTaxController($scope, $uibModalInstance) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function(taxForm) {
    $scope.alert = null;
    if (!$scope.taxInfo.tax_no) {
      taxForm.tax_no.$touched = taxForm.tax_no.$invalid = true;
      return -1;
    }
    if (!$scope.taxInfo.tax_fee) {
      taxForm.tax_fee.$touched = taxForm.tax_fee.$invalid = true;
      return -1;
    }
    if (!$scope.taxInfo.tax_clear_port) {
      taxForm.tax_clear_port.$touched = taxForm.tax_clear_port.$invalid = true;
      return -1;
    }
    $uibModalInstance.close($scope.taxInfo);
  };
}

// export const modalPayTax = {
//   modalPayTaxController: modalPayTaxController
// }
