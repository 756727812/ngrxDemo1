/**
 * 分销渠道管理列表页
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as _ from 'lodash';;

export class storeDistributionListController {
  private page = this.$routeParams['page'] || '1';

  id: string = this.$routeParams['id'];
  seller_list: Array<any>;
  total_items: number;
  search_form: {
    keyword: string,
  } = {
    keyword: this.$routeParams['keyword'],
  };

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
  ) {
    const promises = [this.getSellerList()];
    $q.all(promises);
  }

  submitSearch() {
    this.$location.search(_.assign({}, this.$location.search(), {
      keyword: this.search_form.keyword,
    }));
  }

  private getSellerList() {
    return this.dataService.storage_sellerList({
      all: 0,
      page: this.page,
      page_size: 20,
      filter_info: {
        keyword: this.search_form.keyword,
      },
    }).then(res => {
      this.total_items = res.data.count;
      this.seller_list = res.data.list_seller;
      return this.seller_list;
    });
  }
}

export const storeDistributionList: ng.IComponentOptions = {
  template: require('./store-distribution-list.template.html'),
  controller: storeDistributionListController,
};
