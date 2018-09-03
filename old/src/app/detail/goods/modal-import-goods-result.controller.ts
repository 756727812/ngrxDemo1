import * as angular from 'angular';

modalImportGoodsResultController.$inject = ['$uibModalInstance', 'error', 'goods_id_list', 'dataService'];
export function modalImportGoodsResultController($uibModalInstance, error, goods_id_list, dataService) {
  const vm = this;
  vm.error = error;
  vm.goods_id_list = goods_id_list;
  vm.category = {};
  vm.ok = ok;
  vm.cancel = cancel;

  activate();

  function activate() {
    return dataService.item_class2Tree().then(function (res) {
      vm.class_tree = res.data;
    });
  }
  function ok() {
    const params = {};
    angular.forEach(vm.category, function (v, k) {
      params[k] = v[2];
    });
    $uibModalInstance.close(params);
  }

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }
}
