import { includes, remove, get } from 'lodash';
import { checkFn, CODES } from '../../../utils/permission-helper';
import { NzModalService } from 'ng-zorro-antd';
import { ModalShowUpgradeInfoComponent } from 'app/detail/shop/shop-operate/modal-show-upgrade-info.component';
import { stringify } from 'query-string';

const TAB_TYPE = {
  SHOP_BANNER: 'shopBanner',
  VIDEO: 'video',
  EVENT_BANNER: 'eventBanner',
  GROUP: 'group',
  EXPLOSIVE_GOODS: 'explosiveGoods',
  COUPON: 'coupon',
  SECKILL: 'seckill',
  GROUPBUY: 'groupbuy',
  INTERLINK: 'interlink',
};

export class ShopOperateController implements ng.IComponentController {
  static $inject: string[] = [
    'reportService',
    '$routeParams',
    '$location',
    'dataService',
    '$uibModal',
    'seeModal',
    'shopService',
    'NzModalService',
  ];

  hash: string = this.$location.hash() || 'shopBanner';
  tabs: {
    heading: string;
    type: string;
    desc: string;
    img: string;
  }[] = [
    {
      heading: '店铺Banner',
      type: TAB_TYPE.SHOP_BANNER,
      desc: '可用于店铺调性展示',
      img:
        '//static.seecsee.com/seego_plus/images/shop-operate-shop-banner.jpg',
    },
    {
      heading: '视频',
      type: TAB_TYPE.VIDEO,
      desc: '',
      img: '',
    },
    {
      heading: '活动Banner',
      type: TAB_TYPE.EVENT_BANNER,
      desc: '可用于店铺活动推广',
      img:
        '//static.seecsee.com/seego_plus/images/shop-operate-activity-banner.jpg',
    },
    {
      heading: '优惠券',
      type: TAB_TYPE.COUPON,
      desc: '',
      img:
        '//static.seecsee.com/seego_plus/images/shop-operate-coupon-banner.jpg',
    },
    {
      heading: '秒杀',
      type: TAB_TYPE.SECKILL,
      desc: '',
      img:
        '//static.seecsee.com/seego_plus/images/shop-operate-seckill-config.jpg',
    },
    {
      heading: '爆款商品',
      type: TAB_TYPE.EXPLOSIVE_GOODS,
      desc: '可用于店铺主打商品推广',
      img:
        '//static.seecsee.com/seego_plus/images/shop-operate-explosive-goods.jpg',
    },
    {
      heading: '拼团',
      type: TAB_TYPE.GROUPBUY,
      desc: '',
      img:
        '//static.seecsee.com/seego_plus/images/shop-operate-groupon-buy.png',
    },
    {
      heading: '商品分组',
      type: TAB_TYPE.GROUP,
      desc: '可用于小电铺商品的快速定位',
      img:
        '//static.seecsee.com/seego_plus/images/shop-operate-group-config.png',
    },
    {
      heading: '商城互链',
      type: TAB_TYPE.INTERLINK,
      desc: '',
      img: '',
    },
  ];
  profileData: any;
  xdpInfo: any;
  TAB_TYPE = TAB_TYPE;
  kolId?: string;
  shopBannerDirty: boolean = false;
  activityBannerDirty: boolean = false;
  seckillcount: number = 0;
  grouponcounts: number = 0;
  isQuhaodian: boolean = localStorage.getItem('is_quhaodian') === '1';
  constructor(
    private reportService: see.IReportService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private seeModal: see.ISeeModalService,
    private shopService: any,
    private modalService: NzModalService,
  ) {}

  get isKolOrNewBand() {
    return checkFn([CODES.KOL, CODES.New_Brand])();
  }

  $onInit() {
    if (this.$routeParams.kolId) {
      this.kolId = this.$routeParams.kolId;
    }
    Promise.all([
      this.getXiaoDianPuUser(this.kolId),
      this.getXdpInfo(this.kolId),
    ]).then(() => {
      this.checkShopStatus();
    });
  }

