import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
import './index-account.less';


export class indexAccountController {
  static $inject: string[] = ['$q', '$location', '$routeParams', '$cookies', 'dataService', 'Notification', 'seeModal'];
  secret: string = '';
  GACode: string = '';
  hasShop: any;
  isProShop: any;
  toApply: any;
  isC2C: any;
  isPgc: any;
  platform_info: Array<any>;
  fans_range: Array<any> = [];
  login_info: object = {};
  auth_info: object = {};
  account_info: object = {};
  xiaodianpu_info: any;
  isGaSecretOpen: boolean;
  isGaSecretOpenOrigin: boolean;
  applyData: object = {};
  showQR: any;
  qr: any;


  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: any,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
  ) {
    let promises: ng.IPromise<any>[];
    promises = [this.getSellerDetail(), this.getGAStatus(), this.applyWithdrawalQuery()];
    this.$q.all(promises);
  }

  $onInit() {
    this.isC2C = this.$cookies.get('seller_privilege') === '1' || this.$cookies.get('seller_privilege') === '30';
    this.isPgc = this.$cookies.get('seller_privilege') === '8';
    this.platform_info = [
      {
        id: 2,
        name: '微博',
        placeholder: '微博昵称',
        class: 'fa-weibo',
      },
      {
        id: 3,
        name: '知乎',
        placeholder: '知乎昵称',
        class: 'fa-user',
      },
      {
        id: 4,
        name: '豆瓣',
        placeholder: '用户昵称',
        class: 'fa-user',
      },
      {
        id: 5,
        name: 'Instagram',
        placeholder: '用户名称',
        class: 'fa-instagram',
      },
      {
        id: 6,
        name: 'Facebook',
        placeholder: '用户名称',
        class: 'fa-facebook-official',
      },
      {
        id: 7,
        name: 'Twitter',
        placeholder: '用户名称',
        class: 'fa-twitter',
      },
      {
        id: 8,
        name: 'Pinterest',
        placeholder: '用户名称',
        class: 'fa-pinterest',
      },
    ];
    this.fans_range = ['少于5000', '5000~2w', '2w~5w', '5w~10w', '10w~20w', '20w~50w', '50w~75w', '75w~100w', '100w以上'];
    this.xiaodianpu_info = [];
  }

  changeName() {
    return this.dataService.seller_modifySellerInfo(this.login_info).then(res => {
      this.getSellerDetail();
      this.Notification.success();
    });
  }

  private getSellerDetail = () => {
    return this.dataService.seller_getSellerDetailv2(false).then(res => {
      this.login_info = res.data.login_info;
      this.account_info = res.data.account_info;
      if (!res.data.account_info.seller_type) {
        this.account_info['seller_type'] = 3;
      }
      this.xiaodianpu_info = res.data.xiaodianpu_info;
      this.hasShop = res.data.xiaodianpu_info.length;
      if (this.hasShop) {
        this.getAuthInfo();
      }
      angular.forEach(this.platform_info, function (v1, k1) {
        angular.forEach(res.data.account_info.platform_info, function (v2, k2) {
          if (v1.id == v2.platform_type) {
            v1.is_set = true;
            v1.is_checked = true;
            // v1.name = v2.platform_name;
            v1.account_name = v2.account_name;
            v1.account_id = v2.account_id;
            v1.fans_count = v2.fans_count;
          }
        });
      });
    });
  }
  /**
   * 获取当前账号的谷歌验证状态
   */
  private getGAStatus = () => {
    return this.dataService.seller_isGaSecretOpen().then(res => {
      this.isGaSecretOpen = res.data.isOpen;
      this.isGaSecretOpenOrigin = angular.copy(res.data.isOpen);
    });
  }

  /*
   *获取当前小电铺状态
   */
  private getAuthInfo = () => {
    this.dataService.shop_checkCurrentStatus({}).then(res => {
      const type = res.data.type;
      if (type == 3) {
        this.isProShop = 1;
        this.dataService.xiaodianpu_getAuthResult({}).then(res => {
          this.auth_info = res.data;
        });
      }
    });
  }
  toApplyShop() {
    return this.toApply = 1;
  }
  // 提现信息
  private applyWithdrawalQuery = () => {
    return this.dataService.api_fms_withdrawal_apply_query().then(res => {
      this.applyData = res.data;
    }).catch(err => { });
  }

  withdrawalWarning() {
    this.seeModal.confirm('提醒', '请联系SEE管理员设置提现方式与账户', null, null, '知道了', '');
  }

  /**
   * 生成当前的secret，显示二维码
   */
  createGASecret() {
    this.isGaSecretOpen = true;
    this.dataService.seller_createGASecret().then(res => {
      this.secret = res.data.secret;
      this.showQR = true;
      this.qr = {
        v: 5,
        e: 'M',
        s: 200,
        data: res.data.qrcode,
      };
    },                                            err => this.isGaSecretOpen = false);
  }

  /**
   * 开启两步验证
   */
  saveGASecret() {
    this.dataService.seller_saveGASecret({
      secret: this.secret,
      code: this.GACode,
    }).then(res => {
      this.Notification.success('恭喜，两步验证开启成功！');
      this.isGaSecretOpenOrigin = true;
      this.isGaSecretOpen = true;
      this.showQR = false;
    });
  }

  // 数据接口对接还没完成
  // submitAccountForm () {
  //   let formData = this.account_info;
  //   let extra_platform_info = _.filter(this.platform_info, 'is_checked').map(o => {
  //     return {
  //       platform_type: o['id'],
  //       account_name: o['account_name'],
  //       account_id: o['account_id'],
  //       fans_count: o['fans_count']
  //     }
  //   })
  //   formData.platform_info = _.concat(formData.platform_info, extra_platform_info);
  //   //提交表单
  //   this.dataService.authv2_addAndUpdateInfo(formData).then(res => {
  //     // console.log(res);
  //     this.Notification.success();
  //   })
  // }

}

export const indexAccount: ng.IComponentOptions = {
  template: require('./index-account.template.html'),
  controller: indexAccountController,
};
