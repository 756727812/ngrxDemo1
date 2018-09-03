import { IDataService } from '../../services/data-service/data-service.interface';

export class orderSearchAreaController {
  private area_type: string;
  private page: string;

  filter_text: string;
  filter_warehouse: string;
  type: string;
  in_warehouse: number;
  onGetOrderData: Function;

  static $inject: string[] = ['$q', '$location', '$routeParams', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
  ) { }

  $onInit() {
    enum filterText { 美国和加拿大 = 1, 日本, 韩国, 英国, 中国, 欧洲其他地区 }
    this.area_type = this.$routeParams['area_type'];
    this.filter_text = this.area_type ? filterText[this.area_type] : '';

    this.in_warehouse = this.$routeParams['in_warehouse'] || 0;
    if (this.in_warehouse == 1) {
      this.filter_warehouse = '请选择囤货类型';
    } else if (this.in_warehouse == 2) {
      this.filter_warehouse = '囤货订单';
    } else if (this.in_warehouse == 3) {
      this.filter_warehouse = '非屯货订单';
    }

    this.page = this.$routeParams['page'] || '1';
    this.$q.all([this.searchOrderByArea()]);
  }

  $onChanges(bindings) {
    bindings.shouldUpdate.currentValue && this.$q.all([this.searchOrderByArea()]);
  }

  locationFilter: (area_type: number) => any = area_type => this.$location.search({ area_type });
  wareHouseFilter: (in_warehouse: number) => any = in_warehouse => this.$location.search({ in_warehouse });


  searchOrderByArea: () => ng.IPromise<any> = () => {
    if (this.area_type || this.in_warehouse > 0) {
      let tmp_in_warehouse = this.in_warehouse;
      if (tmp_in_warehouse <= 1) {
        tmp_in_warehouse = -1;
      }
      if (tmp_in_warehouse == 2) {
        tmp_in_warehouse = 1;
      }
      if (tmp_in_warehouse == 3) {
        tmp_in_warehouse = 0;
      }
      return this.dataService.orderv2_searchOrderByArea({
        area_type: this.area_type,
        p: this.page,
        type: this.type,
        in_warehouse: tmp_in_warehouse,
      }).then(res => this.onGetOrderData({ order_data: res.data }));
    } else {
      return this.$q.when('order-search-normal组件未被使用');
    }
  }

}

export const orderSearchArea: ng.IComponentOptions = {
  bindings: {
    in_warehouse: '<',
    type: '<',
    onGetOrderData: '&',
    shouldUpdate: '<',
  },
  template: require('./order-search-area.template.html'),
  controller: orderSearchAreaController,
};
