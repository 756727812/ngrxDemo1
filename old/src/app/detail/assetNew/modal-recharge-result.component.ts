import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

import * as _ from 'lodash';;

export class Controller {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    '$uibModal',
    '$window',
    '$httpParamSerializer',
  ];
  modalInstance: any;
  formData: any = {
    payBy: '1',
  };
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $uibModal: any,
    private $window: ng.IWindowService,
    private $httpParamSerializer: ng.IHttpParamSerializer,
  ) {}
  $onInit() {}

  applyResult(status) {
    this.modalInstance.close();
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

export const modalRechargeResult: ng.IComponentOptions = {
  template: require('./modal-recharge-result.template.html'),
  controller: Controller,
  bindings: {
    modalInstance: '<',
    resolve: '<',
    close: '&',
  },
};
