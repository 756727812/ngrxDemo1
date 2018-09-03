import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

import * as _ from 'lodash';;

export class Controller {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$window',
    '$httpParamSerializer',
  ];
  modalInstance: any;
  resolve: any;
  rechargeType: string;
  formData: any = {
    payBy: '1',
  };
  modalTitle: string;
  payByItems = [
      {val: '1', text: '', imgurl: '//static.seecsee.com/images/alipay.png'},
  ]
  rechargeAmountItems = [
      {val: '199', text: '￥199 / 30天'},
      {val: '549', text: '￥549 / 90天(推荐)'},
      {val: '1999', text: '￥1999 / 1年'},
  ]

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $window: ng.IWindowService,
    private $httpParamSerializer: ng.IHttpParamSerializer,
  ) {}
  $onInit() {
    console.log(this.resolve)
    this.rechargeType = this.resolve.data.type;
    this.modalTitle = this.resolve.data.title || '充值';
    if (this.rechargeType === 'seedata') {
      this.formData.rechargeAmount = '199';
    }
  }
  ok() {
    const params = Object.assign({}, this.formData);
    params.rechargeAmount = (params.rechargeAmount * 100).toFixed();
    params.type = this.rechargeType;
    if (this.rechargeType === 'seedata') {
      this.$window.open(
        '/assetNew/recharge?' + this.$httpParamSerializer(params),
        '_blank',
      );
    } else {
      this.$window.open(
        '/assetNew/recharge?' + this.$httpParamSerializer(params),
        '_blank',
      );
    }

    this.modalInstance.close();
  }
  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

export const modalRecharge: ng.IComponentOptions = {
  template: require('./modal-recharge.template.html'),
  controller: Controller,
  bindings: {
    modalInstance: '<',
    resolve: '<',
    close: '&',
  },
};
