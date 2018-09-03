import { IDataService } from '../../services/data-service/data-service.interface';

export class orderSearchSellerController {
  private page: string;
  private seller_email: string;

  form_data: {
    seller_email: string,
  };
  filter_text: string;
  type: string;
  onGetOrderData: Function;

  static $inject: string[] = ['$q', '$location', '$routeParams', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
  ) { }

  $onInit() {
    this.seller_email = this.$routeParams['seller_email'];
    this.page = this.$routeParams['page'] || '1';
    this.form_data = { seller_email: this.seller_email };
    this.$q.all([this.searchSellerOrder()]);
  }

  $onChanges(bindings) {
    bindings.shouldUpdate.currentValue && this.$q.all([this.searchSellerOrder()]);
  }

  submitSearch: () => any = () => this.$location.search({ seller_email: this.form_data.seller_email });

  searchSellerOrder: () => ng.IPromise<any> = () => {
    if (this.seller_email) {
      return this.dataService.orderv2_searchSellerOrder({
        seller_email: this.$routeParams['seller_email'],
        p: this.page,
        type: this.type,
      }).then(res => this.onGetOrderData({ order_data: res.data }));
    } else {
      return this.$q.when('order-search-normal组件未被使用');
    }
  }

}

export const orderSearchSeller: ng.IComponentOptions = {
  bindings: {
    type: '<',
    onGetOrderData: '&',
    shouldUpdate: '<',
  },
  template: require('./order-search-seller.template.html'),
  controller: orderSearchSellerController,
};
