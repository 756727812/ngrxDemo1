/**
 * 复制商品
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

goodsFusionController.$inject = ['$scope', 'dataService', 'Notification'];
export function goodsFusionController($scope, dataService: IDataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.goods = [];
  $scope.formData = {
    item_ids: '',
    is_delete: 0,
    seller_email: '',
    is_copy_express: '0',
    is_stored: 0,
  };
  $scope.setStore = function () {
    if ($scope.formData.is_stored === 1) {
      $scope.formData.is_copy_express = '0';
    }
  };
  $scope.ok = function () {
    $scope.formError = '';
    if (!$scope.ids || angular.isArray($scope.ids) && $scope.ids.length === 0) {
      $scope.formError = '请填写商品ID！';
      return -1;
    }
    if (typeof $scope.formData.is_stored === 'undefined') {
      $scope.formError = '请选择该商品是否是囤货型商品！';
      return -1;
    }
    $scope.formData.item_ids = JSON.stringify($scope.ids.map(function (item) {
      return item.text;
    }));
    $scope.isPre == 0 && (delete $scope.formData.expire_time_1);
    dataService.item_copyItem($scope.formData).then(res => {
      angular.forEach(res.data, function (val, key) {
        $scope.goods.push({
          ori_id: key,
          new_id: val,
        });
      });
      $scope.ids = null;
    });
  };
}

export const goodsFusion: ng.IComponentOptions = {
  template: require('./goods-fusion.template.html'),
  controller: goodsFusionController,
};
