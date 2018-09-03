import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

// TODO 该登录账号名下未开通小电铺

export class AvtarBlockController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  data: any;
  dataPromise: Promise<any>;

  constructor(private $q: ng.IQService,
              private $routeParams: ng.route.IRouteParamsService,
              private $location: ng.ILocationService,
              private dataService: IDataService,
              private Notification: INotificationService,
              private seeModal: ISeeModalService,
              private $uibModal: any) {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
  }

  $onInit() {
  }

  getData() {
  }

  openShopAccessInfo() {
    this.$uibModal.open({
      animation: true,
      size: 'shop-access-info',
      component: 'modalShopAccessInfo',
      resolve: {
        data: () => this.data,
      },
    });
  }
}

export const shopInfoAvatarBlock: ng.IComponentOptions = {
  template: require('./avatar-block.template.html'),
  controller: AvtarBlockController,
  bindings: {
    data: '<',
  },
};

