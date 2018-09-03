type IShoppingNotesItem = {
  id?: number,
  name?: string,
  noticeImgUrl?: string,
  xdpIdList?: number[],
};

export class goodsShoppingNotesActionController implements ng.IComponentController {

  static $inject: string[] = [
    '$q', '$location', '$routeParams', 'dataService', 'seeUpload', 'Notification', '$uibModal',
  ];

  type: string;
  id: number = ~~this.$routeParams['id'];
  item: IShoppingNotesItem;
  formData: IShoppingNotesItem = {
    xdpIdList: [],
  };
  isSubmitting: boolean = false;

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: see.IDataService,
    private seeUpload: see.ISeeUploadService,
    private notification: see.INotificationService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onInit(): void {
    const promises: ng.IPromise<any>[] = [];
    if (this.type === 'edit') {
      promises.push(this.getShoppingNotesDetail());
    }
    this.$q.all(promises);
  }

  uploaImage(file: File): ng.IPromise<string> {
    return this.seeUpload.uploadAuthImage(file)
      .then(({ data }) => this.formData.noticeImgUrl = data);
  }

  openAddXDPList() {
    this.$uibModal.open({
      size: 'lg',
      backdrop: 'static',
      component: 'modalGoodsShoppingNotesAddXDP',
      resolve: {
        selectedShopList: () => this.formData.xdpIdList,
        from: () => 'shoppingNotes',
      },
    }).result.then(shopIDList => {
      this.formData.xdpIdList = shopIDList;
    }).catch(e => e);
  }

  getFormIsValid(): boolean {
    if (!this.formData.noticeImgUrl) {
      return false;
    }
    return true;
  }

  save(): ng.IPromise<any> {
    if (!this.getFormIsValid()) {
      return;
    }
    const params = {
      ...this.formData,
    };
    const func = this.type === 'add' ? this.addShoppingNotes : this.editShoppingNotes;
    this.isSubmitting = true;
    return func.call(this, params).then(() => {
      this.notification.success(`${this.type === 'add' ? '创建' : '更新'}购物须知成功！`);
      this.$location.path('/goods/shopping-notes');
    }).finally(() => {
      this.isSubmitting = false;
    });
  }

  private addShoppingNotes(params): ng.IPromise<any> {
    return this.dataService.notice_shopping_add(params);
  }

  private editShoppingNotes(params): ng.IPromise<any> {
    return this.dataService.notice_shopping_edit(params);
  }

  private getShoppingNotesDetail(): ng.IPromise<IShoppingNotesItem> {
    return this.dataService.notice_shopping_detail({ shoppingNoticeId: this.id })
      .then(({ data }) => {
        this.formData = {
          id: data.id,
          name: data.name,
          noticeImgUrl: data.noticeImgUrl,
          xdpIdList: data.xdpIdList,
        };
        return this.item = data;
      });
  }
}

export const goodsShoppingNotesAction: ng.IComponentOptions = {
  template: require('./shopping-notes-action.template.html'),
  controller: goodsShoppingNotesActionController,
  bindings: {
    type: '@',
  },
};
