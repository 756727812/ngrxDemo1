import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;
import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';
import { remove, repeat, times, throttle } from 'lodash';

import './list.less';

import BG_OPTIONS from '../../../../const/theme-bg';

import FormController from '../form/form.component';
import AddGoodsDialogController from '../append-goods/index.component';
import { ArticelPickerController } from '../article-picker/article-picker.component';
import { confirmImgHost, waitDom } from '../../../../utils';
import GoodsThemeMsgController from '../msg/msg.component';
import BaseClass from '../../../BaseClass';

const DISPLAY_VAL = {
  VISIBLE: 2,
  HIDDEN: 1,
};
const FILTER_TYPE_OPTIONS = [
  { id: 0, name: '全部' },
  { id: 1, name: '文章主题' },
  { id: 2, name: '非文章主题' },
];

export class Controller extends BaseClass {
  static $inject: string[] = [
    '$scope',
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

  pageData: any;
  lastPageDataParams: any = null;
  formData: any;

  keyword: string = '';
  nonSearchResult: boolean = false;
  submitedKeyword: string;
  loading: boolean = false;
  hasLastPageLoaded: boolean = false;
  ready = false;
  FILTER_TYPE_OPTIONS = FILTER_TYPE_OPTIONS;
  hackBoxList = [];

  constructor(
    private $scope: ng.IScope,
    private $window: ng.IWindowService,
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {
    super();
  }

  $onInit() {
    this.formData = {
      keyword: '',
      filterType: FILTER_TYPE_OPTIONS[0],
    };
    this.pageData = {
      page: this.$routeParams.page || 1,
      pageSize: 12,
      list: [],
      loadedPage: {},
    };
    this.dataService.checkShopStatus({}).then(ok => {
      ok && this.getPageData();
      this.ready = true;
    });
    $(this.$window).on(
      'resize.refreshBoxCtSize',
      throttle(this.refreshListCtWidth.bind(this), 200),
    );
    waitDom('#goods-theme-list ul.theme>li.biz-box') //
      .promise.then(this.refreshListCtWidth.bind(this));
  }

  $onDestroy() {
    $(this.$window).off('resize.refreshBoxCtSize');
  }

  isAdmin() {
    return this.accessChecker.isGoodsThemeAdmin();
  }

  toViewGoods(item) {
    this.$window.open(`/goods-theme-list/${item.id}`);
  }

  toggleVisible(item) {
    const { id, status } = item;
    const newStatus =
      status === DISPLAY_VAL.HIDDEN ? DISPLAY_VAL.VISIBLE : DISPLAY_VAL.HIDDEN;
    const params = { id, status: newStatus };
    item._busy = true;
    this.dataService
      .goods_theme_toggleGoodsTheme({ params, noSpinner: true })
      .then(() => {
        const msg = newStatus === DISPLAY_VAL.HIDDEN ? '隐藏成功' : '已取消隐藏';
        this.Notification.success(msg);
        item._busy = false;
        item.status = newStatus;
        this.getPageData(true);
      })
      .catch(() => {
        const msg = newStatus === DISPLAY_VAL.HIDDEN ? '隐藏失败' : '取消隐藏失败';
        item._busy = false;
        this.Notification.success(msg);
      });
  }

  toDel(item) {
    this.seeModal.confirmP('确认提示', '确认删除该主题').then(() => {
      const params = { id: item.id };
      this.dataService
        .goods_theme_delGoodsTheme({ params })
        .then(() => {
          this.Notification.success('删除成功');
          this.pageData.list = _.without(this.pageData.list, item);
        })
        .catch(() => {
          this.Notification.success('删除失败');
        });
    });
  }

  reloadFirstPage() {
    this.resetPageStatus();
    this.getPageData(true);
  }

  search() {
    this.resetPageStatus();
    this.submitedKeyword = this.formData.keyword;
    this.getPageData();
  }

  onFilterTypeChange() {
    this.reloadFirstPage();
  }

  resetPageStatus() {
    this.lastPageDataParams = null;
    this.hasLastPageLoaded = false;
    Object.assign(this.pageData, {
      list: [],
      page: 1,
      loadedPage: {},
    });
  }

  scrollLoadNextPage() {
    if (!this.ready) {
      return;
    }
    if (this.loading) {
      return;
    }
    if (this.hasLastPageLoaded) {
      return;
    }
    this.pageData.page += 1;
    this.getPageData();
  }

  toCreateTheme() {
    FormController.open().result.then(
      result => result && result.success && this.reloadFirstPage(),
    );
  }

  toEdit(item) {
    // 更新考虑不重刷，回传更新后数据
    FormController.open(item).result.then(
      result => result && result.success && this.reloadFirstPage(),
    );
  }

  toAppendGoods(item) {
    AddGoodsDialogController.open(item.id).result.then(
      result => result && result.success && this.reloadFirstPage(),
    );
  }

  toTop(item) {
    this.asyncMoveThemeToTop(item.id).then(() => {
      this.Notification.success('保存成功');
      this.reloadFirstPage();
    });
  }

  toAppendToOff(item) {
    item._busy = true;
    this.dataService
      .goods_theme_appendThemeToOff({
        params: {
          topic_id: item.id,
          onsale: 0,
        },
        noSpinner: true,
      })
      .then(({ data }) => {
        const { count, unvaliable_count, repeat_count } = data;
        const addedCount = count - unvaliable_count - repeat_count;
        GoodsThemeMsgController.alert(addedCount, repeat_count);
        item.onsale = 0;
        item._busy = false;
      })
      .catch(() => (item._busy = false));
  }

  toAppendToArticle(item) {
    ArticelPickerController.openForAddThemeAllGoods(item.id);
  }

  getBgImg(item) {
    const { defaultImgId } = item;
    if (~~defaultImgId > 0) {
      const bgItem = _.find(BG_OPTIONS, { id: ~~defaultImgId });
      return `url(${bgItem ? bgItem.img : ''})`;
    } else if (item.imgurl) {
      return `url(${confirmImgHost(item.imgurl)}?imageView2/5/w/650/h/526)`;
    }
  }

  asyncMoveThemeToTop(id) {
    return this.dataService.goods_theme_sortGoodsTheme({
      params: {
        id,
        sortType: 1,
      },
    });
  }

  isDefaultBg(item) {
    return ~~item.defaultImgId > 0;
  }

  isUseScrollLoad() {
    return !this.isAdmin();
  }

  isItemHasArticle(item) {
    return item.articleName && item.articleUrl;
  }

  getPageData(force?: boolean) {
    const { page, pageSize } = this.pageData;
    const filterType = this.formData.filterType.id;
    const params = { page, pageSize, filterType };
    let hasKeyword = false;
    if (this.submitedKeyword) {
      Object.assign(params, {
        keyWord: this.submitedKeyword,
      });
      hasKeyword = true;
    }

    if (force !== true && _.isEqual(this.lastPageDataParams, params)) {
      return;
    }
    this.loading = true;
    if (this.isUseScrollLoad()) {
      this.fillListGap();
    }
    this.dataService
      .goods_theme_listGoodsTheme({ params }) //
      .then(({ data }) => {
        this.lastPageDataParams = params;
        // TODO 清除
        if (this.isUseScrollLoad()) {
          this.clearListGap();
          this.onScrollPageLoad(data);
        } else {
          this.onSinglePageLoad(data);
        }
        this.nonSearchResult = hasKeyword && data.list.length === 0;
        this.hasLastPageLoaded = data.count <= pageSize * page;
        this.loading = false;
        setTimeout(() => {
          this.$element
            .find('.desc-txt')
            .dotdotdot({ ellipsis: ' \u2026 ', truncate: 'letter' });
        });
      })
      .catch(() => (this.loading = false));
  }

  clearListGap() {
    this.hackBoxList = [];
  }

  fillListGap() {
    const ul = this.$element.find('ul.theme');
    const lastLi = ul.find('li.biz-box').last();
    if (this.pageData.list.length && lastLi.length) {
      this.$scope.$evalAsync(() => {
        const ulInnerWidth: number = ul.innerWidth();
        const liOuterWidth: number = ul
          .find('li.biz-box')
          .first()
          .outerWidth();
        const colNum = ~~(ulInnerWidth / liOuterWidth);
        const gapItemNum = colNum - ul.find('li.biz-box').length % colNum;
        this.clearListGap();
        // tslint:disable-next-line:prefer-array-literal
        this.hackBoxList = times(gapItemNum, i => ({
          id: `hack-box-${i}`,
          _hackBox: true,
        }));
      });
    }
  }

  refreshListCtWidth() {
    const dsMainCt = this.$element.closest('.page-content');
    const dsMainInnerWidth = dsMainCt.innerWidth();
    const dsHGap = dsMainInnerWidth - dsMainCt.width();
    const mainCt = this.$element.find('#goods-theme-list');
    const themeWrap = mainCt.find('.theme-wrap');
    const ul = themeWrap.find('ul.theme');
    const extraWidth = 0;
    const themeWrapInnerWidth = themeWrap.innerWidth();
    const themeWrapWidth = themeWrap.width();
    const themeWrapHGap = themeWrapInnerWidth - themeWrapWidth;
    const availWidth = dsMainCt.width() - themeWrapHGap - extraWidth; //
    const boxLi = ul.find('li.biz-box').first();
    if (!boxLi.length) {
      return;
    }
    const boxWidth = boxLi.outerWidth(true);
    const availBoxNum = ~~(availWidth / boxWidth);
    const ctBestWidth =
      boxWidth * availBoxNum + (themeWrapInnerWidth - themeWrapWidth);
    mainCt.css('width', ctBestWidth);
  }

  private onSinglePageLoad(data) {
    Object.assign(this.pageData, {
      list: data.list,
      count: data.count,
      totalPageNum: Math.ceil(data.count / this.pageData.pageSize),
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
}

export const goodsThemeList: ng.IComponentOptions = {
  template: require('./list.template.html'),
  controller: Controller,
  bindings: {
    kolId: '<',
  },
};
