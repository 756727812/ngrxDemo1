import * as _ from 'lodash';
import * as moment from 'moment';

interface IFormData {
  currentPageNo: number;
  pageSize: number;
  name?: string;
  status?: number;
  type?: number;
  avaliableTimeStart?: string;
  avaliableTimeEnd?: string;
  moneyPayer?: number | string;
}

interface IDateRange {
  startDate: moment.Moment;
  endDate: moment.Moment;
  options?: any;
}

export class EventCouponListV2Controller implements ng.IComponentController {
  static $inject: string[] = [
    '$location',
    '$routeParams',
    'dataService',
    'seeModal',
    '$cookies',
    'Notification',
  ];

  sellerPrivilege: string = this.$cookies.get('seller_privilege');
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
  urlFrom: string = this.$routeParams.from;
  formData: IFormData = {
    currentPageNo: ~~this.$routeParams['page'] || 1,
    pageSize: 20,
    name: this.$routeParams['name']
      ? decodeURIComponent(this.$routeParams['name'])
      : undefined,
    status: this.$routeParams['status'] || undefined,
    type: ~~this.$routeParams['type'] || undefined,
    moneyPayer: this.$routeParams['moneyPayer']
      ? this.$routeParams['moneyPayer']
      : undefined,
    avaliableTimeStart: this.dateRange.startDate
      ? this.dateRange.startDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined,
    avaliableTimeEnd: this.dateRange.endDate
      ? this.dateRange.endDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined,
  };
  isSuperAdmin = this.sellerPrivilege === '7';
  isElectAdmin = this.sellerPrivilege === '10';
  isAdmin = this.sellerPrivilege === '7' ||
    this.sellerPrivilege === '10' ||
    this.sellerPrivilege === '25';
  couponData: {
    list: any[];
    count: number;
  } = {
    list: [],
    count: 0,
  };
  kolId: string = this.$routeParams['kolId'];
  wechatId: string = this.$routeParams['wechatId'];
  hasSearchParams: boolean = !!(
    this.formData.name ||
    this.formData.status ||
    this.formData.moneyPayer ||
    this.formData.avaliableTimeEnd ||
    this.formData.avaliableTimeStart
  );

  constructor(
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private $cookies: ng.cookies.ICookiesService,
    private Notification: see.INotificationService,
  ) {}

  $onInit(): void {
    this.getCouponList();
  }

  submitSearch: () => ng.ILocationService = () =>
    this.$location.search({
      name: this.formData.name
        ? encodeURIComponent(this.formData.name)
        : undefined,
      status: this.formData.status || undefined,
      type: this.formData.type || undefined,
      startDate: this.dateRange.startDate
        ? this.dateRange.startDate.unix() * 1000
        : undefined,
      endDate: this.dateRange.endDate
        ? this.dateRange.endDate.unix() * 1000
        : undefined,
      moneyPayer: this.isAdmin
        ? this.formData.moneyPayer || undefined
        : undefined,
      kolId: ~~this.kolId,
    });

  terminateCoupon: (id: number) => ng.IPromise<any> = id =>
    this.seeModal
      .confirmP(
        '结束确认',
        '点击“结束”后，优惠券将不能被继续领取，但并不影响已领取的优惠券的使用。确认进行该操作？',
      )
      .then(() =>
        this.dataService.couponv3_end({ id }).then(() => {
          this.Notification.success('结束操作成功');
          return this.getCouponList();
        }),
      );

  reviewApply: (id: number, action: string) => ng.IPromise<any> = (
    id,
    action,
  ) => {
    const title = action === 'pass' ? '通过' : '拒绝';
    return this.seeModal
      .confirmP(`${title}确认`, `确定${title}该优惠券的申请？`)
      .then(() =>
        this.dataService.couponv3_review({ id, action }).then(res => {
          this.Notification.success(`${title}操作成功！`);
          return this.getCouponList();
        }),
      );
  };

  private getCouponList: () => ng.IPromise<any> = () =>
    this.dataService
      .couponv3_list({
        ...this.formData,
        moneyPayer:
          this.formData.moneyPayer === '1' || this.formData.moneyPayer === '2'
            ? ~~this.formData.moneyPayer
            : undefined,
      })
      .then(({ data }) => (this.couponData = data));
}

export const EventCouponListV2: ng.IComponentOptions = {
  template: require('./event-coupon-list-v2.template.html'),
  controller: EventCouponListV2Controller,
};
