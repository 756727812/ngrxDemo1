import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';;

import './sell-point-pop.less';

export class SellPointPopController {
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
  resolve: {
    data: any;
  };

  static open(data) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'goods-theme-sell-point-pop',
      component: 'goodsThemeGoodsListSellPointPop',
      resolve: {
        data: () => data,
      },
    });
  }

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
  $onInit() {}

  get data() {
    return this.resolve.data;
  }
}

export const goodsThemeGoodsListSellPointPop: ng.IComponentOptions = {
  template: require('./sell-point-pop.template.html'),
  controller: SellPointPopController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
