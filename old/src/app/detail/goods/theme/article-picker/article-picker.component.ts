/*
默认表示把主题下的商品添加到文章，可以用作 纯 picker，不发起请求
*/

import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';
import { IReportService } from '../../../../services/report-service/report-service.interface';

// tslint:disable-next-line:max-line-length
import { modalCreateKOLArticleNewController } from '../../../kol/modal-create-kol-article-new.controller';
import { modalEditWechatIdController } from '../../../kol/modal-edit-wechatid.controller';
import { ArticelFormController } from '../../../kol/article-form/article-form.component';

import './article-picker.less';

import GoodsThemeMsgController from '../msg/msg.component';
import Injector from '../../../../utils/injector';

let _kolId = null;
const asyncGetKolId: () => Promise<number> = () =>
  new Promise(resolve => {
    _kolId
      ? resolve(_kolId)
      : Injector.getDataService()
          .shop_checkCurrentStatus() //
          .then(resp => resolve((_kolId = resp.data.kol_id)));
  });

const openDialog = resolveMap => {
  Injector.getUibModal().open({
    animation: true,
    backdrop: 'static',
    size: 'goods-theme-add-to-article',
    component: 'goodsThemeArticlePicker',
    resolve: resolveMap,
  });
};

export class ArticelPickerController {
  static $inject: string[] = [
    'reportService',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];

  static confirmWechatAccountInfo() {
    return new Promise(resolve => {
      Injector.getDataService()
        .seller_getSellerDetail()
        .then(({ data }) => {
          // wx_official_name; // 名称
          // wx_official_account; // 公众号微信号
          const { wx_official_name, wx_official_account } = data.seller_info;
          if (!wx_official_account || !wx_official_name) {
            modalEditWechatIdController
              .open(wx_official_account, wx_official_name) //
              .result.then(params => resolve(params));
          } else {
            resolve({ wx_official_account, wx_official_name });
          }
        });
    });
  }

  static open4OnlyPickWithWechatGuarantee(themeId) {
    return new Promise(resolve => {
      ArticelPickerController.confirmWechatAccountInfo().then(() => {
        openDialog({
          themeId: () => themeId,
          onlyPickCallback: () => article => resolve({ article }),
        });
      });
    });
  }

  static openForAddThemeAllGoods(themeId) {
    return new Promise(resolve => {
      Injector.getUibModal().open({
        animation: true,
        backdrop: 'static',
        size: 'goods-theme-add-to-article',
        component: 'goodsThemeArticlePicker',
        resolve: {
          themeId: () => themeId,
          onAddThemeAllGoodsSucc: () => article => resolve({ article }),
        },
      });
    });
  }

  close: Function;
  form: ng.IFormController;
  loading: boolean;
  submitedKeyword: string = '';
  kolId: number;
  nonResult: boolean = false;
  wechatIdPromise: any;
  kolIdPromise: any;
  resolve: {
    themeId: string;
    onAddThemeAllGoodsSucc: Function; // 原来这个组件用来「主题所有商品添加到文章」，这里表示添加后的回调
    shouldConfirmBeforePick: boolean; // 选择文章，确认提示
    onlyPickCallback: Function; // 选择文章之后的回调，如果提供，则不发起默认的 「主题所有商品添加到文章」请求
  };

  noneSearchResult: boolean = false;
  noArticleYet: boolean = false;

  formData: any = {
    keyword: '',
  };

  pageData: any = {
    page: 1,
    pageSize: 10,
    list: [],
  };
  dismiss: Function;

