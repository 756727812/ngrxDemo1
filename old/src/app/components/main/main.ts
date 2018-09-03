import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

import '../navBar/navBar.less'; // 将来 navBar 单独成组件

export class MainController1 implements ng.IComponentController {
  static $inject = [
    '$scope',
    '$q',
    '$routeParams',
    '$timeout',
    '$document',
    '$window',
    '$location',
    '$cookies',
    'dataService',
    'applicationService',
    'pluginsService',
    'Notification',
  ];

  operateOrderCount: any;
  userName: string;
  showPhoto: boolean;
  headimg: string;
  isYuqing: boolean;
  isWeKOL: boolean;
  isKolHome: boolean;
  isHotItem: boolean;
  isFashion: boolean;
  isOldC2C: boolean;
  isNewBrand: boolean;
  isShowOrder: boolean;
  pri_spe_kol: number;
  list_kol: any[];
  list_kol_super: any[];
  isRuHan: boolean = this.$cookies.get('seller_name') === '如涵';
  hideTopicItemNav: boolean = false;
  hideHotItemNav: boolean = false;

  private userPrivilege: string;

  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $timeout: ng.ITimeoutService,
    private $document: ng.IDocumentService,
    private $window: ng.IWindowService,
    private $location: ng.ILocationService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: IDataService,
    private applicationService: any,
    private pluginsService: any,
    private Notification: INotificationService,
  ) {}

  refreshParentMenuActiveByActiveSubMenu() {
    this.$timeout(() => {
      $('.nav.nav-sidebar .nav-active').removeClass('nav-active active');
      $('.nav.nav-sidebar .active:not(.nav-parent):not(span)')
        .closest('.nav-parent')
        .addClass('nav-active active');
      // .fa.arrow 有 active class 情况
      // $('.nav-parent:not(.active)').find('ul.collapse').each(function() {
      //   $(this).css('display', 'none')
      // })
    });
  }

  $onInit() {
    this.pri_spe_kol = 0;
    this.isOldC2C = false;
    this.userPrivilege = this.$cookies.get('seller_privilege');

    this.isNewBrand = false;
    this.isShowOrder = false;

    if (Number(this.userPrivilege) === 30) {
      this.isNewBrand = true;

      this.dataService.shop_checkCurrentStatus({}).then(res => {
        const data = res.data;
        if (Number(data.xdp_id) > 0 && Number(data.type) > 2) {
          this.isShowOrder = true;
        }
        this.$cookies.put('seller_xdpType', String(data.type));
      });
    } else {
      this.$cookies.remove('seller_xdpType');
    }

    this.$document.ready(() => {
      this.applicationService.init();
      this.pluginsService.init();
      this.$timeout(() => {
        $('.loader-overlay').addClass('loaded');
        $('body > section').animate({ opacity: 1 }, 400);
      }, 500);
      $('.nav.nav-sidebar .active:not(.nav-parent):not(span)')
        .closest('.nav-parent')
        .addClass('nav-active active');
      this.$scope.$on('$viewContentLoaded', () => {
        this.refreshParentMenuActiveByActiveSubMenu();
      });
      this.$timeout(() => {
        // window.addEventListener('offline', () => {
        //   this.goOffline()
        // })
        // window.addEventListener('online', () => {
        //   this.Notification.info('网络连接恢复！')
        // })
        // if (!navigator.onLine) {
        //   this.$timeout(() => {
        //     this.goOffline();
        //   },            300);
        // }
      });
    });

    this.$scope.$on(
      'operateOrderCount',
      (e, d) => (this.operateOrderCount = d),
    );

    this.$q
      .all([
        this.getUserHeadImg(),
        this.getOperateOrderCount(),
        this.getSellerKolInfo(),
        this.getFavourCount(),
      ])
      .then(() => this.refreshParentMenuActiveByActiveSubMenu());

    /**
     * 打印安全提示
     */
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '%c \u5b89\u5168\u8b66\u544a\uff01',
        'font-size:50px;color:red;-webkit-text-fill-color:red;-webkit-text-stroke: 1px black;',
      );
      console.log(
        '%c \u6b64\u6d4f\u89c8\u5668\u529f\u80fd\u4e13\u4f9b\u5f00\u53d1\u8005\u4f7f\u7528\u3002' +
          '\u82e5\u67d0\u4eba\u8ba9\u60a8\u5728\u6b64\u590d\u5236\u7c98\u8d34\u67d0\u5185\u5bb9' +
          '\u4ee5\u542f\u7528\u67d0\u0020\u0053\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u529f' +
          '\u80fd\u6216\u201c\u5165\u4fb5\u201d\u67d0\u4eba\u5e10\u6237\uff0c\u6b64\u4e3a\u6b3a' +
          '\u8bc8\uff0c\u4f1a\u4f7f\u5bf9\u65b9\u83b7\u6743\u8fdb\u5165\u60a8\u7684\u0020\u0053' +
          '\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u5e10\u6237\uff0c\u7ed9\u60a8\u9020\u6210' +
          '\u635f\u5931\u3002',
        'font-size: 20px;color:#333',
      );
    }
  }

  get showStoreConstructionDemo(): boolean {
    return this.$location.host() !== 'portal.xiaodianpu.com';
  }

  isActive: (viewLocation: string) => boolean = (...locationArr) => {
    // 兼容下不同页面的选中效果
    let forceActiveTab = this.$routeParams['force_active_tab'];
    if (forceActiveTab) {
      forceActiveTab = decodeURI(forceActiveTab);
      return locationArr.some(l => !!forceActiveTab.match(l));
    }
    return locationArr.some(l => this.$location.path().includes(l));
  };

  goToAccountPage() {
    this.$location.path('/personalInfo/account');
  }

  logout: () => ng.IPromise<any> = () =>
    this.dataService
      .auth_logout()
      .then(
        () => (this.$window.location.href = '/auth.html#!/entry?from=logout'),
      );

  // 更新选品库数字
  private getFavourCount: () => ng.IPromise<any> = () => {
    return this.dataService.updateFavourCount({});
  };

  /** 获取KOL的账号信息
   */
  private getSellerKolInfo: () => ng.IPromise<any> = () => {
    return this.dataService
      .kol_mgr_kolGetListWithSeller({
        platform_id: 1,
      })
      .then(res => {
        this.list_kol = res.data.list_kol;
        this.list_kol_super = res.data.list_kol_super;
      });
  };

  /**
   * 获取待操作订单计数
   */
  private getOperateOrderCount: () => ng.IPromise<any> = () => {
    if (
      this.userPrivilege === '30' ||
      this.userPrivilege === '1' ||
      this.userPrivilege === '5' ||
      this.userPrivilege === '7' ||
      this.userPrivilege === '10'
    ) {
      return this.dataService.orderv2_getOperateOrderCount().then(res => {
        this.operateOrderCount = res.data;
        return this.operateOrderCount;
      });
    }
    return this.$q.reject();
  };

  /**
   * 获取用户信息
   */
  private getUserHeadImg: () => ng.IPromise<string> = () =>
    this.dataService.seller_getSellerDetail().then(res => {
      this.userPrivilege = res.data.seller_info.seller_privilege;
      this.showPhoto = !!res.data.seller_info.show_photo_match_id || false;
      this.headimg = res.data.user_info.u_headimg
        ? res.data.user_info.u_headimg.indexOf('http') === -1
          ? '//img-qn.seecsee.com/' + res.data.user_info.u_headimg
          : res.data.user_info.u_headimg
        : '//static.seecsee.com/seego_backend/global/images/avatars/avatar.png';
      this.userName = res.data.seller_info.seller_name;
      if (res.data.seller_info.seller_privilege === '24') {
        this.isWeKOL = !res.data.seller_info.block_weiqushi_for_24;
        this.isFashion = !res.data.seller_info.block_fashion;
        this.isYuqing = !res.data.seller_info.block_yuqing;
        this.isKolHome = !res.data.seller_info.block_kolhome;
        this.isHotItem = !res.data.seller_info.block_hotitem;
        this.pri_spe_kol = Number(res.data.seller_info.pri_spe_kol);
        if (this.pri_spe_kol === 1) {
          this.$location.url('/fashion/material');
        }
      } else {
        this.isWeKOL = true;
        this.isFashion = true;
        this.isYuqing = true;
        this.isKolHome = true;
        this.isHotItem = true;
      }
      this.isOldC2C = res.data.seller_info.isOldC2C;
      if (Number(this.userPrivilege) === 30) {
        const { topic_item_flag, hot_item_flag } = res.data.seller_info;
        this.hideHotItemNav = Number(hot_item_flag) === 0;
        this.hideTopicItemNav = Number(topic_item_flag) === 0;
      }
      return this.headimg;
    });

  private goOffline: () => any = () =>
    this.Notification.info('网络连接失败，请检查网络后重试！');
}

export const main: ng.IComponentOptions = {
  template: require('./main.html'),
  controller: MainController1,
};
