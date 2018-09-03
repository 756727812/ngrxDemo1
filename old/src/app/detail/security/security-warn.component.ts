import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class securityWarnController {
  private page: string;

  hash: string;
  list_warn: Array<any>;
  total_items: number;

  filter_platform: Array<any>;

  timestamp: number;
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

  }

  $onInit() {
    let promises = [];
    promises = [this.getWarnList()];
    return this.$q.all(promises);
  }

  resetIsIngore(warning_id) {
    this.seeModal.confirm('确认提示', '确认将该条记录强制失效？强制失效后，该账号的屏蔽状态将被解除', () => {
      return this.dataService.security_resetIsIngore({
        warning_id,
      }).then(res => {
        return this.getWarnList();
      });
    },                    () => {
      return this.getWarnList();
    });
  }

  changeFilter() {
    this.timestamp = this.timestamp + 1;
    this.page = '1';
    const _params = {
      platform: this.platform,
      timestamp: this.timestamp,
      page: this.page,
    };
    console.log(_params);
    this.$location.search(_params);
  }

  private getWarnList: (page_size?: number) => ng.IPromise<any> = (page_size = 20) =>
    this.dataService.security_warnList({
      page: this.page,
      page_size,
      filter_info: JSON.stringify({
        platform: this.platform,
        timestamp: this.timestamp,
      }),
    }).then(res => {
      this.list_warn = res.data.list;
      this.total_items = res.data.count;

      this.filter_platform = res.data.filter_list.platform;
      return this.list_warn;
    })

}



export const securityWarn: ng.IComponentOptions = {
  template: require('./security-warn.template.html'),
  controller: securityWarnController,
};

