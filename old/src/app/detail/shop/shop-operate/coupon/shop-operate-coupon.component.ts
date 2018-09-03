import * as moment from 'moment';
import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import './coupon.less';

export class ShopOperateCouponController implements ng.IComponentController {
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

  couponList: any[] = [];
  formData: {
    title: string;
  } = {
    title: '',
  };
  articleInfo: {
    title: string;
    article_id: number;
  };
  sellerPrivilege: string = this.$cookies.get('seller_privilege');
  isAdmin = this.sellerPrivilege === '7' ||
    this.sellerPrivilege === '10' ||
    this.sellerPrivilege === '25';
  kolId: number = this.isAdmin
    ? ~~this.$routeParams['kolId'] || undefined
    : ~~localStorage.getItem('kolId');

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onInit() {
    this.$q.all([this.getCouponList()]);
  }

  updateCouponListSort: (couponId: number, type: number) => ng.IPromise<any> = (
    couponId,
    type,
  ) =>
    this.dataService
      .couponv3_xiaodianpu_update({ couponId, type, kolId: this.kolId })
      .then(res => {
        this.Notification.success('移动成功！');
        return this.getCouponList();
      });

  removeCouponItem: (couponId: number) => ng.IPromise<any> = couponId =>
    this.seeModal
      .confirmP('删除确认', '确认在小电铺主页移除该优惠券？')
      .then(() =>
        this.dataService
          .couponv3_xiaodianpu_delete({ couponId, kolId: this.kolId })
          .then(res => {
            this.Notification.success('移除优惠券成功');
            return this.getCouponList();
          }),
      );

  openAddCouponModal: () => ng.IPromise<any> = () =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalShopOperateAddCoupon',
        resolve: {
          kolId: () => this.kolId,
          from: () => 'decoration',
        },
      })
      .result.then(r => r, () => this.getCouponList());

  private getCouponList: () => ng.IPromise<any> = () =>
    this.dataService
      .couponv3_xiaodianpu_configCouponV3List({
        kolId: this.kolId,
      })
      .then(
        res =>
          (this.couponList =
            res.data.list.map(item => ({
              ...item,
              avaliableTimeStart: new Date(item.avaliableTimeStart).getTime(),
              avaliableTimeEnd: new Date(item.avaliableTimeEnd).getTime(),
            })) || []),
      );
}

export const ShopOperateCoupon: ng.IComponentOptions = {
  template: require('./shop-operate-coupon.template.html'),
  controller: ShopOperateCouponController,
};
