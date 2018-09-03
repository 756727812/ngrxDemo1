import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';

export const assetWithdrawDetail = {
  template: require('./asset-withdraw-detail.template.html'),
  controller: WithdrawDetailController,
};
WithdrawDetailController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification'];
function WithdrawDetailController($scope, $routeParams, dataService: IDataService, Notification) {

  const WithdrawId = $routeParams.id;
  const date = {
    startDate: null,
    endDate: null,
  };
  // models
  angular.extend($scope, {
    WithdrawDetail: {},
    NoSelfWithdraw: false,
    NoDispatchWithdraw: false,
    searchForm: {
      keyword1: '',
      keyword2: '',
    },
    datePicker1: {
      date: angular.copy(date),
    },
    datePicker2: {
      date: angular.copy(date),
    },
  });

  // methods
  angular.extend($scope, {
    finishPay(order_id) {
      dataService.asset_finsihPay({ order_id }).then(res => Notification.success());
    },
    submitSearchOrder(type) {
      const param = {
        id: WithdrawId,
        type: type === 0 ? 0 : 1,
        keyword: type === 0 ? $scope.searchForm.keyword1 : $scope.searchForm.keyword2,
        startDate: type === 0 ? $scope.datePicker1.date.startDate ? Date.parse($scope.datePicker1.date.startDate) : '' : $scope.datePicker2.date.startDate ? Date.parse($scope.datePicker2.date.startDate) : '',
        endDate: type === 0 ? $scope.datePicker1.date.endDate ? Date.parse($scope.datePicker1.date.endDate) : '' : $scope.datePicker2.date.startDate ? Date.parse($scope.datePicker2.date.startDate) : '',
      };
      dataService.asset_searchWithdrawOrder(param).then(res => {
        type === 0
          ? $scope.WithdrawDetail.self_order.list = res.data.list
          : $scope.WithdrawDetail.dispatch_order.list = res.data.list;
        $scope.total_items = res.data.count;
      });
    },
  });

  function setData(data) {
    const page = $routeParams.page || 1;
    angular.isObject(data) ?
      angular.extend($scope, {
        WithdrawDetail: data.data,
        NoSelfWithdraw: data.data.self_order.count == 0,
        NoDispatchWithdraw: data.data.dispatch_order.count == 0,
      }) :
      Notification.warn('获取数据格式错误!');
  }


  WithdrawId === '0'
    ? // 可提现
    dataService.asset_getWithdrawDetail({ p: 1 }).then(data => setData(data))
    :
    // 已提现
    dataService.asset_getWithdrawDetailById({ id: WithdrawId }).then(data => setData(data));
}
// })();
