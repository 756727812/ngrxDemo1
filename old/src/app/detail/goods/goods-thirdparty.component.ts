import { IDataService } from '../../services/data-service/data-service.interface';
import * as moment from 'moment';
import * as angular from 'angular';

goodsThirdpartyController.$inject = ['$scope', '$q', '$routeParams', '$location', '$timeout', 'Notification', '$log', 'dataService', 'seeModal', '$uibModal'];
export function goodsThirdpartyController($scope, $q, $routeParams, $location, $timeout, Notification, $log, dataService: IDataService, seeModal, $uibModal) {
  const vm = this;
  const page = $routeParams.page || 1,
    item_insale = $routeParams.item_insale || '-1',
    start_date = $routeParams.start_date,
    end_date = $routeParams.end_date;

  vm.datePicker = {
    startDate: start_date ? moment(start_date * 1000) : null,
    endDate: end_date ? moment(end_date * 1000) : null,
  };
  vm.searchData = {
    keyword: $routeParams.keyword,
    platform: $routeParams.platform,
    item_insale,
    mall: $routeParams.mall,
    ship_country: $routeParams.ship_country,
  };
  vm.submitSearch = submitSearch;
  vm.importGoods = importGoods;
  vm.removeGoods = removeGoods;
  vm.readyToSell = readyToSell;

  activate();

  function activate() {
    const promises = [getCountryList(), getPlatforms(), getThirdPartyGoods()];
    return $q.all(promises).then(function () {
      $log.info('第三方商品视图激活！');
    });
  }

  function submitSearch() {
    $location.search(angular.extend({}, $location.search, vm.searchData, {
      page: 1,
      start_date: vm.datePicker.startDate ? Math.floor(+vm.datePicker.startDate._d / 1000) : undefined,
      end_date: vm.datePicker.endDate ? Math.floor(+vm.datePicker.endDate._d / 1000) : undefined,
    }));
  }

  function importGoods() {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-import-goods.template.html'),
      controller: 'modalImportGoodsController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        platforms() {
          return vm.platforms;
        },
      },
    });
    modalInstance.result.then(function (params) {
      if (params.refresh == 1) {
        return getThirdPartyGoods();
      }
      return dataService.third_api_addItemBySpuIds(params).then(function (res) {
        getThirdPartyGoods();
        if (res.data.not_exists_list.length || res.data.exist_list.error.length) {
          let error = res.data.not_exists_list.join('，');
          const goods_id_list = [];
          res.data.exist_list.error.forEach(function (e) {
            error += e.spu_id + '（' + e.reason + '）,';
            if (e.reason === '缺失对应品类') {
              goods_id_list.push(e.spu_id);
            }
          });

          const modalInstance2 = $uibModal.open({
            animation: true,
            template: require('./modal-import-goods-result.template.html'),
            controller: 'modalImportGoodsResultController',
            controllerAs: 'vm',
            backdrop: 'static',
            size: 'lg',
            resolve: {
              error() {
                return '如下商品导入失败：' + error;
              },
              goods_id_list() {
                return goods_id_list;
              },
            },
          });

          modalInstance2.result.then(function (params2) {
            if (goods_id_list.length > 0) {
              return dataService.third_api_addItemBySpuIds({
                platform: params.platform,
                class_id_map: params2,
                spu_ids: goods_id_list.join(','),
              }).then(function (res2) {
                if (res2.data.not_exists_list.length || res2.data.exist_list.error.length) {
                  let error2 = res2.data.not_exists_list.join('，');
                  res2.data.exist_list.error.forEach(function (e) {
                    error2 += e.spu_id + '（' + e.reason + '）,';
                  });
                  error2 += '。';

                  seeModal.confirm('商品导入完毕', '如下商品导入失败：' + error2);
                }
                return getThirdPartyGoods();
              });
            }
          },                         function () { });
          return error;
        }
      });
    },                        function () {
    });
  }

  function readyToSell(id) {
    dataService.item_readyToSell({
      item_id: id,
    }).then(function (res) {
      activate();
      Notification.success('上架成功！');
    });
  }

  function getCountryList() {
    return dataService.CommonData_getConfigLocation().then(function (res) {
      if (res.result == 1) {
        vm.countryList = res.data;
        return vm.countryList;
      }
    });
  }

  function skuMark() {
    let sku = '';
    for (let i = 0; i < arguments[0].sku_list.length; i++) {
      if (arguments[0].sku_list[i].sku_mark) {
        sku = arguments[0].sku_list[i].sku_mark;
        break;
      }
    }
    return sku;
  }

  function getThirdPartyGoods() {
    const params = {
      page,
      keyword: vm.searchData.keyword,
      platform_id: vm.searchData.platform,
      ship_country: vm.searchData.ship_country,
      from: start_date,
      to: end_date,
      item_insale,
    };
    return dataService.item_platformItemList(params).then(function (res) {
      if (res.result === 1) {
        vm.goodsList = res.data.list;
        $scope.total_items = res.data.count;
        return vm.goodsList;
      }
    });
  }

  function getPlatforms() {
    return dataService.third_api_getPlatformList().then(function (res) {
      if (res.result === 1) {
        vm.platforms = res.data;
        return vm.platforms;
      }
    });
  }

  function removeGoods(id) {
    seeModal.confirm('下架商品', '确认下架该商品？', function () {
      return dataService.item_deleteItem({
        item_id: id,
      }).then(function (res) {
        if (res.result === 1) {
          Notification.success('下架成功！');
          return getThirdPartyGoods();
        }
      });
    });

  }
}

export const goodsThirdparty: ng.IComponentOptions = {
  template: require('./goods-thirdparty.template.html'),
  controller: goodsThirdpartyController,
};
