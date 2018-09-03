import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';

import './msg.less';

import { confirmImgHost } from '../../../../utils';

export default class Controller {


  static $inject: string[] = ['$timeout', 'assertService', '$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$element'];

  static alert = (newCount, duplicateCount, unMatchCount?) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    return $uibModal.open({
      animation: true,
      // backdrop: 'static',
      size: 'sm',
      component: 'goodsThemeMsg',
      resolve: {
        newCount: () => newCount,
        duplicateCount: () => duplicateCount,
        unMatchCount: () => unMatchCount,
      },
    });
  }

  close: Function;
  resolve: any;
  disappearTimer: ng.IPromise<any>;

  constructor(
    private $timeout: ng.ITimeoutService,
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

  $onInit() {
    this.disappearTimer = this.$timeout(() => this.close(), 3000);
  }

  $onDestroy() {
    this.$timeout.cancel(this.disappearTimer);
  }

  hasUnMatch() {
    return this.resolve.unMatchCount !== void 0;
  }
}

export const goodsThemeMsg: ng.IComponentOptions = {
  template: require('./msg.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};


