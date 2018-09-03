import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';

export class shopApplyController {
  page: string;
  lists: any[];
  total_items: number;
  data_check: any;
  keyword: string;
  type: string;
  in_contact: string;
  manager_status: string;
  auth_status: string;
  fans_count: string;
  seller_type: string;
  settlement_type: string;
  followUp: string = ''; // 跟进人
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    '$cookies',
    '$uibModal',
  ];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $cookies: any,
    private $uibModal: any,
  ) {
    this.data_check = false;
    this.dataService.shop_getApplyCheckConfig({}).then(res => {
      this.data_check = res.data;
    });

    this.manager_status = this.$routeParams['manager_status'] || '0';
    this.auth_status = this.$routeParams['auth_status'] || '0';
    this.in_contact = this.$routeParams['in_contact'] || '-1';
    this.keyword = this.$routeParams['keyword'] || '';
    this.page = this.$routeParams['page'] || '1';
    this.type = this.$routeParams['type'] || '';
    this.fans_count = this.$routeParams['fans_count'] || '';
    this.seller_type = this.$routeParams['seller_type'] || '';
    this.total_items = 0;
    let promises: ng.IPromise<any>[];
    promises = [this.getApplyList()];
    this.$q.all(promises);

    const seller_privilege = this.$cookies.get('seller_privilege');
    if (seller_privilege === '40') {
      this.followUp = 'xuhang@seeapp.com';
    }
    // console.log("seller_privilege===",seller_privilege);
  }

  filterByKeyWord() {
    this.$location.search(
      _.assign({}, this.$location.search(), {
        type: this.type,
        keyword: this.keyword,
        manager_status: this.manager_status,
        in_contact: this.in_contact,
        auth_status: this.auth_status,
        fans_count: this.fans_count,
        seller_type: this.seller_type,
        settlement_type: this.settlement_type,
      }),
    );
  }

  changeInContact(id, in_contact) {
    return this.dataService
      .xiaodianpu_updateInContact({
        id,
        in_contact,
      })
      .then(res => {
        this.Notification.success('修改洽谈状态成功');
        return this.getApplyList();
      });
  }

  changeApplyStatus(id, status, msg) {
    if (!this.data_check) {
      this.Notification.error('获取数据失败，请刷新页面');
      return;
    }

    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      template: require('./modal-check-apply.html'),
      controller: 'modalCheckApplyController',
      controllerAs: 'vm',
      resolve: {
        id: () => id,
        status: () => status,
        data_check: () => this.data_check,
        followUp: () => this.followUp,
      },
    });

    return modalInstance.result.then(params => {
      return this.getApplyList();
    });
  }

  checkApplyInfo(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      template: require('./modal-apply-info.html'),
      controller: 'modalApplyInfoController',
      controllerAs: 'vm',
      windowClass: 'shop-apply-modal',
      resolve: {
        id: () => id,
        data_check: () => this.data_check,
        followUp: () => this.followUp,
      },
    });

    // return modalInstance.result.then(params => {
    //     return this.getApplyList()
    // })
  }

  modifyApplyStatus(item){
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      template: require('./modal/modal-modify-settlement.html'),
      controller: 'modalModifySettlementController',
      controllerAs: 'vm',
      windowClass: 'modify-apply-modal',
      resolve: {
        id: () => item.id,
        status: () => 30,
        data_check: () => this.data_check,
        followUp: () => this.followUp,
      },
    });
  }

  openLog(item){
    console.log(item);
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      template: require('./modal/modal-logs.html'),
      controller: 'modalModifyLogsController',
      controllerAs: 'vm',
      windowClass: 'modify-logs-modal',
      resolve: {
        id: () => item.id,
      },
    });
  }

  private getApplyList() {
    const param: any = {
      type: this.type,
      page: this.page,
      page_size: 20,
      in_contact: this.in_contact,
      keyword: this.keyword,
      manager_status: this.manager_status,
      auth_status: this.auth_status,
      return_url: encodeURI(this.$location.url()),
      fans_count: this.fans_count,
      seller_type: this.seller_type,
    };
    return this.dataService.shop_getApplyList(param).then(res => {
      console.log(res.data);
      this.lists = res.data.list;
      this.total_items = res.data.count;
    });
  }
}

export const shopApply: ng.IComponentOptions = {
  template: require('./shop-apply.template.html'),
  controller: shopApplyController,
};
