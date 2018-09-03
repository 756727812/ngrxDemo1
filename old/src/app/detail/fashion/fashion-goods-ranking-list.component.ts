// (function () {
//   'use strict';
import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export const fashionGoodsRankingList = {
  template: require('./fashion-goods-ranking-list.template.html'),
  controller: goodsRankingListController,
};

const version = +new Date();

// angular
//   .module('seego.fashion')
//   .component('fashionGoodsRankingList', {
//     templateUrl: `detail/fashion/fashion-goods-ranking-list.template.html?v=${version}`,
//     controller: goodsRankingListController
//   })

goodsRankingListController.$inject = ['$scope', '$routeParams', '$timeout', '$q', 'Notification', '$location', 'fashionService', 'dataService', '$cookies', '$log', '$uibModal'];
function goodsRankingListController(
  $scope: ng.IScope,
  $routeParams: ng.route.IRouteParamsService,
  $timeout: ng.ITimeoutService,
  $q: ng.IQService,
  Notification: INotificationService,
  $location: ng.ILocationService,
  fashionService,
  dataService: IDataService,
  $cookies: ng.cookies.ICookiesService,
  $log: ng.ILogService,
  $uibModal: any,
) {
  let $ctrl = this, page: string, seller_privilege, $grid, day_id;

  $ctrl.submitSearch = submitSearch;
  $ctrl.clearSearch = clearSearch;
  $ctrl.selectTab = selectTab;
  $ctrl.daytypeFilter = daytypeFilter;
  $ctrl.hideGoods = hideGoods;
  $ctrl.changeShowType = changeShowType;
  $ctrl.materialSync = materialSync;
  $ctrl.saveNotes = saveNotes;
  $ctrl.$onInit = activate;

  $ctrl.toSelectClass = toSelectClass;
  $ctrl.getSelectedClassName = getSelectedClassName;
  $ctrl.selected_class = [];
  $ctrl.class_list = [];
  $ctrl.set_class = true;

  $scope.$watch('$ctrl.day_id', function (cur, prev) {
    if (typeof cur !== 'undefined' && cur !== prev) {
      $location.search(angular.extend({}, $location.search(), {
        day_id: moment(cur).format('YYYY-MM-DD'),
      }));
    }
  });

  ////////////////////////

  function activate() {
    $ctrl.set_class = true;
    page = $routeParams['page'] || '1';
    day_id = $routeParams['day_id'];
    seller_privilege = $cookies.get('seller_privilege');
    $ctrl.total_items = 0;
    $ctrl.show_type = sessionStorage.getItem(md5('show_type')) || 'grid';
    $ctrl.day_type = $routeParams['day_type'] || 1;
    $ctrl.rank_type = $location.hash() || '1';
    $ctrl.searchForm = {
      filter_class_id: $routeParams['filter_class_id'],
      filter_country_name: $routeParams['filter_country_name'],
      keyword: $routeParams['keyword'],
      filter_price_start: +$routeParams['filter_price_start'],
      filter_price_end: +$routeParams['filter_price_end'],
    };
    // $ctrl.day_id = day_id ? moment(day_id)._d : moment().subtract(1, 'days')._d;
    $ctrl.day_id = day_id ? moment(day_id)['_d'] : moment().subtract(1, 'days')['_d'];
    const promises = [getItemTopRank()];
    return $q.all(promises).then(function () {
      $log.info('单品排行榜视图激活！');
    });
  }

  /**
   * 筛选时间周期
   * @param { day_type: number } - 1: 近7天； 2: 近30天
   */
  function daytypeFilter(day_type) {
    $location.search(angular.extend({}, $location.search(), {
      day_type,
    }));
  }

  function submitSearch() {
    //$ctrl.set_class = false;
    //getItemTopRank()
    $location.search(angular.extend({}, $location.search(), $ctrl.searchForm));
  }

  function clearSearch() {
    $location.search({ day_type: $ctrl.day_type }).hash($ctrl.rank_type);
  }

  function selectTab() {
    $location.search(_.assign({}, $location.search(), { page: 1 }));
  }

  function changeShowType(type) {
    $ctrl.show_type = type;
    sessionStorage.setItem(md5('show_type'), type);
    if (type === 'grid') {
      $timeout(function () {
        // $grid = $('.grid').masonry({
        //   itemSelector: '.grid-item',
        //   percentPosition: true,
        //   columnWidth: '.grid-sizer'
        // });
        // $grid.imagesLoaded().progress(function () {
        //   $grid.masonry();
        // });
        $grid = (<any>$('.grid')).imagesLoaded(function () {
          $grid.masonry({
            itemSelector: '.grid-item',
            percentPosition: true,
            columnWidth: '.grid-sizer',
          });
        });
      });
    }
  }

  function hideGoods(id, is_public) {
    return dataService.item_itemHide({
      day_type: $ctrl.day_type,
      rank_type: $ctrl.rank_type,
      item_id: id,
      hide_status: +!is_public,
    }).then(function (res) {
      Notification.success();
      $timeout(function () {
        $grid.masonry();
      });
      return $ctrl.hotgoods_list;
    });
  }

  function getItemTopRank() {
    const params = {
      page,
      page_size: 20,
      seller_privilege,
      day_type: $ctrl.day_type,
      day_id: moment($ctrl.day_id).format('YYYY-MM-DD'),
      rank_type: $ctrl.rank_type,
      filter_class_id: JSON.stringify($ctrl.searchForm.filter_class_id),
      //filter_class_id: $ctrl.selected_class.length && JSON.stringify($ctrl.selected_class.map(o => o.class_id)) || undefined,
      filter_price_start: $ctrl.searchForm.filter_price_start || 0,
      filter_price_end: $ctrl.searchForm.filter_price_end || 0,
      filter_country_name: JSON.stringify($ctrl.searchForm.filter_country_name),
      keyword: $ctrl.searchForm.keyword,
    };
    return dataService.item_getItemTopRank(params).then(function (res) {
      $ctrl.hotgoods_list = res.data.list_item;
      $ctrl.list_class = res.data.list_class;
      $ctrl.list_country = res.data.list_country;
      $ctrl.list_price = res.data.list_price;
      $ctrl.total_items = res.data.count_item;

      if ($ctrl.set_class) {
        const data = res.data.list_class_choice;
        let classList = [], length = data.length, temp = {}, i, j, k;
        _.forEach(data, o => {
          o.parent_id === '0' && classList.push(_.assign(o, { children: [] }));
        });
        const cllength = classList.length;
        for (i = 0; i < length; i++) {
          if (data[i].parent_id === '0') continue;
          for (j = 0; j < cllength; j++) {
            if (data[i].parent_id == classList[j].class_id) {
              classList[j].children.push(_.assign(data[i], { children: [] }));
              break;
            }
          }
        }
        let flag = true;

        for (i = 0; i < length; i++) {
          if (~data[i].class_path.indexOf(',')) {
            flag = true;
            for (j = 0; j < cllength; j++) {
              if (!flag) break;
              const templ = classList[j].children.length;
              for (k = 0; k < templ; k++) {
                if (classList[j].children[k].class_id == data[i].parent_id) {
                  classList[j].children[k].children.push(data[i]);
                  flag = false;
                  break;
                }
              }
            }
          }
        }

        $ctrl.class_list = classList;
      }


      $timeout(function () {
        if ($ctrl.show_type === 'grid') {
          $grid = (<any>$('.grid')).imagesLoaded(function () {
            $grid.masonry({
              itemSelector: '.grid-item',
              percentPosition: true,
              columnWidth: '.grid-sizer',
            });
          });
        }
      });
      return $ctrl.hotgoods_list;
    });
  }

  function materialSync(item_id) {
    return dataService.data_api_materialSync({
      sync_flag: 1,
      ids: item_id,
    }).then(function (res) {
      Notification.success('同步成功！');
    });
  }

  function saveNotes(data, item_id) {
    if (data && data.trim()) {
      return dataService.data_api_materialNotes({
        opt_type: 1,
        item_id,
        notes: data,
        is_v2: 1,
      }).then(function (res) {
        Notification.success('添加备注成功！');
        return activate();
      });
    }
  }

  // 显示选择品类的表
  function toSelectClass() {
    console.log($ctrl.selected_class);
    const modalInstance = $uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../datacenter/modal-select-class.html'),
      controller: 'modalSelectClassController',
      controllerAs: 'vm',
      resolve: {
        // 获取选择的列表
        selected_class: () => $ctrl.selected_class,
        // 获取全部的列表
        class_list: () => $ctrl.class_list,
      },
    });

    return modalInstance.result.then((new_selected_class: any[]) => $ctrl.selected_class = new_selected_class);
  }

  // 在搜索中显示
  function getSelectedClassName() {
    //console.log($ctrl.selected_class);
    return $ctrl.selected_class.map(o => o.class_name).join(',');
  }

}
// })();
