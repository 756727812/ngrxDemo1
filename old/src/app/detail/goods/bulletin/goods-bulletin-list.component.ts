export class goodsBulletinListController implements ng.IComponentController {

  static $inject: string[] = ['$q', '$routeParams', 'dataService', 'Notification', 'seeModal'];

  private page: number = ~~this.$routeParams['page'] || 1;

  items: {
    list: any[],
    count: number,
  } = {
    list: [],
    count: 0,
  };

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: see.IDataService,
    private notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
  ) {}

  $onInit(): void {
    this.$q.all([this.getProductNoticeList()]);
  }

  switchStatus(id: number, status: number): void {
    const title = status === 1 ? '下线' : '启用';
    let statusToBe;
    if ([0, 2].includes(status)) {
      statusToBe = 1;
    } else if (status === 1) {
      statusToBe = 2;
    } else {
      throw new Error('未指定商详公告状态');
    }
    this.seeModal.confirmP(title, `确认${title}此公告吗？`)
      .then(() => this.setNoticeItemStatus(id, statusToBe))
      .then(() => this.getProductNoticeList())
      .catch(e => e);
  }

  private getProductNoticeList() {
    return this.dataService.productNotice_list({
      page: this.page,
      pageSize: 20,
    }).then(({ data }) => this.items = data);
  }

  private setNoticeItemStatus(id: number, status: number): ng.IPromise<any> {
    return this.dataService.productNotice_updateStatus({ id, status })
      .then(() => this.notification.success('操作成功！'));
  }
}

export const goodsBulletinList: ng.IComponentOptions = {
  template: require('./goods-bulletin-list.template.html'),
  controller: goodsBulletinListController,
};
