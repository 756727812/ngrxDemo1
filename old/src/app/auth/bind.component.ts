/// <reference path='../../../node_modules/@types/angular-route/index.d.ts' />
import * as angular from 'angular';
import { IDataService } from '../services/data-service/data-service.interface';
import { INotificationService } from '../services/notification/notification.interface';

export class BindComponentController {
  static $inject: string[] = [
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    '$interval',
    '$http',
  ];

  steps: string[] = ['手机验证', '绑定微信', '升级成功'];
  currentStep: number = ~~this.$routeParams['currentStep'] || 1;
  isGetSMSCodeBtnDisabled: boolean = false;
  getSMSCodeBtnText: string = '获取验证码';
  formData: {
    seller_mobile: string;
    code: string;
    captcha: string;
  };
  error: string;
  iFrameUrl: string = `https://seecsee.com/authority/loginByQRCode?platform=1&action=binding&host=${encodeURIComponent(
    window.location.protocol + '//' + window.location.host,
  )}`;
  codeImg: string = '/api/auth/createCaptcha';
  private stop: ng.IPromise<any> | undefined;
  private seconds: number = 60;

  constructor(
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $interval: ng.IIntervalService,
    private $http: ng.IHttpService,
  ) {}

  onSubmitStepOne: () => void = () => {
    this.dataService
      .authv2_bindSellerMobile({
        country: 86,
        seller_mobile: this.formData.seller_mobile,
        code: this.formData.code,
      })
      .then(response => {
        this.$location.path('/bind/2');
      })
      .catch(res => {
        this.error = res.msg;
        if (res.msg.includes('该手机号已经被绑定')) {
          this.getCaptcha();
        }
      });
  };

  onGetIn: () => void = () => {
    window.location.href = '/';
  };
  getCaptcha: () => void = () =>
    (this.codeImg = `/api/auth/createCaptcha?v=${new Date().getTime()}`);

  getSMSCode: (isMobileValid: boolean) => void = isMobileValid => {
    this.error = '';
    if (isMobileValid) {
      this.dataService
        .authv2_sendSmsCode({
          country: 86,
          mobile: this.formData.seller_mobile,
          captcha: this.formData.captcha,
          type: 2,
        })
        .then(response => {
          this.getSMSCodeBtnText = `${this.seconds}s`;
          this.startCountDown();
        })
        .catch(res => (this.error = res.msg));
    }
  };

  private stopCountDown: () => void = () => {
    if (angular.isDefined(this.stop)) {
      this.$interval.cancel(this.stop);
      this.stop = undefined;
      this.getSMSCodeBtnText = '获取验证码';
      this.isGetSMSCodeBtnDisabled = false;
    }
  };

  private startCountDown: () => void = () => {
    if (angular.isDefined(this.stop)) {
      return;
    }
    this.isGetSMSCodeBtnDisabled = true;
    let seconds = this.seconds;
    this.stop = this.$interval(() => {
      seconds -= 1;
      if (seconds > 0) {
        this.getSMSCodeBtnText = `${seconds}s`;
      } else {
        this.stopCountDown();
      }
    }, 1000);
  };
}

export const bindComponent: ng.IComponentOptions = {
  template: require('./bind.template.html'),
  controller: BindComponentController,
};
