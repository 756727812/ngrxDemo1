import { IMallService } from '../mall/mall.service';
import * as angular from 'angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';
import { NzModalService } from 'ng-zorro-antd';

import { accessChecker } from '@utils';
import { PERMISSION_CODES } from '../../const';
import './fashion-kol-info-list.less';
import ThemePickerController from '../goods/theme/theme-picker/theme-picker.component';
import { modalEditWechatIdController } from './modal-edit-wechatid.controller';
import { ArticelPickerController } from '../goods/theme/article-picker/article-picker.component';
import { Controller as GoodsListCtrl } from '../goods/theme/goods-list/goods-list.component';
import { ArticleGoodsStepsController } from './article-goods/steps.component';
import { ArticleGoodsGoodsLinksController } from './article-goods/goods-links.component';
import { GoodsLinkInfoController } from './article-goods/link-info/link-info.component';
import { ArticelFormController } from './article-form/article-form.component';
import { ModalArticleAddGroupBuyGoods } from './modal-article-add-group-buy-goods.component';
import { ModalLinksComponentV2 } from '../kol-v2/components/modal-links-v2-ng1/modal-links.component';

const PAGE_ARTICLE_DETAIL_HASH = '2';
const PAGE_KEY = {
  1: 'PAGE_CONTENT_ELEC_MARKET',
  [PAGE_ARTICLE_DETAIL_HASH]: 'PAGE_ARTICLE_DETAIL',
};

export class fashionKolInfoListController {
  private page: string;

  is_start_watch_date: number;
  count_not_sell: number;
  count_sell: number;
  wechat_id: string;
  wechat_name: string;
  id: string;
  hash: string;
  search_data: {
    date_picker: {
      startDate: any;
      endDate: any;
    };
    rank_type: string;
    keyword: string;
    article_id: number;
    collection_id: number;
    act_type: string;
  };
  kol: any;
  kol_content: any;
  kol_top: any;
  article_cur: any;
  name_cur: any;
  article_id: any;
  page_url: string;
  collection_id: any;
  article_type: any;
  item_status_type: any;
  article_list: any[];
  goods_list: any[];
  list_mall_class: any[];
  selected_class: any[];
  total_items: number;
  user_init: any;
  kol_table: {
    hot_head: string[];
    favor_head: string[];
  };

  chart_theme: string;
  chart_gender_instance: any;
  chart_age_instance: any;
  chart_area_instance: any;
  chart_star_instance: any;
  chart_active_instance: any;
  status: number;
  kol_act_data: any;
  kol_act_list: any;
  kol_act_select: any;
  kol_act_keyword: any;
  act_id: any;

  is_kol: number;
  is_new_brand: number;
  is_inside: number;
  b_show_xiaochengurl: number;
  kol_info: any;

  xiaochengdata: any;

  block_item: number;
  seller_privilege: number;
  init_form_data: {
    title: string;
  };
  showMark: boolean[];
  xdpInfo: any = Object.create(null);

  static $inject: string[] = [
    'reportService',
    '$window',
    '$scope',
    '$q',
    '$cookies',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
    '$echarts',
    'mallService',
    'applicationService',
    'NzModalService',
  ];

  constructor(
    private reportService: see.IReportService,
    private $window: any,
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $cookies: any,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: any,
    private $echarts: any,
    private mallService: IMallService,
    private applicationService: any,
    private modalService: NzModalService,
  ) {
    this.showMark = [];
    this.dataService.checkShopStatus({
      url: this.$location.path(),
      status: '',
    });
  }

  getAvatarUrl() {
    return _.result(
      this,
      'kol.avatar',
      '//static.seecsee.com/seego_plus/images/icons/logo.png',
    );
  }

  reportPv() {
    const pageKey = PAGE_KEY[this.hash];
    if (pageKey) {
      const extOptions: any = {};
      if (this.hash === PAGE_ARTICLE_DETAIL_HASH) {
        extOptions.ext3 = this.article_id;
      }
      this.reportService.reportByPageKey(pageKey, extOptions);
    }
  }

