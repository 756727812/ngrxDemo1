import * as moment from 'moment';
import * as _ from 'lodash';;
import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import './order-search-btn-group.less';


interface IOrderData {
  list: any[];
  count: number;
  items_per_page?: number;
}

interface IBtnGroup {
  key: string;
  name: string;
}

export class orderListController {
  private page: string;
  private is_mark_star: string;
  private status: string;
  private isTimeout: string = this.$routeParams['isTimeout'];
  timeoutFilterText: string = '';
  order_start_time: number;
  order_end_time: number;
  should_update: boolean;
  type: string;
  order_title: string;
  order_data: IOrderData;
  filter_text: string;
  withdraw_text: string;
  after_sale_btn_group: IBtnGroup[];
  need_finish_btn_group: IBtnGroup[];

  static $inject: string[] = [
    '$scope', '$q', '$location', '$window', '$routeParams', 'dataService', 'orderService',
    'seeModal',
  ];
  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $window: ng.IWindowService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
    private orderService: any,
    private seeModal: ISeeModalService,
  ) { }

  $onInit() {
    this.order_start_time = this.$routeParams['startDate'] || 0;
    this.order_end_time = this.$routeParams['endDate'] || 0;

    this.should_update = false;
    this.page = this.$routeParams['page'] || '1';
    this.status = this.$routeParams['status'];
    this.is_mark_star = this.$routeParams['is_mark_star'];
    enum orderType { 所有订单, 待付款订单, 待备货订单, 已完成订单 = 5, 已关闭订单, 售后订单, 待派发订单 = 9, 待完成订单 }
    this.order_title = orderType[this.type];
    enum starText { 所有订单, 星标订单 }
    this.filter_text = this.is_mark_star ? starText[this.is_mark_star] : '';
    enum timeoutEnum { 所有订单, '48h未发货订单' }
    this.timeoutFilterText = _.isUndefined(this.isTimeout) ? '' : timeoutEnum[this.isTimeout];
    enum withdrawText { 全部, 已提现, 未提现 }
    this.withdraw_text = this.status ? withdrawText[this.status] : '';
    this.after_sale_btn_group = [
      { key: '1', name: '申请退款中' },
      { key: '2', name: '退货中' },
      { key: '3', name: '退款中' },
      { key: '4', name: '退款成功' },
    ];
    this.need_finish_btn_group = [
      { key: '1', name: '全部' },
      { key: '6', name: '待官网发货' },
      { key: '2', name: '待供应商发货' },
      { key: '5', name: '待确认收货' },
      { key: '7', name: '待国内拼邮中转收货' },
      // { key: '3', name: '待转运仓发货' },
    ];
    this.$q.all([this.getOrderList()]).catch(e => e);
  }

  onUpdate: () => any = () => {
    this.should_update = true;
    this.getOrderList();
    this.orderService.getOperateOrderCount(res => this.$scope.$emit('operateOrderCount', res.data));
  }

  timeoutFilter(isTimeout: number): void {
    this.$location.search({ isTimeout });
  }

  markFilter: (is_mark_star: string) => any = is_mark_star =>
    this.$location.search({ is_mark_star })

  withdrawFilter: (status: string) => any = status => this.$location.search({ status });

  getOrderData: (order_data: IOrderData) => IOrderData = order_data =>
    this.order_data = this.processOrderData(order_data)

  private getOrderList: () => ng.IPromise<any> = () => {
    const search: string[] = _.keys(this.$location.search());
    const flag: boolean = search.length === 0
      || (search.length === 1 && search[0] === 'page')
      || !_.isNil(this.is_mark_star)
      || !_.isNil(this.isTimeout)
      || !_.isNil(this.status);
    if (flag) {
      return this.dataService.orderv2_getOrderList({
        is_mark_star: this.is_mark_star,
        is_timeout: ~~this.isTimeout || undefined,
        status: this.status,
        p: this.page,
        type: this.type,
      }).then(res => this.order_data = this.processOrderData(res.data));
    } else {
      return this.$q.reject();
    }
  }

  private processOrderData: (order_data: IOrderData) => IOrderData = (order_data = {
    list: [],
    count: 0,
  }) => {
    if (Object.hasOwnProperty.call(order_data, 'list') && order_data.list.length > 0) {
      order_data.list
        .filter(
          order => Object.hasOwnProperty.call(order, 'order_list') && order.order_list.length > 0,
        )
        .forEach(order => {
          order.order_list[0].comments = order.order_list[0].comments.replace(/\s+/g, '');
          if (order.summary_info.status === '20006') {
            const buy_time = moment(order.order_list[0].buy_time).unix();
            const now = moment().unix();
            order.is_show_btn = (now - buy_time) >= 3600;
          }
        });

    }
    this.should_update = false;
    return {
      ...order_data,
      items_per_page: 20,
    };
  }

  exportOrderNew() {
    const begin = this.getDateStr(this.order_start_time);
    const end = this.getDateStr(this.order_end_time);
    if (!this.getInputTime()) {
      this.seeModal.confirm('提醒', '请选择下单时间', null, null, '确定', '');
    } else {
      this.$window.open(
        `${this.$location.hash()}/api/CommonData/exportOrderDataNew?begin=${begin}&end=${end}`,
      );
    }
  }

  getInputTime() {
    return this.order_start_time > 0 && this.order_end_time > 0;
  }

  getDateStr(uData) {
    const myDate = new Date(uData);
    const year = myDate.getFullYear();
    const month = myDate.getMonth() + 1;
    const day = myDate.getDate();
    return year + '-' + month + '-' + day;
  }

  get hideOrderSearchArea(): boolean {
    return [11].includes(Number(this.type));
  }
}

export const orderList: ng.IComponentOptions = {
  bindings: {
    type: '@',
  },
  template: require('./order-list.template.html'),
  controller: orderListController,
};

