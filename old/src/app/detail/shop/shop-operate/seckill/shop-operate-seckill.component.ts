import * as moment from 'moment';
import { omit } from 'lodash';
type ISeckillData = {
  list: any[];
  count: number;
};

export class ShopOperateSeckillController implements ng.IComponentController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$cookies',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  seckillData: ISeckillData = {
    list: [],
    count: 0,
  };
  seckillcount: 0;
  articleInfo: {
    title: string;
    article_id: number;
  };
  formData: {
    productName: string;
  } = {
    productName: this.$routeParams['productName'] || undefined,
  };
  showDate = [];
  sellerPrivilege: string = this.$cookies.get('seller_privilege');
  isAdmin = this.sellerPrivilege === '7' ||
    this.sellerPrivilege === '10' ||
    this.sellerPrivilege === '25';
  kolId: number = this.isAdmin
    ? ~~this.$routeParams['kolId'] || undefined
    : ~~localStorage.getItem('kolId');
  wechatId: string = this.isAdmin
    ? this.$routeParams['wechat_id'] || undefined
    : undefined;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: ng.cookies.ICookiesService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onInit() {
    this.$q.all([this.getSeckillList()]);
  }
  updateSeckillListSort: (
    id: number,
    sortType: number,
  ) => ng.IPromise<ISeckillData> = (id, sortType) =>
    this.dataService
      .seckill_configSort({ id, sortType, kolId: this.kolId })
      .then(res => {
        this.Notification.success('移动成功！');
        return this.getSeckillList();
      });
  removeSeckillItem: (id: number) => ng.IPromise<ISeckillData> = id =>
    this.seeModal
      .confirmP('删除确认', '确认在小电铺移出该秒杀活动？')
      .then(() =>
        this.dataService
          .seckill_activityToBanner({ id, toBanner: 2 })
          .then(res => {
            this.Notification.success('移出秒杀活动成功');
            return this.getSeckillList();
          }),
      );

  openAddSeckillModal: () => ng.IPromise<any> = () =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalShopOperateAddSeckill',
        resolve: {
          kolId: () => this.kolId,
          wechatId: () => this.wechatId,
        },
      })
      .result.then(r => r, () => this.getSeckillList());

  openSetPublishTimeModal: (
    id: number,
    endTime: string,
    releaseTime: string,
  ) => ng.IPromise<ISeckillData> = (id, endTime, releaseTime) =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalShopOperateSetPublishTime',
        resolve: {
          title: () => '发布',
          endTime: () => endTime,
          releaseTime: () => releaseTime,
        },
      })
      .result.then((releaseTime: Date) => this.setPublishTime(id, releaseTime))
      .catch(e => e);

  setDate(index) {
    this.showDate = [];
    this.showDate[index] = true;
  }
  unSetDate() {
    this.showDate = [];
    this.getSeckillList();
  }
  dateChange: (index: number, id: number, releaseTime: string) => any = (
    index,
    id,
    releaseTime,
  ) => {
    if (releaseTime == null) {
      this.Notification.warn('活动显示时间不能为空!');
      return false;
    }
    this.dataService
      .seckill_configSetReleaseTime({
        id,
        releaseTime: moment(releaseTime).format('YYYY-MM-DD HH:mm:ss'),
      })
      .then(() => {
        this.showDate[index] = false;
        return this.getSeckillList();
      });
  };
  submitSearch: () => ng.ILocationService = () => {
    const { productName } = this.formData;
    return this.$location.search({
      ...this.$location.search(),
      productName,
    });
  };
  get searchParams() {
    return Object.values(omit(this.$location.search(), 'page'));
  }
  private getSeckillList: () => ng.IPromise<any> = () =>
    this.dataService
      .seckill_activityActivities({
        page: ~~this.$routeParams['page'] || 1,
        pageSize: 20,
        kolId: this.kolId,
        toBanner: 1,
        ...this.formData,
      })
      .then(({ data }) => {
        this.seckillData = data;
        this.seckillcount = data.count;
      });

  private setPublishTime: (
    id: number,
    releaseTime: Date,
  ) => ng.IPromise<ISeckillData> = (id, releaseTime) =>
    this.dataService
      .seckill_activitySetRelease({ id, releaseTime })
      .then(() => {
        this.Notification.success();
        return this.getSeckillList();
      });

  disabledDate(current) {
    return (
      current &&
      (current.getTime() < Date.now() - 86400000 ||
        current.getTime() === Date.now())
    );
  }
}

export const ShopOperateSeckill: ng.IComponentOptions = {
  template: require('./shop-operate-seckill.template.html'),
  controller: ShopOperateSeckillController,
  bindings: {
    seckillcount: '=',
  },
};
