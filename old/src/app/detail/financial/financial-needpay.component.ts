import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

financialNeedPayController.$inject = ['$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification'];
export function financialNeedPayController($q: ng.IQService, $routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, seeModal: ISeeModalService, dataService: IDataService, Notification: INotificationService) {
  let $ctrl = this, page: string;

  $ctrl.finishPayInBatch = finishPayInBatch;
  $ctrl.submitSearch = submitSearch;
  $ctrl.clearSearch = clearSearch;
  $ctrl.finishPay = finishPay;
  $ctrl.checkAll = checkAll;
  $ctrl.checkReverse = checkReverse;
  $ctrl.$onInit = activate;

  ////////////////

  function activate() {
    page = $routeParams['page'] || '1';
    $ctrl.c2cCheck = {};
    $ctrl.pgcCheck = {};
    $ctrl.total_items = 0;
    $ctrl.keyword = $routeParams['keyword'];
    $ctrl.hash = $location.hash() || 'c2c';
    const promises: ng.IPromise<any>[] = getPromises();
    $q.all(promises);
  }

  function getPromises() {
    let p: ng.IPromise<any>[] = [];
    if ($ctrl.hash === 'c2c') {
      p = $ctrl.keyword ? [submitSearchBill()] : [getNeedPayList()];
    } else if ($ctrl.hash === 'pgc') {
      p = [getPgcWithdrawList()];
    }
    return p;
  }

  function checkAll() {
    $ctrl.c2cCheck = {};
    angular.forEach($ctrl.need_pay_list, function (item) {
      $ctrl.c2cCheck[item.id] = true;
    });
  }

  function checkReverse() {
    $ctrl.c2cCheck = {};
  }


  function selectTab() {
    $location.search({});
  }

  function submitSearch() {
    $location.search(_.assign({}, $location.search(), {
      keyword: $ctrl.keyword,
    }));
  }

  function clearSearch() {
    $location.search({}).hash($ctrl.hash);
  }

  function getPgcWithdrawList() {
    return dataService.pgc_settle_getPgcWithdrawList({
      p: page,
      status: 1,
      keyword: $ctrl.keyword,
    }).then(function (res) {
      $ctrl.pgc_need_pay_list = res.data.list;
      $ctrl.total_items = res.data.count;
      return $ctrl.pgc_need_pay_list;
    });
  }

  function getNeedPayList() {
    return dataService.financial_getNeedPayList({ p: page }).then(function (data) {
      $ctrl.need_pay_list = data.data.list;
      $ctrl.total_items = data.data.count;
      return $ctrl.NeedPayList;
    });
  }

  /**
   * 批量完成打款
   * @param type { number } 0-商户 1-自媒体
   */
  function finishPayInBatch(type) {
    let params = {};
    type === 0 ?
      params = {
        title: '确定要打款给商户吗？',
        check_list: $ctrl.c2cCheck,
      } : params = {
        title: '确定要打款给自媒体吗？',
        check_list: $ctrl.pgcCheck,
      };
    seeModal.confirm('批量完成打款', params['title'], function () {
      const checked = [];
      _.forEach(params['check_list'], function (v, k) {
        v && checked.push(k);
      });
      return dataService.financial_finishPayInBatch({
        type,
        withdraw_id_list: JSON.stringify(checked),
      }).then(function (res) {
        $ctrl.c2cCheck = {};
        $ctrl.pgcCheck = {};
        checked.length = 0;
        Notification.success('批量完成打款操作成功！');
        return checked;
      }).then(function () {
        return activate();
      });
    });
  }

  /**
   * 完成打款
   * @param type Number: 0-商户， 1-自媒体
   */
  function finishPay(type, withdraw_id) {
    const title = type ? '确定要打款给自媒体吗？' : '确定要打款给商户吗？';
    seeModal.confirm('完成打款', title, function () {
      return dataService.financial_finishPay({
        type,
        withdraw_id,
      }).then(function (data) {
        Notification.success('完成打款操作成功');
      });
    });
  }


  // 订单搜索功能
  function submitSearchBill() {
    return dataService.financial_submitSearchBill({
      keyword: $ctrl.keyword,
      searchType: '1',  //从待打款列表中搜索
    }).then(function (res) {
      $ctrl.need_pay_list = res.data.list;
      $ctrl.total_items = res.data.count;
      return $ctrl.need_pay_list;
    });
  }
}

export const financialNeedPay: ng.IComponentOptions = {
  template: require('./financial-needpay.template.html'),
  controller: financialNeedPayController,
};
