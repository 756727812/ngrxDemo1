
import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;


export class IndicatorBlockController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  data: any;
  dataPromise: Promise<any>;
  hasNonContent: boolean;

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
}

export const shopInfoIndicatorBlock: ng.IComponentOptions = {
  template: require('./indicator-block.template.html'),
  controller: IndicatorBlockController,
  bindings: {},
};