  shouldShowTav(tabItem: { type: string }) {
    if (!this.isKolOrNewBand) {
      // 超管
      return [
        TAB_TYPE.GROUP,
        TAB_TYPE.COUPON,
        TAB_TYPE.GROUPBUY,
        TAB_TYPE.SHOP_BANNER,
        TAB_TYPE.EVENT_BANNER,
        TAB_TYPE.SECKILL,
        TAB_TYPE.VIDEO,
        TAB_TYPE.INTERLINK,
        TAB_TYPE.EXPLOSIVE_GOODS,
      ].includes(tabItem.type);
    }
    return [
      TAB_TYPE.SHOP_BANNER,
      TAB_TYPE.EVENT_BANNER,
      TAB_TYPE.COUPON,
      TAB_TYPE.EXPLOSIVE_GOODS,
      TAB_TYPE.GROUP,
      TAB_TYPE.GROUPBUY,
      TAB_TYPE.SECKILL,
    ].includes(tabItem.type);
  }

  selectTab(obj) {
    console.log(this.$location);
    if (this.isTabTypeActive(obj.type)) {
      return false;
    }
    if (
      (this.isTabTypeActive(TAB_TYPE.SHOP_BANNER) && this.shopBannerDirty) ||
      (this.isTabTypeActive(TAB_TYPE.EVENT_BANNER) && this.activityBannerDirty)
    ) {
      return new Promise(resolve => {
        this.seeModal.confirm(
          '确认提示',
          '确定要退出 Banner 配置？退出后，未保存的信息将不会保留',
          resolve,
        );
      });
    }
    return true;
  }

  isTabTypeActive(tabType: string) {
    return this.hash === tabType;
  }

  openShopAccessInfo() {
    this.$uibModal.open({
      animation: true,
      size: 'shop-access-info',
      component: 'modalShopAccessInfo',
      resolve: {
        data: () => this.profileData,
      },
    });
  }

  openEntireShow() {
    this.seeModal.confirmP(
      '整体案例展示',
      // tslint:disable-next-line:max-line-length
      '<div class="text-center"><img src="//static.seecsee.com/seego_plus/images/shop-operate-long-img-show.jpg" see-viewer /></div>',
      '',
      false,
    );
  }

  showModalForComponent() {
    if (this.shopService.isShowUpgradeInfo) {
      return;
    }

    if (this.isQuhaodian) {
      const wechatId = get(this.profileData, 'xdp_info.wechat_id', 0);
      const kolId = get(this.profileData, 'xdp_info.kol_id');
      const xdpId = get(this.profileData, 'xdp_info.xdp_id');
      const path = `/kol-v2/kol-cooperation-management/${kolId}/${wechatId ||
        0}/micro-page`;
      let search = {};
      if (xdpId) {
        search = { xdpId };
      }
      this.$location.path(path).search(search);
      return;
    }

    this.modalService.open({
      title: '版本更新',
      content: ModalShowUpgradeInfoComponent,
      footer: false,
      componentParams: {
        queryParams: {
          wechatId: get(this.profileData, 'xdp_info.wechat_id', 0),
          xdpId: get(this.profileData, 'xdp_info.xdp_id'),
          source: this.$routeParams['source'],
          kolId: get(this.profileData, 'xdp_info.kol_id'),
        },
      },
    });
    this.shopService.isShowUpgradeInfo = true;
  }

  private getXiaoDianPuUser(kol_id: string = null): ng.IPromise<any> {
    return this.dataService
      .shop_getXiaoDianPuUser(kol_id ? { kol_id } : null) //
      .then(({ data }) => (this.profileData = data));
  }

  private getXdpInfo(kol_id: string = null): ng.IPromise<any> {
    return this.dataService
      .shop_getXdpInfo(kol_id ? { kol_id } : null) //
      .then(({ data }) => (this.xdpInfo = data));
  }

  private checkShopStatus(): ng.IPromise<any> {
    if (this.xdpInfo.xdp_id > 0) {
      return this.dataService
        .checkShopStatus({
          url: this.$location.path(),
          status: '',
        })
        .then(({ data }) => {
          this.showModalForComponent();
        });
    }
  }
}

export const shopOperate: ng.IComponentOptions = {
  template: require('./shop-operate.template.html'),
  controller: ShopOperateController,
};
