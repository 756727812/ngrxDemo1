import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export class mallTempListController {
  private page: string;
  total_items: number;
  item_list: Array<any>;
  list_template_key: Array<any>;
  is_testing: number;

  filter_info: {
    template_select: string,
    template_ids: string,
  };

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', '$uibModal', 'Notification', 'seeModal'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $uibModal: any,
    private Notification: any,
    private seeModal: any,
  ) { }

  $onInit() {
    this.total_items = 0;
    this.page = this.$routeParams['page'] || '1';

    this.is_testing = 0;//开启或者关闭测试按钮

    this.filter_info = {
      template_ids: this.$routeParams['template_ids'] || '',
      template_select: typeof this.$routeParams['template_select'] == 'string' ? [this.$routeParams['template_select']] : this.$routeParams['template_select'],
    };


    const promises = [this.template_list(), this.getKeyTemplate()];
    this.$q.all(promises);
  }

  //功能测试
  private funcTest() {
    const modalInstance2 = this.$uibModal.open({
      animation: true,
      template: require('./modal-success-sync.html'),
      controller: 'modalSuccessSyncCouponController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'sm',
      resolve: {
        num_kol: () => 5,
        num_item: () => 2,
      },
    });
  }

  submitSearch: () => any = () => {
    this.filter_info.template_ids = '';
    const self = this;
    _.forEach(self.filter_info.template_select, (v, i) => {
      _.forEach(self.list_template_key, (info, j) => {
        if (info.name === v) {
          if (self.filter_info.template_ids !== '') {
            self.filter_info.template_ids += ',';
          }
          self.filter_info.template_ids += info.value;
        }
      });
    });
    this.$location.search({});
    this.$location.search(this.filter_info);
  }

  private getKeyTemplate() {
    return this.dataService.mall_template_getFilterTemplateList({}).then(res => {
      this.list_template_key = res.data;
      return this.list_template_key;
    });
  }

  private template_list: () => ng.IPromise<any> = () => {
    const param = {
      page: this.page,
      page_size: 20,
      filter_info: JSON.stringify(this.filter_info),
    };
    return this.dataService.mall_template_list(param).then(res => {
      this.total_items = res.data.count;
      this.item_list = res.data.list;
      return this.item_list;
    });
  }

  creatTemplate: (type: string, id: string, name: string, desc: string) => any = (type, id, name, desc) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-template.html'),
      controller: 'modalCreateTemplateController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        template_type: () => type,
        template_id: () => id || '',
        template_name: () => name || '',
        template_desc: () => desc || '',
      },
    });
    return modalInstance.result.then(params => {
      if (type == 'edit') {
        return this.dataService.mall_template_set({
          template_info: JSON.stringify(params),
        }).then(res => {
          this.Notification.success('编辑模块成功！');
          return this.template_list();
        });
      } else if (type == 'create') {
        return this.dataService.mall_template_add({
          template_info: JSON.stringify(params),
        }).then(res => {
          this.Notification.success('创建模块成功！');
          return this.template_list();
        });
      }

    });
  }
  //删除模板
  deleteTemplate: (id: number) => any = (id) => {
    this.seeModal.confirm('删除模块', '确定要删除该模块吗？', () => {
      this.dataService.mall_template_delete({
        template_id: id || 0,
      }).then(res => {
        this.Notification.success('删除模块成功！');
        return this.template_list();
      });
    });
  }
  //模板分配--选择KOL
  divideTemplate: (id: number, name: string) => any = (id, name) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-divide-template.html'),
      controller: 'modalDivideTemplateController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        template_id: () => id || 0,
        template_name: () => name || '',
      },
    });
    /*
    return modalInstance.result.then(params => {
      let p = JSON.stringify(params)
      this.divideTemplateSetting(id, p)
    })*/
  }
  /*
  //模板分配--多商城设置
  divideTemplateSetting: (id, param) => any = (id, param) =>{
    let modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-divide-template-setting.html'),
      controller: 'modalDivideTemplateSettingController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        template_id:() => id,
        kol_ids:() => param
      }
    })
    return modalInstance.result.then(params => {
    })
  }
  */

}
export const mallTempList: ng.IComponentOptions = {
  template: require('./mall-temp-list.template.html'),
  controller: mallTempListController,
};
