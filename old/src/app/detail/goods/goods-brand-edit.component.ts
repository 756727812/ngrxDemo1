/**
 * 品牌库管理--编辑
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

goodsBrandEditController.$inject = ['$scope', '$routeParams', 'Notification', 'dataService', '$location'];
export function goodsBrandEditController($scope, $routeParams, Notification, dataService: IDataService, $location) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const brand_id = $routeParams.id;
  $scope.brandName = $routeParams.name;
  init();
  function init() {
    getBrandDetail(brand_id);
    dataService.CommonData_getConfigLocation().then(res => $scope.countryList = res.data);
  }
  $scope.upload = function (res) {
    if (res.result == 1) {
      $scope.image = 'https://img-qn.seecsee.com' + res.data;
    }
  };
  $scope.upload1 = function (res) {
    if (res.result == 1) {
      $scope.brand_banner = 'https://img-qn.seecsee.com' + res.data;
    }
  };
  $scope.setStandardBrand = function () {
    if (this.brandDetail.is_standard == '0') {
      $scope.brandDetail.is_public = '0';
    }
  };
  function getBrandDetail(brand_id) {
    dataService.brand_getBrandDetail({ brand_id }).then(res => {
      $scope.brandDetail = res.data;
      let list = res.data.class_list;
      $scope.checkboxClass = ['', '', '', ''];
      if (list) {
        list = list.split(',');
        angular.forEach(list, function (item) {
          const index = item - 1;
          $scope.checkboxClass[index] = item;
        });
      }
    });
  }
  $scope.updateBrandInfo = function () {
    let params = {};
    const p = $scope.brandDetail;
    const classList = [];
    for (let i = 0; i < 4; i++) {
      if ($scope.checkboxClass[i]) {
        classList.push($scope.checkboxClass[i]);
      }
    }
    params = $.extend(p, {
      class_list: classList.toString(),
      brand_logo: $scope.image ? $scope.image : p.brand_logo,
      brand_banner: $scope.brand_banner || p.brand_banner,
    });
    dataService.brand_updateBrand(params).then(res => Notification.success('该品牌信息修改成功！'));
  };
}

export const goodsBrandEdit: ng.IComponentOptions = {
  template: require('./goods-brand-edit.template.html'),
  controller: goodsBrandEditController,
};
