/**
 * 库存概况
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as _ from 'lodash';;

export class storeOverviewController {
  private page = this.$routeParams['page'] || '1';

  id: string = this.$routeParams['id'];
  config_store: Array<any>;
  store_list: Array<any>;
  total_items: number;
  search_form: {
    keyword: string,
    store_id: string,
  } = {
    keyword: this.$routeParams['keyword'],
    store_id: this.$routeParams['store_id'],
  };

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
  ) {
    const promises = [this.getConfigureStore(), this.getStoreList()];
    $q.all(promises);
  }

  submitSearch() {
    this.$location.search(_.assign({}, this.$location.search(), {
      keyword: this.search_form.keyword,
      store_id: this.search_form.store_id,
    }));
  }

  private getConfigureStore() {
    return this.dataService.storage_configGet().then(res => {
      this.config_store = res.data.config_store;
      return this.config_store;
    });
  }

  private getStoreList() {
    return this.dataService.storage_storeList({
      page: this.page,
      page_size: 20,
      storage_spu_id: this.id,
      filter_info: JSON.stringify({
        keyword: this.search_form.keyword,
        store_id: this.search_form.store_id,
      }),
    }).then(res => {
      this.total_items = res.data.count;
      this.store_list = res.data.list;
      return this.store_list;
    });
  }
}

export const storeOverview: ng.IComponentOptions = {
  template: require('./store-overview.template.html'),
  controller: storeOverviewController,
};
