// (function () {
// 'use strict';

import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export const fashionMaterial = {
  template: require('./fashion-material.template.html'),
  controller: materialController,
};

materialController.$inject = ['$routeParams', '$timeout', '$q', 'Notification', '$location', 'seeModal', 'fashionService', 'dataService', '$log'];
function materialController(
  $routeParams: ng.route.IRouteParamsService,
  $timeout: ng.ITimeoutService,
  $q: ng.IQService,
  Notification: INotificationService,
  $location: ng.ILocationService,
  seeModal: ISeeModalService,
  fashionService,
  dataService: IDataService,
  $log: ng.ILogService) {

  const $ctrl = this;
  let page: string, user_id, is_public, blogger, $grid;

  $ctrl.searchLib = searchLib;
  $ctrl.searchCust = searchCust;
  $ctrl.getFilteText = getFilteText;
  $ctrl.materialFilter = materialFilter;
  $ctrl.submitSearch = submitSearch;
  $ctrl.clearSearch = clearSearch;
  $ctrl.seeDetail = seeDetail;
  $ctrl.addToFavorite = addToFavorite;
  $ctrl.removeFavoriteItem = removeFavoriteItem;
  $ctrl.generateWish = generateWish;
  $ctrl.applyNewLib = applyNewLib;
  $ctrl.applyCustomLib = applyCustomLib;
  $ctrl.searchKol = searchKol;
  $ctrl.changeShowType = changeShowType;
  $ctrl.itemHide = itemHide;
  $ctrl.$onInit = activate;

  function activate() {
    dataService.data_api_fashionView({}).then(res => { });

    page = $routeParams['page'] || '1';
    is_public = $routeParams['is_public'];
    blogger = $routeParams['blogger'];
    $ctrl.show_type = sessionStorage.getItem(md5('show_type')) || 'grid';
    $ctrl.start_date = $routeParams['start_date'];
    $ctrl.end_date = $routeParams['end_date'];
    $ctrl.platform = $routeParams['platform'];
    $ctrl.custom = $routeParams['custom'];
    $ctrl.sortby = $routeParams['sortby'];
    $ctrl.searchForm = {
      country: $routeParams['country'],
      catalog: $routeParams['catalog'],
      kol: $routeParams['kol'] || 'all',
      keyword: $routeParams['keyword'],
    };
    $ctrl.datePicker = {
      startDate: $ctrl.start_date ? moment($ctrl.start_date) : null,
      endDate: $ctrl.end_date ? moment($ctrl.end_date) : null,
    };
    return fashionService.getUid().then(function (uid) {
      user_id = uid;
      const promises = [getCatlog(), getPlatform(), getMaterialList(), checkPopEditKol()];
      return $q.all(promises).then(function () {
        $log.info('素材库视图激活');
      });
    });

  }

  //临时加的法务需求，强制让Kol编辑资料，并且在几个页面加判断
  function checkPopEditKol() {
    dataService.seller_checkPopEditKol().then(res => {
      if (res.data.pop == 1) {
        seeModal.confirmP('注意', '后台系统升级，为了提升账号安全性，请你前往个人中心补充个人信息', '现在就去^_^', false)
          .then(() => $location.url('personalInfo/account/modifyinfo-kol?id=' + res.data.id));
      }
    });
  }

  /**
   * 获取下拉按钮的文字
   */
  function getFilteText() {
    switch ($ctrl.sortby) {
      case 'publish_time':
        return '按发布时间';
      case 'likes':
        return '按点赞数';
      default:
        return '排序';
    }
  }

  /**
   * 申请新库
   */
  function applyNewLib() {
    return fashionService.applyNewLib($ctrl.public_kol_catalogs, user_id);
  }

  // 自定义素材库
  function applyCustomLib() {
    return fashionService.applyCustomLib($ctrl.public_cust_catalogs, user_id);
  }

  /**
   * 改变fashion item的展示效果
   */
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

  /**
   * 下拉按钮的筛选
   */
  function materialFilter(sorttype) {
    $location.search(angular.extend({}, $location.search(), {
      sortby: sorttype,
    }));
  }

  /**
   * 左侧的平台筛选
   */
  function searchLib(type, ispublic) {
    $location.search(angular.extend({}, $location.search(), {
      platform: type,
      is_public: ispublic,
    }));
  }
  function searchCust(type, ispublic) {
    $location.search({
      custom: type,
      is_public: ispublic,
    });
  }

  /**
   * KOL用户搜索分类
   */
  function searchKol(kol_id) {
    $location.search(angular.extend({}, $location.search(), {
      kol: kol_id,
      is_public: '011',
      custom: '',
    }));
  }

  function submitSearch() {
    $location.search(angular.extend({}, $location.search(), $ctrl.searchForm, ($ctrl.datePicker.startDate && $ctrl.datePicker.endDate) && {
      start_date: +$ctrl.datePicker.startDate._d,
      end_date: +$ctrl.datePicker.endDate._d,
    }));
  }

  function clearSearch() {
    $location.search({});
  }

  /**
   * 打开查看详情模态框
   */
  function seeDetail(item) {
    return fashionService.fashionDetail(item);
  }

  function addToFavorite(item_id) {
    return fashionService.addToFavorite(item_id, user_id).then(function () {
      const index = _.findIndex($ctrl.material_list, function (o) { return (<any>o)._id === item_id; });
      $ctrl.material_list[index].isfavorite = true;
      return $ctrl.material_list;
    });
  }
  function removeFavoriteItem(item_id) {
    fashionService.removeFavoriteItem(item_id, user_id, function () {
      const index = _.findIndex($ctrl.material_list, function (o) { return (<any>o)._id === item_id; });
      $ctrl.material_list[index].isfavorite = false;
      return $ctrl.material_list;
    });
  }
  function generateWish(desc, img_url) {
    fashionService.generateWish(desc, img_url);
  }



  function getCatlog() {
    return fashionService.getCatalog().then(function (data) {
      $ctrl.inner_libs = data.PlatformCatalog;
      $ctrl.inner_kol_catalog = data.KOLCatalog;
      $ctrl.circle_catalog = data.CircleCatalog;
      $ctrl.country_catalog = data.CountryCatalog;
    });
  }

  function getPlatform() {
    return fashionService.getPlatform(user_id).then(function (data) {
      $ctrl.public_kol_catalogs = data.KOLCatalog;
      $ctrl.public_libs = data.PlatformCatalog;
      $ctrl.public_cust_catalogs = data.CustomCatalog;
    });
  }

  function itemHide(id, is_hide, index) {
    return dataService.crawler_itemHide({
      skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
      item_id: id,
      hide_status: +!is_hide,
    }).then(function (res) {
      $ctrl.material_list.splice(index, 1);
      Notification.success('隐藏成功！');
      $timeout(function () {
        $grid.masonry();
      });
      return $ctrl.material_list;
    });
  }

  function getMaterialList() {

    const params = {
      p: page,
      uid: user_id,
      ispublic: is_public,
      blogger,
      sortby: $ctrl.sortby,
      platform: $ctrl.platform,
      custom: $ctrl.custom,
      country: $ctrl.searchForm.country,
      catalog: $ctrl.searchForm.catalog,
      kol: $ctrl.searchForm.kol,
      kw: $ctrl.searchForm.keyword,
      start_date: $ctrl.start_date ? Math.floor($ctrl.start_date / 1000) : undefined,
      end_date: $ctrl.end_date ? Math.floor($ctrl.end_date / 1000) : undefined,
    };
    return dataService.crawler_getMaterialList(params).then(function (res) {
      if (res.result === 1 || res.result === 10012) {
        $ctrl.material_list = res.data;
        $ctrl.total_items = res.allcount;
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
        return $ctrl.material_list;
      } else {
        Notification.dataError(res.msg);
        return $q.reject(res.msg);
      }
    });
  }
}
// })();
