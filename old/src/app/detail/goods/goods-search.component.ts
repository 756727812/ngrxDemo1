/**
 * 搜索管理
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

goodsSearchController.$inject = ['$scope', '$location', '$routeParams', '$timeout', '$uibModal', 'filterFilter', 'Notification', 'dataService', 'seeModal'];
export function goodsSearchController($scope, $location, $routeParams, $timeout, $uibModal, filterFilter, Notification, dataService: IDataService, seeModal: ISeeModalService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  angular.extend($scope, {
    total_items: 1,
    // 已被选择的商品
    checkedItems: [],
    // 更新已选择的商品数组
    selectedChanged() {
      $scope.checkedItems = filterFilter($scope.goods, function (good) {
        return good.isChecked;
      });
    },
    // 全选
    checkAll() {
      angular.forEach($scope.goods, function (item) {
        item.isChecked = true;
      });
      $scope.selectedChanged();
    },
    // 反选
    checkReverse() {
      angular.forEach($scope.goods, function (item) {
        item.isChecked = !item.isChecked;
      });
      $scope.selectedChanged();
    },
    // 搜索关键字
    search() {
      $location.search({
        keyword: $scope.keyword,
      });
    },
    // 显示或隐藏商品
    hideOrShow(goods, isHidden) {
      const _title = isHidden == '1' ? '显示商品' : '隐藏商品',
        _body = isHidden == '1' ? '你确定要执行显示操作吗？' : '你确定要执行隐藏操作吗？';

      seeModal.confirmP(_title, _body).then(() =>
        dataService.search_control_showOrHideItems({
          key: $scope.keyword,
          item_id_list: getIdArrayJson(goods),
        },                                         isHidden == '1').then(res => {
          Notification.success();
          return init();
        }),
      );
    },
    // 调整权重
    changeWeight(goods) {
      //调整权重2.0
      const modalInstance = $uibModal.open({
        animation: true,
        template: require('./modal-change-goods-weight.template.html'),
        controller: 'modalChangeWeightNewCtrl',
        size: 'md',
        resolve: {
          score_info() {
            if (angular.isArray(goods)) {
              let list = '';
              angular.forEach(goods, function (item) {
                if (list != '') {
                  list += ',';
                }
                list += item.item_id;
              });
              goods[0].score_info.item_id = list;
              return goods[0].score_info;
            } else {
              return goods.score_info;
            }
          },
          list_set() {
            const list_set = [];
            for (let i = 1; i <= 14; i++) {
              list_set.push({ id: i, name: i });
            }
            return list_set;
          },
        },
      });
      modalInstance.result.then(function (score_info) {
        //          console.log(score_info.item_id)
        const params = {
          score_info: JSON.stringify(score_info),
        };
        return dataService.search_control_scoreUpdate(params).then(function (res) {
          Notification.success();
          $scope.$apply(init());
        });

      },                        function () {
        //
      });

    },
    // 全局隐藏
    setGlobalHidden(goods) {
      seeModal.confirmP('全局隐藏', '你确定要执行全局隐藏操作吗？').then(() =>
        dataService.search_control_setGlobalHidden({
          item_id_list: getIdArrayJson(goods),
        }).then(res => {
          Notification.success();
          return init();
        }),
      );
    },
    // 展示商品
    showUp(good) {
      const modalInstance = $uibModal.open({
        animation: false,
        template: require('./modal-goods-show-up.template.html'),
        controller: 'ModalGoodShowUpCtrl',
        size: 'lg',
        resolve: {
          good() {
            return good;
          },
        },
      });
    },
  });

  const init = function () {
    if ($routeParams.keyword) {
      $scope.keyword = $routeParams.keyword;
      dataService.search_control_searchItems({
        key: $routeParams.keyword,
        type: '1',
        p: $routeParams.page || 1,
      }).then(res => {
        $scope.goods = res.data.item.list;
        $scope.total_items = res.data.item.count;
      });
    }
  };

  init();

  // 由商品数组或单个商品获取商品id数组
  function getIdArrayJson(objs) {
    if (angular.isArray(objs)) {
      return JSON.stringify(objs.map(function (i) { return i.item_id; }));
    } else {
      return JSON.stringify([objs.item_id]);
    }
  }

}

export const goodsSearch: ng.IComponentOptions = {
  template: require('./goods-search.template.html'),
  controller: goodsSearchController,
};
