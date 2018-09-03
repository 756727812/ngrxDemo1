import * as _ from 'lodash';;
import { IDataService } from '../../services/data-service/data-service.interface';

export class orderSearchBtnGroupController {
  private page: string = this.$routeParams['page'] || '1';

  group: any[];
  paramName: string;
  listApi: string;
  countApi: string;
  onGetOrderData: ({ order_data: any }) => any;
  filter_type: string = this.$routeParams['filter_type'];
  count: any;
  flag = _.remove(
    _.keys(this.$location.search()), s => s !== 'page' && s !== 'filter_type',
  ).length === 0;

  static $inject: string[] = ['$q', '$location', '$routeParams', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
  ) { }

  $onInit() {
    if (this.flag) {
      this.$q.all([this.getFilterTypeCount(), this.getOrderList()]);
    }
    this.paramName = this.paramName || 'filter_type';
  }

  $onChanges(bindings) {
    if (bindings.shouldUpdate.currentValue) {
      this.$onInit();
    }
  }

  typeFilter: (filter_type: string) => any = filter_type => this.$location.search({
    [this.paramName]: filter_type,
  })

  private getOrderList: () => ng.IPromise<any> = () =>
    this.dataService[this.listApi]({
      p: this.page,
      page: this.page,
      type: this.filter_type,
    }).then(res => this.onGetOrderData({ order_data: res.data }))

  private getFilterTypeCount: () => ng.IPromise<any> = () =>
    this.dataService[this.countApi]().then(res => {
      let countobj = res.data;
      if (this.countApi === 'orderv2_getOrderCountLogistics') {
        countobj = {
          2: res.data['buyer_send'],
          3: res.data['storage_send'],
          5: res.data['user_get'],
          6: res.data['official_send'],
          7: res.data['transfer_send'],
        };
      }
      this.count = countobj;
    })

}

export const orderSearchBtnGroup: ng.IComponentOptions = {
  bindings: {
    listApi: '@',
    countApi: '@',
    group: '<',
    paramName: '@',
    onGetOrderData: '&',
    shouldUpdate: '<',
  },
  controller: orderSearchBtnGroupController,
  template: require('./order-search-btn-group.template.html'),
};
