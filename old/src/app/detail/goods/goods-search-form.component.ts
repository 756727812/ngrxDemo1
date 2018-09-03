import { IDataService } from '../../services/data-service/data-service.interface'
import * as moment from 'moment';
import * as angular from 'angular';
import * as _ from 'lodash';

goodsSearchFormController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'Notification'];
export function goodsSearchFormController($scope, $location, $routeParams, dataService: IDataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const type = $scope.currentType,
    page = $routeParams.page || 1,
    version = +new Date()

  $scope.datePicker = {
    startDate: $routeParams.from ? moment($routeParams.from * 1000) : null,
    endDate: $routeParams.to ? moment($routeParams.to * 1000) : null
  };
  $scope.goods = [];
  $scope.searchData = {
    keyword: $routeParams.keyword,
    prepare: $routeParams['prepare'],
    seller_type: $routeParams['seller_type'],
    ship_country: $routeParams['ship_country']
  };

  $scope.searchGoods = function() {
    if ($scope.datePicker.startDate) {
      angular.extend($scope.searchData, {
        from: $scope.datePicker.startDate ? Date.parse($scope.datePicker.startDate) / 1000 : null,
        to: $scope.datePicker.endDate ? Date.parse($scope.datePicker.endDate) / 1000 : null
      })
    }
    $location.search($scope.searchData);
  };

  switch (type) {

    case 'WaitPost':    // 待编辑商品
      $scope.template = 'detail/goods/goods-wait-post.html?v=' + version;
      break;
    case 'Off':     // 已下架商品
      $scope.template = 'detail/goods/goods-off.html?v=' + version;
      break;
    case 'hidden':  // 已隐藏商品
      $scope.template = 'detail/goods/goods-hidden.html?v=' + version;
      break;
    case 'collection':  // 我的合集
      $scope.template = 'detail/goods/my-collection.html?v=' + version;
      break;
    case 'search':  // 搜索管理
      $scope.template = 'detail/goods/goods-search.html?v=' + version;
      break;
    case 'fusion':
      $scope.template = 'detail/goods/goods-fusion.html?v=' + version;
      break;
    default:    // 已上架商品
      $scope.template = 'detail/goods/goods-posted.html?v=' + version;
  }

  function renderCountyList() {
    dataService.CommonData_getConfigLocation().then(res => $scope.countryList = res.data)
  }

  renderCountyList();
}

export const goodsSearchForm: ng.IComponentOptions = {
  template: require('./goods-search-form.template.html'),
  controller: goodsSearchFormController
}
