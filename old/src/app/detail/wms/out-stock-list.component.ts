import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as moment from 'moment';
import * as angular from 'angular';
import './modal/modal.less';

export class outstockListController {
  searchForm: any;
  page: string;
  total_items: number;
  list: Array<any>;
  datePicker: any;
  post_mid_order: string;
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {
    this.post_mid_order = '';
    this.page = $routeParams['page'] || '1';
    this.datePicker = {
      startDate: $routeParams.startTime
        ? moment(+$routeParams.startTime)
        : null,
      endDate: $routeParams.endTime ? moment(+$routeParams.endTime) : null,
    };
    console.log(this.datePicker);
    this.searchForm = {
      exWarehouseOrderId: $routeParams.exWarehouseOrderId,
      orderId: $routeParams.orderId,
      trackingNumber: $routeParams.trackingNumber,
      consignee: $routeParams.consignee,
      isUnnormal: $routeParams.isUnnormal,
      type: $routeParams.type,
      status: $routeParams.status,
    };
    let promises: ng.IPromise<any>[];
    promises = [this.wms_outboundOrder_list()];
    this.$q.all(promises);
  }

  submitSearch: () => any = () => {
    // alert(123);
    this.$location.search({
      ...this.$location.search(),
      ...this.searchForm,
      page: 1,
      startTime: this.datePicker.startDate
        ? Date.parse(this.datePicker.startDate)
        : undefined,
      endTime: this.datePicker.endDate
        ? Date.parse(this.datePicker.endDate)
        : undefined,
    });
    console.log(this.$location.search());
  };
  resetSearch: () => any = () => {
    this.$location.search({});
  };

  postOrder: () => any = () => {
    console.log('postOrder' + this.post_mid_order);
    if (this.post_mid_order === '') {
      this.Notification.error('请输入中订单号');
      return;
    }
    const param = {
      midOrderId: this.post_mid_order,
    };
    return this.dataService.wms_outboundOrder_create(param).then(res => {
      console.log(res);
      this.Notification.success('重新出库推送成功');
    });
  };

  postOrderBatch: () => any = () => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal/modal-post-order-batch.html'),
      backdrop: 'static',
      size: 'post-order-batch',
      controller: 'ModalPostOrderBatchController',
      controllerAs: 'vm',
      resolve: {},
    });
    return modalInstance.result
      .then(_params => {
        console.log(_params);
      })
      .catch();
  };

  private wms_outboundOrder_list(page_size = 20) {
    const param: any = {
      ...this.$location.search(),
      page_size,
      page: this.page,
      startTime: this.datePicker.startDate
        ? Date.parse(this.datePicker.startDate)
        : undefined,
      endTime: this.datePicker.endDate
        ? Date.parse(this.datePicker.endDate)
        : undefined,
    };
    return this.dataService.wms_outboundOrder_list(param).then(res => {
      console.log(res);
      this.total_items = res.data.count;
      this.list = res.data.list;
    });
  }
}

export const outStockList: ng.IComponentOptions = {
  template: require('./out-stock-list.template.html'),
  controller: outstockListController,
};
