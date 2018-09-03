import * as angular from 'angular';
import { merge } from 'lodash';
import './dialog.less';

import BaseClass from '../../../../BaseClass';


export class Controller extends BaseClass{
  static $inject: string[] = [
    '$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  infoData: any;
  resolve: {
    info: any,
  };
  busy = false;
  close: Function;
  dismiss: Function;

  static open = (info) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'md',
      windowClass: 'xcxCodeAuthInfoConfigDialog',
      component: 'xcxCodeAuthInfoConfigDialog',
      resolve: {
        info: () => info,
      },
    });
  }

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: any,
  ) {
    super();
  }

  $onInit() {
    this.infoData = merge({}, this.resolve.info);
  }
  prettyInfo() {
    return JSON.stringify(this.infoData, null, 2);
  }

  ok() {
    this.busy = true;
    this.$q.all([this.saveServiceInfo(), this.saveLogoInfo()])
      .then(() => {
        this.Notification.success('保存配置成功');
        this.busy = false;
        this.close({ $value: { hasUpdated: true } });
      },    () => {
        this.Notification.warn('保存配置失败');
        this.busy = false;
      });
  }

  cancel() {
    this.dismiss();
  }

  saveServiceInfo() {
    const param = {
      service_config: JSON.stringify(this.infoData.service_config),
      id: this.infoData.id,
    };
    return this.dataService.weixin_updateServiceConfig(param);
  }

  saveLogoInfo() {
    const params = {
      json_config: JSON.stringify(this.infoData.json_config),
      id: this.infoData.id,
    };
    return this.dataService.weixin_updateJsonConfig(params);
  }
}

export const xcxCodeAuthInfoConfigDialog: ng.IComponentOptions = {
  template: require('./dialog.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};

