import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class securityLogController {
  private page: string;

  hash: string;
  list_log: Array<any>;
  total_items: number;

  filter_time: Array<any>;
  filter_pri: Array<any>;
  filter_platform: Array<any>;
  filter_ctrl: Array<any>;
  filter_api: Array<any>;
  num_backend: number;
  num_api: number;
  filter_backend: Array<any>;

  timestamp: number;
  pri: number;
  backend_id: number;
  time: number;
  ctrl_id: number;
  api_id: number;
  platform: number;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal', '$echarts'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private $echarts: any,
  ) {
    this.hash = this.$location.hash() || '1';
    this.page = this.$routeParams['page'] || '1';

    this.platform = Number($routeParams['platform']) || 0;
    this.ctrl_id = Number($routeParams['ctrl_id']) || 0;
    this.api_id = Number($routeParams['api_id']) || 0;
    this.time = Number($routeParams['time']) || 0;
    this.pri = Number($routeParams['pri']) || 0;
    this.backend_id = Number($routeParams['backend_id']) || 0;

    this.num_backend = this.num_api = 0;
  }

  $onInit() {
    let promises = [];
    promises = [this.getLogList()];
    return this.$q.all(promises);
  }

  changeFilter() {
    this.timestamp = this.timestamp + 1;
    this.page = '1';
    const _params = {
      platform: this.platform,
      time: this.time,
      pri: this.pri,
      ctrl_id: this.ctrl_id,
      api_id: this.api_id,
      backend_id: this.backend_id,
      timestamp: this.timestamp,
      page: this.page,
    };
    console.log(_params);
    this.$location.search(_params);
  }

  private getLogList: (page_size?: number) => ng.IPromise<any> = (page_size = 20) =>
    this.dataService.security_logList({
      page: this.page,
      page_size,
      filter_info: JSON.stringify({
        platform: this.platform,
        time: this.time,
        pri: this.pri,
        backend_id: this.backend_id,
        ctrl_id: this.ctrl_id,
        api_id: this.api_id,
        timestamp: this.timestamp,

      }),
    }).then(res => {
      this.list_log = res.data.list;
      this.total_items = res.data.count;

      this.filter_platform = res.data.filter_list.platform;
      this.filter_time = res.data.filter_list.time;
      this.filter_backend = res.data.filter_list.backend;
      this.num_backend = res.data.filter_list.num_backend;
      this.filter_pri = res.data.filter_list.pri;
      this.filter_ctrl = res.data.filter_list.ctrl;
      this.filter_api = res.data.filter_list.api;
      this.num_api = res.data.filter_list.num_api;
      return this.list_log;
    })

}



export const securityLog: ng.IComponentOptions = {
  template: require('./security-log.template.html'),
  controller: securityLogController,
};

