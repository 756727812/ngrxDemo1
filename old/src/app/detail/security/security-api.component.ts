import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class securityApiController {
  private page: string;

  hash: string;
  list_api: Array<any>;
  filter_rank: Array<any>;
  filter_type: Array<any>;
  filter_platform: Array<any>;
  filter_ctrl: Array<any>;
  filter_api_type: Array<any>;
  filter_api_type_select: Array<any>;
  total_items: number;

  timestamp: number;
  type: number;
  api_type: number;
  rank: number;
  ctrl_id: number;
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
    this.type = Number($routeParams['type']) || 1;
    this.api_type = Number($routeParams['api_type']) || 0;
    this.ctrl_id = Number($routeParams['ctrl_id']) || 0;
    this.rank = Number($routeParams['rank']) || 1;
    this.keyword = this.$routeParams['keyword'] || '';

  }

  $onInit() {
    let promises = [];
    promises = [this.getApiList()];
    return this.$q.all(promises);
  }

  changeFilter() {
    this.timestamp = this.timestamp + 1;
    this.page = '1';
    const _params = {
      platform: this.platform,
      type: this.type,
      rank: this.rank,
      api_type: this.api_type,
      ctrl_id: this.ctrl_id,
      keyword: this.keyword,
      timestamp: this.timestamp,
      page: this.page,
    };
    console.log(_params);
    this.$location.search(_params);
  }

  managerConfig: (api_info: any) => ng.IPromise<any> = (api_info) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-config.html'),
      controller: 'modalConfigController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        api_info: () => api_info,
        routeParams: () => this.$routeParams,
      },
    });
    return modalInstance.result.then(params => {
      this.getApiList();
    });
  }


  updateApiName(name: string, api_id: string) {
    const api_info = {
      api_id,
      name,
    };
    const _params = {
      api_info: JSON.stringify(api_info),
    };
    //console.log(api_info);
    return this.dataService.security_apiSet(_params).then(res => {
      console.log(res);
      this.Notification.success();
      this.getApiList();
    });
  }

  updateApiType(api_type: number, api_id: string) {
    const api_info = {
      api_id,
      api_type,
    };
    const _params = {
      api_info: JSON.stringify(api_info),
    };
    return this.dataService.security_apiSet(_params).then(res => {
      console.log(res);
      this.Notification.success();
      this.getApiList();
    });
  }


  private getApiList: (page_size?: number) => ng.IPromise<any> = (page_size = 20) =>
    this.dataService.security_apiList({
      page: this.page,
      page_size,
      filter_info: JSON.stringify({
        type: this.type,
        rank: this.rank,
        api_type: this.api_type,
        ctrl_id: this.ctrl_id,
        keyword: this.keyword,
        platform: this.platform,
      }),
    }).then(res => {
      this.filter_platform = res.data.filter_list.platform;
      this.filter_rank = res.data.filter_list.rank;
      this.filter_type = res.data.filter_list.type;
      this.filter_ctrl = res.data.filter_list.ctrl;
      this.filter_api_type = res.data.filter_list.api_type;
      this.filter_api_type_select = this.filter_api_type;
      //delete (this.filter_api_type_select[0])
      this.total_items = res.data.count;
      this.list_api = res.data.list;
      return this.list_api;
    })

}



export const securityApi: ng.IComponentOptions = {
  template: require('./security-api.template.html'),
  controller: securityApiController,
};

