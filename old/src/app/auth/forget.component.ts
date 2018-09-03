import * as angular from 'angular'
import { IDataService } from '../services/data-service/data-service.interface'
import { INotificationService } from '../services/notification/notification.interface'

export class ForgetComponentController {

  static $inject: string[] = ['$routeParams', '$location', 'dataService', 'Notification', '$interval']

  steps: string[] = ['验证身份', '重置登录密码', '重置成功']
  currentStep: number = ~~this.$routeParams['currentStep'] || 1
  isGetSMSCodeBtnDisabled: boolean = false
  getSMSCodeBtnText: string = '获取验证码'
  formData: {
    seller_mobile: string,
    code: string,
    captcha: string
  }
  form2Data: {
    seller_pwd: string,
    seller_confirm_pwd: string
  }
  error: string
  sellerMobile: string = this.$routeParams['seller_mobile']
  codeImg: string = '/api/auth/createCaptcha'
  private stop: ng.IPromise<any> | undefined
  private seconds: number = 60

  constructor(
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $interval: ng.IIntervalService
  ) { }

  $onInit() {
    this.error = ''
    if (!angular.isDefined(this.sellerMobile) && this.currentStep === 2) {
      this.$location.path('/forget/1')
    }
  }

  onSubmitStepOne: () => void = () => {
    this.dataService.auth_resetPasswdStep1({
      seller_mobile: this.formData.seller_mobile,
      code: this.formData.code
    }).then(response => {
      this.$location.path('/forget/2').search('seller_mobile', this.formData.seller_mobile)
    }).catch(res => this.error = res.msg)
  }

  onSubmitStepTwo: () => void = () => {
    this.dataService.auth_resetPasswdStep2({
      seller_pwd: this.form2Data.seller_pwd,
      seller_mobile: this.sellerMobile
    }).then(response => {
      this.$location.path('/forget/3')
    }).catch(res => this.error = res.msg)
  }

  onGetIn: () => void = () => {
    window.location.href = '/auth.html#!/login'
  }

  getCaptcha: () => void = () => {
    this.codeImg = '/api/auth/createCaptcha?_' + (new Date().getTime())
  }

  getSMSCode: (isMobileValid: boolean) => void = isMobileValid => {
    if (isMobileValid) {
      this.dataService.authv2_sendSmsCode({
        country: 86,
        mobile: this.formData.seller_mobile,
        captcha: this.formData.captcha
      }).then(response => {
        this.getSMSCodeBtnText = `${this.seconds}s`
        this.startCountDown()
      }).catch(res => this.error = res.msg)
    }
  }

  private stopCountDown: () => void = () => {
    if (angular.isDefined(this.stop)) {
      this.$interval.cancel(this.stop)
      this.stop = undefined
      this.getSMSCodeBtnText = '获取验证码'
      this.isGetSMSCodeBtnDisabled = false
    }
  }

  private startCountDown: () => void = () => {
    if (angular.isDefined(this.stop)) { return }
    this.isGetSMSCodeBtnDisabled = true
    let seconds = this.seconds
    this.stop = this.$interval(() => {
      seconds -= 1
      if (seconds > 0) {
        this.getSMSCodeBtnText = `${seconds}s`
      } else {
        this.stopCountDown()
      }
    }, 1000)
  }
}

export const forgetComponent: ng.IComponentOptions = {
  template: require('./forget.template.html'),
  controller: ForgetComponentController
}
