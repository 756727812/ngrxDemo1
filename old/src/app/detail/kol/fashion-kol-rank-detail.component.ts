import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

export class fashionKolRankDetailController {
  private page;
  private type;
  private category;
  private key;
  private from_url;

  hash: string;
  list_detail: Array<any>;
  total_items: number;

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

    this.page = $routeParams['page'] || '1';
    this.type = $routeParams['type'] || '1';
    this.category = $routeParams['category'] || '1';
    this.key = $routeParams['key'] || '1';
    this.from_url = $routeParams['from_url'] || '';


  }

  $onInit() {
    let promises: ng.IPromise<any>[];
    promises = [this.getDetailBrandAndClass()];
    this.$q.all(promises);
  }

  private getDetailBrandAndClass(page_size = 20) {
    const param: any = {
      key: this.key,
      type: this.type,
      category: this.category,
      page: this.page,
      page_size,
      token: '',
    };
    param.token = this.dataService.createToken(param);
    //param.token = md5('see' + moment().format('YYYYMMDD') + param.key + param.type + param.category + param.page + param.page_size);
    return this.dataService.da_kol_rank_DetailBrandAndClass(param).then(res => {
      if (page_size === 20) this.total_items = res.data.count;
      this.list_detail = res.data.list;
      return this.list_detail;
    });
  }

}

export const fashionKolRankDetail: ng.IComponentOptions = {
  template: require('./fashion-kol-rank-detail.template.html'),
  controller: fashionKolRankDetailController,
};
