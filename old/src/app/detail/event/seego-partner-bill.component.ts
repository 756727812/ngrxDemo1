import * as _ from 'lodash';;

export const seegoPartnerBill: ng.IComponentOptions = {
  template: require('./seego-partner-bill.template.html'),
  controller: seegoPartnerBillController,
};

seegoPartnerBillController.$inject = ['$scope', '$routeParams', '$location', 'dataService',
  'Notification', 'seeModal'];
function seegoPartnerBillController(
  $scope, $routeParams, $location, dataService: see.IDataService, Notification, seeModal) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  const page = $routeParams.page || 1;
  const id = $routeParams.id;
  const hash = $location.hash() || 'bill';
  const bill_type = $routeParams.bill_type;
  $scope.filterText = ((t) => {
    return t === 0 && '全部' ||
      t === 1 && '冻结中' ||
      t === 2 && '已失效' ||
      t === 3 && '待提现' ||
      t === 4 && '提现中' ||
      t === 5 && '已打款';
  })(+bill_type);

  ngOnInit();
  /**
   * 获取待提现账单
   */
  function getWithdraw(page) {
    dataService.seego_partner_getWithdraw({
      page,
      partner_u_id: id,
      page_size: 20,
    }).then((res) => {
      $scope.bill_summary = res.data.summary;
      $scope.wait_withdraw = res.data.wait_withdraw;
      $scope.wait_withdraw.start_time = new Date(res.data.wait_withdraw.start_time);
      $scope.withdraw_list = res.data.withdraw;
      _.forEach($scope.withdraw_list, (item) => {
        item.start_time = new Date(item.start_time);
        item.end_time = new Date(item.end_time);
      });
      $scope.show_wait_withdraw = !Array.isArray($scope.wait_withdraw);
    });
  }

  /**
   * 获取佣金详情订单
   */
  function commissionDetail(status, page) {
    dataService.seego_partner_commissionDetail({
      page,
      partner_u_id: id,
      page_size: 20,
      status: status || 0,
    }).then((res) => {
      $scope.orderList = res.data.list;
      $scope.total_items = res.data.count;
    });
  }

  function ngOnInit() {
    if (hash === 'bill') {
      getWithdraw(page);
    } else {
      commissionDetail(bill_type, page);
    }
  }

  /**
   * 申请提现按钮
   */
  $scope.applyWithdraw = function () {
    seeModal
      .confirmP('申请提现', '你确定要申请提现吗？')
      .then(() =>
        dataService.seego_partner_applyWithdraw({
          partner_u_id: id,
        }).then((res) => {
          Notification.success('申请提现成功！');
          return $scope.init();
        }),
      );
  };

  /**
   * 完成打款按钮
   */
  $scope.finishPay = function (id) {
    seeModal
      .confirmP('完成打款', '你确定要完成打款吗？')
      .then(() =>
        dataService.seego_partner_finishWithdraw({ id }).then((res) => {
          Notification.success('完成打款操作成功！');
          return $scope.init();
        }),
      );
  };

  /**
   * 根据佣金状态筛选订单
   */
  $scope.billFilter = function (bill_type) {
    $location.search({
      bill_type,
      page: 1,
    });
  };
}
