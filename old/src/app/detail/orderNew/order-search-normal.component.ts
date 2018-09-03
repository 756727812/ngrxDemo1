import * as moment from 'moment';
import * as angular from 'angular';
import { NzModalService } from 'ng-zorro-antd';
import { ModalExportOrder } from './modal-export-order.component';

export class orderSearchNormalController {
  static $inject: string[] = [
    '$q',
    '$location',
    '$routeParams',
    '$window',
    'dataService',
    'seeModal',
    'NzModalService',
  ];

  onGetOrderData: Function;
  type: string;
  form_data: {
    keyword: string;
    date_picker: {
      startDate: moment.Moment;
      endDate: moment.Moment;
    };
    group_status: number;
  };
  private page: string;
  sellerPrivilege: string = localStorage.getItem('seller_privilege');

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $window: ng.IWindowService,
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private modalService: NzModalService,
  ) {}

  $onInit() {
    this.page = this.$routeParams['page'] || '1';
    this.form_data = {
      keyword: this.$routeParams['keyword']
        ? decodeURIComponent(this.$routeParams['keyword'])
        : undefined,
      date_picker: {
        startDate: this.$routeParams['startDate']
          ? moment(+this.$routeParams['startDate'])
          : null,
        endDate: this.$routeParams['endDate']
          ? moment(+this.$routeParams['endDate'])
          : null,
      },
      group_status: ~~this.$routeParams['group_status'] || undefined,
    };
    this.$q.all([this.searchOrder()]);
  }

  $onChanges(bindings) {
    bindings.shouldUpdate.currentValue && this.searchOrder();
  }

  submitSearch: () => any = () =>
    this.$location.search({
      keyword: this.form_data.keyword
        ? encodeURIComponent(this.form_data.keyword)
        : undefined,
      startDate: this.form_data.date_picker.startDate
        ? this.form_data.date_picker.startDate.unix() * 1000
        : undefined,
      endDate: this.form_data.date_picker.endDate
        ? this.form_data.date_picker.endDate.unix() * 1000
        : undefined,
      group_status: this.form_data.group_status || undefined,
    });

  searchOrder: () => ng.IPromise<any> = () => {
    if (
      this.$routeParams['keyword'] ||
      this.$routeParams['startDate'] ||
      this.$routeParams['endDate'] ||
      this.$routeParams['group_status']
    ) {
      return this.dataService
        .orderv2_searchOrder({
          p: this.page,
          type: this.type,
          keyword: this.form_data.keyword
            ? decodeURIComponent(this.form_data.keyword)
            : undefined,
          startDate: this.$routeParams['startDate'],
          endDate: this.$routeParams['endDate'],
          group_status: this.form_data.group_status,
        })
        .then(res => this.onGetOrderData({ order_data: res.data }));
    }
    return this.$q.when('order-search-normal组件未被使用');
  };

  exportOrderNew() {
    if (this.type === '12') {
      this.$window.open('api/CommonData/export48hOrderData');
      return;
    }
    if (this.type === '0' && [5, 7, 10].includes(+this.sellerPrivilege)) {
      this.modalService.open({
        title: '批量导出',
        content: ModalExportOrder,
        maskClosable: false,
        // width: 768,
        showConfirmLoading: true,
        footer: false,
      });
      return;
    }
    const begin = this.getDateStr(this.form_data.date_picker.startDate);
    const end = this.getDateStr(this.form_data.date_picker.endDate);
    if (
      !this.form_data.date_picker.startDate ||
      !this.form_data.date_picker.endDate
    ) {
      this.seeModal.confirm(
        '提醒',
        '请选择下单时间',
        () => angular.element('.order-time').click(),
        () => angular.element('.order-time').click(),
        '确定',
        false,
      );
    } else {
      this.$window.open(
        this.$location.hash() +
          '/api/CommonData/exportOrderDataNew?begin=' +
          begin +
          '&end=' +
          end,
      );
    }
  }

  getDateStr(uData) {
    const myDate = new Date(uData);
    const year = myDate.getFullYear();
    const month = myDate.getMonth() + 1;
    const day = myDate.getDate();
    return year + '-' + month + '-' + day;
  }

  // 隐藏拼团订单筛选项
  get hideGroupSelect(): boolean {
    return [11].includes(Number(this.type));
  }

  // 隐藏 批量导出 按钮
  get hideExport(): boolean {
    return [11].includes(Number(this.type));
  }

  private exportOrderData(params): ng.IPromise<any> {
    return;
  }
}

export const orderSearchNormal: ng.IComponentOptions = {
  bindings: {
    type: '<',
    onGetOrderData: '&',
    shouldUpdate: '<',
  },
  template: require('./order-search-normal.template.html'),
  controller: orderSearchNormalController,
};
