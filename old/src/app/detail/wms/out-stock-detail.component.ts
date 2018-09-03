import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

export class outStockDetailController {
  orderId: string;
  list: Array<any>;
  recvAddressVO: object;
  productPaymentListVO: object;
  logistic_info: object;
  logistics_list: Array<any>;
  logistics_list_vertical: Array<any>;
  isShowLog: boolean;

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
    this.orderId = $routeParams.orderId;
    let promises: ng.IPromise<any>[];
    promises = [this.wms_outboundOrder_detail(), this.wms_outboundOrder_express()];
    this.$q.all(promises);

  }

  private wms_outboundOrder_detail(page_size = 20) {
    const param: any = {
      midOrderId: this.orderId,
    };
    return this.dataService.wms_outboundOrder_detail(param).then(res => {
      // console.log(res)
      this.list = res.data;
      this.recvAddressVO = res.data.recvAddressVO; //收货信息
      this.productPaymentListVO = res.data.productPaymentListVO; //商品与支付信息

    });
  }
  private wms_outboundOrder_express() {
    const that = this;
    return this.dataService.orderv2_getOrderDetail({
      mid_order_id: this.orderId,
    }).then(res => {
      that.isShowLog = res.data ? true : false;
      that.logistic_info = res.data.logistic_info;
      that.logistics_list = res.data.logistic_info.logistics_list;
      that.logistics_list_vertical = _.values(res.data.logistic_info.logistics_list.vertical);
      for (let i = 0; i < that.logistics_list_vertical.length; i++) {
        if (that.logistics_list_vertical[i].node_type) {
          that.logistics_list_vertical[i].isFirstBigNode = true;
          break;
        }
      }
      _.forEach(res.data.logistic_info.transport_info, ti => {
        if (ti.transport_url.indexOf('http') !== ti.transport_url.lastIndexOf('http')) {
          const ts = ti.transport_url.substr(7);
          ti.transport_url = ts;
        }
      });
      _.forEach(that.logistics_list_vertical, ti => {
        if (ti.transport_url && (ti.transport_url.indexOf('http') !== ti.transport_url.lastIndexOf('http'))) {
          const ts = ti.transport_url.substr(7);
          ti.transport_url = ts;
        }
      });
    });
  }


}


export const outStockDetail: ng.IComponentOptions = {
  template: require('./out-stock-detail.template.html'),
  controller: outStockDetailController,
};

