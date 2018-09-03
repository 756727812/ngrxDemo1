/**
 * 入库信息列表页
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export class warehousingInfoListController {
  private page: string = this.$routeParams['page'] || '1';
  id: string = this.$routeParams['id'];
  warehousing_log_list: Array<any> = [];
  total_items: number;

  static $inject: string[] = ['$q', '$routeParams', 'dataService', 'Notification', 'seeModal'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
  ) {
    const promises = [this.getWarehousingLogList()];
    $q.all(promises);
  }

  repeal(id) {
    this.seeModal.confirm('撤销入库信息', '确认撤销该条入库信息', () => {
      return this.dataService.storage_storeCancel({
        storage_store_id: id,
      }).then(res => {
        this.Notification.success('撤销该条入库信息成功！');
        return this.getWarehousingLogList();
      });
    });
  }

  private getWarehousingLogList() {
    return this.dataService.storage_storeLog({
      page: this.page,
      page_size: 20,
      storage_spu_id: this.id,
    }).then(res => {
      this.total_items = res.data.count;
      this.warehousing_log_list = res.data.list;
      return this.warehousing_log_list;
    });
  }
}

export const warehousingInfoList: ng.IComponentOptions = {
  template: require('./warehousing-info-list.template.html'),
  controller: warehousingInfoListController,
};
