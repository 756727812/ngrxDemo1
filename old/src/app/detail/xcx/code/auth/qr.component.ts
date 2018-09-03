import * as angular from 'angular';
import { pick, result } from 'lodash';

import './qr.less';

export class Controller {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  list: string[];
  data: any;
  busy: boolean;
  hasUpdated: boolean = false;
  close: Function;
  resolve: {
    authorizer_appid: string;
    data: any;
  };

  static open = data => {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'md',
      component: 'xcxCodeAuthQr',
      resolve: {
        data: () => data,
      },
    });
  }; // tslint:disable-line:semicolon

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: any,
  ) {}

  get view_qrcode_url() {
    return this.resolve.data.view_qrcode_url;
  }

  get online_qrcode_url() {
    return this.resolve.data.online_qrcode_url;
  }

  getQrCodeHostName() {
    return process.env.NODE_ENV === 'development'
      ? 'https://see-test.seecsee.com'
      : 'https://m.seeapp.com';
  }
}

export const xcxCodeAuthQr: ng.IComponentOptions = {
  template: require('./qr.template.html'),
  controller: Controller,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<',
  },
};
