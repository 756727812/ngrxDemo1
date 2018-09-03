import './href-picker.less';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;
import { IPromise } from 'angular';

export class Controller {
  static open(kolId) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      size: 'shop-operate-href-picker',
      backdrop: 'static',
      component: 'modalShopOperateHrefPicker',
      resolve: {
        kolId: () => kolId,
      },
    });
  }

  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  dismiss: Function;
  close: Function;

  pageData: {
    totalPageNum: number;
    pageSize: number;
    list: any[];
    page: number;
    count: number;
  } = {
    totalPageNum: 0,
    pageSize: 10,
    list: [],
    count: 0,
    page: 1,
  };

  formData: any = {
    keyword: '',
  };

  resolve: {
    kolId: string;
  };

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {}

  get kolId() {
    return this.resolve.kolId;
  }

  $onInit() {
    this.getPageData();
  }

  select(item: any) {
    this.close({ $value: item });
  }

  isPageDataEmpty() {
    return this.pageData.list.length === 0;
  }

  getPageData: (page?: number) => ng.IPromise<any> = (page = 1) => {
    return this.dataService
      .shop_getArticleList({
        page,
        kol_id: this.kolId,
        keyword: _.trim(this.formData.keyword),
        page_size: this.pageData.pageSize,
      }) //
      .then(({ data }) => {
        this.pageData.list = data.list;
        this.pageData.count = parseInt(data.count, 10);
        this.pageData.page = page;
        this.pageData.totalPageNum = Math.ceil(
          data.count / this.pageData.pageSize,
        );
      });
  }

  ok: () => any = () => this.close();
  cancel: () => any = () => this.dismiss({ $value: 'cancel' });
}

export const modalShopOperateHrefPicker: ng.IComponentOptions = {
  template: require('./href-picker.template.html'),
  controller: Controller,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
