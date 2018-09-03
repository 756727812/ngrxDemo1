import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';
import './data-crawling.less';
export class dataCrawlingController {
  private;
  dataCrawlingUrls: string = '';
  MAX_LENGTH: number = 10000;
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
  ];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
  ) {}

  handleValueChange(e) {
    const value = e.target.value;
    if (value.length >= this.MAX_LENGTH) {
      this.dataCrawlingUrls = value.substr(0, this.MAX_LENGTH);
    }
  }

  submit() {
    this.dataService
      .addDataUrls({ urls: this.dataCrawlingUrls })
      .then((res: any) => {
        const num = res.data[0].insert_num;
        this.dataCrawlingUrls = '';
        this.Notification.success(`成功爬取${num}条`);
      });
  }
}
export const dataCrawling: ng.IComponentOptions = {
  template: require('./data-crawling.template.html'),
  controller: dataCrawlingController,
};
