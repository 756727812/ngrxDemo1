
financialDetailController.$inject = ['$routeParams', '$location', 'dataService'];
function financialDetailController($routeParams, $location, dataService) {
  let $ctrl = this,
    id = $routeParams.id;

  $ctrl.$onInit = activate;
  $ctrl.submitSearchOrder = submitSearchOrder;

  function activate() {
    return getBillDetail();
  }

  function getBillDetail() {
    return dataService.financial_getBillDetail({
      id,
    }).then(function (res) {
      $ctrl.order_list = res.data;
      return $ctrl.order_list;
    });
  }

  //订单搜索功能
  function submitSearchOrder() {

    return dataService.financial_submitSearchOrder({
      keyword: $ctrl.searchKeyword,
      withdraw_id: id,
    }).then(function (res) {
      $ctrl.order_list = res.data;
      return $ctrl.order_list;
    });
  }
}

export const financialDetail: ng.IComponentOptions = {
  template: require('./financial-detail.template.html'),
  controller: financialDetailController,
};
