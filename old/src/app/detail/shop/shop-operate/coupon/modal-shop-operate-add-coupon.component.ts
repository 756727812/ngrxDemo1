import * as _ from 'lodash';;
import * as moment from 'moment';

export class ModalShopOperateAddCouponController implements ng.IComponentController {

  static $inject: string[] = ['$q', 'dataService', 'seeModal', 'Notification'];

  close: Function;
  dismiss: Function;
  formData: {
    status?: number,
    type?: number,
    name?: string,
  } = {};
  items: {
    list: any[]
    count?: number
    page: number,
  } = {
    list: [],
    page: 1,
  };
  resolve: {
    kolId: number,
    from: string,
  };

  constructor(
    private $q: ng.IQService,
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private Notification: see.INotificationService,
  ) { }

  $onInit() {
    this.$q.all([
      this.getCouponList(),
    ]);
  }

  ok: () => any = () => this.close();

  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  getCouponList: (page?: number) => ng.IPromise<any> = (page = 1) => {
    // 创建抽奖团添加优惠券(from == groupon), 列表只显示抽奖团优惠券
    const params = {
      ...this.formData,
      page,
      pageSize: 10,
      status: this.formData.status || undefined,
      type: this.resolve.from === 'groupon' ? 3 : (this.formData.type || undefined),
      kolId: this.resolve.kolId,
    };
    return this.dataService.couponv3_xiaodianpu_list(params).then(({ data }) => {
      this.items = {
        page,
        list: data ? data.list.map(item => ({
          ...item,
          avaliableTimeStart: new Date(item.avaliableTimeStart).getTime(),
          avaliableTimeEnd: new Date(item.avaliableTimeEnd).getTime(),
          configed: this.resolve.from === 'groupon' ? false : item.configed,
        })) : [],
        count: data ? data.count : 0,
      };
    });
  }

  addCouponItem: (item: any) => ng.IPromise<any> = item => {
    if (this.resolve.from === 'decoration') {
      return this.dataService.couponv3_xiaodianpu_add({
        couponId: item.id,
        kolId: this.resolve.kolId,
      }).then(res => {
        this.Notification.success('添加优惠券成功');
        return this.getCouponList(this.items.page);
      });
    } else if (this.resolve.from === 'groupon') { // 创建抽奖团需要优惠券
      this.close({ $value: item });
    }
  }

  removeCouponItem: (couponId: number) => ng.IPromise<any> = couponId =>
    this.seeModal.confirmP('删除确认', '确认在小电铺主页移除该优惠券？')
      .then(() => this.dataService.couponv3_xiaodianpu_delete({
        couponId,
        kolId: this.resolve.kolId,
      }).then(res => {
        this.Notification.success('移除优惠券成功');
        return this.getCouponList(this.items.page);
      }))
}

export const ModalShopOperateAddCoupon: ng.IComponentOptions = {
  template: require('./modal-shop-operate-add-coupon.template.html'),
  controller: ModalShopOperateAddCouponController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
