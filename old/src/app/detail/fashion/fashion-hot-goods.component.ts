// (function () {
//   'use strict';
import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as _ from 'lodash';;
import * as md5 from 'md5';;

export const fashionHotGoods = {
  template: require('./fashion-hot-goods.template.html'),
  controller: hotgoodsController,
};
const version = +new Date();

// angular
//   .module('seego.fashion')
//   .component('fashionHotGoods', {
//     templateUrl: 'detail/fashion/fashion-hot-goods.template.html?v=' + version,
//     controller: hotgoodsController
//   })

hotgoodsController.$inject = ['$routeParams', '$timeout', '$q', 'Notification', '$location', 'fashionService', 'dataService', '$cookies', '$log', 'seeModal', '$uibModal'];
function hotgoodsController($routeParams, $timeout, $q, Notification, $location, fashionService, dataService: IDataService, $cookies, $log, seeModal: ISeeModalService, $uibModal) {
  const $ctrl = this;
  let page = $routeParams.page || 1,
    seller_privilege = $cookies.get('seller_privilege'),
    is_kol = seller_privilege === '24' || seller_privilege === '30',
    $grid;

  $ctrl.total_items = 0;
  $ctrl.show_type = sessionStorage.getItem(md5('show_type')) || (is_kol ? 'grid' : 'table');
  $ctrl.searchForm = {
    filter_class_id: $routeParams.filter_class_id,
    filter_country_name: $routeParams.filter_country_name,
    keyword: $routeParams.keyword,
    filter_price_start: +$routeParams.filter_price_start,
    filter_price_end: +$routeParams.filter_price_end,
  };

  $ctrl.searchFormBrand = {
    keyword: $routeParams.keyword,
  };

  $ctrl.list_goods_status = [
    { id: 0, name: '稳定' },
    { id: 1, name: '不稳定' },
    { id: 2, name: '相对稳定' },
  ];

  $ctrl.hash = $location.hash() || '1';
  $ctrl.addBrandModal = addBrandModal;
  $ctrl.materialBrandDelete = materialBrandDelete;
  $ctrl.submitSearchBrand = submitSearchBrand;
  $ctrl.changeGoodsStatus = changeGoodsStatus;

  $ctrl.submitSearch = submitSearch;
  $ctrl.addGoodsModal = addGoodsModal;
  $ctrl.hideGoods = hideGoods;
  $ctrl.changeShowType = changeShowType;
  $ctrl.materialSync = materialSync;
  $ctrl.materialTop = materialTop;
  $ctrl.saveNotes = saveNotes;
  $ctrl.saveRecommend = saveRecommend;
  $ctrl.materialSupplyPrice = materialSupplyPrice;
  $ctrl.materialFavorItemAdd = materialFavorItemAdd;
  $ctrl.$onInit = activate;
  $ctrl.toSelectClass = toSelectClass;
  $ctrl.getSelectedClassName = getSelectedClassName;

  $ctrl.selectTab = selectTab;

  $ctrl.selected_class = [];
  $ctrl.class_list = [];

  $ctrl.set_class = true;

  function activate() {
    $ctrl.set_class = true;
    //console.log('激活')
    let promises;
    const select_flag = $ctrl.hash == 1 ? 0 : 1;
    //1:单品热度  3：单品时间   2：品牌
    if (1 == $ctrl.hash || 3 == $ctrl.hash) {
      promises = [getClassList(), getItemTopRank(select_flag), checkPopEditKol()];
    } else {
      promises = [getClassList(), materialBrandList(), checkPopEditKol()];
    }
    return $q.all(promises).then(function () {
      //      $log.info('热门商品视图激活！')
    });
  }

  function getClassList() {
    dataService.mall_mallClassChoice({}).then(res => {
      $ctrl.class_list = res.data.class_list;

      const tmp_class_id = $routeParams['tmp_class_id'] ? JSON.parse(decodeURIComponent($routeParams['tmp_class_id'])) : [];
      tmp_class_id.length && _.forEach(tmp_class_id, c1 => {
        _.forEach($ctrl.class_list, c2 => {
          if (Number(c1) === Number(c2.class_id))
            $ctrl.selected_class.push(c2);
        });
      });

    });
  }

  /** 临时加的法务需求，强制让Kol编辑资料，并且在几个页面加判断 */
  function checkPopEditKol() {
    dataService.seller_checkPopEditKol().then(res => {
      if (res.data.pop == 1) {
        seeModal.confirmP('注意', '后台系统升级，为了提升账号安全性，请你前往个人中心补充个人信息', '现在就去^_^', false)
          .then(() => $location.url('personalInfo/account/modifyinfo-kol?id=' + res.data.id));
      }
    });
  }


  function selectTab() {
    $location.search({});
  }

  function submitSearch() {
    //var select_flag = $ctrl.hash == 1 ? 0 : 1;
    //$ctrl.set_class = false;
    //getItemTopRank(select_flag)
    const tmp = angular.extend({}, $location.search(), $ctrl.searchForm);
    $location.search(angular.extend({}, tmp, { tmp_class_id: $ctrl.selected_class.length && JSON.stringify($ctrl.selected_class.map(o => o.class_id)) || undefined }));
  }

  function submitSearchBrand() {
    $location.search(angular.extend({}, $location.search(), $ctrl.searchFormBrand));
    activate();
  }

  function addGoodsModal() {
    fashionService.addGoodsModal().then(function () {
      activate();
    });
  }

  function changeShowType(type) {
    $ctrl.show_type = type;
    sessionStorage.setItem(md5('show_type'), type);
    if (type === 'grid') {
      $timeout(function () {
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
    return dataService.data_api_materialHideItems({
      ids: id,
      hide_status: +!is_public,
    }).then(function (res) {
      Notification.success();
      $timeout(function () {
        $grid.masonry();
      });
      return $ctrl.hotgoods_list;
    });
  }

  //select_flag 0：按热度  1：按时间
  function getItemTopRank(select_flag = 0) {
    const filter_class_id = [];
    if ($routeParams['tmp_class_id']) {
      const tmp_class_id = JSON.parse(decodeURIComponent($routeParams['tmp_class_id']));
      _.forEach(tmp_class_id, c2 => {
        filter_class_id.push(c2);
      });
    }
    //  console.log(filter_class_id);

    const params = {
      select_flag,
      page,
      page_size: 20,
      seller_privilege,
      //filter_class_id: JSON.stringify($ctrl.searchForm.filter_class_id),
      filter_class_id: JSON.stringify(filter_class_id),
      filter_price_start: $ctrl.searchForm.filter_price_start || 0,
      filter_price_end: $ctrl.searchForm.filter_price_end || 0,
      filter_country_name: JSON.stringify($ctrl.searchForm.filter_country_name),
      keyword: $ctrl.searchForm.keyword,
    };
    return dataService.data_api_materialSelectItem(params).then(function (res) {
      $ctrl.hotgoods_list = res.data.list_item;
      $ctrl.list_class = res.data.list_class;
      $ctrl.list_country = res.data.list_country;
      $ctrl.list_price = res.data.list_price;
      $ctrl.total_items = res.data.count_item;

      /*
      if($ctrl.set_class){
        const data = res.data.list_class_choice;
        let classList = [], length = data.length, temp = {}, i, j, k;
        _.forEach(data, o => {
          o.parent_id === '0' && classList.push(_.assign(o, { children: [] }))
        })
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

        var tmp_class_id = $routeParams['tmp_class_id'] ? JSON.parse(decodeURIComponent($routeParams['tmp_class_id'])) : []
        tmp_class_id.length && _.forEach(tmp_class_id, c1 => {
            _.forEach($ctrl.class_list, c2 => {
              if (c1 === c2.class_id) $ctrl.selected_class.push(c2)
              else _.forEach(c2.children, c3 => {
                if (c1 === c3.class_id) $ctrl.selected_class.push(c3)
                else _.forEach(c3.children, c4 => {
                  if (c1 === c4.class_id) $ctrl.selected_class.push(c4)
                })
              })
            })
          })
      //  console.log(tmp_class_id);

      }
      */

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

  function materialSync(id) {
    return dataService.data_api_materialSync({
      sync_flag: 0,
      ids: id,
    }).then(function (res) {
      Notification.success('取消同步成功！');
      return activate();
    });
  }

  function materialTop(id, flag) {
    return dataService.data_api_materialTop({
      top_flag: +!flag,
      ids: id,
    }).then(function () {
      Notification.success(flag === 1 ? '取消' : '' + '置顶成功！');
      return activate();
    });
  }

  function saveNotes(data, item_id) {
    if (data && data.trim()) {
      return dataService.data_api_materialNotes({
        opt_type: 2,
        item_id,
        notes: data,
      }).then(function (res) {
        Notification.success('添加备注成功！');
        return activate();
      });
    }
  }

  function saveRecommend(data, item_id) {
    if (data && data.trim()) {
      return dataService.data_api_materialRecommend({
        opt_type: 2,
        item_id,
        recommend: data,
      }).then(function (res) {
        Notification.success('添加推荐理由成功！');
        return activate();
      });
    }
  }

  function materialSupplyPrice(item_id, supply_price_start, supply_price_end) {
    return fashionService.materialSupplyPrice(item_id, supply_price_start, supply_price_end).then(function () {
      return activate();
    });
  }

  function materialFavorItemAdd(item_id, del) {
    return fashionService.materialFavorItemAdd(item_id, del).then(function () {
      const index = _.findIndex($ctrl.hotgoods_list, function (o) { return o['item_id'] === item_id; });
      $ctrl.hotgoods_list[index].is_favor = +!del;
      return $ctrl.hotgoods_list;
    });
  }

  /************************** 单品品牌相关接口 **************************/
  //获取品牌列表
  function materialBrandList() {
    const filter_info = {
      keyword: $ctrl.searchFormBrand.keyword,
    };
    const params = {
      page,
      page_size: 20,
      filter_info: JSON.stringify(filter_info),
    };
    return dataService.data_api_materialBrandList(params).then(function (res) {
      $ctrl.brand_list = res.data.list;
      $ctrl.total_items = res.data.count;
      return $ctrl.brand_list;
    });
  }

  function changeGoodsStatus(item_id, goods_status) {
    //  console.log(item_id,goods_status)
    const params = {
      item_id,
      goods_status,
    };
    return dataService.data_api_materialGoodsStatus(params).then(function (res) {

    });
  }


  function addBrandModal(kol_brand_id) {
    // console.log(1111)
    fashionService.addBrandModal(kol_brand_id).then(function () {
      activate();
    });
  }



  function materialBrandDelete(kol_brand_id) {
    fashionService.materialBrandDelete(kol_brand_id, function () {
      activate();
    });
  }


  // 显示选择品类的表
  function toSelectClass() {
    // console.log($ctrl.selected_class);
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

    return modalInstance.result.then((new_selected_class: any[]) => {
      $ctrl.selected_class = new_selected_class;
      $ctrl.submitSearch();
    });
  }

  // 在搜索中显示
  function getSelectedClassName() {
    //console.log($ctrl.selected_class);
    return $ctrl.selected_class.map(o => o.class_name).join(',');
  }

  /**** 单品品牌相关接口 end ****/

}
// })();
