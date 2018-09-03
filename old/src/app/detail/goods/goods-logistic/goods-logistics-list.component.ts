import * as angular from 'angular';
import * as _ from 'lodash';;
import './goods-logistic.less';

export class goodsLogisticsListController implements ng.IComponentController {

  static $inject: string[] = [
    '$q', '$cookies', '$routeParams', '$location', 'Notification', 'dataService', 'seeModal',
  ];

  page = this.$routeParams.page || 1;
  searchForm = {
    is_seego: this.$routeParams.is_seego,
    keyword: this.$routeParams.keyword,
    free_mail_method: this.$routeParams.free_mail_method || '3',
    /* seller_email: this.$routeParams.seller_email || '', */
    search_backend_id: this.$routeParams.search_backend_id || '',
    type: this.$routeParams.type || 1,
  };
  sellerPrivilege = this.$cookies.get('seller_privilege');
  is_c2c = ['1', '30'].includes(this.sellerPrivilege);
  logisticsList: any[];
  total_items: number;
  seller_list_key: any[];
  selectOptions: any;

  constructor(
    private $q: ng.IQService,
    private $cookies: ng.cookies.ICookiesService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private Notification: see.INotificationService,
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
  ) {}

  $onInit(): void {
    this.$q.all([this.getList(), this.getSellerKeyList(), this.getExpressSelectOption()]);
  }

  submitSearch() {
    this.$location.search(angular.extend({}, this.$location.search(), this.searchForm));
  }


  updateTop(ex_id, is_top, tips) {
    this.seeModal.confirm('确认提示', tips, () => {
      return this.dataService.express_updateTop({
        ex_id,
        is_top,
      }).then(res => {
        this.Notification.success('操作成功！');
        return this.getList();
      });
    });
  }

  deleteItem(id) {
    this.seeModal.confirm('删除路线', '确认删除该路线？', () => {
      return this.dataService.express_deleteItem({
        ex_id: id,
      }).then(res => {
        if (res.result === 1) {
          res.data.tips && this.seeModal.confirm('注意', res.data.tips);
          this.Notification.success('删除路线成功！');
          return this.getList();
        }
      });
    });
  }

  private getExpressSelectOption: () => ng.IPromise<any> = () => {
    return this.dataService.express_getExpressSelectOption().then(res => {
      this.selectOptions = res.data;
    })
  }

  private getList() {
    const params = {
      page: this.page,
      page_size: 20,
      keyword: this.searchForm.keyword,
      is_seego: this.searchForm.is_seego,
      free_mail_method: this.searchForm.free_mail_method,
      /* seller_email: this.searchForm.seller_email, */
      search_backend_id: this.searchForm.search_backend_id,
      type: this.searchForm.type,
    };
    return this.dataService.express_getList(params).then(res => {
      if (res.result === 1) {
        this.logisticsList = res.data.list;
        const express_type_list = res.data.ex_type_list;
        angular.forEach(this.logisticsList, log => {
          angular.forEach(express_type_list, type => {
            if (Number(log.ex_type) === Number(type.ex_type))
              log.ex_type_str = type.value;
          });
        });
        this.total_items = res.data.count;
        return this.logisticsList;
      } else this.Notification.dataError(res.msg);
    });
  }

  private getSellerKeyList() {
    return this.dataService.user_getC2CUser().then(({ data }) => {
      if (data) {
        this.seller_list_key = data;
        this.seller_list_key.unshift({
          id: 0,
          seller_name: '全部',
          seller_email: '',
        });
      }
    });
  }
}

export const goodsLogisticsList: ng.IComponentOptions = {
  template: require('./goods-logistics-list.template.html'),
  controller: goodsLogisticsListController,
};
