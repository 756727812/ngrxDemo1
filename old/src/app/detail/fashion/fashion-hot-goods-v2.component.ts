import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';
import { IReportService } from '../../services/report-service/report-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as _ from 'lodash';;
import * as md5 from 'md5';;
import { checkFn, CODES } from '../../utils/permission-helper';
import injector from '../../utils/injector';

export const fashionHotGoodsV2 = {
  template: require('./fashion-hot-goods-v2.template.html'),
  controller: hotgoodsController,
};

const version = +new Date();

hotgoodsController.$inject = [
  'reportService',
  '$routeParams',
  '$timeout',
  '$q',
  'Notification',
  '$location',
  'fashionService',
  'dataService',
  '$cookies',
  '$log',
  'seeModal',
  '$uibModal',
  'applicationService',
];

function hotgoodsController(
  reportService: IReportService,
  $routeParams,
  $timeout,
  $q,
  Notification,
  $location,
  fashionService,
  dataService: IDataService,
  $cookies,
  $log,
  seeModal: ISeeModalService,
  $uibModal,
  applicationService,
) {
  const $ctrl = this;
  let page = $routeParams.page || 1,
    seller_privilege = $cookies.get('seller_privilege'),
    is_kol = seller_privilege === '24' || seller_privilege === '30',
    $grid;
  $ctrl.isQuhaodian = localStorage.getItem('is_quhaodian') === '1';
  $ctrl.is_show_all = 0;
  let loading = 1;
  let max_page = 0;
  $ctrl.total_items = 0;
  $ctrl.is_kol = is_kol;
  if ($ctrl.is_kol) {
    $ctrl.show_type = 'grid';
  } else {
    $ctrl.show_type =
      sessionStorage.getItem(md5('show_type')) ||
      ($ctrl.is_kol ? 'grid' : 'table');
  }
  $ctrl.isKolOrNewBand = checkFn([CODES.KOL, CODES.New_Brand]);
  $ctrl.searchForm = {
    show_btn: 0,
    kol_flag: $routeParams['kol_flag'] || '0',
    goods_flag: $routeParams['goods_flag'] || '0',
    order_id: $routeParams['order_id'] || '',
    class_type: $routeParams['class_type'] || '0',
    filter_class_id: $routeParams.filter_class_id,
    filter_country_name: $routeParams.filter_country_name,
    keyword: $routeParams.keyword,
    filter_price_start: +$routeParams.filter_price_start,
    filter_price_end: +$routeParams.filter_price_end,
  };

  // kol不给看到隐藏的
  if ($ctrl.is_kol) {
    $ctrl.searchForm.kol_flag = 1;
  }

  $ctrl.searchFormBrand = {
    keyword: $routeParams.keyword,
  };

  $ctrl.list_goods_status = [
    { id: 0, name: '稳定' },
    { id: 1, name: '不稳定' },
    { id: 2, name: '相对稳定' },
  ];

  $ctrl.is_focus = false;
  $ctrl.tmp_price_start = '';
  $ctrl.tmp_price_end = '';
  $ctrl.hash = $location.hash() || '1'; // .hash() 不会有值
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
  $ctrl.$onInit = activate;
  $ctrl.toSelectClass = toSelectClass;
  $ctrl.getSelectedClassName = getSelectedClassName;
  $ctrl.classTypeFilter = classTypeFilter;
  $ctrl.changeOrder = changeOrder;
  $ctrl.changeInputPrice = changeInputPrice;
  $ctrl.resetInputPrice = resetInputPrice;
  $ctrl.lostInput = lostInput;
  $ctrl.getNextPage = getNextPage;
  $ctrl.addDistributionItem = addDistributionItem;
  $ctrl.deleteItem = deleteItem;
  $ctrl.selectTab = selectTab;
  $ctrl.onFavorChange = (item_id, value) => {
    const item: any = _.find($ctrl.hotgoods_list, { item_id });
    item && (item.is_favor = value);
  };

  const detectSellPointWetherPop = () => {
    $('.sell-point').each((i, el) => {
      setTimeout(() => {
        const width = $(el).innerWidth();
        if (width && width === el.scrollWidth) {
          $(el)
            .closest('.goods-sell-point-wrap')
            .find('.sell-point-tips')
            .hide();
        }
        // tslint:disable-next-line:align
      }, 1);
    });
    // tslint:disable-next-line:semicolon
  };

  $ctrl.getSellPointTips = item => {
    return item.topic_item_sell_point
      .split(/\r?\n/)
      .map(p => `<p>${p}</p>`)
      .join('');
  };

  $ctrl.onSellGoodsSuccess = item_id => {
    const item: any = _.find($ctrl.hotgoods_list, { item_id });
    if (item) {
      item.is_xdp_item = 1;
    }
  };

  $ctrl.onAddWarehouseSuccess = item_id => {
    const item: any = _.find($ctrl.hotgoods_list, { item_id });
    if (item) {
      item.warehouse_flag = 1;
    }
  };

  $ctrl.selected_class = [];
  $ctrl.class_list = [];

  $ctrl.set_class = true;
  $ctrl.isShow = false;

  function activate() {
    dataService.checkShopStatus({ url: $location.path(), status: '' });

    $ctrl.set_class = true;
    // console.log('激活')
    let promises;
    const select_flag = $ctrl.hash == 1 ? 0 : 1;
    // 1:单品热度  3：单品时间   2：品牌
    if (1 == $ctrl.hash) {
      promises = [
        getClassList(),
        getItemTopRank(select_flag),
        checkPopEditKol(),
      ];
    }
    return $q.all(promises).then(function() {
      if (!$cookies.get('leadHotGoods')) {
        // showCover()
      }
    });
  }
  /*
  function showCover() {
    setTimeout(() => {
      const elCover = document.getElementById('lead-cover'),
        elLItem2 = $('#lead_item_2')[0],
        elLItem0Love = $('#lead_item_0_love')[0],
        elLShopShow = document.getElementById('lead_shop_show');
      applicationService.coverGuide(
        elCover, elLItem2,
        '点击这里，可以将商品添加到小电铺中进行售卖</br>也可以在商品管理模块统一管理小电铺的商品', function () {
          $('.lead-cover,.lead-info').removeAttr('style').hide();
          $('#lead_item_2').removeClass('hover');
          // $("#lead_item_0").addClass('hover')
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 1);
          $cookies.put('leadHotGoods', 1, { expires: expireDate });
          // applicationService.coverGuide(
          //   elCover,elLItem0Love,
          //   '将喜爱的商品收藏至选品库，</br/>进而添加到内容电商的文章中',function(){
          //     $("#lead_item_0").removeClass('hover')
          //     $(".lead-cover,.lead-info").hide()
          //     $(".lead-info").removeAttr('style').removeClass('lead_left')
          //     $cookies.put('leadHotGoods',1)
          // })
          // $(".lead-info").addClass('lead_left').css({
          //   'margin':'-50px 0 0 50px'
          // })
        },
      );
      $('.lead-info').css({
        paddingLeft: '0',
        backgroundSize: '44px 60px',
        backgroundPosition: '30% 0',
      });
      $('.lead-cover').css({
        padding: '5px 8px 8px 5px',
      });
      $('#lead_item_2').addClass('hover');
    },         500);
  }
  */
  function addDistributionItem(itemId) {
    return dataService
      .kol_mgr_addDistributionItem({ item_ids: `[${itemId}]` })
      .then(res => {
        Notification.success('添加到小电铺成功！');
        const i = _.findIndex($ctrl.hotgoods_list, { item_id: itemId });
        $ctrl.hotgoods_list[i].is_xdp_item = 1;
      });
  }

  function changeOrder(order_id) {
    $ctrl.searchForm.order_id = order_id;
    $ctrl.page = 1;
    $ctrl.submitSearch();
  }

  function changeInputPrice() {
    $ctrl.is_focus = true;
    if ($ctrl.tmp_price_start === '') {
      $ctrl.tmp_price_start = $ctrl.searchForm.filter_price_start;
      $ctrl.tmp_price_end = $ctrl.searchForm.filter_price_end;
    }
    $ctrl.searchForm.show_btn = 1;
  }

  function lostInput() {
    $ctrl.is_focus = false;
    $timeout(function() {
      if (!$ctrl.is_focus) {
        $ctrl.searchForm.show_btn = 0;
      }
    });
  }

  function resetInputPrice() {
    $ctrl.searchForm.show_btn = 0;
    $ctrl.searchForm.filter_price_start = $ctrl.tmp_price_start;
    $ctrl.searchForm.filter_price_end = $ctrl.tmp_price_end;
  }

  function classTypeFilter(class_type) {
    $ctrl.searchForm.class_type = class_type;
    $ctrl.searchForm.order_id = '';
    $ctrl.searchForm.kol_flag = '0';
    $ctrl.searchForm.goods_flag = '0';
    $ctrl.searchForm.keyword = '';
    $ctrl.page = 1;
    $ctrl.submitSearch();
  }

  function getClassList() {
    setTimeout(() => {
      $ctrl.isShow = true;
    }, 500);

    dataService.mall_mallClassChoice({}).then(res => {
      $ctrl.class_list = res.data.class_list;

      const tmp_class_id = $routeParams['tmp_class_id']
        ? JSON.parse(decodeURIComponent($routeParams['tmp_class_id']))
        : [];
      tmp_class_id.length &&
        _.forEach(tmp_class_id, c1 => {
          _.forEach($ctrl.class_list, c2 => {
            if (Number(c1) === Number(c2.class_id)) {
              $ctrl.selected_class.push(c2);
            }
          });
        });
    });
  }

  /** 临时加的法务需求，强制让Kol编辑资料，并且在几个页面加判断 */
  function checkPopEditKol() {
    dataService.seller_checkPopEditKol().then(res => {
      if (res.data.pop == 1) {
        seeModal
          .confirmP(
            '注意',
            '后台系统升级，为了提升账号安全性，请你前往个人中心补充个人信息',
            '现在就去^_^',
            false,
          )
          .then(() =>
            $location.url(
              'personalInfo/account/modifyinfo-kol?id=' + res.data.id,
            ),
          );
      }
    });
  }

  function deleteItem(item_id) {
    dataService.item_deleteItem({ item_id }).then(() => Notification.success());
  }

  function selectTab() {
    $location.search({});
  }

  function submitSearch() {
    const tmp = angular.extend({}, $location.search(), $ctrl.searchForm);
    $location.search(
      angular.extend({}, tmp, {
        page: 1,
        tmp_class_id:
          ($ctrl.selected_class.length &&
            JSON.stringify($ctrl.selected_class.map(o => o.class_id))) ||
          undefined,
      }),
    );
  }

  function submitSearchBrand() {
    $location.search(
      angular.extend({}, $location.search(), $ctrl.searchFormBrand),
    );
    activate();
  }

  function addGoodsModal() {
    fashionService.addGoodsModal().then(function() {
      activate();
    });
  }

  function changeShowType(type) {
    $ctrl.show_type = type;
    sessionStorage.setItem(md5('show_type'), type);

    page = 1;
    submitSearch();
    /*
    if (type === 'grid') {
      $timeout(function () {
        $grid = (<any>$('.grid')).imagesLoaded(function () {
          $grid.masonry({
            itemSelector: '.grid-item',
            percentPosition: true,
            columnWidth: '.grid-sizer'
          });
        });
      })
    }
    getItemTopRank();
    */
  }

  function hideGoods(id, is_public) {
    const tips =
      is_public === 0
        ? '确认设置该商品对KOL可见？'
        : '确认设置该商品对KOL隐藏？';
    seeModal.confirm(
      '确认提示',
      tips,
      () => {
        return dataService
          .data_api_materialHideItems({
            ids: id,
            hide_status: +!is_public,
            is_v2: 1,
          })
          .then(function(res) {
            Notification.success();
            activate();
            $timeout(function() {
              $grid.masonry();
            });
            return $ctrl.hotgoods_list;
          });
      },
      () => {
        return activate();
      },
    );
  }

  function getNextPage() {
    if ($ctrl.show_type !== 'grid') {
      return;
    }
    if (loading) {
      return;
    }
    if (page >= max_page) {
      $ctrl.is_show_all = 1;
      return;
    }

    page++;
    getItemTopRank(0, true);
  }

  function formatInfo(list) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].brand_name === '') {
        list[i].brand_name = '-';
      }
      if (list[i].class_name === '') {
        list[i].class_name = '-';
      }
    }
    return list;
  }

  // select_flag 0：按热度  1：按时间
  function getItemTopRank(select_flag = 0, add_to_ori = false) {
    $ctrl.is_show_all = 0;
    loading = 1;
    let filter_class_id = [];
    if ($routeParams['tmp_class_id']) {
      const tmp_class_id = JSON.parse(
        decodeURIComponent($routeParams['tmp_class_id']),
      );
      _.forEach(tmp_class_id, c2 => {
        filter_class_id.push(c2);
      });
    }
    //  console.log(filter_class_id);

    const params = {
      kol_flag: $ctrl.searchForm.kol_flag,
      goods_flag: $ctrl.searchForm.goods_flag,
      time_flag: 0,
      profit_flag: 0,
      select_flag,
      page,
      page_size: 20,
      seller_privilege,
      // filter_class_id: JSON.stringify($ctrl.searchForm.filter_class_id),
      filter_class_id: JSON.stringify(filter_class_id),
      filter_price_start: $ctrl.searchForm.filter_price_start || 0,
      filter_price_end: $ctrl.searchForm.filter_price_end || 0,
      filter_country_name: JSON.stringify($ctrl.searchForm.filter_country_name),
      keyword: $ctrl.searchForm.keyword,
    };
    if ($ctrl.searchForm.order_id === '1') {
      params.profit_flag = 1;
    }
    if ($ctrl.searchForm.order_id === '2') {
      params.time_flag = 1;
    }
    if (Number($ctrl.searchForm.class_type) > 0) {
      filter_class_id = [$ctrl.searchForm.class_type];
      params.filter_class_id = JSON.stringify(filter_class_id);
    }

    return dataService.data_api_materialSelectItem(params).then(
      function(res) {
        loading = 0;

        if (!add_to_ori) {
          $ctrl.hotgoods_list = formatInfo(res.data.list_item);
          $ctrl.list_class = res.data.list_class;
          $ctrl.list_country = res.data.list_country;
          $ctrl.list_price = res.data.list_price;
          $ctrl.total_items = res.data.count_item;
          max_page = Math.ceil($ctrl.total_items / 20);
        } else {
          const tmp_list = formatInfo(res.data.list_item);
          for (let i = 0; i < tmp_list.length; i++) {
            $ctrl.hotgoods_list.push(tmp_list[i]);
          }
        }
        setTimeout(detectSellPointWetherPop, 10);
        /*
       $timeout(function () {
         if ($ctrl.show_type === 'grid') {
           $grid = (<any>$('.grid')).imagesLoaded(function () {
             $grid.masonry({
               itemSelector: '.grid-item',
               percentPosition: true,
               columnWidth: '.grid-sizer'
             });
           });
         }
       })*/
        return $ctrl.hotgoods_list;
      },
      function(res) {
        loading = 0;
        console.log('fail');
      },
    );
  }

  function materialSync(id) {
    seeModal.confirm(
      '确认提示',
      '确认要将商品移出单品库？',
      () => {
        return dataService
          .data_api_materialDelItem({
            item_id: id,
          })
          .then(function(res) {
            Notification.success('移出单品库成功');
            return activate();
          });
      },
      () => {
        return activate();
      },
    );
  }

  function materialTop(id, flag) {
    const tips = flag === 1 ? '确认要取消置顶？' : '确认要置顶？';
    seeModal.confirm(
      '确认提示',
      tips,
      () => {
        return dataService
          .data_api_materialTop({
            top_flag: +!flag,
            ids: id,
            is_v2: 1,
          })
          .then(function() {
            Notification.success(flag === 1 ? '取消' : '' + '置顶成功！');
            return activate();
          });
      },
      () => {
        return activate();
      },
    );
  }

  function saveNotes(data, item_id) {
    if (data && data.trim()) {
      return dataService
        .data_api_materialNotes({
          opt_type: 2,
          item_id,
          notes: data,
          is_v2: 1,
        })
        .then(function(res) {
          Notification.success('添加备注成功！');
          return activate();
        });
    }
  }

  function saveRecommend(data, item_id) {
    if (data && data.trim()) {
      return dataService
        .data_api_materialRecommend({
          opt_type: 2,
          item_id,
          recommend: data,
          is_v2: 1,
        })
        .then(function(res) {
          Notification.success('添加推荐理由成功！');
          return activate();
        });
    }
  }

  function materialSupplyPrice(item_id, supply_price_start, supply_price_end) {
    return fashionService
      .materialSupplyPrice(item_id, supply_price_start, supply_price_end)
      .then(function() {
        return activate();
      });
  }

  /************************** 单品品牌相关接口 **************************/
  // 获取品牌列表
  function materialBrandList() {
    const filter_info = {
      keyword: $ctrl.searchFormBrand.keyword,
    };
    const params = {
      page,
      page_size: 20,
      filter_info: JSON.stringify(filter_info),
    };
    return dataService.data_api_materialBrandList(params).then(function(res) {
      $ctrl.brand_list = res.data.list;
      $ctrl.total_items = res.data.count;
      return $ctrl.brand_list;
    });
  }

  function changeGoodsStatus(item_id, goods_status) {
    const tips = '确认要修改库存状态?';
    seeModal.confirm(
      '确认提示',
      tips,
      () => {
        //  console.log(item_id,goods_status)
        const params = {
          item_id,
          goods_status,
          is_v2: 1,
        };
        return dataService
          .data_api_materialGoodsStatus(params)
          .then(function(res) {
            Notification.success();
            activate();
            $timeout(function() {
              $grid.masonry();
            });
          });
      },
      () => {},
    );
  }

  function addBrandModal(kol_brand_id) {
    // console.log(1111)
    fashionService.addBrandModal(kol_brand_id).then(function() {
      activate();
    });
  }

  function materialBrandDelete(kol_brand_id) {
    fashionService.materialBrandDelete(kol_brand_id, function() {
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
    // console.log($ctrl.selected_class);
    return $ctrl.selected_class.map(o => o.class_name).join(',');
  }

  /**** 单品品牌相关接口 end ****/
}
// })();
