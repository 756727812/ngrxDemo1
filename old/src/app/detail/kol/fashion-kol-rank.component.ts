import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';

export class fashionKolRankController {
  private page;

  hash: string;
  list_select: string;

  rank_type: string;
  type: string;
  category: string;
  from_url: string;

  list_info_kol: Array<any>;
  list_info_brand: Array<any>;
  list_info_class: Array<any>;
  total_items: number;

  list_key_kol: Array<any>;
  list_key_brand: Array<any>;
  list_key_class: Array<any>;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'Upload', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private Upload: any,
    private $uibModal: any,
  ) {
    this.hash = this.$location.hash() || '1';

    this.page = $routeParams['page'] || '1';
    this.rank_type = $routeParams['rank_type'] || '1';
    this.list_select = $routeParams['list_select'];
  }

  $onInit() {
    let promises: ng.IPromise<any>[];
    switch (this.rank_type) {
      case '1':
        promises = [this.getListInfoKol()];
        break;
      case '2':
        if (this.hash === '1') {
          promises = [this.getListBrandAndClass(1, 1)];
        } else if (this.hash === '2') {
          promises = [this.getListBrandAndClass(1, 2)];
        }
        break;
      case '3':
        if (this.hash === '1') {
          promises = [this.getListBrandAndClass(2, 1)];
        } else if (this.hash === '2') {
          promises = [this.getListBrandAndClass(2, 2)];
        }
        break;
    }

    this.$q.all(promises);
  }

  selectTab() {
    this.$location.search({
      rank_type: this.rank_type,
    });
  }

  rankTypeFilter(rank_type) {
    this.$location.search({
      rank_type,
    });
  }

  submitSearch() {
    this.$location.search(angular.extend({}, this.$location.search(), {
      list_select: this.list_select,
    }));
  }

  private getKey(res) {
    const list_key = [];
    angular.forEach(res.data.list_key, function (v2, k2) {
      const item = { key: v2, name: v2 };
      list_key.push(item);
    });
    return list_key;
  }

  private getKeyword(bUseImplode = true) {
    if (!bUseImplode) {
      if (!this.list_select) {
        return '';
      }
      return this.list_select;
    }
    let key = '';
    angular.forEach(this.list_select, function (v2, k2) {
      if (key != '') {
        key += ',';
      }
      key += v2;
    });
    return key;
  }

  private getListInfoKol(page_size = 20) {
    const param: any = {
      key: this.getKeyword(),
      page: this.page,
      page_size,
      token: '',
    };
    param.token = this.dataService.createToken(param);
    //param.token = md5('see' + moment().format('YYYYMMDD') + param.key + param.page + param.page_size);
    return this.dataService.da_kol_rank_ListInfoKol(param).then(res => {
      if (page_size === 20) this.total_items = res.data.count;
      this.list_info_kol = res.data.list;
      this.list_key_kol = this.getKey(res);
      return;
    });
  }

  private getListBrandAndClass(type, category, page_size = 20) {
    this.from_url = encodeURIComponent(this.$location.absUrl());
    this.type = type;
    this.category = category;
    let key = '';
    if (category == 1 && type == 1) {
      key = this.getKeyword(false);
    } else {
      key = this.getKeyword(true);
    }
    const param: any = {
      key,
      type,
      category,
      page: this.page,
      page_size,
      token: '',
    };
    param.token = this.dataService.createToken(param);
    //param.token = md5('see' + moment().format('YYYYMMDD') + param.key + param.type + param.category + param.page + param.page_size);
    return this.dataService.da_kol_rank_ListBrandAndClass(param).then(res => {
      if (page_size === 20) this.total_items = res.data.count;
      if (category == 1) {
        this.list_info_brand = res.data.list;
        this.list_key_brand = this.getKey(res);
        return this.list_info_brand;
      } else if (category == 2) {
        this.list_info_class = res.data.list;
        this.list_key_class = this.getKey(res);
        return this.list_info_class;
      }

    });
  }

}

export const fashionKolRank: ng.IComponentOptions = {
  template: require('./fashion-kol-rank.template.html'),
  controller: fashionKolRankController,
};
