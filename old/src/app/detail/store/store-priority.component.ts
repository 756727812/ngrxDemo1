/**
 * 仓库出库优先级
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as _ from 'lodash';;

export class storePriorityController {
  private id: string = this.$routeParams['id'];

  config_store: Array<any>;
  store_priority_array: Array<any>;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) {
    const promises = [this.getConfigureStore()];
    $q.all(promises);
  }

  save() {
    return this.dataService.storage_sellerSetPRI({
      backend_id: this.id,
      list_store_pri: _.values(this.store_priority_array).join(','),
    }).then(res => {
      this.Notification.success('设置仓库出库优先级成功！');
      this.$location.path('/store/distribution-list');
    });
  }

  private getConfigureStore() {
    return this.dataService.storage_configGet().then(res => {
      this.config_store = res.data.config_store.filter(o => o.store_id);
      return this.config_store;
    });
  }
}

export const storePriority: ng.IComponentOptions = {
  template: require('./store-priority.template.html'),
  controller: storePriorityController,
};
