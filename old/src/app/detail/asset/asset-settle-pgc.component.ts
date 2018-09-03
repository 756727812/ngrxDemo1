import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export const assetSettlePgc = {
  template: require('./asset-settle-pgc.template.html'),
  controller: SettlePgcCtrl,
};

SettlePgcCtrl.$inject = ['$scope', 'dataService', 'Notification', 'seeModal', '$timeout'];
function SettlePgcCtrl($scope, dataService: IDataService, Notification, seeModal: ISeeModalService, $timeout) {
  $scope.canWithdraw = false;

  init();

  function init() {
    getPgcBillSummaryData();
    getPgcNeedWithdraw();
    getPgcHasWithdraw();
    getPgcHasRemit(1);
  }
  /**
   * 账单统计
   */
  function getPgcBillSummaryData() {
    dataService.pgc_settle_getPgcBillSummaryData().then(res => $scope.BillStats = res.data);
  }

  /**
   * 待提现账单
   */
  function getPgcNeedWithdraw(p = 1) {
    dataService.pgc_settle_getWithdrawPgcBillList({
      p,
      status: 0,
    }).then(res => $scope.NeedWithdrawList = angular.extend({ list: [] }, res.data));
  }
  /**
   * 已申请提现账单
   */
  function getPgcHasWithdraw(p = 1) {
    dataService.pgc_settle_getWithdrawPgcBillList({
      p,
      status: 1,
    }).then(res => $scope.HasWithdrawList = angular.extend({ list: [] }, res.data));
  }

  /**
   * 已打款账单
   * @param _p Object {p: PageNum}
   */
  function getPgcHasRemit(p = 1) {
    dataService.pgc_settle_getWithdrawPgcBillList({
      p,
      status: 2,
    }).then(res => $scope.HasRemitList = angular.extend({ list: [] }, res.data));
  }
  /**
   * 分页
   */
  $scope.pageChange = function () {
    getPgcHasRemit($scope.page);
  };
  /**
   * 自媒体确认提现
   */
  $scope.withDraw = function (settle_date) {
    seeModal.confirmP('确认提现', '确定要提现吗？').then(() =>
      dataService.pgc_settle_withdraw({
        settle_date,
      }).then(data => {
        Notification.success(data.msg);
        return init();
      }),
    );
  };
}
// })();
