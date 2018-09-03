import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';;

import './sell-way.less';

export class SellWayController {
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

  resolve: {
    themeId: string;
    goodsItem: {
      id;
    };
    resolve: Function;
  };
  close: Function;
  dismiss: Function;

  static open() {
    return new Promise(resolve => {
      const $uibModal: any = angular
        .element(document.body)
        .injector()
        .get('$uibModal');
      return $uibModal.open({
        animation: true,
        backdrop: 'static',
        size: 'goods-theme-sell-way',
        component: 'goodsThemeGoodsListSellWay',
        resolve: {
          resolve: () => resolve,
        },
      });
    });
  }
  isQuhaodian:boolean = localStorage.getItem('is_quhaodian') === '1';;

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

  select(name) {
    this.resolve.resolve(name);
    this.dismiss();
  }
}

export const goodsThemeGoodsListSellWay: ng.IComponentOptions = {
  template: require('./sell-way.template.html'),
  controller: SellWayController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
