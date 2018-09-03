/**
 * 已隐藏商品
 */
import { IDataService } from '../../services/data-service/data-service.interface';

goodsHiddenController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification'];
export function goodsHiddenController($scope, $routeParams, dataService: IDataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let page = $routeParams.page || 1;

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
    const params = {
      p: page,
      keyword: $routeParams['keyword'],
      from: $routeParams['from'],
      to: $routeParams['to'],
    };

    dataService.item_itemListHidden(params).then(data => {
      $scope.goods = data.data.list;
      $scope.total_items = data.data.count;
    });
  }

  init();
}

export const goodsHidden: ng.IComponentOptions = {
  template: require('./goods-hidden.template.html'),
  controller: goodsHiddenController,
};
