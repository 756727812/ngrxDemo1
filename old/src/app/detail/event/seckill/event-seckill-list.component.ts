import * as moment from 'moment';
import { GoodsLinkInfoController } from '../../kol/article-goods/link-info/link-info.component';

type IFormData = {
  page: number;
  pageSize: number;
  activityName?: string;
  status?: number;
  kolId: number;
};

type IDateRange = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  options?: any;
};

type ISeckillData = {
  list: any[];
  count: number;
};

export class EventSeckillListController implements ng.IComponentController {
  static $inject: string[] = [
    '$timeout',
    '$scope',
    '$q',
    '$location',
    '$routeParams',
    '$cookies',
    'dataService',
    'seeModal',
    'Notification',
  ];

  sellerPrivilege: string = this.$cookies.get('seller_privilege');
  isSuperAdmin = this.sellerPrivilege === '7';
  isElectAdmin = this.sellerPrivilege === '10';
  isKOLAdmin = this.sellerPrivilege === '25'; // 市场运营权限
  isNewBrand = this.sellerPrivilege === '30';
  isAdmin = this.isSuperAdmin || this.isElectAdmin || this.isKOLAdmin;
  urlFrom: string = this.$routeParams.from;
  kolId: string = this.$routeParams['kolId'];
  wechatId: string = this.$routeParams['wechat_id'];
  formData: IFormData = {
    kolId: this.isAdmin ? ~~this.kolId : undefined,
    page: ~~this.$routeParams['page'] || 1,
    pageSize: 20,
    activityName: this.$routeParams['activityName']
      ? decodeURIComponent(this.$routeParams['activityName'])
      : undefined,
    status: ~~this.$routeParams['status'] || 0,
  };
  seckillData: ISeckillData = {
    list: [],
    count: 0,
  };
  hasSearchParams: boolean = !!(
    this.formData.activityName || this.formData.status
  );
  tooltipIsOpen: {
    [key: number]: boolean;
  } = {};

  constructor(
    private $timeout: ng.ITimeoutService,
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private notification: see.INotificationService,
  ) {}

  $onInit(): void {
    this.$q.all([this.getSeckillList()]);
  }

  onCopySuccess(itemId: number): void {
    this.tooltipIsOpen[itemId] = true;
    this.$timeout(() => {
      this.tooltipIsOpen[itemId] = false;
      this.$scope.$apply();
    }, 1000);
  }

  showGoodsLinks(item) {
    const { id: activityId, itemImgurl } = item;
    this.dataService
      .pathAQrUrl_getSeckill({ activityId }) //
      .then(({ data }) => {
        GoodsLinkInfoController.open(
          { xcxCardImgUrl: itemImgurl, ...data },
          { kolId: this.kolId, onlyXcx: true },
        );
      });
  }

  submitSearch: () => ng.ILocationService = () => {
    const { activityName, status } = this.formData;
    return this.$location.search({
      ...this.$location.search(),
      status: status || undefined,
      activityName: activityName ? encodeURIComponent(activityName) : undefined,
    });
  };

  terminateSeckill: (
    activityId: number,
  ) => ng.IPromise<ISeckillData> = activityId =>
    this.seeModal.confirmP('使失效', '确定使该秒杀活动失效？').then(() =>
      this.dataService.seckill_activityDown(activityId).then(() => {
        this.notification.success();
        return this.getSeckillList();
      }),
    );

  private getSeckillList: () => ng.IPromise<ISeckillData> = () =>
    this.dataService
      .seckill_activityActivities({
        ...this.formData,
        status: this.formData.status
          ? this.formData.status === 3 ? [3, 4] : [this.formData.status]
          : undefined,
      })
      .then(({ data }) => (this.seckillData = data));

  getWxacodeUrl(item) {
    if (item.wxacodeUrl) {
      return;
    }
    const { id: activityId } = item;
    this.dataService
      .ng_seckill_activity_setWxacodeUrl({ activityId, kolId: this.kolId })
      .then(({ data }) => {
        item.wxacodeUrl = data;
      });
  }
}

export const EventSeckillList: ng.IComponentOptions = {
  template: require('./event-seckill-list.template.html'),
  controller: EventSeckillListController,
};
