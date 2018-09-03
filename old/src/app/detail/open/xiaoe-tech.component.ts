import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class xiaoeTechController {
  show_type: string;
  page: string;
  total_items: number;
  list: Array<any>;
  source_id: string;
  list_kol: Array<any>;
  kol_id: string;
  list_choice_kol: Array<any>;
  count_result: string;

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
    this.count_result = '';
    this.page = $routeParams['page'] || '1';
    this.show_type = $routeParams['show_type'] || '1';
    this.source_id = $routeParams['source_id'] || '';
    this.kol_id = $routeParams['kol_id'] || '0';

    let promises: ng.IPromise<any>[];
    switch (this.show_type) {
      case '1':
        promises = [this.getKeyList(), this.xiaoe_e_get_distribution_list()];
        break;
      case '2':
        promises = [this.xiaoe_e_get_list_dis()];
        break;
      case '3':
        promises = [this.xiaoe_e_get_distribution_result()];
        break;
    }

    this.$q.all(promises);

  }

  copySuccess(msg) {
    this.Notification.success(msg);
  }

  delInfo(id) {
    this.seeModal.confirm('确认提示', '确认要删除这条分销地址？', () => {
      return this.dataService.xiaoe_e_get_del_info({
        id,
      }).then(res => {
        return this.xiaoe_e_get_list_dis();
      });
    },                    () => {

    });
  }

  saveMargin(data, id) {
    return this.dataService.xiaoe_e_get_set_margin_scale({
      id,
      margin_scale: data,
    }).then(res => {
      return this.xiaoe_e_get_list_dis();
    });
  }

  addUrl(item) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-url.html'),
      controller: 'modalcreateUrlController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        info: () => item,
        source_id: () => item.source_id,
        list_kol: () => this.list_kol,
      },
    });
    return modalInstance.result.then(params => {
      this.Notification.success(params.msg);
      return this.xiaoe_e_get_distribution_list();
    });
  }

  funcFilter(show_type) {
    this.show_type = show_type;
    this.$location.search({
      show_type,
    });
  }

  submitSearchKol() {
    console.log(this.kol_id, 'kol_id');
    this.$location.url('open/xiaoe?show_type=3&kol_id=' + this.kol_id);
  }


  private getKeyList() {
    return this.dataService.kol_mgr_keyList({}).then(res => {
      this.list_kol = res.data.list_key;
      return;
    });
  }

  private xiaoe_e_get_distribution_result(page_size = 20) {
    const param: any = {
      kol_id: this.kol_id,
      page: this.page,
      page_size,
    };
    return this.dataService.xiaoe_e_get_distribution_result(param).then(res => {
      this.total_items = res.data.count;
      this.list = res.data.list;
      this.list_choice_kol = res.data.list_choice_kol;
      this.count_result = res.data.count;
      return;
    });
  }

  private xiaoe_e_get_distribution_list(page_size = 20) {
    const param: any = {
      page: this.page,
      page_size,
    };
    return this.dataService.xiaoe_e_get_distribution_list(param).then(res => {
      this.total_items = res.data.count;
      this.list = res.data.list;
      return;
    });
  }

  private xiaoe_e_get_list_dis(page_size = 20) {
    const param: any = {
      page: this.page,
      page_size,
      source_id: this.source_id,
    };
    return this.dataService.xiaoe_e_get_list_dis(param).then(res => {
      this.total_items = res.data.count;
      this.list = res.data.list;
      return;
    });
  }

}


export const xiaoeTech: ng.IComponentOptions = {
  template: require('./xiaoe-tech.template.html'),
  controller: xiaoeTechController,
};

