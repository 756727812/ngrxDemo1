
modalMaterialDetailController.$inject = ['$uibModalInstance', 'item'];
function modalMaterialDetailController($uibModalInstance, item) {
  let vm = this;
  vm.item = item;

  vm.ok = function () {
    $uibModalInstance.close();
  };
  vm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
export {
  modalMaterialDetailController,
};
