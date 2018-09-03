modalApplyNewLibController.$inject = ['$uibModalInstance', '$rootScope', 'catalogs'];
function modalApplyNewLibController($uibModalInstance, $rootScope, catalogs) {
  let vm = this;
  let tagArray = [];
  vm.isok = 0;
  vm.catalogs = catalogs.data;
  vm.type = catalogs.type === 'custom';
  console.log(catalogs);
  vm.ok = function () {
    // console.log(vm.formData)
    if (vm.tag && vm.tag.length > 0) {
      vm.isok = 0;
      vm.tag.forEach((s, i) => tagArray[i] = s.text);
      vm.formData.tag = tagArray.toString();
      // $rootScope.$broadcast('materialList', vm.formData);
      $uibModalInstance.close(vm.formData);
    } else {
      vm.isok = !0;
    }

  };
  vm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
export {
  modalApplyNewLibController,
};
