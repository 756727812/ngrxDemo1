import * as _ from 'lodash';;

import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import MobileResponsive from '../../utils/mobile-resposive';

export class kolSignupController {

  private counter: ng.IPromise<any>;

  form_data: any = {};
  btn_disabled: boolean;
  is_term_checked: boolean;
  platform_info: Array<any> = [
    {
      id: 1,
      name: '微信',
      placeholder: '微信名称',
      class: 'fa-wechat',
      is_checked: true,
    }
  ];
  fans_range: string[];
  account_type: any;
  from_where: any;
  isMobile: boolean;

  static $inject: string[] = ['$q', '$window', '$location', '$interval', 'dataService', 'Notification'];
  constructor(
    private $q: ng.IQService,
    private $window: ng.IWindowService,
    private $location: ng.ILocationService,
    private $interval: ng.IIntervalService,
    // private Plugin: any,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) {
    this.is_term_checked = true;
    this.fans_range = ['少于5000', '5000~2w', '2w~5w', '5w~10w', '10w~20w', '20w~50w', '50w~75w', '75w~100w', '100w以上'];
    this.isMobile = this.$window.navigator.userAgent.toLowerCase().indexOf('mobile') >= 0;
    this.getAccountTypeList()
    this.getFromWhereList()
  }
  getAccountTypeList: () => ng.IPromise<any> = () => {
    return this.dataService.authv2_getAccountTypeList({}).then(
      res => {
        this.account_type = res.data;
      }
    )
  }
  getFromWhereList: () => ng.IPromise<any> = () => {
    return this.dataService.authv2_getFromWhereList({}).then(
      res => {
        this.from_where = res.data
      }
    )
  }
  signup: () => ng.IPromise<any> = () => {
    this.btn_disabled = true;

    this.form_data.platform_info = _.filter(this.platform_info, 'is_checked').map(o => {
      return {
        platform_type: o.id,
        account_name: o.account_name,
        account_id: o.account_id,
        fans_count: o.fans_count,
      };
    });

    const params: any = {
      ...this.form_data,
      platform_info: JSON.stringify(this.form_data.platform_info),
      seller_type: 4
    };
    return this.dataService.authv2_addAndUpdateInfo(params).then(
      res => {
        this.$location.path('/register/3');
      })
      .finally(() => this.btn_disabled = false);

  }
}

export const kolSignup: ng.IComponentOptions = {
  controller: kolSignupController,
  template: require('./kol-signup.template.html'),
};
