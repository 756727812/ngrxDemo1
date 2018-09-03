type IItems = {
  list: any[],
  count: number,
  page: number,
};

export class ModalShopOperateAddSeckillController implements ng.IComponentController {

  static $inject: string[] = ['dataService', 'seeModal', 'Notification'];

  close: Function;
  dismiss: Function;
  items: IItems = {
    list: [],
    count: 0,
    page: 1,
  };
  resolve: {
    kolId: number
    wechatId: number,
  };
  hideList: boolean = false;

  constructor(
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private Notification: see.INotificationService,
  ) {}

  $onInit() {
    this.getSeckilList();
  }

  ok: () => any = () => this.close();

  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  getSeckilList: (page?: number) => ng.IPromise<IItems> = (page = 1) =>
    this.dataService.seckill_activityActivities({
      page,
      pageSize: 10,
      kolId: this.resolve.kolId,
      status: [1, 2],
    }).then(({ data: { list, count } }) => this.items = { list, count, page })

  addSeckillItem: (id: number) => ng.IPromise<IItems> = id => this.switchStatus(id, 1);

  removeSeckillItem: (id: number) => ng.IPromise<IItems> = id =>
    this.seeModal.confirmP('删除确认', '确认移出该秒杀活动？')
      .then(() => this.switchStatus(id, 2))

  private switchStatus: (id: number, toBanner: 1 | 2) => ng.IPromise<IItems> = (id, toBanner) =>
    this.dataService.seckill_activityToBanner({ id, toBanner }).then(({ data }) => {
      this.Notification.success(`${toBanner === 1 ? '添加' : '移出'}秒杀活动成功`);
      return this.getSeckilList(this.items.page);
    })
}

export const ModalShopOperateAddSeckill: ng.IComponentOptions = {
  template: require('./modal-shop-operate-add-seckill.template.html'),
  controller: ModalShopOperateAddSeckillController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
