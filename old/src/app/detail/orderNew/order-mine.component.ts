import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export class orderMineController {
  private page: string;

  form_data: {
    keyword: string;
  };
  order_list: any[];
  total_items: number;
  xdp_type: any;

  static $inject: string[] = [
    '$q', '$cookies', '$location', '$window', '$httpParamSerializer', '$routeParams', 'seeModal',
    'dataService',
  ];
  constructor(
    private $q: ng.IQService,
    private $cookies: any,
    private $location: ng.ILocationService,
    private $window: ng.IWindowService,
    private $httpParamSerializer: ng.IHttpParamSerializer,
    private $routeParams: ng.route.IRouteParamsService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
  ) { }

  $onInit() {
    const is_new_brand = (this.$cookies.get('seller_privilege') === '30') ? 1 : 0;
    this.xdp_type = this.$cookies.get('seller_xdpType');
    this.page = this.$routeParams['page'] || '1';
    this.form_data = {
      keyword: this.$routeParams['keyword'],
    };
    if (is_new_brand) {
      this.$q.all([this.getDistributionOrder()]);
    } else {
      this.$q.all([this.getKOLOrderList()]);
    }
  }

  submitSearch: () => any = () => this.$location.search({ keyword: this.form_data.keyword });

  private getKOLOrderList: () => ng.IPromise<any> = () =>
    this.dataService.orderv2_getKOLOrderList({
      keyword: this.form_data.keyword,
      page: this.page,
      page_size: 20,
    }).then(res => {
      this.order_list = res.data.list.map(item => item.order_list[0]);
      this.total_items = res.data.count;
      return this.order_list;
    })

  private getDistributionOrder: () => ng.IPromise<any> = () =>
    this.dataService.orderv2_getDistributionOrder({
      keyword: this.form_data.keyword,
      page: this.page,
      page_size: 20,
    }).then(res => {
      this.order_list = res.data.list.map(item => ({
        ...item.order_list[0],
        summary_info: item.summary_info,
      }));
      this.total_items = res.data.count;
      return this.order_list;
    })

  exportOrders: () => any = () => {
    this.seeModal.confirm(
      '提醒',
      `可复制如下链接到浏览器，并在链接地址中编辑订单的下单时间范围，进行订单导出：
      <a href="javascritp:;">https://portal.xiaodianpu.com/api/CommonData/exportOrderDataNew?begin=xxxx-xx-xx&end=xxxx-xx-xx</a>
      <p style="color:#666;padding-top:10px"><sup style="padding-right:5px">注</sup>begin为开始时间；end为结束时间；时间格式如1900-05-28</p>`,
      () => {},() => {},
      '确定',
      '');
  }

}

export const orderMine: ng.IComponentOptions = {
  template: require('./order-mine.template.html'),
  controller: orderMineController,
};
