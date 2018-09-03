modalItemAddListController.$inject = ['$uibModalInstance'];
function modalItemAddListController($uibModalInstance) {
  let vm = this;

  vm.ok = function () {
    let ids = vm.tagsKeywords.map(function (o) { return o.text; }).join(',');
    $uibModalInstance.close(ids);
  };
  vm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
export {
  modalItemAddListController,
};
