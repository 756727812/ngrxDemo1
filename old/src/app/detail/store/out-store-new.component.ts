/**
 * 创建实际出库记录
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as moment from 'moment';

export class outStoreNewController {
  private id: string = this.$routeParams['id'];
  private current_backend_id: string;

  goods: any;
  dateTimePicker: string;
  to_backend_id: string;
  seller_list: Array<any>;
  config_store: Array<any>;
  errors: string[] = [];
  page: string;
  store_lock_records: Array<any>;
  pagination: {
    page: number,
    page_size: number,
    count: number,
  };

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) {
    const promises = [this.getGoodsInfo(), this.getConfigureStore(), this.getSellerList()];
    $q.all(promises);
  }

  onSetTime(newDate, oldDate) {
    if (newDate.getTime() >= (new Date())) {
      this.dateTimePicker = oldDate;
      this.Notification.warn('出库时间必须早于或等于当前时间！');
    }
  }

  saveSingle(index) {
    this.errors.length = 0;
    !this.dateTimePicker && this.errors.push('请填写出库时间！');
    !this.to_backend_id && this.errors.push('请选择分销渠道！');
    !this.store_lock_records[index].buy_num && this.errors.push('请填写出货数量！');
    if (this.errors.length) return -1;
    this.dataService.storage_logAdd({
      log_time: moment(this.dateTimePicker).format('YYYY-MM-DD HH:mm:ss'),
      log_detail: JSON.stringify([{
        storage_allot_id: this.store_lock_records[index].storage_allot_id,
        buy_num: this.store_lock_records[index].buy_num,
      }]),
    }).then(res => {
      this.Notification.success('创建实际出库记录成功！');
      this.$location.path(`/store/goods-list/${this.id}/out-store-list`).hash('1');
    });
  }

  getStoreLockRecords(backend_id, page = 1) {
    return this.dataService.storage_allotLog({
      page,
      page_size: 20,
      backend_id,
      storage_spu_id: this.id,
    }).then(res => {
      this.store_lock_records = res.data.list;
      this.pagination = {
        page,
        page_size: 20,
        count: res.data.count,
      };
      this.current_backend_id = backend_id;
      return this.store_lock_records;
    });
  }

  changePage() {
    return this.getStoreLockRecords(this.current_backend_id, this.pagination.page);
  }

  private getSellerList() {
    return this.dataService.storage_sellerList({
      all: 0,
    }).then(res => {
      this.seller_list = res.data.list_seller;
      return this.seller_list;
    });
  }

  private getConfigureStore() {
    return this.dataService.storage_configGet().then(res => {
      this.config_store = res.data.config_store.filter(o => o.store_id);
      return this.config_store;
    });
  }

  private getGoodsInfo() {
    return this.dataService.storage_spuGet({
      storage_spu_id: this.id,
      all: 1,
    }).then(res => {
      this.goods = res.data.spu_info;
      return this.goods;
    });
  }
}

export const outStoreNew: ng.IComponentOptions = {
  template: require('./out-store-new.template.html'),
  controller: outStoreNewController,
};
