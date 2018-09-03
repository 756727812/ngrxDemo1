/**
 * 库存商品列表页
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { IStoreService } from './store.service';
import * as _ from 'lodash';;

export class storeGoodsListController {
  config_store: Array<any>;
  spu_list: Array<any>;
  total_items: number;
  searchForm: {
    keyword: string,
    store_id: string,
  } = {
    keyword: this.$routeParams['keyword'],
    store_id: this.$routeParams['store_id'],
  };

  private page: string = this.$routeParams['page'] || '1';

  static $inject: string[] = ['$q', '$location', '$routeParams', 'dataService', 'storeService'];
  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
    private storeService: IStoreService,
  ) {
    const promises = [this.getConfigureStore(), this.getSpuList()];
    this.$q.all(promises).then(() => {
      console.log('库存商品视图激活成功！');
    });
  }

  submitSearch() {
    this.$location.search(_.assign({}, this.$location.search(), {
      keyword: this.searchForm.keyword,
      store_id: this.searchForm.store_id,
    }));
  }

  private getConfigureStore() {
    return this.dataService.storage_configGet().then(res => {
      this.config_store = res.data.config_store;
      return this.config_store;
    });
  }

  private getSpuList() {
    const filter_info = {
      keyword: this.$routeParams['keyword'],
      store_id: this.$routeParams['store_id'],
    };
    return this.dataService.storage_spuList({
      page: this.page,
      page_size: 20,
      filter_info: JSON.stringify(filter_info),
    }).then(res => {
      this.total_items = res.data.count;
      this.spu_list = res.data.list;
      return this.spu_list;
    });
  }

}

export const storeGoodsList: ng.IComponentOptions = {
  template: require('./store-goods-list.template.html'),
  controller: storeGoodsListController,
};
