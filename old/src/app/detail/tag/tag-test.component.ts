import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as _ from 'lodash';;


export class tagTestController {
  private page: string;

  hash: string;
  form_goods: {
    search: string,
    ship_country: string,
  };
  form_brand: {
    search: string,
    class_type: string,
  };
  country_list: any[];
  goods_list: any[];
  brand_list: any[];
  total_items: number;

  static $inject: string[] = ['$q', '$location', '$routeParams', 'dataService', 'seeModal', 'Notification'];
  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
    private seeModal: ISeeModalService,
    private Notification: INotificationService,
  ) { }

  $onInit() {
    this.page = this.$routeParams['page'] || '1';
    this.hash = this.$location.hash() || 'goods';
    this.total_items = 0;
    this.form_goods = {
      search: this.$routeParams['search'],
      ship_country: this.$routeParams['ship_country'],
    };
    this.form_brand = {
      search: this.$routeParams['search'],
      class_type: this.$routeParams['class_type'],
    };
    let promises: ng.IPromise<any>[];
    if (this.hash === 'goods') {
      promises = [this.getConfigLocation(), this.getOrderRateList()];
    } else {
      promises = [this.getBrandRateList()];
    }
    return this.$q.all(promises);
  }

  selectTab: () => any = () => this.$location.search({});

  submitGoodsSearch: () => any = () => this.$location.search(this.form_goods);

  submitBrandSearch: () => any = () => this.$location.search(this.form_brand);

  reset: (id: string, ispublic: string) => ng.IPromise<any> = (id, ispublic) => {
    const title = ispublic !== '1' ? '显示' : '隐藏';
    return this.seeModal.confirmP('提示', `你确定要${title}该心愿吗？`).then(() => {
      if (ispublic !== '1') {
        return this.dataService.wanted_resumeTheme({ id }).then(res => {
          this.Notification.success(`${title}操作成功！`);
          return this.hash === 'goods' ? this.getOrderRateList() : this.getBrandRateList();
        });
      } else {
        return this.dataService.wanted_hideTheme({ t_id: id }).then(res => {
          this.Notification.success(`${title}操作成功！`);
          return this.hash === 'goods' ? this.getOrderRateList() : this.getBrandRateList();
        });
      }
    });
  }

  private getConfigLocation: () => ng.IPromise<any> = () =>
    this.dataService.CommonData_getConfigLocation().then(res => {
      this.country_list = res.data;
      return this.country_list;
    })

  private getOrderRateList: () => ng.IPromise<any> = () =>
    this.dataService.rate_getOrderRateList(_.assign({ p: this.page }, this.form_goods)).then(res => {
      this.goods_list = res.data.list;
      this.total_items = res.data.count;
      return this.goods_list;
    })

  private getBrandRateList: () => ng.IPromise<any> = () =>
    this.dataService.rate_getBrandRateList(_.assign({ p: this.page }, this.form_brand)).then(res => {
      this.brand_list = res.data.list;
      this.total_items = res.data.count;
      return this.brand_list;
    })
}

export const tagTest: ng.IComponentOptions = {
  template: require('./tag-test.template.html'),
  controller: tagTestController,
};
