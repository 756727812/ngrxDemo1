import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class virtualOrderController {
  page: string;
  total_items: number;
  list: Array<any>;

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
    promises = [this.kol_mgr_articleVirtualOrderList()];

    this.$q.all(promises);

  }

  addItem() {
    const info = {
      article_id: 0,
      virtual_order_num: 0,
      virtual_order_gmv: 0,
    };
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-add-virtual-order.html'),
      controller: 'modalAddVirtualOrderController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        info: () => info,
        is_edit: () => 0,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService.kol_mgr_articleVirtualOrderAdd(params.info).then(res => {
        return this.kol_mgr_articleVirtualOrderList();
      });
    });
  }

  editItem(item) {
    const info = {
      article_id: item.article_id,
      virtual_order_num: item.virtual_order_num,
      virtual_order_gmv: item.virtual_order_gmv,
    };
    const self = this;
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-add-virtual-order.html'),
      controller: 'modalAddVirtualOrderController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        info: () => info,
        is_edit: () => 1,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService.kol_mgr_articleVirtualOrderSet(params.info).then(res => {
        return this.kol_mgr_articleVirtualOrderList();
      });
    });
  }

  delteItem(item) {
    this.seeModal.confirm('确认提示', '确认要删除该文章的虚拟订单数？', () => {
      return this.dataService.kol_mgr_articleVirtualOrderDel({
        article_id: item.article_id,
        virtual_order_num: 0,
        virtual_order_gmv: 0,
      }).then(res => {
        this.Notification.success('删除成功');
        return this.kol_mgr_articleVirtualOrderList();
      });
    },                    () => {
      return this.kol_mgr_articleVirtualOrderList();
    });
  }

  private kol_mgr_articleVirtualOrderList() {
    const param: any = {
      page: this.page,
      page_size: 20,
    };
    return this.dataService.kol_mgr_articleVirtualOrderList(param).then(res => {
      this.total_items = res.data.count;
      this.list = res.data.list;
      return;
    });
  }

}


export const virtualOrder: ng.IComponentOptions = {
  template: require('./virtual-order.template.html'),
  controller: virtualOrderController,
};

