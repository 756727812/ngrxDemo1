type GroupTypeItem = {
  label: string;
  value: number;
};

export class ModalShopOperateAddGroupBuyController
  implements ng.IComponentController {
  static $inject: string[] = ['$q', 'dataService', 'seeModal', 'Notification'];

  close: Function;
  dismiss: Function;
  formData: {
    type: number;
    keyword: string;
  } = {
    type: 0,
    keyword: '',
  };
  items: {
    list: any[];
    count?: number;
    page: number;
  } = {
    list: [],
    page: 1,
  };
  resolve: {
    kolId: number;
    wechatId: number;
  };
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
    private $q: ng.IQService,
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private Notification: see.INotificationService,
  ) {}

  $onInit() {
    this.$q.all([this.getGroupBuyList()]);
  }

  ok: () => any = () => this.close();

  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  getGroupBuyList: (page?: number) => ng.IPromise<any> = (page = 1) => {
    const params = {
      ...this.formData,
      page,
      pageSize: 10,
      kolId: this.resolve.kolId,
    };
    return this.dataService
      .groupon_config_allList(params)
      .then(({ data: { list, count } }) => {
        this.items = { list, count, page };
      });
  };

  addGroupBuyItem: (id: number) => ng.IPromise<any> = id =>
    this.switchStatus(id, 1);

  removeGroupBuyItem: (id: number) => ng.IPromise<any> = id =>
    this.seeModal
      .confirmP('删除确认', '确认移出该拼团活动？')
      .then(() => this.switchStatus(id, 2));

  private switchStatus: (id: number, isShow: number) => ng.IPromise<any> = (
    id,
    isShow,
  ) =>
    this.dataService
      .groupon_config_switchStatus({
        id,
        isShow,
        kolId: this.resolve.kolId,
      })
      .then(({ data }) => {
        this.Notification.success(
          `${isShow === 1 ? '添加' : '移出'}拼团活动成功`,
        );
        return this.getGroupBuyList(this.items.page);
      });
}

export const ModalShopOperateAddGroupBuy: ng.IComponentOptions = {
  template: require('./modal-shop-operate-add-groupbuy.template.html'),
  controller: ModalShopOperateAddGroupBuyController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