  $onInit() {
    this.handleRedirectFromTheme();
    // TODO 注入一个 value，避免每次都调 this.$cookies.get
    this.seller_privilege = parseInt(this.$cookies.get('seller_privilege'), 10);

    this.selected_class = [];
    this.list_mall_class = [];

    this.is_start_watch_date = 0;
    this.kol_info = [];
    this.is_kol =
      this.$cookies.get('seller_privilege') === '24' ||
      this.$cookies.get('seller_privilege') === '30'
        ? 1
        : 0;
    this.is_new_brand = this.$cookies.get('seller_privilege') === '30' ? 1 : 0;
    this.is_inside =
      this.$cookies.get('seller_privilege') === '7' ||
      this.$cookies.get('seller_privilege') === '10'
        ? 1
        : 0;
    this.block_item = 1;
    this.b_show_xiaochengurl = 0;
    this.xiaochengdata = null;
    if (this.is_new_brand) {
      this.dataService.shop_checkCurrentStatus({}).then(res => {
        this.xiaochengdata = res.data;
        console.log(this.xiaochengdata);
        if (Number(this.xiaochengdata.type) === 3) {
          this.block_item = 0;
        }
        if (
          Number(this.xiaochengdata.type) === 3 &&
          Number(this.xiaochengdata.manager_status) === 80
        ) {
          this.b_show_xiaochengurl = 1;
        }
      });
    }

    this.page_url = this.$location.url();
    this.page_url = encodeURIComponent(this.page_url);
    this.collection_id = this.$routeParams['collection_id'] || '0';
    this.article_id = this.$routeParams['article_id'];
    this.item_status_type = this.$routeParams['item_status_type'] || '1';
    this.article_type = 0;
    this.article_cur = false;
    this.name_cur = '';
    this.total_items = 0;
    this.page = this.$routeParams['page'] || '1';
    this.id = this.$routeParams['id'];
    this.wechat_id = this.$routeParams['wechat_id'] || '';
    this.status = this.$routeParams['status'] || '1';
    const user_code = this.$cookies.get('seller_privilege');
    const hash_num = user_code === '20' || user_code === '25' ? '1' : '2';
    this.hash = this.$location.hash() || hash_num;
    // this.hash = this.$location.hash() || '1';

    // 获取微信号
    if (Number(this.id) > 0) {
      this.dataService.seller_getSellerDetail(false).then(({ data }) => {
        // wx_official_name; // 名称
        // wx_official_account; // 公众号微信号
        const { wx_official_name, wx_official_account } = data.seller_info;
        this.wechat_id = wx_official_account;
        this.wechat_name = wx_official_name;
      });
    }

    if (Number(this.id) === -1) {
      return;
    }
    if (Number(this.id) === 0) {
      this.dataService
        .kol_mgr_getKolIdWithWeixin({
          wechat_id: this.wechat_id,
        })
        .then(res => {
          const tmp_kol_id = res.data.kol_id;
          if (tmp_kol_id > 0) {
            const cur_url =
              '/kol/kol-cooperation-management/' + Number(tmp_kol_id);
            this.$location.url(cur_url + '?wechat_id=' + this.wechat_id + '#1');
            return;
          }
        });
    }

    if (this.$routeParams['article_type']) {
      this.article_type = this.$routeParams['article_type'];
      if (this.article_type === 2) {
        this.name_cur = '商城';
      } else {
        this.name_cur = '文章';
      }
    } else {
      if (this.hash === '1') {
        this.article_type = 1;
        this.name_cur = '文章';
      } else if (this.hash === '5') {
        this.article_type = 2;
        this.name_cur = '商城';
      }
    }

    this.search_data = {
      date_picker: {
        startDate: this.$routeParams['start_date']
          ? moment(this.$routeParams['start_date'] * 1000)
          : null,
        endDate: this.$routeParams['end_date']
          ? moment(this.$routeParams['end_date'] * 1000)
          : null,
      },
      keyword: this.$routeParams['keyword'],
      article_id: this.$routeParams['article_id'],
      collection_id: this.$routeParams['collection_id'] || 0,
      act_type: this.$routeParams['act_type'] || '',
      rank_type: this.$routeParams['rank_type'] || '0',
    };
    this.kol_top = {
      page: 1,
      type: 1,
      count: 0,
    };
    this.kol_table = {
      hot_head: ['排名', '品牌名', '评分'],
      favor_head: ['排名', '品类', '百分比'],
    };
    this.user_init = {
      page: 1,
    };

    let promises = [];
    // 要添加权限，在请求前先处理
    this.dataService
      .kol_mgr_checkUserPri({
        kol_id: this.id,
      })
      .then(res => {
        if (res.result === 1) {
          const xdpInfo = _.get(
            res.data,
            'kol_info.xdp_info',
            Object.create(null),
          );
          this.xdpInfo = xdpInfo;
          // if (!_.isEmpty(xdpInfo)) {
          //   const microPage = `/kol-v2/kol-cooperation-management/${
          //     this.id
          //   }/${this.wechat_id || 0}/micro-page`;
          //   return this.$location.path(microPage); // 如果有小电铺信息, 直接跳到新版微页面
          // }
          if (this.hash === '1' || this.hash === '5') {
            promises = [this.getArticleList()];
          } else if (this.hash === '2') {
            if (!this.article_id) {
              this.$location
                .search({
                  wechat_id: this.wechat_id,
                  article_type: this.article_type,
                  article_id: xdpInfo.article_id,
                  collection_id: xdpInfo.collection_id,
                })
                .replace();
            }
            promises = [
              this.getGoodsList(),
              this.getArticleList(999),
              this.getMallClassKey(),
            ];
          }
          if (this.wechat_id !== '') {
            promises.push(this.getKOLDetailBase());
          }
          accessChecker.isKol() &&
            (this.article_id ||
              (this.$routeParams['article_type'] ||
                this.$routeParams.page > 1) ||
              this.goToKolV2({ kol_id: this.id, wechat_id: this.wechat_id }));
          this.kol_info = res.data.kol_info;
        } else {
        }
      });

    this.$q.all(promises).then(() => {
      this.checkAutoOpenNewArticle();
    });

    this.watchDate();
    this.reportPv();
    return true;
  }

  checkAutoOpenNewArticle() {
    // NOTE 如果有这个参数，表示要去确认「是否要自动拉起创建文章」
    // 另外还要配合一个 storage 来判断，避免刷新后又再次拉起
    if (
      this.$routeParams.needCheckOpenNewArticle &&
      localStorage.getItem(
        '__checkIfOpenNewArticleInKolCooperationManagement__',
      )
    ) {
      this.importArticleNew();
      localStorage.removeItem(
        '__checkIfOpenNewArticleInKolCooperationManagement__',
      );
    }
  }

  addGroupBuyGoods() {
    const subscription = this.modalService.open({
      title: '添加拼团商品',
      content: ModalArticleAddGroupBuyGoods,
      footer: false,
      maskClosable: false,
      width: 768,
      componentParams: {
        kolId: this.id,
        articleId: this.article_id,
      },
    });
    subscription.subscribe(result => {
      if (result === 'onOk') {
        this.getGoodsList();
      }
    });
  }

