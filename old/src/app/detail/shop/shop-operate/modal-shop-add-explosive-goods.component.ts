export class ModalShopAddExplosiveGoodsController
  implements ng.IComponentController {
  static $inject: string[] = ['dataService', 'seeModal', 'Notification'];

  close: Function;
  dismiss: Function;
  formData: {
    type: 1 | 2 | 3;
    keyword?: string;
  } = {
    type: 3,
  };
  items: {
    list: any[];
    count: number;
    page: number;
  } = {
    list: [],
    count: 0,
    page: 1,
  };
  resolve: {
    addedGoodsListLength: number;
    kolId: number;
  };
  knownGoodsListLength: number;

  constructor(
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private Notification: see.INotificationService,
  ) {}

  $onInit() {
    this.getItemList();
    this.knownGoodsListLength = this.resolve.addedGoodsListLength;
  }

  ok: () => any = () => this.close();
  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  getItemList: (page?: number) => ng.IPromise<any> = (page = 1) =>
    this.dataService
      .xiaodianpu_getItemList({
        ...this.formData,
        page,
        kol_id: this.resolve.kolId,
      })
      .then(({ data }) => {
        this.items = {
          page,
          ...data,
        };
      });

  addExplosionItem: (item_id: number) => ng.IPromise<any> = item_id => {
    if (this.knownGoodsListLength === 10) {
      this.Notification.warn(
        '出于前端显示效果，小电铺当前只支持配置10个爆款商品',
      );
    } else {
      return this.dataService
        .xiaodianpu_addExplosionItem({
          item_id,
          kol_id: this.resolve.kolId,
        })
        .then(res => {
          this.knownGoodsListLength += 1;
          this.Notification.success('添加成功！');
          return this.getItemList(this.items.page);
        });
    }
  };

  cancelExplosionItem: (item_id: number) => ng.IPromise<any> = item_id =>
    this.seeModal.confirmP('取消添加', '确定取消添加该爆款商品吗？').then(() =>
      this.dataService
        .xiaodianpu_delExplosionItem({
          item_id,
          kol_id: this.resolve.kolId,
        })
        .then(res => {
          this.knownGoodsListLength -= 1;
          this.Notification.success('取消添加成功！');
          return this.getItemList(this.items.page);
        }),
    );
}

export const modalShopAddExplosiveGoods: ng.IComponentOptions = {
  template: require('./modal-shop-add-explosive-goods.template.html'),
  controller: ModalShopAddExplosiveGoodsController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
