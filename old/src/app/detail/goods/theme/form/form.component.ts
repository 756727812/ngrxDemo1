import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

import './form.less';

import { GOODS_THEME_BG } from '../../../../const';

const BG_SRC_VAL = {
  DEFAULT: 0,
  CUSTOM: 1,
};

export default class Controller {
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

  close: Function;
  form: ng.IFormController;
  formData: any;
  BG_CARDS: any[];
  bgImgSrcOptions: any[];
  loading: boolean;
  resolve: {
    data?: any; // 编辑的时候传数据
  };
  bgImgSrc: number;

  static open(data?: any) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'goods-theme-form',
      component: 'goodsThemeForm',
      resolve: {
        data: () => data,
      },
    });
  }

  GOODS_THEME_BG = GOODS_THEME_BG;

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

  isForEdit() {
    return !!this.resolve.data;
  }

  hasArticleRequiredError() {
    return (
      this.form.$error &&
      _.some(this.form.$error.required, (item: any) => {
        return item.$name === 'articleUrl' || item.$name === 'articleName';
      })
    );
  }

  $onInit() {
    this.loading = false;
    this.bgImgSrcOptions = [
      { val: BG_SRC_VAL.DEFAULT, text: '默认' },
      { val: BG_SRC_VAL.CUSTOM, text: '自定义' },
    ];
    this.formData = {
      defaultImgId: '',
      imgurl: '',
    };
    this.bgImgSrc = 0;
    if (this.isForEdit()) {
      this.initDataForEdit();
    }
  }

  initDataForEdit() {
    const { data } = this.resolve;
    if (data) {
      _.merge(this.formData, data);
      if (~~data.defaultImgId > 0) {
        this.bgImgSrc = BG_SRC_VAL.DEFAULT;
      } else {
        this.bgImgSrc = BG_SRC_VAL.CUSTOM;
      }
    }
  }

  selDefaultBg(bgItem) {
    this.formData.defaultImgId = bgItem.id;
  }

  isSelBgItem(bgItem) {
    return this.formData.defaultImgId === bgItem.id;
  }

  hasError() {
    return !_.isEmpty(this.form.$error);
  }

  getSubmitParams() {
    const bgImgSrc = this.bgImgSrc;
    const data = _.merge({}, this.formData);
    if (bgImgSrc !== BG_SRC_VAL.CUSTOM) {
      delete data.imgurl;
    } else if (bgImgSrc !== BG_SRC_VAL.DEFAULT) {
      delete data.defaultImgId;
    }
    return data;
  }

  submit() {
    if (this.hasError() || this.loading) {
      return;
    }
    this.asyncSave(this.getSubmitParams());
  }

  asyncSave(params) {
    this.loading = true;
    const updateMethod = params =>
      this.isForEdit()
        ? this.asyncUpdateTheme(params)
        : this.asyncAddTheme(params);

    updateMethod(params)
      .then(() => {
        this.loading = false;
        this.Notification.success('保存成功');
        this.close({ $value: { success: true } });
      })
      .catch(() => {
        this.loading = false;
        this.Notification.success('保存失败');
      });
  }

  asyncAddTheme(params) {
    return this.dataService.goods_theme_addGoodsTheme({
      params,
      noSpinner: true,
    });
  }

  asyncUpdateTheme(params) {
    return this.dataService.goods_theme_updateGoodsTheme({
      params,
      noSpinner: true,
    });
  }
}

export const goodsThemeForm: ng.IComponentOptions = {
  template: require('./form.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
