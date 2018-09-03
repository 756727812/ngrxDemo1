/**
 * 库存锁定记录
 */
import { IDataService } from '../../services/data-service/data-service.interface';

export class storeLockRecordsController {
  private page = this.$routeParams['page'] || '1';

  id: string = this.$routeParams['id'];
  store_lock_records: Array<any>;
  total_items: number;

  static $inject: string[] = ['$q', '$routeParams', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
  ) {
    const promises = [this.getStoreLockRecords()];
    $q.all(promises);
  }

  private getStoreLockRecords() {
    return this.dataService.storage_allotLog({
      page: this.page,
      page_size: 20,
      backend_id: this.id,
    }).then(res => {
      this.total_items = res.data.count;
      this.store_lock_records = res.data.list;
      return this.store_lock_records;
    });
  }
}

export const storeLockRecords: ng.IComponentOptions = {
  template: require('./store-lock-records.template.html'),
  controller: storeLockRecordsController,
};
