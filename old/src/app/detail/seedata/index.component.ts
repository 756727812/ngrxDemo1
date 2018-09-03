import * as angular from 'angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';
import { merge, findIndex } from 'lodash';

import { isProdEnv } from '../../utils';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../services/assert-service/assert.service.interface';

import './index.less';
import seedataConfig from './const';

export class Controller {
  static $inject: string[] = [
    '$scope',
    '$compile',
    '$window',
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];

  isUnApplyYet: boolean;
  isFree: boolean = true;
  ready: boolean;
  profileData: any;
  userinfo: any;
  sellerinfo: any;
  nowPrivList: any[];
  vipPrivList: any[];
  vipPrivilege: any[];

  constructor(
    private $scope: ng.IScope,
    private $compile: Function,
    private $window: ng.IWindowService,
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {}

  $onInit() {
    this.nowPrivList = seedataConfig.nowPrivilege;
    this.vipPrivilege = seedataConfig.vipPrivilege;
    this.vipPrivList = seedataConfig.vipPrivList;

    this.dataService.seller_getSellerDetail().then(res => {
      this.sellerinfo = res.data.seller_info;
    });

    this.dataService
      .shop_getXiaoDianPuUser() //
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

    this.dataService.seedata_recharge_userinfo().then(res => {
      this.userinfo = res.data;
    });
  }

  goSeedata() {
    if (isProdEnv()) {
      this.$window.open('http://data.xiaodianpu.com');
    } else {
      this.$window.open('http://seedata-test.seecsee.com:14180');
    }
  }

  applyRecharge: (title: string) => any = (title = '充值') => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      component: 'modalRecharge',
      resolve: {
        data: () => {
          return {
            title,
            type: 'seedata',
          };
        },
      },
    });

    return modalInstance.result.then((params: any[]) => {
      const modalInstance = this.$uibModal.open({
        animation: true,
        size: 'md',
        backdrop: 'static',
        component: 'modalRechargeResult',
        resolve: {},
      });
      return modalInstance.result.finally((params: any[]) => {
        this.$onInit();
      });
    });
  };

  free90Days: () => void = () => {
    this.dataService.seedata_free_90_days().then(res => {
      this.$onInit();
    });
  };
}

export const seedata: ng.IComponentOptions = {
  template: require('./index.template.html'),
  controller: Controller,
  bindings: {},
};
