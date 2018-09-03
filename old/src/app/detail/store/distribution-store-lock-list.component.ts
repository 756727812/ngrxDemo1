/**
 * 分销库存锁定
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export class distributionStoreLockListController {
  private page = this.$routeParams['page'] || '1';

  id: string = this.$routeParams['id'];
  distribution_log_list: Array<any>;
  total_items: number;


  static $inject: string[] = ['$q', '$routeParams', 'dataService', 'Notification', 'seeModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
  ) {
    const promises = [this.getDistributionLogList()];
    $q.all(promises);
  }

  allotCancel(id) {
    this.seeModal.confirm('立刻释放锁定库存', '确定释放该条记录？', () => {
      return this.dataService.storage_allotCancel({
        storage_allot_id: id,
      }).then(res => {
        this.Notification.success('释放锁定库存成功！');
        return this.getDistributionLogList();
      });
    });
  }

  private getDistributionLogList() {
    return this.dataService.storage_allotLog({
      page: this.page,
      page_size: 20,
      storage_spu_id: this.id,
    }).then(res => {
      this.total_items = res.data.count;
      this.distribution_log_list = res.data.list;
      return this.distribution_log_list;
    });
  }
}

export const distributionStoreLockList: ng.IComponentOptions = {
  template: require('./distribution-store-lock-list.template.html'),
  controller: distributionStoreLockListController,
};

