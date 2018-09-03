import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

import './asset-new-info.less';

export class assetNewInfoController {
  data: any;
  withdrawalData: any;
  applyData: any;
  profileData: any;
  shopData: any;
  supplyData: any;
  isUnApplyYet: boolean;
  header: any;
  b_get_header: boolean;
  isOldC2C: boolean;
  isC2C: boolean;
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {}

  $onInit() {
    this.dataService.checkShopStatus({
      url: this.$location.path(),
      status: '',
    });
    let promises: ng.IPromise<any>[];
    promises = [
      this.accountProfile(),
      this.withdrawalQuery(),
      this.applyWithdrawalQuery(),
      this.getXiaodianpuData(),
      this.getSellerDetail(),
      this.getShopData(),
    ];
    this.$q.all(promises);

    this.dataService
      .shop_checkCurrentStatus() //
      .then(({ data }) => {
        // TODO remove
        // data.xdp_id = 0
        //
        this.isUnApplyYet = data.xdp_id == 0;
      });
    this.isOldC2C = false;
  }

  getShopData() {
    return this.dataService
      .shop_getXiaoDianPuData() //
      .then(({ data }) => {
        /*
          "enter_num":七日流量,
          "user_num":7日用户,
          "deal_item_num":7日成交,
          "onsale_item_num":在售商品数
        */
        this.shopData = data;
      })
      .then(() => this.dataService.shop_getSupplyItemData())
      .then(({ data }) => {
        this.supplyData = data;
      });
  }

  accountProfile: () => ng.IPromise<any> = () => {
    return this.dataService
      .api_fms_accountProfile()
      .then(res => {
        this.data = res.data;
      })
      .catch(err => {});
  };

  withdrawalQuery: () => ng.IPromise<any> = () => {
    return this.dataService.api_fms_withdrawal_survey_query().then(res => {
      this.withdrawalData = res.data;
    });
  };

  applyWithdrawalQuery: () => ng.IPromise<any> = () => {
    return this.dataService
      .api_fms_withdrawal_apply_query()
      .then(res => {
        this.applyData = res.data;
      })
      .catch(err => {});
  };

  applyWithdrawals: () => any = () => {
    if (!this.applyData.account || !this.applyData.withdrawalType) {
      // TODO 后台去掉判断
      this.seeModal.confirm(
        '提醒',
        '请联系SEE管理员设置提现方式与账户',
        null,
        null,
        '确定',
        '',
      );
    } else if (this.data.availableAmount > 0) {
      this.$location.path('/assetNew/withdrawals');
    } else {
      this.seeModal.confirm(
        '提醒',
        '抱歉，您的余额不足，不可提现',
        null,
        null,
        '确定',
        '',
      );
    }
  };

  applyRecharge: () => any = () => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      component: 'modalRecharge',
      resolve: {
        data: () => {
          return {
            title: '充值'
          }
        }
      },
    });

    return modalInstance.result.then((params: any[]) => {
      const modalInstance = this.$uibModal.open({
        animation: true,
        size: 'md',
        backdrop: 'static',
        component: 'modalRechargeResult',
        resolve: {

        },
      });
      return modalInstance.result.then((params: any[]) => {}).finally(() => {
        this.$onInit();
      });
    });
  };

  getXiaodianpuData() {
    return this.dataService
      .shop_getXiaoDianPuUser() //
      .then(({ data }) => {
        this.profileData = data;
      });
  }

  getSellerDetail() {
    return this.dataService.seller_getSellerDetail().then(res => {
      this.isOldC2C = res.data.seller_info.isOldC2C;
      this.isC2C = res.data.seller_info.seller_privilege == 1;
    });
  }
}

export const assetNewInfo: ng.IComponentOptions = {
  template: require('./asset-new-info.template.html'),
  controller: assetNewInfoController,
};
