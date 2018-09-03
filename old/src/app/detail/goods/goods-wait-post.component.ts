/**
 * 待编辑商品
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

goodsWaitPostController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification'];
export function goodsWaitPostController($scope, $routeParams, dataService: IDataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const page = $routeParams.page || 1;

  $scope.skuMark = function () {
    let sku = '';
    for (let i = 0; i < arguments[0].sku_list.length; i++) {
      if (arguments[0].sku_list[i].sku_mark) {
        sku = arguments[0].sku_list[i].sku_mark;
        break;
      }
    }
    return sku;
  };

  function init() {
    const params = [];
    params['p'] = page;
    $routeParams.keyword ? params['keyword'] = $routeParams.keyword : '';
    $routeParams.from ? params['from'] = $routeParams.from : '';
    $routeParams.to ? params['to'] = $routeParams.to : '';

    dataService.item_itemListNeedEdit(params).then(res => {
      $scope.goods = res.data.list;
      $scope.total_items = res.data.count;
    });
  }

  init();
}

export const goodsWaitPost: ng.IComponentOptions = {
  template: require('./goods-wait-post.template.html'),
  controller: goodsWaitPostController,
};
