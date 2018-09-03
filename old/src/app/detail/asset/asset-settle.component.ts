import { IDataService } from '../../services/data-service/data-service.interface';

export const assetSettle = {
  template: require('./asset-settle.template.html'),
  controller: SettleController,
};
SettleController.$inject = ['$scope', '$q', 'dataService', '$timeout', 'seeModal', 'Notification', '$routeParams'];
function SettleController($scope, $q: ng.IQService, dataService: IDataService, $timeout, seeModal, Notification, $routeParams) {
  $scope.WithdrawHistoryCurrentPage = 1;
  $scope.datePicker = {
    date: {
      startDate: null,
      endDate: null,
    },
  };
  $scope.pageChanged = pageChanged;
  $scope.withDraw = withDraw;
  /** 根据日期范围搜索账单 */
  $scope.searchBills = searchBills;


  init();

  function init() {
    $q.all([getBillStatData(), generateWithdrawBill(), getWithdrawHistory($scope.WithdrawHistoryCurrentPage)]);
  }

  function getBillStatData() {
    return dataService.asset_getBillStatData().then(res => {
      $scope.BillStats = res.data;
      return $scope.BillStats;
    });
  }

  function generateWithdrawBill() {
    return dataService.asset_generateWithdrawBill().then(res => {
      //有可以提现的账单
      $scope.canWithdraw = true;
      $scope.WithdrawBill = res.data;
    },                                                   err => $scope.canWithdraw = false);
  }

  function getWithdrawHistory(p) {
    return dataService.asset_getWithdrawHistory({ p }).then(res => {
      $scope.WithdrawHistory = res.data.list;
      $scope.WithdrawHistoryCount = res.data.count;
    });
  }

  function pageChanged() {
    getWithdrawHistory($scope.WithdrawHistoryCurrentPage);
  }

  function searchBills() {
    return dataService.asset_searchWithdrawList({
      startDate: Date.parse($scope.datePicker.date.startDate._d),
      endDate: Date.parse($scope.datePicker.date.endDate._d),
    }).then(res => $scope.WithdrawHistory = res.data.list);
  }

  function withDraw() {
    return seeModal.confirmP('提现', '确定要提现吗？').then(() =>
      dataService.asset_withdraw().then(res => {
        Notification.success('提现已完成');
        return init();
      }),
    );
  }
}

// })();
