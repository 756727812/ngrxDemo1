import * as angular from 'angular';
import { throttle, debounce, invert, toPairs, findKey } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';
import './goods-list.less';

import BG_OPTIONS from '../../../../const/theme-bg';

import EditFormController from './edit-form.component';
import AddGoodsDialogController from '../append-goods/index.component';
import { waitDom, confirmImgHost, isProdEnv } from '../../../../utils';
import BaseClass from '../../../BaseClass';
import { SellPointPopController } from './sell-point-pop.component';
import Injector from '../../../../utils/injector';

const SORTER_NAME = {
  PRICE: 'profitType',
  SUPPLY_PRICE: 'supplyPriceType',
};

let _kolInfo = null;
const getUserInfo = () => {
  return new Promise(resolve => {
    if (_kolInfo) {
      resolve(_kolInfo);
    } else {
      Injector.getDataService()
        .kol_mgr_kolGetWithSeller({}) //
        .then(({ data }) => {
          _kolInfo = data.kol_info;
          resolve(_kolInfo);
        });
    }
  });
};

const MARK_COME_FROM_THEME_WHEN_TO_CONTENT_ELEC = 'goods:themes:to:sell';
export class Controller extends BaseClass {
  static $inject: string[] = [
    '$interval',
    '$window',
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];

  static isComeFromTheme() {
    const val = localStorage.getItem(MARK_COME_FROM_THEME_WHEN_TO_CONTENT_ELEC);
    localStorage.removeItem(MARK_COME_FROM_THEME_WHEN_TO_CONTENT_ELEC);
    return val === '1';
  }

  pageData: any;
  themeId: string;
  nonGoods: boolean = false;
  urlprefix: string;
  themeInfo = {};
  profitSorter = 0;
  supplyPriceSorter = 0;
  sorters: any;
  sorterVal: any;
  resizeTimer: any;
  kolInfo: any;
  loading: boolean;
  hasLastPageLoaded: boolean;
  isQuhaodian: boolean = localStorage.getItem('is_quhaodian') === '1';

