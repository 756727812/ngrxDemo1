import * as angular from 'angular';
import { IDataService } from '../services/data-service/data-service.interface';
import { INotificationService } from '../services/notification/notification.interface';
import { ReportService } from '../services/report-service/report-service';
import MobileResponsive from '../utils/mobile-resposive';

import './register.less';

export class registerComponentController {
  static $inject: string[] = [
    '$q',
    '$window',
    '$routeParams',
    '$location',
    'dataService',
    '$interval',
    'Notification',
    '$cookies',
  ];

  // user_tag: string[] = this.USERTAG
  formData: any = {};
  email_validate_result: string;
  errors: string[];
  btn_disabled: boolean;
  is_term_checked: boolean;
  country_code_list: any[];
  verify_btn: {
    text: string;
    seconds: number;
    is_msg_sended: boolean;
  };
  validate_form: {
    country_code: string;
    code: string;
    captcha: string;
  };
  current_step: number;
  codeImg: string;
  isMobile: any;
  isBoolMobile: boolean;
  isFromSeeData = false;

  private counter: ng.IPromise<any>;

  constructor(
    private $q: ng.IQService,
    private $window: ng.IWindowService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $interval: ng.IIntervalService,
    private Notification: INotificationService,
    private $cookies: ng.cookies.ICookiesService,
  ) {
    // Plugin.handleiCheck()
    this.is_term_checked = true;
    this.btn_disabled = false;
    this.validate_form = {
      country_code: '86',
      code: '',
      captcha: '',
    };
    this.verify_btn = {
      text: '获取验证码',
      seconds: 60,
      is_msg_sended: false,
    };
    this.isMobile = this.$window.navigator.userAgent
      .toLowerCase()
      .indexOf('mobile');
    this.isBoolMobile = this.isMobile >= 0;
    this.current_step = ~~this.$routeParams['currentStep'] || 1;
    this.codeImg = '/api/auth/createCaptcha';
    this.isMobile >= 0 && $('body').css({ background: 'none' });
    const promises: ng.IPromise<any>[] = [this.getCountryCode()];
    this.$q.all(promises);
    if (sessionStorage.getItem('__isSeeData__') === '1') {
      this.isFromSeeData = true;
    }
  }
  $onInit() {
    MobileResponsive.start();
  }

  $onDestroy() {
    MobileResponsive.end();
  }
  signup: () => ng.IPromise<any> = () => {
    this.errors = [];
    if (!this.is_term_checked)
      this.errors.push('请同意遵守《See购服务商日常交易行为规范》');
    //if (!document.getElementById('terms')['checked']) this.errors.push('请同意遵守《See购服务商日常交易行为规范》')
    if (this.errors.length) return;
    this.btn_disabled = true;
    const params: any = {
      ...this.formData,
      country: this.validate_form.country_code,
      code: this.validate_form.code,
      seller_from: ~~ReportService.getReferSellerFrom() || undefined,
    };
    return this.dataService
      .authv2_registerXiaodianpu(params)
      .then(res => {
        // 从 See数 进来注册的用户，只需设置手机密码即可
        this.$location.path(this.isFromSeeData ? '/register/3' : '/register/2');
      })
      .catch(res => this.errors.push(res.msg))
      .finally(() => (this.btn_disabled = false));
  };
  getCaptcha: () => void = () => {
    this.codeImg = '/api/auth/createCaptcha?_' + new Date().getTime();
  };
  sendSmsCode: () => ng.IPromise<any> = () => {
    const params: any = {
      country: this.validate_form.country_code,
      mobile: this.formData.seller_mobile,
      captcha: this.validate_form.captcha,
      type: 1,
    };
    return this.dataService.auth_sendSmsCode(params).then(res => {
      this.Notification.success('验证码发送成功！');
      this.verify_btn.is_msg_sended = true;
      this.verify_btn.seconds = 60;
      this.counter = this.$interval(this.timer, 1000);
    });
  };

  private validateSms: () => ng.IPromise<any> = () => {
    const params: any = {
      country: this.validate_form.country_code,
      mobile: this.formData.seller_mobile,
      code: this.validate_form.code,
    };
    return this.dataService.auth_validateSms(params);
  };

  private timer: () => void = () => {
    this.verify_btn.seconds--;
    if (this.verify_btn.seconds <= 0) {
      this.$interval.cancel(this.counter);
      this.verify_btn.is_msg_sended = false;
      this.verify_btn.text = '获取验证码';
    }
  };
  private select: () => void = () => {
    console.log(12);
  };
  private getCountryCode: () => ng.IPromise<any> = () =>
    this.dataService.auth_getCountryCode().then(res => {
      this.country_code_list = res.data.map(o => {
        return {
          code: o.code,
          label: `${o.name} +${o.code}`,
          letter: o.letter,
        };
      });
      this.validate_form.country_code = '86';
      return this.country_code_list;
    });
  private copySuccess: () => void = () => {
    // this.Notification.success('复制成功！')
    alert('复制成功');
  };
}

export const registerComponent: ng.IComponentOptions = {
  controller: registerComponentController,
  template: require('./register.template.html'),
};
