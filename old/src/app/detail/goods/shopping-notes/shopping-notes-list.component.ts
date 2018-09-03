import './shopping-notes.less';

export class goodsShoppingNotesListController implements ng.IComponentController {

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
    this.$q.all([this.getShoppingNotesList()]);
  }

  switchStatus(id: number, status: number): void {
    const title = status === 1 ? '下线' : '启用';
    this.seeModal.confirmP(title, `确认${title}此模板吗？`)
      .then(() => this.setNotesItemStatus(id, Number(!status)))
      .then(() => this.getShoppingNotesList())
      .catch(e => e);
  }

  private getShoppingNotesList() {
    return this.dataService.notice_shopping_list({
      page: this.page,
      pageSize: 20,
    }).then(({ data }) => this.items = data);
  }

  private setNotesItemStatus(shoppingNoticeId: number, status: number): ng.IPromise<any> {
    return this.dataService.notice_shopping_switch_status({ shoppingNoticeId, status })
      .then(() => this.notification.success('操作成功！'));
  }
}

export const goodsShoppingNotesList: ng.IComponentOptions = {
  template: require('./shopping-notes-list.template.html'),
  controller: goodsShoppingNotesListController,
};