  constructor(
    private $interval: ng.IIntervalService,
    private $window: ng.IWindowService,
    private assertService: see.IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: see.ISeeModalService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {
    super();
    this.urlprefix = (function() {
      const url = window.location.href;
      let newUrl = '';
      if (
        url.match('//portal.xiaodianpu.com/') ||
        url.match('//portal.xiaodianpu.com/')
      ) {
        newUrl = '//m.seeapp.com';
      } else {
        newUrl = '//see-test.seecsee.com';
      }
      return newUrl;
    })();
  }

  $onInit() {
    this.sorterVal = {
      [SORTER_NAME.PRICE]: 0,
      [SORTER_NAME.SUPPLY_PRICE]: 0,
    };
    this.sorters = [
      { label: '利润', name: SORTER_NAME.PRICE },
      { label: '供货价', name: SORTER_NAME.SUPPLY_PRICE },
    ];
    this.pageData = {
      page: this.$routeParams.page || 1,
      pageSize: 10,
      list: [],
      loadedPage: {},
    };
    this.themeId = this.$routeParams.themeId;
    this.getPageData();
    this.getThemeInfo();
    $(this.$window).on('resize.refreshBoxCtSize', this.refreshListCtWidth);

    // waitDom('#goods-theme-goods-list ul.goods>li') //
    //   .promise.then(this.refreshListCtWidth.bind(this));
    this.resizeTimer = this.$interval(this.refreshListCtWidth.bind(this), 1000);
  }

  $onDestroy() {
    this.$interval.cancel(this.resizeTimer);
    // $(this.$window).off('resize.refreshBoxCtSize');
  }

  getItemHrefUrl(item) {
    // 唉~~
    const host = isProdEnv()
      ? ' http://m.seeapp.com'
      : 'http://see-test.seecsee.com';
    return `${host}/see/static/detail/commodity_limit.html?item_id=${item.id}`;
  }

  popGoodsSellPoint(item) {
    SellPointPopController.open(item);
  }

  getSellPointTips(item) {
    return item.topicItemSellPoint
      .split(/\r?\n/)
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  sort({ name }) {
    const toggle = val => ({ 0: 2, 2: 1, 1: 0 }[val]);
    Object.keys(this.sorterVal).forEach(key => {
      this.sorterVal[key] =
        key === name //
          ? toggle(this.sorterVal[key])
          : 0;
    });
    this.debounceReloadFirstPage();
  }
  isSorterVal({ name }, val) {
    return this.sorterVal[name] === val;
  }

  isSorterActive({ name }) {
    return this.sorterVal[name] !== 0;
  }

  isAdmin() {
    return this.accessChecker.isGoodsThemeAdmin();
  }

  toAppendToOff(item) {
    return this.toggleSaleStatus(item, 0);
  }

  refreshListCtWidth = throttle(() => {
    const dsMainCt = this.$element.closest('.page-content');
    const listCt = this.$element.find('.list-ct');
    const mainCt = this.$element.find('#goods-theme-goods-list');
    const ul = mainCt.find('ul.goods');
    const extraWidth = 0;
    const availWidth = listCt.width() - extraWidth; //
    const boxLi = ul.find('li').first();
    if (boxLi.length) {
      const boxWidth = boxLi.outerWidth(true);
      const availBoxNum = ~~(availWidth / boxWidth);
      const ctBestWidth = boxWidth * availBoxNum;
      this.$element.find('.goods-block').css('width', ctBestWidth);
    }
    const wholeCt = this.$element.find('#goods-theme-goods-list-ct');
    wholeCt.height(
      $(window).height() - wholeCt.offset().top - $('footer').outerHeight(true),
    );
    // this.$element.find('.top-bar').css('width', ctBestWidth);
    // this.$element
    //   .find('.goods-block')
    //   .height($(window).height() - listCt.offset().top);
    // tslint:disable-next-line:align
  }, 300);

  private toggleSaleStatus(item, onsale) {
    item._busy = true;
    return this.dataService
      .goods_theme_addGoodsItemToXDPOrOff({
        params: {
          onsale,
          item_ids: JSON.stringify([item.id]),
        },
        noSpinner: true,
      })
      .then(() => {
        item._busy = false;
        if (onsale === 0) {
          item.inStore = true;
        } else if (onsale === 1) {
          item.inXDP = true;
        }
        this.Notification.success('保存成功');
      })
      .catch(() => (item._busy = false));
  }

  resetPageStatus() {
    this.hasLastPageLoaded = false;
    Object.assign(this.pageData, {
      list: [],
      page: 1,
      loadedPage: {},
    });
  }

  reloadFirstPage() {
    this.resetPageStatus();
    this.getPageData();
    // if (~~this.$routeParams.page === 1) {
    //   this.getPageData();
    // } else {
    //   this.$location.search({
    //     ...this.$location.search(),
    //     page: 1,
    //   });
    // }
  }

  getThemeInfo() {
    this.dataService
      .goods_theme_getThemeInfo({ params: { topicId: this.themeId } }) //
      .then(({ data }) => {
        if (data.firstVisit) {
          this.seeModal.alert(
            '提示',
            '文章资源在小电铺推广期间暂时免费，推广期过后，使用文章会收取相应版权费用',
            () => {},
            '知道了',
          );
        }
        this.themeInfo = data;
      });
  }

  debounceReloadFirstPage = debounce(() => this.reloadFirstPage(), 250);

  adjustUISize() {
    this.refreshListCtWidth();
    this.detectSellPointWetherPop();
  }

  detectSellPointWetherPop = () => {
    this.$element.find('.sell-point').each((i, el) => {
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

  scrollLoadNextPage() {
    if (this.loading) {
      return;
    }
    if (this.hasLastPageLoaded) {
      return;
    }

    this.pageData.page += 1;
    this.getPageData();
  }

  getPageData() {
    const { page, pageSize } = this.pageData;
    const params = {
      topicId: this.themeId,
      page: this.pageData.page,
      pageSize: this.pageData.pageSize,
    };
    const sorterName = findKey(this.sorterVal, val => val !== 0);
    if (sorterName) {
      params[sorterName] = this.sorterVal[sorterName];
    }
    this.loading = true;

    this.dataService
      .goods_theme_getGoodsInTheme({ params })
      .then(({ data }) => {
        // Object.assign(this.pageData, {
        //   list: data.list,
        //   count: data.count,
        // });
        this.onScrollPageLoad(data);
        this.nonGoods = page === 1 && data.list.length === 0;
        this.hasLastPageLoaded = data.count <= pageSize * page;

        setTimeout(() => {
          this.adjustUISize();
          // tslint:disable-next-line:align
        }, 100);
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  private onScrollPageLoad(data) {
    const pageData = this.pageData;
    const { page, pageSize, loadedPage, list } = this.pageData;
    if (!loadedPage[page]) {
      list.push.apply(list, data.list);
      loadedPage[page] = data.list;
    }
  }

  fmtPercent(val) {
    const num = parseFloat(val);
    let newNum = '';
    if (isNaN(num)) {
      newNum = '';
    } else {
      newNum = `${(num * 100).toFixed(2)}%`;
    }
    return newNum;
  }

  toEdit(item) {
    EditFormController.open(this.themeId, item.id, {
      wordLink: item.wordLink,
      topicItemIconDisplay: item.topicItemIconDisplay,
      sellPoint: item.topicItemSellPoint, // 囧~~
    }).result.then(result => {
      if (result && result.success && result.updatedData) {
        Object.assign(item, result.updatedData);
      }
    });
  }
  // 商品导出
  toExportGoods(itemName): void {
    const themeId = this.$routeParams && this.$routeParams.themeId;
    this.$window.open(
      `/api/ng/cts/item/exportList?topicId=${themeId}&topicName=${itemName}`,
    );
  }

  toAppendGoods(item) {
    const modalInstance = AddGoodsDialogController.open(this.themeId);
    modalInstance.closed.then(() => this.reloadFirstPage());
  }

  toRemove(item) {
    this.seeModal
      .confirmP('确认提示', '确认将该商品移出当前主题？')
      .then(() => {
        this.dataService
          .goods_theme_removeGoods({
            params: {
              targetId: item.id,
              type: 1,
              topicId: this.themeId,
            },
          })
          .then(() => {
            this.getPageData();
            this.Notification.success('保存成功');
          })
          .catch(() => {
            this.Notification.success('保存失败');
          });
      });
  }

  toSell() {
    getUserInfo() //
      .then((kol_info: any) => {
        // tslint:disable-next-line:max-line-length
        const href = `/kol/kol-cooperation-management/${
          kol_info.kol_id
        }?themeId=${this.themeId}&fromThemeSell=1&wechat_id=${
          kol_info.weixin_id
        }#1`;
        localStorage.setItem(MARK_COME_FROM_THEME_WHEN_TO_CONTENT_ELEC, '1');
        this.$window.location.href = href;
      });
  }
}

export const goodsThemeGoodsList: ng.IComponentOptions = {
  template: require('./goods-list.template.html'),
  controller: Controller,
  bindings: {},
};
