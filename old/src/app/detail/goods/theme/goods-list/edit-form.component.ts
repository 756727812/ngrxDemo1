import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';

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
    themeId: string;
    goodsItemId: string;
    formData: any;
  };
  bgImgSrc: number;
  topicItemIconDisplayOptions = [
    { text: '显示', val: false },
    { text: '隐藏', val: true },
  ];

  static open(themeId: string, goodsItemId: string, formData: any) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'goods-theme-form',
      component: 'goodsThemeGoodsListEditForm',
      resolve: {
        themeId: () => themeId,
        goodsItemId: () => goodsItemId,
        formData: () => formData,
      },
    });
  }

  constructor(
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {}

  $onInit() {
    this.loading = false;
    this.formData = {
      url: '',
    };
    merge(this.formData, this.resolve.formData);
  }

  hasError() {
    return !isEmpty(this.form.$error);
  }

  submit() {
    if (this.hasError() || this.loading) {
      return;
    }
    const params = {
      sellPoint: this.formData.sellPoint,
      topicItemIconDisplay: this.formData.topicItemIconDisplay,
      // url: this.formData.wordLink,
      topicId: this.resolve.themeId,
      targetId: this.resolve.goodsItemId,
    };
    this.asyncSave(params);
  }

  asyncSave(params) {
    this.loading = true;
    this.dataService
      .goods_theme_updateAdCopy({ params, noSpinner: true })
      .then(() => {
        this.loading = false;
        this.Notification.success('保存成功');
        this.close({
          $value: {
            success: true,
            updatedData: {
              ...this.formData,
              topicItemSellPoint: this.formData.sellPoint,
            },
          },
        });
      })
      .catch(() => {
        this.loading = false;
        this.Notification.success('保存失败');
      });
  }
}

export const goodsThemeGoodsListEditForm: ng.IComponentOptions = {
  template: require('./edit-form.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