  constructor(
    private reportService: IReportService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {}

  get themeId() {
    return this.resolve.themeId;
  }

  closeModal() {
    this.close({ $value: null });
  }

  $onInit() {
    const DEFAULT_RESOLVE_VALUE = {
      shouldConfirmBeforePick: true,
    };
    this.resolve = _.merge({}, DEFAULT_RESOLVE_VALUE, this.resolve);
    asyncGetKolId().then(kolId => {
      this.kolId = kolId;
      this.getPageData();
    });
    this.wechatIdPromise = new Promise(resolve => {
      this.dataService.seller_getSellerDetailv2().then(resp => {
        resolve(_.result(resp, 'data.account_info.wx_official_account'));
      });
    });
  }

  private openArticleFormDialog(wechatId, initFormData?: any) {
    ArticelFormController.openWithInitData(
      initFormData,
    ).result.then(formData => {
      console.log('formData', formData);
      asyncGetKolId().then(kol_id => {
        const params = _.merge({}, formData, {
          kol_id,
          topic_item_id: this.themeId,
        });
        this.dataService
          .goods_theme_createArticle({
            params: { article_info: JSON.stringify(params) },
          })
          .then(res => {
            this.Notification.success('创建文章成功');
            return this.reloadFirstPage();
          });
      });
    });
  }

  toCreateArticle() {
    this.wechatIdPromise.then(wechatId => {
      if (!wechatId) {
        this.seeModal.confirmP('提示', '请先完善公众号信息，再创建文章').then(() => {
          modalEditWechatIdController.open().result.then(({ wechat_id }) => {
            this.wechatIdPromise = Promise.resolve(wechat_id);
          });
        });
      } else {
        this.asyncGetArticleInitFormData() //
          .then(initFormData => {
            this.openArticleFormDialog(wechatId, initFormData);
          });
      }
    });
  }

  private asyncGetArticleInitFormData() {
    return new Promise(resolve => {
      if (this.themeId) {
        // 如果是从主题相关的创建文章，那么默认带上主题表单的文章
        this.dataService
          .goods_theme_getThemeInfo({ params: { topicId: this.themeId } }) //
          .then(({ data }) => resolve({ title: data.articleName }));
      } else {
        resolve();
      }
    });
  }

  search() {
    this.pageData.page = 1;
    this.submitedKeyword = this.formData.keyword;
    this.getPageData();
  }

  reloadFirstPage() {
    this.submitedKeyword = this.formData.keyword = '';
    this.pageData.page = 1;
    this.getPageData();
  }

  select(item) {
    if (this.resolve.onlyPickCallback) {
      const pickCbFn = () => {
        this.resolve.onlyPickCallback(item, this.dismiss.bind(this));
        this.dismiss();
      };
      if (this.resolve.shouldConfirmBeforePick) {
        this.seeModal.confirm('确认选择', `确认选择文章“${item.title}”售卖主题商品`, () => {
          pickCbFn();
        });
      }
      return;
    }

    // this.reportService.reportByKey(
    //   'PAGE_THEME_LIST.BTN_ADD_TO_ARTICLE',
    //   {ext1: article_id, ext3: topic_id}
    // )
    this.addThemeAllGoodsToArticle(item);
  }

  addThemeAllGoodsToArticle(articleItem) {
    const topic_id = this.resolve.themeId;
    const article_id = articleItem.article_id;
    this.seeModal.confirm('确认选择', `确认选择文章“${articleItem.title}”售卖主题商品`, () => {
      this.loading = true;
      const modalInstance = this.$uibModal.open({
        animation: true,
        template: `<div class="modal-body"> 商品正在添加到文章中，请稍候... </div>`,
        size: 'sm',
        backdrop: 'static',
      });
      asyncGetKolId().then(kol_id => {
        this.dataService
          .goods_theme_appendThemeToArticle({
            params: { topic_id, article_id, kol_id },
            noSpinner: true,
          })
          .then(({ data }) => {
            modalInstance.dismiss();
            // const { count, unvaliable_count, repeat_count } = data;
            // const addedCount = count - unvaliable_count - repeat_count;
            // GoodsThemeMsgController.alert(addedCount, repeat_count);
            this.loading = false;
            if (this.resolve.onAddThemeAllGoodsSucc) {
              this.resolve.onAddThemeAllGoodsSucc(articleItem);
            }
          })
          .catch(() => {
            this.loading = false;
            modalInstance.dismiss();
          });
      });
    });
  }

  formatDate(sec) {
    return sec ? moment(sec * 1000).format('YYYY/MM/DD') : '';
  }

  getPageData(page = 1) {
    console.log(page, this.pageData.page);
    asyncGetKolId().then(kol_id => {
      this.loading = true;
      const { pageSize } = this.pageData;
      const params = {
        page,
        kol_id,
        page_size: pageSize,
      };
      if (this.submitedKeyword) {
        Object.assign(params, {
          filter_info: JSON.stringify({ keyword: this.submitedKeyword }),
        });
      }
      this.dataService
        .goods_theme_getKolArticleList({ params, noSpinner: true }) //
        .then(({ data }) => {
          Object.assign(this.pageData, {
            page,
            list: data.list,
            count: data.count,
            totalPageNum: Math.ceil(data.count / pageSize),
          });
          this.nonResult = page == 1 && data.list.length === 0;
          this.noneSearchResult =
            this.submitedKeyword && data.list.length === 0;
          this.noArticleYet = !this.submitedKeyword && data.list.length === 0;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    });
  }
}

export const goodsThemeArticlePicker: ng.IComponentOptions = {
  template: require('./article-picker.template.html'),
  controller: ArticelPickerController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
