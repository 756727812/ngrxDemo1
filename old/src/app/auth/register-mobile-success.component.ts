// 手机端，注册成功之后，提示页
import MobileResponsive from '../utils/mobile-resposive';
import * as angular from 'angular';

export class Controller {
  static $inject: string[] = [];
  isSeedata: boolean = false;

  constructor() {
    this.isSeedata = sessionStorage.getItem('__isSeeData__') === '1';
    console.log(this.isSeedata);
  }

  $onInit() {
    MobileResponsive.start();
  }

  $onDestroy() {
    MobileResponsive.end();
  }

  onCopySuccess() {
    alert('复制成功');
  }
}

export const authRegisterMobileSuccess: ng.IComponentOptions = {
  controller: Controller,
  template: require('./register-mobile-success.template.html'),
  bindings: {
    type: '@',
  },
};
