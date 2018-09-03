/**
 * 创建库存锁定条目
 */
import * as moment from 'moment';
import * as _ from 'lodash';;
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

export class distributionStoreLockNewController {
  id: string = this.$routeParams['id'];
  goods: any;
  list_seller: Array<any>;
  config_store: Array<any>;
  form_data: {
    to_backend: any,
    sku_detail: Array<any>,
  };
  errors: string[] = [];
  date_range_picker_opt: any = {
    minDate: new Date(),
  };
  date_range_picker_batch_opt: any;
  batch_data: {
    store_id: number,
    date_picker: {
      startDate: any,
      endDate: any,
    },
  };
  default_store_id: number;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService) {
  }

  $onInit() {
    this.default_store_id = 1;
    this.batch_data = {
      store_id: this.default_store_id,
      date_picker: {
        startDate: null,
        endDate: null,
      },
    };
    this.date_range_picker_batch_opt = {
      minDate: new Date(),
      eventHandlers: {
        'apply.daterangepicker': ({ model }) => _.forEach(this.goods.sku_detail, sku => sku.date_picker = model),
      },
    };
    const promises = [this.getGoodsInfo(), this.getSellerList(), this.getConfigureStore()];
    this.$q.all(promises).then(() => _.forEach(this.goods.sku_detail, sku => sku.store_id = this.default_store_id));
  }

  storeBatchSelected: () => any = () => {
    this.batch_data.store_id && _.forEach(this.goods.sku_detail, sku => sku.store_id = this.batch_data.store_id);
  }

  save: () => ng.IPromise<any> = () => {
    this.errors.length = 0;
    _.forEach(this.goods.sku_detail, o => {
      o.date_picker.startDate === null && this.errors.push(`SKU囤货码为${o.storage_sku_id}的库存锁定时间不能为空！`);
      typeof o.auto_sync === 'undefined' && this.errors.push(`SKU囤货码为${o.storage_sku_id}的库存锁定量不能为空！`);
    });
    if (this.errors.length) return this.$q.when(-1);
    const params = {
      storage_spu_id: this.id,
      to_backend_id: this.form_data.to_backend.id,
      allot_detail: JSON.stringify(this.goods.sku_detail.map(o => {
        return {
          store_id: o.store_id,
          storage_sku_id: o.storage_sku_id,
          stock: o.stock,
          auto_sync: o.auto_sync,
          begin_time: moment(o.date_picker.startDate).format('YYYY-MM-DD'),
          end_time: moment(o.date_picker.endDate).format('YYYY-MM-DD'),
        };
      })),
    };
    return this.dataService.storage_allotAdd(params).then(res => {
      this.Notification.success('创建库存锁定条目成功！');
      this.$location.path(`/store/goods-list/${this.id}/distribution-store-lock-list`);
      return 0;
    });
  }

  private getSellerList() {
    return this.dataService.storage_sellerList({
      all: 1,
    }).then(res => {
      this.list_seller = res.data.list_seller;
      return this.list_seller;
    });
  }

  private getGoodsInfo() {
    return this.dataService.storage_spuGet({
      storage_spu_id: this.id,
      all: 1,
    }).then(res => {
      this.goods = res.data.spu_info;
      _.forEach(this.goods.sku_detail, o => {
        o.date_picker = {
          startDate: null,
          endDate: null,
        };
      });
      return this.goods;
    });
  }

  private getConfigureStore() {
    return this.dataService.storage_configGet().then(res => {
      this.config_store = res.data.config_store.filter(o => o.store_id);
      return this.config_store;
    });
  }
}

export const distributionStoreLockNew: ng.IComponentOptions = {
  template: require('./distribution-store-lock-new.template.html'),
  controller: distributionStoreLockNewController,
};
