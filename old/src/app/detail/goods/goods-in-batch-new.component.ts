/**
 * 新建商品规则
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

goodsInBatchNewController.$inject = ['$scope', '$location', '$cookies', 'dataService', 'Notification'];
export function goodsInBatchNewController($scope, $location, $cookies, dataService: IDataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  init();
  function init() {
    dataService.CommonData_getConfigLocation().then(res => $scope.countryList = res.data);
  }
  const seller_privilege = $cookies.get('seller_privilege');
  $scope.formData = {
    selectGoodsType: (seller_privilege == 1 || seller_privilege == 30) ? '2' : '1',
    exec_type: (seller_privilege == 1 || seller_privilege == 30) ? 'modifyItemPrice' : 'off',
  };
  $scope.save = function () {
    $scope.errors = [];
    if ($scope.dateTimePicker < new Date()) {
      $scope.errors.push('规则创建时间必须早于预约的执行时间！');
      return;
    }
    const _params = angular.extend($scope.formData, {
      start_time: +$scope.dateTimePicker / 1000,
    });
    if ($scope.formData.ids) {
      $scope.formData.item_ids = JSON.stringify($scope.formData.ids.split('|'));
    }
    $scope.formData.modify_price_count = $scope['modify_price_count_' + $scope.formData.modify_price_type];
    if ($scope.formData.modify_price_count < 1) {
      $scope.errors.push('输入的数字必须大于0！');
      return;
    }

    dataService.rule_addRule(_params).then(res => $location.path('/goods/goods-in-batch'));
  };

  $scope.onSetTime = function (newDate, oldDate) {
    if (newDate.getTime() <= (new Date())) {
      $scope.dateTimePicker = oldDate;
      Notification.warn('规则创建时间必须早于预约的执行时间！');
    }
  };
}

export const goodsInBatchNew: ng.IComponentOptions = {
  template: require('./goods-in-batch-new.template.html'),
  controller: goodsInBatchNewController,
};
