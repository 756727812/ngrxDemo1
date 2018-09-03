import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

export class shopManageController {
  page: string;
  lists: Array<any>;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {
    this.page = $routeParams['page'] || '1';

    let promises: ng.IPromise<any>[];
    promises = [this.getList()];
    this.$q.all(promises);
  }

  private getList() {
    const param: any = {
      page: this.page,
      page_size: 20,
    };
    return this.dataService.shop_getList(param).then(res => {
      // console.log(res.data)
      this.lists = res.data.list;
    });
  }

  delApply(item) {//取消申请
    const param: any = {
      id: item,
    };
    this.seeModal.confirm('确认提示', `你确放弃本次的小电铺申请？`, () => {
      return this.dataService.shop_delApply(param).then(res => {
        if (res.result == 1) {
          this.Notification.success('取消成功!');
          this.getList();
        } else {
          this.Notification.warn(res.msg);
        }
      });
    });
  }
  reApply(item) {//重新申请
    const param: any = {
      id: item,
    };
    return this.dataService.shop_reApply(param).then(res => {
      if (res.result == 1) {
        this.Notification.success('已重新申请!');
      } else {
        this.Notification.warn(res.msg);
      }
    });
  }

}


export const shopManage: ng.IComponentOptions = {
  template: require('./shop-manage.template.html'),
  controller: shopManageController,
};

