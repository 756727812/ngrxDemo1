import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';

export class ShopOperateExplosiveGoodsController implements ng.IComponentController {
  static $inject: string[] = [
    '$q', '$routeParams', '$location', '$cookies', 'dataService', 'Notification', 'seeModal',
    '$uibModal',
  ];

  sellerPrivilege: string = this.$cookies.get('seller_privilege');
  isAdmin = this.sellerPrivilege === '7' || this.sellerPrivilege === '10'
  || this.sellerPrivilege === '25';
  explosiveGoodsList: any[] = [];
  formData: {
    kolId: number,
    title: string,
  } = {
    kolId: this.isAdmin ? (~~this.$routeParams['kolId'] || undefined) : undefined,
    title: '',
  };
  articleInfo: {
    title: string
    article_id: number,
  };

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) { }

  $onInit() {
    this.$q.all([
      this.getExplosionItem(),
    ]);
  }

  moveOrder: (from: number, to: number) => any = (from, to) => {
    const idList = this.explosiveGoodsList.map(o => o.id);
    const temp = idList[from];
    idList[from] = idList[to];
    idList[to] = temp;
    return this.sortExplosionItem(JSON.stringify(idList));
  }

  delExplosionItem: (item_id: number) => ng.IPromise<any> = item_id =>
    this.seeModal.confirmP('删除爆款商品', '确定删除该商品？')
      .then(() => this.dataService.xiaodianpu_delExplosionItem({
        item_id,
        kol_id: this.formData.kolId,
      }).then(res => {
        this.Notification.success('删除成功！');
        return this.getExplosionItem();
      }))

  updateExplosionITitle: (event: KeyboardEvent) => ng.IPromise<any> = event => {
    if (event.keyCode === 13) {
      return this.dataService.xiaodianpu_updateExplosionITitle({
        kol_id: this.formData.kolId,
        title: this.formData.title,
        article_id: this.articleInfo.article_id,
      }).then(res => this.Notification.success('更新标题成功！'));
    } else {
      return this.$q.reject();
    }
  }

  openAddGoodsModal: () => any = () => {
    this.$uibModal.open({
      size: 'lg',
      backdrop: 'static',
      component: 'modalShopAddExplosiveGoods',
      resolve: {
        addedGoodsListLength: () => this.explosiveGoodsList.length,
        kolId: () => this.formData.kolId,
      },
    }).result.then(e => e, () => this.getExplosionItem());
  }

  private getExplosionItem: () => ng.IPromise<any> = () =>
    this.dataService.xiaodianpu_getExplosionItem({
      kol_id: this.formData.kolId,
    }).then(res => {
      const data = res.data || {};
      this.explosiveGoodsList = data.item_list || [];
      this.articleInfo = data.article_info;
      this.formData.title = data.article_info ? data.article_info.title : '';
    })

  private sortExplosionItem: (idList: string) => ng.IPromise<any> = id_list =>
    this.dataService.xiaodianpu_sortExplosionItem({ id_list, kol_id: this.formData.kolId })
      .then(res => {
        this.Notification.success('移动成功！');
        return this.getExplosionItem();
      })
}

export const shopOperateExplosiveGoods: ng.IComponentOptions = {
  template: require('./shop-operate-explosive-goods.template.html'),
  controller: ShopOperateExplosiveGoodsController,
};
