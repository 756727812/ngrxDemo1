import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

// TODO 该登录账号名下未开通小电铺

export class ShopInfoController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  profileData: any;
  shopData: any;
  supplyData: any;
  ready: boolean;
  // 是否显示跟「用户小店铺信息」相关（已经申请小店铺）
  isUnApplyYet: boolean;
  unApplyXDP: boolean;

  constructor(private $q: ng.IQService,
              private $routeParams: ng.route.IRouteParamsService,
              private $location: ng.ILocationService,
              private dataService: IDataService,
              private Notification: INotificationService,
              private seeModal: ISeeModalService,
              private $uibModal: any) {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
  }

  $onInit() {
    // this.dataService.checkShopStatus({url:this.$location.path(), status: '' });
    this.dataService.shop_checkCurrentStatus()//
      .then(({ data }) => {
        // TODO remove
        // data.xdp_id = 0
        // <<<
        this.ready = true;
        this.isUnApplyYet = parseInt(<any>data.xdp_id, 10) === 0;
      });

    this.getData();
  }

  getData() {
    this.dataService.shop_getXiaoDianPuUser()//
      .then(({ data }) => {
        /*
         show_supply_data ：展示供货商品数据 1-展示；0-不展示
         h5_img：h5二维码；
         xdp_img：小电铺二维码；
         h5_url：h5商城 url 地址
         ；xdp_url：小电铺地址
         xdp_bind_flag: 1,   1-小程序绑定公众号；0-没有绑定
         "app_title": "测试账号",
         "img": 头像
         "type": 1,
         "type_str": "基础版",
         "is_auth": 1,
         "upgrade_img": 升级服务联系二维码
         "xdp_bind_flag": 1,
         "label_info": [{
         "label_id": 1,
         "label_name": "see引擎",
         "label_status": 1
         },...]
         */
        this.profileData = data;
      });
    this.dataService.shop_getXiaoDianPuData() //
      .then(({ data }) => {
        /*
         "enter_num":七日流量,
         "user_num":7日用户,
         "deal_item_num":7日成交,
         "onsale_item_num":在售商品数
         */
        this.shopData = data;
      });
    this.dataService.shop_getSupplyItemData() //
      .then(({ data }) => {
        this.supplyData = data;
      });
  }
}


export const shopInfo: ng.IComponentOptions = {
  template: require('./shop-info.template.html'),
  controller: ShopInfoController,
};

