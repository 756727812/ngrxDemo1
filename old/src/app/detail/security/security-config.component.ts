import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class securityConfigController {
  private page: string;

  hash: string;
  list_config: Array<any>;
  total_items: number;

  filter_api: Array<any>;
  filter_ctrl: Array<any>;
  filter_platform: Array<any>;
  filter_ingore: Array<any>;

  timestamp: number;
  api_id: number;
  ctrl_id: number;
  platform: number;
  is_ingore: number;

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
    this.is_ingore = Number($routeParams['is_ingore']) || 0;

  }

  $onInit() {
    let promises = [];
    promises = [this.getConfigList()];
    return this.$q.all(promises);
  }

  changeFilter() {
    this.timestamp = this.timestamp + 1;
    this.page = '1';
    const _params = {
      platform: this.platform,
      api_id: this.api_id,
      ctrl_id: this.ctrl_id,
      is_ingore: this.is_ingore,
      timestamp: this.timestamp,
      page: this.page,
    };
    console.log(_params);
    this.$location.search(_params);
  }

  private getConfigList: (page_size?: number) => ng.IPromise<any> = (page_size = 20) =>
    this.dataService.security_configList({
      page: this.page,
      page_size,
      filter_info: JSON.stringify({
        platform: this.platform,
        api_id: this.api_id,
        ctrl_id: this.ctrl_id,
        is_ingore: this.is_ingore,
        timestamp: this.timestamp,

      }),
    }).then(res => {
      this.list_config = res.data.list;
      this.total_items = res.data.count;

      this.filter_platform = res.data.filter_list.platform;
      this.filter_ctrl = res.data.filter_list.ctrl;
      this.filter_api = res.data.filter_list.api;
      this.filter_ingore = res.data.filter_list.ingore;
      return this.list_config;
    })

}



export const securityConfig: ng.IComponentOptions = {
  template: require('./security-config.template.html'),
  controller: securityConfigController,
};

