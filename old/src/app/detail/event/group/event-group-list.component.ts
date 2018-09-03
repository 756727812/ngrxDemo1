import * as moment from 'moment';
import { merge } from 'lodash';
import { IDataService } from '../../../services/data-service/data-service.interface';
import { GoodsLinkInfoController } from '../../kol/article-goods/link-info/link-info.component';

type IFormData = {
  page: number;
  pageSize: number;
  activityName?: string;
  status?: number;
  type?: number;
  startTime?: string;
  endTime?: string;
  kolId?: number;
};

type IDateRange = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  options?: any;
};

type GroupTypeItem = {
  label: string;
  value: number;
};

type IGroupBuyData = {
  list: any[];
  count: number;
};

type IQrData = {
  publicNumberPath: string; //  公众号路径
  articlePath: string; // 小程序路径（文章）
  xiaochengxuCardImgUrl: string; // 小程序卡片配图

  articleAcodeUrl: string; //  文章-小程序URL ,
  articleQrcodeUrl: string; // 文章-二维码URL ,

  wxGroupAcodeUrl: string; //  微信群-小程序URL ,
  wxGroupQrcodeUrl: string; // 微信群-二维码URL

  scanAcodeUrl: string; // ("扫一扫-小程序URL")
  scanQrcodeUrl: string; //  扫一扫-二维码URL ,

  wxGroupShareAcodeUrl: string; // 微信群-分享-小程序URL
  wxGroupShareQrcodeUrl: string; // 微信群-分享-二维码URL
};

export class EventGroupListController implements ng.IComponentController {
  static $inject: string[] = [
    '$timeout',
    '$scope',
    '$location',
    '$routeParams',
    '$cookies',
    'dataService',
    'Notification',
  ];

  // sellerPrivilege: string = this.$cookies.get('seller_privilege');
  // 不使用公共方法，避免缓存问题
  sellerPrivilege: string = document.cookie.match(
    /(^| )seller_privilege=([^;]*)(;|$)/,
  )[2];
  isSuperAdmin = this.sellerPrivilege === '7';
  isElectAdmin = this.sellerPrivilege === '10';
  isKOLAdmin = this.sellerPrivilege === '25'; // 市场运营权限
  isAdmin = this.isSuperAdmin || this.isElectAdmin || this.isKOLAdmin;
  isNewBrand = this.sellerPrivilege === '30';
  kolId: string = this.$routeParams['kolId'];
  wechatId: string = this.$routeParams['wechat_id'];
  urlFrom: string = this.$routeParams.from;
  isDashboard: boolean =
    (this.isSuperAdmin && this.isElectAdmin && !this.kolId) ||
    this.urlFrom === 'sidebar';
  dateRange: IDateRange = {
    startDate: this.$routeParams['startDate']
      ? moment(+this.$routeParams['startDate'])
      : null,
    endDate: this.$routeParams['endDate']
      ? moment(+this.$routeParams['endDate'])
      : null,
    options: {
      eventHandlers: {
        'apply.daterangepicker': () => this.submitSearch(),
        'cancel.daterangepicker': () => {
          this.dateRange.startDate = this.dateRange.endDate = null;
          this.submitSearch();
        },
      },
      locale: {
        cancelLabel: '清空',
      },
    },
  };
  formData: IFormData = {
    kolId: ~~this.kolId || undefined,
    page: ~~this.$routeParams['page'] || 1,
    pageSize: 20,
    activityName: this.$routeParams['activityName']
      ? decodeURIComponent(this.$routeParams['activityName'])
      : undefined,
    status: ~~this.$routeParams['status'] || 0,
    type: ~~this.$routeParams['type'] || 0,
    startTime: this.dateRange.startDate
      ? this.dateRange.startDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined,
    endTime: this.dateRange.endDate
      ? this.dateRange.endDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined,
  };
  groupData: IGroupBuyData = {
    list: [],
    count: 0,
  };
  hasSearchParams: boolean = !!(
    this.formData.type ||
    this.formData.activityName ||
    this.formData.status ||
    this.formData.startTime ||
    this.formData.endTime
  );
  tooltipIsOpen: {
    [key: number]: boolean;
  } = {};
  groupTypeConst: {
    NORMAL: GroupTypeItem;
    LUCKY: GroupTypeItem;
    SUPER: GroupTypeItem;
    ROOKIE: GroupTypeItem;
    ATTRACT_NEW: GroupTypeItem;
  } = {
    NORMAL: {
      label: '普通拼团',
      value: 1,
    },
    ROOKIE: {
      label: '新人团',
      value: 2,
    },
    LUCKY: {
      label: '抽奖团',
      value: 3,
    },
    SUPER: {
      label: '超级团',
      value: 4,
    },
    ATTRACT_NEW: {
      label: '拉新团',
      value: 5,
    },
  };

  constructor(
    private $timeout: ng.ITimeoutService,
    private $scope: ng.IScope,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: see.IDataService,
    private notification: see.INotificationService,
  ) {}

  $onInit(): void {
    this.getGroupList();
  }

  onCopySuccess(itemId: number): void {
    this.tooltipIsOpen[itemId] = true;
    this.$timeout(() => {
      this.tooltipIsOpen[itemId] = false;
      this.$scope.$apply();
    }, 1000);
  }

  showGoodsLinks(item) {
    const { id: activityId, bannerUrl } = item;
    this.dataService
      .pathAQrUrl_getGroupon({ activityId }) //
      .then(({ data }) => {
        GoodsLinkInfoController.open(
          { xcxCardImgUrl: bannerUrl, ...data },
          { kolId: this.kolId, onlyXcx: true },
        );
      });
  }

  terminateGroupBuy: (
    activityId: number,
  ) => ng.IPromise<IGroupBuyData> = activityId =>
    this.dataService.groupon_activityForceClose({ activityId }).then(() => {
      this.notification.success();
      return this.getGroupList();
    });

  submitSearch: () => ng.ILocationService = () => {
    const { activityName, status, type } = this.formData;
    const { startDate, endDate } = this.dateRange;
    return this.$location.search({
      ...this.$location.search(),
      status,
      type,
      page: 1,
      activityName: activityName ? encodeURIComponent(activityName) : undefined,
      startDate: startDate ? startDate.unix() * 1000 : undefined,
      endDate: endDate ? endDate.unix() * 1000 : undefined,
    });
  };

  private getGroupList(): ng.IPromise<IGroupBuyData> {
    let p = 'groupon_activity_list';
    if (this.isDashboard) {
      p = 'grouponActivityAllList';
    }
    return this.dataService[p]({
      ...this.formData,
      type: this.formData.type || undefined,
    }).then(({ data }) => (this.groupData = data));
  }
}

export const EventGroupList: ng.IComponentOptions = {
  template: require('./event-group-list.template.html'),
  controller: EventGroupListController,
};
