modalEditSupplyPriceController.$inject = ['$uibModalInstance', 'supply_price_start', 'supply_price_end'];
function modalEditSupplyPriceController($uibModalInstance, supply_price_start, supply_price_end) {
  var vm = this;
  vm.formData = {
    start_price: supply_price_start,
    end_price: supply_price_end
  }

  vm.ok = function() {
    $uibModalInstance.close(vm.formData);
  };
  vm.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}
export {
  modalEditSupplyPriceController
}
