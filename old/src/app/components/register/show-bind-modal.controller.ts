modalConfirmCtrl.$inject = ['$uibModalInstance'];
export function modalConfirmCtrl($uibModalInstance) {
  let vm = this;

  vm.cancel = cancel;

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }
}