  goToKolV2(option) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-link-kol-listV2.html'),
      controller: 'modalLinkKolListController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        // collection_id: () => collection_id,
        params() {
          return option;
          // return {
          //   kol_id,
          //   article_type,
          // };
        },
      },
    });
    return modalInstance.result.then(params => {});
  }

  getArticleGoodsHref(articleItem) {
    const href = `/kol/kol-cooperation-management/${this.id}?article_id=${
      articleItem.article_id
    }&wechat_id=${articleItem.weixin_id}&article_type=${
      this.article_type
    }&collection_id=${articleItem.collection_id}#2`;
    return href;
  }

  confirmWechatAccountInfo() {
    return new Promise(resolve => {
      this.dataService.seller_getSellerDetail().then(({ data }) => {
        // wx_official_name; // 名称
        // wx_official_account; // 公众号微信号
        const { wx_official_name, wx_official_account } = data.seller_info;
        if (!wx_official_account || !wx_official_name) {
          modalEditWechatIdController
            .open(wx_official_account, wx_official_name) //
            .result.then(params => {
              if (params.wx_official_account) {
                this.wechat_id = params.wx_official_account;
              }
              resolve(params);
            });
        } else {
          resolve({
            wx_official_account,
            wx_official_name,
          });
        }
      });
    });
  }

  /*
  主题商品列表 ---售卖--> 内容电商
  确认公众号填写->选择文章
  */
  handleRedirectFromTheme() {
    if (GoodsListCtrl.isComeFromTheme()) {
      this.confirmWechatAccountInfo().then(data => {
        // TODO 此时刷新页面会重复打开文章选择，是否要通过 sessionstorage
        ArticelPickerController.openForAddThemeAllGoods(
          this.$routeParams.themeId,
        ) //
          .then(({ article }) => {
            this.$window.location.href = this.getArticleGoodsHref(article);
          });
      });
    }
  }

  gotoAddWechatId() {
    modalEditWechatIdController
      .open() //
      .result.then(params => {
        if (params.wechat_id) {
          const url =
            this.$location.path() + '?wechat_id=' + params.wechat_id + '#1';
          this.$window.location.href = url;
        }
      });
  }

  exportArticleList(article_type) {
    let is_shop_list = 0;
    if (article_type === 2) {
      is_shop_list = 1;
    }
    const param = {};
    let url =
      '/api/kol_mgr/exportArticleListAll?v=1&is_shop_list=' + is_shop_list;
    const tmp_filter_info = JSON.stringify({
      all: 0,
      kol_id: this.id,
      article_id: '',
      article_type: this.article_type,
      keyword: this.search_data.keyword,
      begin_time: this.search_data.date_picker.startDate
        ? this.search_data.date_picker.startDate.unix()
        : undefined,
      end_time: this.search_data.date_picker.endDate
        ? this.search_data.date_picker.endDate.unix()
        : undefined,
    });

    url = url + '&filter_info=' + tmp_filter_info;
    window.open(url);
  }

  exportItemList() {
    const tmp_filter_info = JSON.stringify({
      item_status_type: this.item_status_type,
      keyword: this.search_data.keyword,
      begin_time: this.search_data.date_picker.startDate
        ? this.search_data.date_picker.startDate.unix()
        : undefined,
      end_time: this.search_data.date_picker.endDate
        ? this.search_data.date_picker.endDate.unix()
        : undefined,
      article_id: this.search_data.article_id,
      article_type: this.article_type,
      collection_id: this.collection_id,
      rank_type: this.search_data.rank_type,
    });
    let url = '/api/kol_mgr/itemList?v=1';
    url =
      url +
      '&is_export=1&kol_id=' +
      this.id +
      '&filter_info=' +
      tmp_filter_info;
    window.open(url);
  }

  submitSearchAct() {
    return this.$location.search(
      angular.extend(
        {
          page: 1,
          status: this.status,
          wechat_id: this.wechat_id,
          article_type: this.article_type,
          article_id: this.article_id,
        },
        _.assign(this.search_data, {
          start_date: this.search_data.date_picker.startDate
            ? this.search_data.date_picker.startDate.unix()
            : undefined,
          end_date: this.search_data.date_picker.endDate
            ? this.search_data.date_picker.endDate.unix()
            : undefined,
          article_id: this.search_data.article_id,
          act_type: this.search_data.act_type,
        }),
      ),
    );
  }

  watchDate() {
    this.$scope.$watch(
      '$ctrl.search_data.date_picker',
      (cur: any, prev: any) => {
        if (this.is_start_watch_date === 0) {
          this.is_start_watch_date = 1;
        } else {
          this.submitSearch();
        }
      },
      true,
    );
  }

  changeRank(rank) {
    this.search_data.rank_type = rank;
    console.log(rank, this.search_data.rank_type);
    this.submitSearch();
  }

  submitSearchArticle() {
    return this.$location.search(
      angular.extend(
        {
          wechat_id: this.wechat_id,
          article_type: this.article_type,
          article_id: this.article_id,
          tmp_class_id: undefined,
        },
        _.assign(this.search_data, {
          start_date: undefined,
          end_date: undefined,
        }),
      ),
    );
  }

  submitSearch() {
    return this.$location.search(
      angular.extend(
        {
          wechat_id: this.wechat_id,
          article_type: this.article_type,
          article_id: this.article_id,
          tmp_class_id:
            (this.selected_class.length &&
              JSON.stringify(this.selected_class.map(o => o.class_id))) ||
            undefined,
        },
        _.assign(this.search_data, {
          start_date: this.search_data.date_picker.startDate
            ? this.search_data.date_picker.startDate.unix()
            : undefined,
          end_date: this.search_data.date_picker.endDate
            ? this.search_data.date_picker.endDate.unix()
            : undefined,
        }),
      ),
    );
  }

  itemTypeFilter(item_status_type) {
    this.item_status_type = item_status_type;
    this.$location.search(
      angular.extend(
        {
          item_status_type: this.item_status_type,
          wechat_id: this.wechat_id,
          article_type: this.article_type,
          article_id: this.article_id,
        },
        _.assign(this.search_data, {
          start_date: this.search_data.date_picker.startDate
            ? this.search_data.date_picker.startDate.unix()
            : undefined,
          end_date: this.search_data.date_picker.endDate
            ? this.search_data.date_picker.endDate.unix()
            : undefined,
        }),
      ),
    );
  }

  activityFilter(status) {
    this.status = status;
    this.$location.search(
      angular.extend({
        page: 1,
        status: this.status,
        wechat_id: this.wechat_id,
        article_type: this.article_type,
        article_id: this.article_id,
      }),
    );
  }

  updateItemRank(item_rank: string, id: string, item_id: string) {
    return this.dataService
      .collection_rankItem({
        id,
        item_id,
        item_rank,
      })
      .then(res => {
        return this.getGoodsList();
      });
  }

  updateItemName(item_name: string, item: any) {
    this.seeModal.confirm(
      '确认提示',
      '确认要修改商品名为' + item_name,
      () => {
        return this.dataService
          .kol_mgr_kolItemSet({
            item_name,
            collection_id: item.collection_id,
            set_type: 2,
            item_info: JSON.stringify({
              item_id: item.item_id,
            }),
          })
          .then(res => {
            return this.getGoodsList();
          });
      },
      () => {
        return this.getGoodsList();
      },
    );
  }
  updateItemProfit(profit: any, item: any) {
    const reg = /^(?!0+(\.0*)?$)\d+(\.\d{1,2})?$/;
    if (!reg.test(profit)) {
      item.profit_rate.min = item.profit_rate.max;
      this.Notification.warn('毛利率请设置为正整数或保留不超过两位小数的正数');
      return;
    }
    // 毛利率设置
    this.dataService
      .kol_mgr_modifyProfitRate({
        item_id: item.item_id,
        profit_rate: profit,
      })
      .then(res => {
        item.profit_rate.max = item.profit_rate.min = profit;
        this.Notification.success('毛利率设置成功');
        return this.getGoodsList();
      })
      .catch(res => {
        item.profit_rate.min = item.profit_rate.max;
      });
  }
  updateItemPrice(price: string, item: any) {
    item.price_max = item.price_min;
    if (parseFloat(price) < parseFloat(item.price_kol_min)) {
      this.Notification.error('商品售价不能低于供货价，请重新设置');
      this.getGoodsList();
      return;
    }
    this.dataService
      .kol_mgr_kolItemSet({
        collection_id: item.collection_id,
        set_type: 3,
        item_info: JSON.stringify({ price, item_id: item.item_id }),
      })
      .then(res => {
        return this.getGoodsList();
      });
    // this.seeModal.confirm(
    //   '确认提示',
    //   '确认要将该商品的SKU售价批量修改为 ' + price,
    //   () => {
    //     return this.dataService
    //       .kol_mgr_kolItemSet({
    //         collection_id: item.collection_id,
    //         set_type: 3,
    //         item_info: JSON.stringify({ price, item_id: item.item_id }),
    //       })
    //       .then(res => {
    //         return this.getGoodsList();
    //       });
    //   },
    //   () => {
    //     return this.getGoodsList();
    //   },
    // );
  }

  updateItemCostPrice(price: string, item: any) {
    item.price_kol_max = item.price_kol_min;
    if (parseFloat(price) > parseFloat(item.price_min)) {
      this.Notification.error('供货价不能大于商品售价，请重新设置');
      this.getGoodsList();
      return;
    }
    this.seeModal.confirm(
      '确认提示',
      '确认要将该商品的SKU供货价批量修改为 ￥' + price,
      () => {
        return this.dataService
          .kol_mgr_kolItemSet({
            collection_id: item.collection_id,
            set_type: 4,
            item_info: JSON.stringify({
              item_id: item.item_id,
              cost_price: price,
            }),
          })
          .then(res => {
            return this.getGoodsList();
          });
      },
      () => {
        return this.getGoodsList();
      },
    );
  }

  listSet(mall_id, title, mall_online, mall_sync) {
    this.mallService.listSet(
      Number(mall_id),
      title,
      mall_online,
      mall_sync,
      () => {},
    );
  }

  mallClassSet(collection_id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-mall-class-rank-set.html'),
      controller: 'mallClassRankSetController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        collection_id: () => collection_id,
      },
    });
    return modalInstance.result.then(params => {});
  }

  addItem(template_id, mall_id, collection_id) {
    this.mallService
      .selectGoods(
        Number(template_id),
        Number(mall_id),
        Number(collection_id),
        0,
      )
      .then(() => this.getGoodsList(), () => {});
  }

  popSet(item_id) {
    this.mallService.popSet(
      0,
      Number(this.article_cur.article_id),
      Number(item_id),
    );
  }
  showGoodsQr(item){
    GoodsLinkInfoController.open(
      {
        xcxCardImgUrl: item.item_imgurl,
        webUrl: item.url_item,
        webQrcodeUrl: item.url_qrc,
        itemId: item.item_id,
        articleId: item.article_id,
        ...item
      },
      { xdpInfo: _.result(this.kol_info, 'xdp_info') },
    );
  }
  showGoodsLinks(item, isGroupon = false) {
    if (this.isAdmin()) {
      const {
        article_id,
        item_id,
        kol_id,
        item_imgurl,
        url_item,
        url_qrc,
        collection_id,
        platform_id,
      } = item;
      const $p = isGroupon
        ? this.dataService.pathAQrUrlArticleGetGroupon({
            articleId: article_id,
            itemId: item_id,
            kolId: kol_id,
            platformId: platform_id,
            collectionId: collection_id,
          })
        : this.dataService.pathAQrUrl_getCollectionItem({
            articleId: article_id,
            itemId: item_id,
            kolId: kol_id,
          });
      //
      return $p.then(({ data }) => {
        GoodsLinkInfoController.open(
          {
            xcxCardImgUrl: item_imgurl,
            webUrl: url_item,
            webQrcodeUrl: url_qrc,
            itemId: item_id,
            articleId: article_id,
            ...data,
          },
          { xdpInfo: _.result(this.kol_info, 'xdp_info') },
        );
      });
    }
    // return ArticleGoodsGoodsLinksController.open(
    //   item,
    //   _.result(this.kol_info, 'xdp_info'),
    // );
    console.log(this.kol_info);
    console.log(item);
    const subscription = this.modalService.open({
      title: '商品链接',
      content: ModalLinksComponentV2,
      footer: false,
      maskClosable: false,
      width: 600,
      componentParams: {
        modalLink: {
          xdpId: this.kol_info.xdp_info.id,
          type: 0,
          typeId: item.item_id,
          kolId: this.kol_info.kol_id,
        },
      },
    });
  }

  showLinksInfoForArticle(item) {
    const {
      url_qrc,
      collection_url_article_2,
      kol_id,
      url_xiaochengxu,
      collection_id,
    } = item;
    console.log(url_qrc, collection_url_article_2);
    this.dataService
      .pathAQrUrl_getKolCollection({
        collectionId: collection_id,
        xcxUrl: url_xiaochengxu,
        kolId: kol_id,
      })
      .then(({ data }) => {
        GoodsLinkInfoController.open(
          {
            // xcxCardImgUrl: item_imgurl,
            webUrl: collection_url_article_2,
            webQrcodeUrl: url_qrc,
            ...data,
          },
          {
            xdpInfo: _.result(this.kol_info, 'xdp_info'),
            tabs: [
              {},
              {
                custom: true,
                templateId: `link-info-tab-web-4-article.html`,
              },
            ],
          },
        );
      });
  }

  showLinksInfo4Mall(item) {
    const {
      collection_url_shop_1,
      order_list_url,
      kol_id,
      collection_id,
      url_xiaochengxu,
    } = item;
    this.dataService
      .pathAQrUrl_getKolCollection({
        collectionId: collection_id,
        xcxUrl: url_xiaochengxu,
        kolId: kol_id,
      })
      .then(({ data }) => {
        GoodsLinkInfoController.open(
          {
            webUrl: collection_url_shop_1,
            orderListUrl: order_list_url,
            ...data,
          },
          {
            preventMallPath: true,
            xdpInfo: _.result(this.kol_info, 'xdp_info'),
            tabs: [
              {},
              {
                custom: true,
                templateId: `link-info-tab-web-4-mall.html`,
              },
            ],
          },
        );
      });

    console.log('mall', item);
  }

  copyUrl: (
    item: any,
    type: string,
    title: string,
    is_kol: number,
  ) => ng.IPromise<any> = (item, type, title, is_kol = 0) => {
    const template = require('./modal-copy-url.html');

    const list_url = [];
    if (type === 'item') {
      if (item.url_item !== '') {
        list_url.push({
          url: item.url_item,
          name: '商品链接',
          is_png: 0,
          block_view: 0,
        });
      }
      if (item.url_qrc !== '') {
        list_url.push({
          url: item.url_qrc,
          name: '商品二维码',
          is_png: 1,
          block_view: 0,
        });
      }
      if (is_kol === 0) {
        if (item.url_f_id_2 !== '') {
          list_url.push({
            url: item.url_f_id_2,
            name: '可见刷链接',
            is_png: 0,
            block_view: 0,
          });
        }
        if (item.url_f_id_1 !== '') {
          list_url.push({
            url: item.url_f_id_1,
            name: '不可见刷链接',
            is_png: 0,
            block_view: 0,
          });
        }
      }
    } else if (type === 'article') {
      if (this.isAdmin()) {
        if (item.collection_url_article_1 !== '') {
          list_url.push({
            url: item.collection_url_article_1,
            name: '文章阅读原文链接',
            is_png: 0,
            block_view: 0,
          });
        }
      }
      if (item.collection_url_article_2 !== '') {
        list_url.push({
          url: item.collection_url_article_2,
          name: '内容商品链接',
          is_png: 0,
          block_view: 0,
        });
      }
      if (item.url_qrc !== '') {
        list_url.push({
          url: item.url_qrc,
          name: '内容商品二维码',
          is_png: 1,
          block_view: 0,
        });
      }
    } else if (type === 'shop') {
      if (item.collection_url_shop_1 !== '') {
        list_url.push({
          url: item.collection_url_shop_1,
          name: '商城Tab链接',
          is_png: 0,
          block_view: 0,
        });
      }
      if (item.order_list_url && this.is_inside) {
        list_url.push({
          url: item.order_list_url,
          name: '用户订单查询链接',
          is_png: 0,
          block: 1,
        });
      }
      if (is_kol === 0) {
        if (item.collection_url_shop_2 !== '') {
          list_url.push({
            url: item.collection_url_shop_2,
            name: '非合作文章二维码链接',
            is_png: 0,
            block_view: 0,
          });
        }
        if (item.url_qrc !== '') {
          list_url.push({
            url: item.url_qrc,
            name: '非合作文章二维码图片',
            is_png: 1,
            block_view: 0,
          });
        }
        if (item.collection_url_shop_3 !== '') {
          list_url.push({
            url: item.collection_url_shop_3,
            name: '非合作文章推送链接',
            is_png: 0,
            block_view: 0,
          });
        }
      }
    }
    if (is_kol === 0 || this.b_show_xiaochengurl) {
      if (item.url_xiaochengxu !== '') {
        list_url.push({
          url: item.url_xiaochengxu,
          name: '小程序路径链接',
          is_png: 0,
          block: 1,
        });
      }
    }

    const modalInstance = this.$uibModal.open({
      template,
      animation: true,
      controller: 'modalCopyUrlController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        list_url: () => list_url,
        title: () => '商品链接配置',
      },
    });
    return modalInstance.result.then(params => {});
  };

  editCollectionText: (
    id: string,
    title: string,
    name: string,
    type: number,
  ) => ng.IPromise<any> = (id, title, name) => {
    let template;
    if (name === '商城名') {
      template = require('./modal-edit-collection-text.html');
    } else {
      template = require('./modal-create-collection-text.html');
    }
    const modalInstance = this.$uibModal.open({
      template,
      animation: true,
      controller: 'modalCreateCollectionTextController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        id: () => id,
        name: () => name,
        title: () => title,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .collection_collectionSet({
          collection_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('设置文案成功');
        });
    });
  };

  editCollectionCoupon: (
    id: string,
    title: string,
    name: string,
  ) => ng.IPromise<any> = (id, title, name) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-collection-coupon.html'),
      controller: 'modalCreateCollectionCouponController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        id: () => id,
        name: () => name,
        title: () => title,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .collection_collectionSet({
          collection_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('设置优惠券成功');
        });
    });
  };

  editCollectionSeckill: (
    id: string,
    title: string,
    name: string,
  ) => ng.IPromise<any> = (id, title, name) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-seckill.html'),
      controller: 'modalCreateSeckillController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        name: () => name,
        id: () => id,
        title: () => title,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .collection_seckillSet({
          seckill_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('设置秒杀成功');
        });
    });
  };

  editCollectionItems: (
    kol_id: string,
    id: string,
    article_id: string,
    name: string,
    title: string,
  ) => ng.IPromise<any> = (kol_id, id, article_id, name, title) => {
    if (Number(kol_id) === 0) {
      return;
    }
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-article-add-item.html'),
      controller: 'modalCreateArticleAddItemsController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        kol_id: () => kol_id,
        title: () => title,
        name: () => name,
        id: () => id,
        article_id: () => article_id,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      params.ids = params.ids.replace(/ /g, '');
      params.ids = params.ids.replace(/，/g, ',');
      const seller_email = this.article_cur.seller_email;
      const new_params = {
        params,
        seller_email,
        item_ids: params.ids,
      };
      // 需求变更，不复制商品
      return this.dataService
        .collection_collectionSet({
          collection_info: JSON.stringify(new_params.params),
        })
        .then(res => {
          this.Notification.success('添加商品成功');
          this.getGoodsList();
          this.getArticleList(999);
        });
    });
  };

  choiceCollectionItems: (
    kol_id: string,
    id: string,
    article_id: string,
    name: string,
    title: string,
  ) => ng.IPromise<any> = (kol_id, id, article_id, name, title) => {
    if (Number(kol_id) === 0) {
      return;
    }
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-article-choice-item.html'),
      controller: 'modalCreateArticleChoiceItemsController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        list_article: () => this.getArticleList(9999, 1, Number(article_id)),
        kol_id: () => kol_id,
        title: () => title,
        name: () => name,
        id: () => id,
        article_id: () => article_id,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      if (!params.ids) {
        return;
      }
      return this.dataService
        .collection_collectionSet({
          collection_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('添加已有商品成功');
          this.getGoodsList();
          this.getArticleList(999);
        });
    });
  };

  importArticleNew() {
    ArticelFormController.open4CreateWithWechatGuarantee(this.id).then(() => {
      this.getArticleList();
    });
  }

  editArticleNew: (article_id: string) => void = _.debounce(article_id => {
    ArticelFormController.open4EditWithWechatGuarantee(article_id).then(() => {
      this.getArticleList();
    });
    // tslint:disable-next-line:align
  }, 200);

  /*
  请求文章列表有个神奇的参数 is_get_key，然后 title 会多了 [文章] 或者 [商城]
  为了安全起见，直接过滤字符串，保佑不要有文章开头就是这个
  */
  getCurArticleTitle() {
    return _.result(this.article_cur, 'title', '').replace(/^\s*\[文章\]/, '');
  }

  importArticleShop: () => ng.IPromise<any> = () => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-kol-article-shop.html'),
      controller: 'modalCreateKOLArticleShopController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        article_id: () => 0,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      _.assign(params, {
        kol_id: this.id,
      });
      return this.dataService
        .kol_mgr_articleAdd({
          article_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('添加文章成功！');
          return this.getArticleList();
        });
    });
  };

  editArticleShop: (article_id: string) => ng.IPromise<any> = article_id => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-kol-article-shop.html'),
      controller: 'modalCreateKOLArticleShopController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        article_id: () => article_id,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .kol_mgr_articleSet({
          article_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('文章编辑成功！');
          return this.getArticleList();
        });
    });
  };

  savePrice: (data: string, id: string) => ng.IPromise<any> = (data, id) => {
    const params = {
      id,
      kol_price: data,
    };

    return this.dataService
      .kol_mgr_itemSet({
        item_info: JSON.stringify(params),
      })
      .then(res => {
        this.Notification.success('编辑价格成功！');
        return this.getGoodsList();
      });
  };

  editPrice: (id: string) => ng.IPromise<any> = id => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-edit-kol-item-price.html'),
      controller: 'modalEditKOLItemPriceController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        id: () => id,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .kol_mgr_itemSet({
          item_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('编辑价格成功！');
          return this.getGoodsList();
        });
    });
  };

  hideItem: (id: string, is_public: '1' | '0') => ng.IPromise<any> = (
    id,
    is_public,
  ) => {
    const str = is_public === '1' ? '隐藏' : '取消隐藏';
    return this.seeModal.confirmP(`${str}单品`, `确定${str}该单品？`).then(() =>
      this.dataService
        .kol_mgr_itemHide({
          id,
          is_public: is_public === '1' ? 0 : 1,
        })
        .then(res => {
          this.Notification.success(`${str}单品操作成功！`);
          return this.getGoodsList();
        }),
    );
  };

  selectTab: () => void = () =>
    this.$location.search({ wechat_id: this.wechat_id });

  deleteItem: (id: string) => any = id =>
    this.seeModal.confirm('删除单品', '确认删除该单品？', () => {
      return this.dataService
        .kol_mgr_itemDelete({
          id,
        })
        .then(res => {
          this.Notification.success('删除单品成功！');
          return this.getGoodsList();
        });
    });

  hideItem2: (
    id: string,
    item_id: string,
    is_hide: string,
    title: string,
    index: any,
  ) => any = (id, item_id, is_hide, title, index) => {
    this.dataService
      .collection_hideItem({
        id,
        item_id,
        is_hide,
      })
      .then(res => {
        this.Notification.success(title + '成功！');
        // return this.getGoodsList();
        this.goods_list[index].is_hide = is_hide;
      });
  };
  // this.seeModal.confirm('确认提示', '确认' + title + '？', () => {
  //   return this.dataService
  //     .collection_hideItem({
  //       id,
  //       item_id,
  //       is_hide,
  //     })
  //     .then(res => {
  //       this.Notification.success(title + '成功！');
  //       return this.getGoodsList();
  //     });
  // });

  recommendItem: (
    id: string,
    item_id: string,
    tag_recommend: string,
    title: string,
  ) => any = (id, item_id, tag_recommend, title) =>
    this.seeModal.confirm('确认提示', '确认' + title + '？', () => {
      return this.dataService
        .collection_recommendItem({
          id,
          item_id,
          tag_recommend,
        })
        .then(res => {
          this.Notification.success(title + '成功！');
          return this.getGoodsList();
        });
    });

  deleteCollectionItem: (id: string, item_id: string, title: string) => any = (
    id,
    item_id,
    title,
  ) =>
    this.seeModal.confirm('确认提示', '确认' + title + '？', () => {
      return this.dataService
        .collection_deleteItem({
          id,
          item_id,
        })
        .then(res => {
          this.Notification.success(title + '成功！');
          return this.getGoodsList();
        });
    });

  shouldShowGoodsGroupTab() {
    return (
      this.id !== '0' &&
      _.includes(
        [
          PERMISSION_CODES.Super_Admin, // 超管
          PERMISSION_CODES.Elect_Admin, // 电商管理员
          PERMISSION_CODES.KOL_Admin, // 市场运营
        ],
        this.seller_privilege,
      )
    );
  }

  isAdmin() {
    return (
      this.id !== '0' &&
      _.includes(
        [
          PERMISSION_CODES.Super_Admin, // 超管
          PERMISSION_CODES.Elect_Admin, // 电商管理员
          PERMISSION_CODES.KOL_Admin, // 市场运营
        ],
        this.seller_privilege,
      )
    );
  }

  shouldShowSaleToolBtn() {
    return !_.includes(
      [
        PERMISSION_CODES.KOL_Admin, // 市场运营
      ],
      this.seller_privilege,
    );
  }

  addGoodsFromTheme(item) {
    ThemePickerController.open(item.kol_id, item.article_id);
  }

  showSteps(shouldCheckEver?: boolean) {
    const stepNum = this.isArticleCreateUnderThemeWithArticle() ? 3 : 2;
    const storageKey = `hasEverPopStep${stepNum}Indicator`;
    if (shouldCheckEver && localStorage.getItem(storageKey)) {
      return;
    }
    localStorage.setItem(storageKey, '1');
    ArticleGoodsStepsController.open(stepNum);
  }

  getArticleListHref(item) {
    // TODO 统一调用，免得缺少参数
    const href = `/kol/kol-cooperation-management/${item.kol_id}?&wechat_id=${
      item.weixin_id
    }#1`;
    return href;
  }

  private getArticleList: (
    page_size?: number,
    all?: number,
    article_id?: number,
  ) => ng.IPromise<any> = (page_size = 20, all = 0, article_id = 0) => {
    let cur_page = Number(this.page);
    let is_get_key = 0;
    if (page_size >= 999) {
      cur_page = 1;
      is_get_key = 1;
    }
    return this.dataService
      .kol_mgr_articleList({
        is_get_key,
        page_size,
        page: cur_page,
        kol_id: this.id,
        filter_info: JSON.stringify({
          all,
          article_id,
          article_type: this.article_type,
          keyword: this.search_data.keyword,
          begin_time: this.search_data.date_picker.startDate
            ? this.search_data.date_picker.startDate.unix()
            : undefined,
          end_time: this.search_data.date_picker.endDate
            ? this.search_data.date_picker.endDate.unix()
            : undefined,
        }),
      })
      .then(res => {
        if (page_size === 20) this.total_items = res.data.count;
        if (Number(all) === 1) {
          return res.data.list;
        }
        this.article_list = res.data.list.map(article => ({
          ...article,
          title:
            +article.article_id === +this.xdpInfo.article_id
              ? '所有商品'
              : article.title,
        }));
        this.article_cur = false;
        _.forEach(res.data.list, (v, i) => {
          if (Number(v.article_id) === Number(this.search_data.article_id)) {
            this.article_cur = v;
            // 宝宝看不懂呀~~~~~~~~~~~~
            // 如果是 kol 登录，弹出文章提示
            if (this.is_new_brand) {
              this.showSteps(true);
            }
            /*
            var cur_time = new Date();
            this.search_data.date_picker = {
            startDate: moment(this.article_cur.start_time * 1000) ,
            endDate:  moment( cur_time) ,
            }*/
          }
        });
        return this.article_list;
      });
  };

  isNonArticle() {
    return _.isEmpty(this.article_list);
  }

  // 「文章商品」页中的「预览文章」按钮是否显示
  // 依据：1 该文章在「有文章的主题」下创建 && 2 主题可见
  shouldShowPreviewArticle(articleItem) {
    const topic_info = articleItem && articleItem.topic_info;
    return (
      topic_info &&
      topic_info.article_url && // #1
      Number(topic_info.status) === 2 // #2
    );
  }

  //   true: 该文章在「有文章的主题」下创建
  isArticleCreateUnderThemeWithArticle(articleItem = this.article_cur) {
    return _.result(articleItem, 'topic_info.article_url');
  }

  // 显示选择品类的表
  private toSelectMallClass() {
    // console.log('selected_class',this.selected_class);
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../datacenter/modal-select-class.html'),
      controller: 'modalSelectClassController',
      controllerAs: 'vm',
      resolve: {
        // 获取选择的列表
        selected_class: () => this.selected_class,
        // 获取全部的列表
        class_list: () => this.list_mall_class,
      },
    });

    return modalInstance.result.then((new_selected_class: any[]) => {
      this.selected_class = new_selected_class;
      this.submitSearch();
    });
  }

  // 在搜索中显示
  private getSelectedMallClassName() {
    return this.selected_class.map(o => o.class_name).join(',');
  }

  private getMallClassKey: () => ng.IPromise<any> = () => {
    return this.dataService.mall_mallClassGetKey({}).then(res => {
      this.list_mall_class = res.data;

      const tmp_class_id = this.$routeParams['tmp_class_id']
        ? JSON.parse(decodeURIComponent(this.$routeParams['tmp_class_id']))
        : [];
      tmp_class_id.length &&
        _.forEach(tmp_class_id, c1 => {
          _.forEach(this.list_mall_class, c2 => {
            if (Number(c1) === Number(c2.class_id)) {
              this.selected_class.push(c2);
            }
          });
        });

      return this.list_mall_class;
    });
  };

  private getGoodsList: () => ng.IPromise<any> = () => {
    this.search_data.article_id = this.article_id;

    const filter_class_id = [];
    if (this.$routeParams['tmp_class_id']) {
      const tmp_class_id = JSON.parse(
        decodeURIComponent(this.$routeParams['tmp_class_id']),
      );
      _.forEach(tmp_class_id, c2 => {
        filter_class_id.push(c2);
      });
    }

    return this.dataService
      .kol_mgr_itemList({
        filter_class_id: JSON.stringify(filter_class_id),
        page: this.page,
        page_size: 20,
        kol_id: this.id,
        filter_info: JSON.stringify({
          item_status_type: this.item_status_type,
          keyword: this.search_data.keyword,
          begin_time: this.search_data.date_picker.startDate
            ? this.search_data.date_picker.startDate.unix()
            : undefined,
          end_time: this.search_data.date_picker.endDate
            ? this.search_data.date_picker.endDate.unix()
            : undefined,
          article_id: this.search_data.article_id,
          article_type: this.article_type,
          collection_id: this.collection_id,
          rank_type: this.search_data.rank_type,
        }),
      })
      .then(res => {
        this.total_items = res.data.count;
        this.goods_list = res.data.list;
        this.count_sell = res.data.count_sell;
        this.count_not_sell = res.data.count_not_sell;
        return this.goods_list;
      });
  };

  private getKOLDetailBase: () => ng.IPromise<any> = () => {
    if (this.wechat_id === '') {
      return;
    }
    return this.dataService
      .da_portrait_detail_base({
        wechat_id: this.wechat_id,
        token: md5(`see${moment().format('YYYYMMDD')}${this.wechat_id}`),
      })
      .then(res => {
        this.kol = res.data;
        return this.kol;
      });
  };
}

export const fashionKolInfoList: ng.IComponentOptions = {
  template: require('./fashion-kol-info-list.template.html'),
  controller: fashionKolInfoListController,
};
