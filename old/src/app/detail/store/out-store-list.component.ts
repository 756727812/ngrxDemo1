/**
 * 出库情况列表页
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

export class outStoreListController {
  private page: string = this.$routeParams['page'] || '1';

  id: string = this.$routeParams['id'];
  log_type: string = this.$location.hash() || '0';
  out_store_list: any;
  total_items: number;


  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) {
    const promises = [this.getLogList()];
    $q.all(promises);
  }

  cancel(id) {
    return this.dataService.storage_logCancel({
      storage_log_id: id,
    }).then(res => {
      this.Notification.success('撤销出库记录成功！');
      return this.getLogList();
    });
  }

  private getLogList() {
    return this.dataService.storage_logList({
      storage_spu_id: this.id,
      page: this.page,
      page_size: 20,
      log_type: this.log_type,
    }).then(res => {
      this.total_items = res.data.count;
      this.out_store_list = res.data.list;
      return this.out_store_list;
    });
  }
}

export const outStoreList: ng.IComponentOptions = {
  template: require('./out-store-list.template.html'),
  controller: outStoreListController,
};
