import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';
import { modalEditWechatIdController } from '../modal-edit-wechatid.controller';
import Injector from '../../../utils/injector';
import { checkFn, CODES } from '../../../utils/permission-helper';

import './article-form.less';

const _openForValues = (article_id: string, init_form_data?: any) => {
  return Injector.getUibModal().open({
    animation: true,
    backdrop: 'static',
    windowClass: 'kol-article-form',
    // size: 'kol-article-form',
    component: 'kolArticleForm',
    size: 'md',
    resolve: {
      article_id: () => article_id,
      init_form_data: () => init_form_data,
    },
  });
};

const _openWithWechatGuarantee = (article_id?: string) =>
  new Promise((resolve, reject) => {
    modalEditWechatIdController
      .guaranteeWechatAccount() //
      .then(wechatAccountInfo =>
        _openForValues(article_id)
          .result //
          .then(params => {
            resolve(params);
          })
          .catch(() => {}),
      );
  });

export class ArticelFormController {
  static $inject: string[] = [
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

  resolve: { article_id: string | number; init_form_data: any };
  close: Function;
  dismiss: Function;
  form_data: any = {};
  articleFloorInputMask: string;
  articleFloorPlaceholder: string;
  validateOptions: any;

  static openWithInitData = (init_data: any) => _openForValues(null, init_data);

  static open4EditWithWechatGuarantee = (article_id: string) =>
    _openWithWechatGuarantee(article_id).then(params => {
      Injector.getDataService()
        .kol_mgr_articleSet({ article_info: JSON.stringify(params) })
        .then(res => {
          Injector.getNotifcation().success('文章编辑成功');
        });
      // tslint:disable-next-line:semicolon
    });

  static open4CreateWithWechatGuarantee = (kol_id: string) =>
    _openWithWechatGuarantee().then(params => {
      Injector.getDataService()
        .kol_mgr_articleAdd({
          article_info: JSON.stringify(merge({}, params, { kol_id })),
        })
        .then(res => {
          Injector.getNotifcation().success('文章创建成功');
        });
      // tslint:disable-next-line:semicolon
    });

  constructor(
    private assertService: see.IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: see.ISeeModalService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {}
  $onInit() {
    if (this.resolve.article_id) {
      this.getArticleById();
    }
    if (this.resolve.init_form_data) {
      merge(this.form_data, this.resolve.init_form_data);
    }
    if (checkFn([CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin])()) {
      this.articleFloorInputMask = 'INTEGER_ONLY';
      this.articleFloorPlaceholder = '活动填0，头条文章填1，次条填2，以此类推';
    } else {
      this.articleFloorInputMask = 'POSITIVE_INTEGER';
      this.articleFloorPlaceholder = '头条文章填1，次条填2，以此类推';
    }

    const w5cValidator: any = angular
      .element(document.body)
      .injector()
      .get('w5cValidator');

    // TODO w5c-form-validate 没提供组件级别的错误信息配置~~~自己 HACK
    this.validateOptions =
      w5cValidator && w5cValidator.defaultShowError
        ? {
            showError(elem, argErrorMessage) {
              let errorMessage = argErrorMessage;
              try {
                const ERROR = {
                  url: ['格式不正确，请复制包含 weixin.qq.com 的完整链接'],
                };
                if ($(elem).attr('w5c-customizer')) {
                  errorMessage = ERROR[$(elem).attr('name')] || errorMessage;
                }
              } catch (e) {}
              return w5cValidator.defaultShowError(elem, errorMessage);
            },
          }
        : null;
  }

  get article_id() {
    return this.resolve.article_id;
  }

  get modalTitle() {
    return !this.article_id || ~~this.article_id === 0
      ? '添加文章'
      : '编辑文章';
  }

  get isNewBrand(): boolean {
    return checkFn([CODES.New_Brand])();
  }

  ok() {
    this.form_data.article_type = 1;
    this.form_data.from_type = 1;
    const start_time = this.form_data.start_time / 1000;
    this.close({
      $value: merge({}, this.form_data, { start_time }),
    });
  }

  cancel() {
    this.dismiss();
  }

  validateWechatArticleUrl() {
    if (!this.form_data.url) {
      return true;
    }
    return /^\s*https?:\/\/mp.weixin.qq.com\/s\/.{22}\s*$/.test(
      this.form_data.url,
    );
  }

  private getArticleById() {
    this.dataService
      .kol_mgr_articleGet({
        article_id: this.resolve.article_id,
      })
      .then(res => {
        const {
          kol_id,
          article_id,
          floor_level,
          title,
          start_time,
          url,
          from_type,
          from_collection_id,
          act_order,
          act_gmv,
          is_new,
          from_article_id,
        } = res.data.article_info;
        this.form_data = {
          kol_id,
          article_id,
          floor_level,
          title,
          url,
          from_type,
          from_collection_id,
          act_order,
          act_gmv,
          is_new,
          from_article_id,
          start_time: new Date(start_time * 1000),
        };
      });
  }
}

export const kolArticleForm: ng.IComponentOptions = {
  template: require('./article-form.template.html'),
  controller: ArticelFormController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
