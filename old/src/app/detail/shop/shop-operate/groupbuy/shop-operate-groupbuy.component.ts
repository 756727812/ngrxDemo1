import * as moment from 'moment';
type IGroupBuy = {
  list: any[];
  count: number;
};

export class ShopOperateGroupBuyController implements ng.IComponentController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    '$cookies',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  groupBuy: IGroupBuy = {
    list: [],
    count: 0,
  };
  grouponcount: 0;
  formData: {
    title: string;
    type: number;
    keyword: string;
  } = {
    title: '',
    type: ~~this.$routeParams['type'] || 0,
    keyword: this.$routeParams['keyword'] || '',
  };
  articleInfo: {
    title: string;
    article_id: number;
  };
  showDate = [];
  sellerPrivilege: string = this.$cookies.get('seller_privilege');
  isAdmin = [7, 10, 25].includes(+this.sellerPrivilege);
  kolId: string = this.isAdmin
    ? this.$routeParams['kolId'] || undefined
    : localStorage.getItem('kolId');
  wechatId: string = this.isAdmin
    ? this.$routeParams['wechat_id'] || undefined
    : undefined;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onInit() {
    this.$q.all(this.getGroupBuyList());
  }

  updateGroupBuyListSort: (
    id: number,
    sortType: number,
  ) => ng.IPromise<IGroupBuy> = (id, sortType) =>
    this.dataService
      .groupon_config_sort({ id, sortType, kolId: this.kolId })
      .then(res => {
        this.Notification.success('移动成功！');
        return this.getGroupBuyList();
      });

  removeGroupBuyItem: (id: number) => ng.IPromise<IGroupBuy> = id =>
    this.seeModal
      .confirmP('删除确认', '确认在小电铺移出该拼团活动？')
      .then(() =>
        this.dataService
          .groupon_config_switchStatus({ id, kolId: this.kolId, isShow: 2 })
          .then(res => {
            this.Notification.success('移出拼团活动成功');
            return this.getGroupBuyList();
          }),
      );

  openAddGroupBuyModal: () => ng.IPromise<any> = () =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalShopOperateAddGroupBuy',
        resolve: {
          kolId: () => this.kolId,
          wechatId: () => this.wechatId,
        },
      })
      .result.then(r => r, () => this.getGroupBuyList());

  openSetShowTimeModal: (
    grouponActivityId: number,
    endTime: string,
    releaseTime: string,
  ) => ng.IPromise<IGroupBuy> = (grouponActivityId, endTime, releaseTime) =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalShopOperateSetPublishTime',
        resolve: {
          title: () => '显示',
          endTime: () => endTime,
          releaseTime: () => releaseTime,
        },
      })
      .result.then(releaseTime =>
        this.dataService
          .groupon_configSetReleaseTime({
            releaseTime,
            grouponActivityId,
          })
          .then(() => {
            this.Notification.success();
            return this.getGroupBuyList();
          }),
      );

  setDate(index) {
    this.showDate = [];
    this.showDate[index] = true;
  }
  unSetDate() {
    this.showDate = [];
    this.getGroupBuyList();
  }
  dateChange: (
    index: number,
    grouponActivityId: number,
    releaseTime: string,
  ) => any = (index, grouponActivityId, releaseTime) => {
    if (releaseTime == null) {
      this.Notification.warn('活动显示时间不能为空!');
      return false;
    }
    this.dataService
      .groupon_configSetReleaseTime({
        grouponActivityId,
        releaseTime: moment(releaseTime).format('YYYY-MM-DD HH:mm:ss'),
      })
      .then(() => {
        this.showDate[index] = false;
        return this.getGroupBuyList();
      });
  };

  submitSearch: () => ng.ILocationService = () => {
    const { type, keyword } = this.formData;
    return this.$location.search({
      ...this.$location.search(),
      keyword,
      type,
    });
  };

  private getGroupBuyList: () => ng.IPromise<any> = () =>
    this.dataService
      .groupon_config_addedList({
        page: ~~this.$routeParams['page'] || 1,
        pageSize: 20,
        kolId: this.kolId,
        ...this.formData,
      })
      .then(({ data }) => {
        this.groupBuy = data;
        this.grouponcount = data.count;
      });

  disabledDate(current) {
    return (
      current &&
      (current.getTime() < Date.now() - 86400000 ||
        current.getTime() === Date.now())
    );
  }
}

export const ShopOperateGroupBuy: ng.IComponentOptions = {
  template: require('./shop-operate-groupbuy.template.html'),
  controller: ShopOperateGroupBuyController,
  bindings: {
    grouponcount: '=',
  },
};
