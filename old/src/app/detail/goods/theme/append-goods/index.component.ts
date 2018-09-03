import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';

import './index.less';

import { GOODS_THEME_BG } from '../../../../const';


const BG_SRC_VAL = {
  DEFAULT: 0,
  CUSTOM: 1,
};

export default class Controller {

  static $inject: string[] = ['assertService', '$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$element'];

  close: Function;
  form: ng.IFormController;
  loading: boolean;

  static open = (themeId: string) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    return $uibModal.open({
      animation: true,
      // backdrop: 'static',
      size: 'goods-theme-append-goods',
      component: 'goodsThemeAppendGoods',
      resolve: {
        themeId: () => themeId,
      },
    });
  }
  hasUpdatedForArticle = false;
  hasUpdatedForHot = false;

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
  ) {
  }

  closeModal() {
    this.close(({ $value: { hasUpdated: this.hasUpdatedForArticle || this.hasUpdatedForHot } }));
  }

  $onInit() {
  }
}

export const goodsThemeAppendGoods: ng.IComponentOptions = {
  template: require('./index.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};


