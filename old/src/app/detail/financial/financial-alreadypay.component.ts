
import * as _ from 'lodash';

financialAlreadyPayController.$inject = ['$q', '$routeParams', '$location', 'dataService'];
export function financialAlreadyPayController($q: ng.IQService, $routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, dataService) {
  let $ctrl = this, page: string;

  $ctrl.submitSearch = submitSearch
  $ctrl.selectTab = selectTab
  $ctrl.clearSearch = clearSearch
  $ctrl.$onInit = activate

  function activate() {
    page = $routeParams['page'] || '1'
    $ctrl.total_items = 0
    $ctrl.hash = $location.hash() || 'c2c';
    $ctrl.keyword = $routeParams['keyword']
    const promises: ng.IPromise<any>[] = getPromises()
    $q.all(promises)
  }

  function getPromises() {
    let p: ng.IPromise<any>[] = []
    if ($ctrl.hash === 'c2c') {
      p = $ctrl.keyword ? [submitSearchBill()] : [getAlreadyPayList()]
    } else if ($ctrl.hash === 'pgc') {
      p = [getPgcWithdrawList()]
    }
    return p
  }

  function selectTab() {
    $location.search({})
  }

  function submitSearch() {
    $location.search(_.assign({}, $location.search(), {
      keyword: $ctrl.keyword,
    }))
  }

  function clearSearch() {
    $location.search({}).hash($ctrl.hash)
  }

  function getAlreadyPayList() {
    return dataService.financial_getAlreadyPayList({
      p: page,
    }).then(function(res) {
      $ctrl.already_pay_list = res.data.list;
      $ctrl.total_items = res.data.count
      return $ctrl.already_pay_list
    })
  }

  function getPgcWithdrawList() {
    return dataService.pgc_settle_getPgcWithdrawList({
      p: page,
      status: 2,
      keyword: $ctrl.keyword
    }).then(function(res) {
      $ctrl.pgc_ist = res.data.list;
      $ctrl.total_items = res.data.count
      return $ctrl.pgc_ist
    })
  }

  function submitSearchBill() {
    return dataService.financial_submitSearchBill({
      keyword: $ctrl.keyword,
      searchType: '2',
    }).then(function(res) {
      $ctrl.already_pay_list = res.data.list;
      $ctrl.total_items = res.data.count
      return $ctrl.already_pay_list
    })
  };
}

export const financialAlreadyPay: ng.IComponentOptions = {
  template: require('./financial-alreadypay.template.html'),
  controller: financialAlreadyPayController
}
