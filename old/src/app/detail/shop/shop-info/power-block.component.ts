import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

export class PowerBlockController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  data: any;

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

  gogoUrl(url) {
    console.log(url);
    window.location.href = url;
  }
  goToContentBiz() {
    // TODO 通过 evtbus
    const contentBizHrefEL = $('#sidebar').find('.nav-item-content-business').find('a').first();
    if (contentBizHrefEL.length) {
      window.location.href = contentBizHrefEL.attr('href');
    }
  }
}

export const shopInfoPowerBlock: ng.IComponentOptions = {
  template: require('./power-block.template.html'),
  controller: PowerBlockController,
  bindings: {
    data: '<',
  },
};

