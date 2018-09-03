import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

export class stockDetailController {
  page: string;
  total_items: number;
  item_info: any;
  list: Array<any>;
  detail: any;
  sku_attr_list: Array<any>;
  sku_attr_change: Array<any>;
  productId: number;
  skuCode: string;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {
    this.sku_attr_change = [];
    this.sku_attr_list = [];
    this.page = $routeParams['page'] || '1';
    this.productId = $routeParams['productId'] || 0;
    this.skuCode = $routeParams['skuCode'] || '';

    let promises: ng.IPromise<any>[];
    promises = [this.item_getItem(), this.wms_stock_detail(), this.wms_stock_changeList()];
    this.$q.all(promises);

  }

  private item_getItem() {
    if (this.productId == 0) {
      return;
    }
    const param: any = {
      item_id: this.productId,
    };
    return this.dataService.item_getItem(param).then(res => {
      this.item_info = res.data;
    });
  }

  private wms_stock_detail() {
    if (this.productId == 0) {
      return;
    }
    const param: any = {
      productId: this.productId,
    };
    return this.dataService.wms_stock_detail(param).then(res => {
      this.detail = res.data;

      this.sku_attr_list = [];
      if (this.detail.skuStockDetailVOList.length > 0) {
        const tmp_key = [];
        _.forEach(this.detail.skuStockDetailVOList[0].specMap, function (v, k) {
          tmp_key.push({ key: k });
        });
        this.sku_attr_list = tmp_key;
      }
      return;
    });
  }

  private wms_stock_changeList(page_size = 20) {
    if (this.skuCode === '') {
      return;
    }
    const param: any = {
      skuCode: this.skuCode,
      page: this.page,
      pageSize: page_size,
    };
    return this.dataService.wms_stock_changeList(param).then(res => {
      this.total_items = res.data.count;
      this.list = res.data.list;

      if (this.sku_attr_change.length == 0) {
        this.sku_attr_change = [];
        if (this.list.length > 0) {
          const tmp_key = [];
          _.forEach(this.list[0].specMap, function (v, k) {
            tmp_key.push({ key: k });
          });
          this.sku_attr_change = tmp_key;
        }
      }
      return;
    });
  }


}


export const stockDetail: ng.IComponentOptions = {
  template: require('./stock-detail.template.html'),
  controller: stockDetailController,
};

