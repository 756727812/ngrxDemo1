/**
 * 创建入库记录
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as moment from 'moment';


export class warehousingInfoNewController {
  private id: string = this.$routeParams['id'];

  config_store: Array<any>;
  goods: any;
  form_data: any = {};
  dateTimePicker: string;

  static $inject: string[] = ['$q', '$window', '$routeParams', '$location', 'dataService', 'Notification'];
  constructor(
    private $q: ng.IQService,
    private $window: ng.IWindowService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) {
    const promises = [this.getGoodsInfo(), this.getConfigureStore()];
    $q.all(promises);
  }

  onSetTime(newDate, oldDate) {
    if (newDate.getTime() >= (new Date())) {
      this.dateTimePicker = oldDate;
      this.Notification.warn('入库时间必须早于或等于当前时间！');
    }
    this.form_data.log_time = moment(this.dateTimePicker).format('YYYY-MM-DD HH:mm:ss');
  }

  save() {
    this.form_data.spu_info = JSON.stringify(this.goods);
    return this.dataService.storage_storeAdd(this.form_data).then(res => {
      this.Notification.success('创建入库记录成功');
      this.$location.path(`/store/goods-list/${this.id}/warehousing-info-list`);
    });
  }

  cancel() {
    this.$window.history.back();
  }

  integerfy(index) {
    const v = this.goods.sku_detail[index].stock;
    this.goods.sku_detail[index].stock = Math.floor(v);
  }

  private getConfigureStore() {
    return this.dataService.storage_configGet().then(res => {
      this.config_store = res.data.config_store;
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

export const warehousingInfoNew: ng.IComponentOptions = {
  template: require('./warehousing-info-new.template.html'),
  controller: warehousingInfoNewController,
};
