import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class securityCtrlController {
  private page: string;

  hash: string;
  list_ctrl: Array<any>;
  filter_rank: Array<any>;
  filter_type: Array<any>;
  filter_platform: Array<any>;
  total_items: number;

  timestamp: number;
  type: number;
  rank: number;
  keyword: string;
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
    this.timestamp = Number($routeParams['timestamp']) || 1;
    this.hash = this.$location.hash() || '1';
    this.page = this.$routeParams['page'] || '1';

    this.platform = Number($routeParams['platform']) || 0;
    this.keyword = this.$routeParams['keyword'] || '';

  }

  $onInit() {
    let promises = [];
    promises = [this.getCtrlList()];
    return this.$q.all(promises);
  }

  changeFilter() {
    this.timestamp = this.timestamp + 1;
    this.page = '1';
    const _params = {
      platform: this.platform,
      keyword: this.keyword,
      timestamp: this.timestamp,
      page: this.page,
    };
    console.log(_params);
    this.$location.search(_params);
  }

  updateCtrlName(name: string, ctrl_id: string) {
    const ctrl_info = {
      ctrl_id,
      ctrl_name: name,
    };
    const _params = {
      ctrl_info: JSON.stringify(ctrl_info),
    };
    return this.dataService.security_ctrlSet(_params).then(res => {
      console.log(res);
      this.Notification.success();
      this.getCtrlList();
    });
  }

  private getCtrlList: (page_size?: number) => ng.IPromise<any> = (page_size = 20) =>
    this.dataService.security_ctrlList({
      page: this.page,
      page_size,
      filter_info: JSON.stringify({
        keyword: this.keyword,
        platform: this.platform,
      }),
    }).then(res => {
      this.list_ctrl = res.data.list;
      this.filter_platform = res.data.filter_list.platform;
      this.total_items = res.data.count;
      return this.list_ctrl;
    })

}



export const securityCtrl: ng.IComponentOptions = {
  template: require('./security-ctrl.template.html'),
  controller: securityCtrlController,
};

