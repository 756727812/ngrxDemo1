import './index.less';
import { pick } from 'lodash';

export class Controller {
  hash: any;
  static $inject: string[] = [
    '$location',
    'dataService',
    'Notification',
    'seeModal',
  ];

  constructor(
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
  ) {}
  $onInit() {
    this.hash = this.$location.hash() || 1;
  }
}

export const xcxCode: ng.IComponentOptions = {
  template: require('./index.template.html'),
  controller: Controller,
};
