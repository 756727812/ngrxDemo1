import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';

// 供销弹框类型
export const enum DISTRIBUTE_MODAL_TYPE {
  APPLY = 1,
  AUDIT = 2,
  ADJUST_PRICE = 3,
  AUDIT_ADJUST_PRICE = 4,
  // ADMIN_DISTR = 5,              // 内部权限一键供货
  // EDIT_ADJUST_PRICE = 6,        // 在商品编辑页面调价
}

// 供销商品状态
export const enum DISTRIBUTE_APPLY_STATUS {
  AUDITING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
  ADJUSTING = 4,
  ADJUST_ACCEPT = 5,
  ADJUST_REJECT = 6,
  NO_MORE_DISTRIBUTE = 7,
}

export class Controller {
  static $inject: string[] = [
    '$window',
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    '$cookies',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];

  pageData: any;
  lastPageDataParams: any = null;
  is_admin: boolean;

  formData = {
    keyWord: this.$routeParams.keyWord || '',
  };

  keyword: string = '';
  nonSearchResult: boolean = false;
  submitedKeyword: string;
  loading: boolean = false;
  hasLastPageLoaded: boolean = false;
  ready = false;
  profile: any = null;
  distributeList: any = [];
  count: number;
  xdp_list: any = [];
  searchXdp: any;

  constructor(
    private $window: ng.IWindowService,
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private $cookies: ng.cookies.ICookiesService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {
    this.is_admin =
      $cookies.get('seller_privilege') === '7' ||
      $cookies.get('seller_privilege') === '10' ||
      $cookies.get('seller_privilege') === '25';
  }

  $onInit() {
    this.dataService.checkShopStatus({
      url: this.$location.path(),
      status: 'check_update',
    });
    if (this.$routeParams.status) {
      this.formData['status'] = this.$routeParams.status;
    }
    let promises = [this.getDistributionApplyList()];
    if (!this.is_admin) {
      promises = [...promises, this.getDistributeProfile()];
    }
    this.$q.all(promises).then(() => {
      if (this.$routeParams.xdp_id) {
        this.searchXdp = this.xdp_list.find(e => {
          return e.xdp_id === this.$routeParams.xdp_id;
        });
      }
    });
  }

  getDistributionApplyList() {
    const params = {
      ...this.formData,
      page: this.$routeParams.page || 1,
      sortType: this.$routeParams.sortType || 0,
      pageSize: 20,
      xdpId: this.$routeParams.xdp_id || '',
    };
    return this.dataService.cds_getDistributionApplyList(params).then(res => {
      this.distributeList = res.data.list;
      this.count = res.data.count;
    });
  }

  getXdpList: () => ng.IPromise<any> = () => {
    return this.dataService.user_getXdpList().then(res => {
      this.xdp_list = res.data;
    });
  };

  getDistributeProfile() {
    return this.dataService.cds_supplyProfile().then(res => {
      this.profile = res.data;
    });
  }

  exitDistribution(item) {
    this.seeModal
      .confirmP(
        '提示',
        require('./exit-distribution-warning.html'),
        '确定',
        '取消',
      )
      .then(() => {
        this.dataService
          .cds_exitDistribution({ applyId: item.id, itemId: item.itemId })
          .then(res => {
            this.Notification.success('退出分销成功');
            this.$onInit();
          });
      });
  }

  openDistrModal(item: any, type: number) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('../../modal/modal-distribution-info.html'),
      controller: 'modalDistributionInfoController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'distr-size',
      resolve: {
        item: () => item,
        modalType: () => type,
      },
    });
    return modalInstance.result;
  }

  // 调价(申请)
  adjustPrice(item) {
    this.openDistrModal(item, DISTRIBUTE_MODAL_TYPE.ADJUST_PRICE).then(
      params => {
        this.dataService
          .cds_editCommodityDistributionApply(params)
          .then(res => {
            if (!this.is_admin) {
              this.seeModal.confirm('提醒', res.msg, null, null, '知道了', '');
            }
            this.$onInit();
            this.Notification.success('修改成功');
          });
      },
    );
  }

  // 调价审核
  auditAdjustPrice(item) {
    this.openDistrModal(item, DISTRIBUTE_MODAL_TYPE.AUDIT_ADJUST_PRICE).then(
      params => {
        this.dataService.cds_auditDistributionApply(params).then(res => {
          this.$onInit();
        });
      },
      () => this.$onInit(),
    );
  }

  // 分销审核
  auditApply(item) {
    this.openDistrModal(item, DISTRIBUTE_MODAL_TYPE.AUDIT)
      .then(params => {
        this.dataService
          .cds_auditDistributionApply(params)
          .then(() => {
            return this.seeModal
              .confirmP('提示', '是否将该商品加入热门单品库?', '确认', '取消')
              .then(
                () => {
                  return this.dataService
                    .data_api_materialAddItems({ ids: params.itemId, is_v2: 1 })
                    .then(res =>
                      this.Notification.success('添加热门单品成功！'),
                    );
                },
                () => {
                  return this.$q.resolve();
                },
              );
          })
          .then(() => {
            // 审核接口
            this.Notification.success('通过审核成功');
            this.$onInit();
          });
      })
      .catch(err => {
        if (err === 'reject') {
          this.$onInit();
        }
      });
  }

  // 重新申请
  reapply(item) {
    this.openDistrModal(item, DISTRIBUTE_MODAL_TYPE.APPLY).then(params => {
      this.dataService.cds_applyCommodityDistribution(params).then(res => {
        this.seeModal.confirm('提醒', res.msg, null, null, '知道了', '');
        this.$onInit();
      });
    });
  }

  submitSearch: () => any = () => {
    if (this.searchXdp) {
      this.formData['xdp_id'] = this.searchXdp.xdp_id;
    }
    this.$location.search({
      ...this.$location.search(),
      ...this.formData,
      page: 1,
    });
  };

  resetSearch: () => any = () => {
    this.$location.search({});
  };

  changeOrder: (type: number) => any = type => {
    this.$location.search({
      ...this.$location.search(),
      ...this.formData,
      page: 1,
      sortType: type,
    });
  };
}

export const goodsDistributeList: ng.IComponentOptions = {
  template: require('./list.template.html'),
  controller: Controller,
  bindings: {},
};
