import * as bower from 'bowser';

import { show as showMobileTips } from '../utils/mobile-tip';

declare const PasswordCredential: any;

import './login.less';

const WECHAT_AUTH_URL = [
  'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx55d175ecd4b6f7a5',
  'redirect_uri=https%3a%2f%2fm.seeapp.com%2fauthority%2fsuccessLoginQRCode%3ftype%3d2%26test' +
    '%3d1%26v%3d1%26platform%3d1%26action%3dlogin%26host%3dhttps%3a%2f%2fbackend.seecsee.com',
  'response_type=code',
  'scope=snsapi_userinfo',
  'state=456',
].join('&');
import { ReportService } from '../services/report-service/report-service';
export class LoginComponentController {
  static $inject: string[] = [
    '$timeout',
    'dataService',
    '$window',
    '$location',
    '$routeParams',
    '$q',
    '$cookies',
  ];

  isMobile: boolean = false;
  isWechat: boolean = false;
  form_data: {
    username: string;
    password: string;
    code?: string;
  } = {
    username: '',
    password: '',
  };
  form: {
    is_GA: boolean;
  } = {
    is_GA: false,
  };
  error: string;
  is_GA: boolean;
  is_btn_disabled: boolean;
  is_remember_account: boolean;
  activeTab: number;
  isFromregisterRightNow: boolean = this.$routeParams['registerRightNow'] ===
    '1';
  iFrameUrl: string = `https://seecsee.com/authority/loginByQRCode?platform=1&action=login&host=${encodeURIComponent(
    window.location.protocol + '//' + window.location.host,
  )}`;
  shouldQrFrame: boolean = false;
  private seller_from: string;
  private enableCredential: boolean = Boolean((<any>navigator).credentials);
  private from: string = this.$routeParams.from;

  constructor(
    private $timeout: ng.ITimeoutService,
    private dataService: see.IDataService,
    private $window: ng.IWindowService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $q: ng.IQService,
    private $cookies: ng.cookies.ICookiesService,
  ) {}

  $onInit() {
    if (this.$location.search().see_data_callback) {
      sessionStorage.setItem(
        '__see_data_callback__',
        this.$location.search().see_data_callback,
      );
    }
    this.seller_from = ReportService.getReferSellerFrom();
    this.shouldQrFrame = !bower.mobile;
    bower.mobile && $(document.body).addClass('mobile');
    // 只要是 mobile 则不显示「扫一扫」
    this.isMobile = bower.mobile;
    this.isWechat = /MicroMessenger/i.test(window.navigator.userAgent);

    if (this.$routeParams.token && !this.activeTab) {
      this.login();
    } else {
      if (this.isMobile) {
        this.activeTab = 1;
      }
      this.is_remember_account = localStorage.getItem('remember') === 'true';
      if (this.is_remember_account) {
        this.getLocalStorageValue();
      }
      if (this.form_data.username) {
        this.checkGA(this.form_data.username);
      }
      if (this.from !== 'logout' && this.enableCredential) {
        console.log('自动登录开始...');
        this.autoSignIn().catch(e => e);
      }
    }

    // 注册标记
    if (this.seller_from) {
      this.$cookies.put('seller_from', this.seller_from);
    }
  }

  login: () => void = () => {
    showMobileTips();
    const token = this.$routeParams.token || '';
    const params = {
      ...this.form_data,
      token,
    };
    if (token) {
      this.authLogin(params);
    } else {
      this.checkGA(this.form_data.username)
        .then(isGA => {
          if (isGA && !this.form_data.code) {
            return this.$q.reject('请填写 Google 验证码');
          }
          delete params.token;
          this.authLogin(params);
        })
        .catch(e => {
          if (typeof e === 'string') {
            this.error = e;
          }
        });
    }
  };

  /**
   * 验证当前输入的用户名是否开启了谷歌验证
   * @param _username { String } 登录输入框的用户邮箱
   */
  checkGA: (username: string) => ng.IPromise<any> = username => {
    if (!username) {
      return this.$q.reject();
    }
    return this.dataService
      .auth_isGoogleAuthenticated({ username })
      .then(res => {
        this.is_GA = res.data.result;
        if (this.is_GA) {
          this.$timeout(() => $('#GACode').css('display', 'block'));
        }
        return this.is_GA;
      })
      .catch(e => e);
  };

  getRegUrlPrefix: () => string = () =>
    this.$window.location.host === 'portal.xiaodianpu.com'
      ? 'https://portal.xiaodianpu.com'
      : '';

  private authLogin: (params: any) => void = params => {
    this.is_btn_disabled = true;
    return this.dataService
      .auth_login(params)
      .then(res => {
        this.dataService.login_setUser(res.data);
        if (this.is_remember_account) {
          localStorage.setItem('remember', 'true');
          localStorage.setItem(
            'userInfo',
            JSON.stringify({
              userName: this.form_data.username,
              password: this.form_data.password,
            }),
          );
        } else {
          localStorage.setItem('remember', 'false');
          localStorage.removeItem('userInfo');
        }
        if (
          Boolean(this.form_data.username) &&
          Boolean(this.form_data.password) &&
          this.enableCredential
        ) {
          const cred = new PasswordCredential({
            id: this.form_data.username,
            ...this.form_data,
          });
          (<any>navigator).credentials.store(cred);
        }

        // !!!!!!! 囧 我也不想地狱 if else
        if (res.data.token) {
          // 表示微信扫码进来
          const ua = this.$window.navigator.userAgent.toLowerCase();
          if (res.data.seller_mobile) {
            // seller_mobile 表示已经有手机号，进入功能入口页
            if (this.checkSeeDataRedirect()) {
              return;
            }

            // 微信入口登录后跳转
            if (String(ua.match(/MicroMessenger/i)) === 'micromessenger') {
              this.$location.path('/register/4'); // 这里 /register/4 理解成微信 dashboard 页
            } else {
              window.location.href = '/';
            }
          } else {
            this.$location.path('/register');
          }
        } else {
          this.setLoginRedirect(res.data.use_weixin);
        }
      })
      .catch(res => {
        console.warn(res);
        this.activeTab = 1;
        this.error = res.msg;
      })
      .finally(() => (this.is_btn_disabled = false));
  };

  private autoSignIn: () => ng.IPromise<any> = () => {
    if ((<any>navigator).credentials) {
      return (<any>navigator).credentials
        .get({
          password: true,
        })
        .then(cred => {
          if (cred) {
            if (cred.type === 'password') {
              if (cred.password === undefined) {
                return this.$q.reject();
              }
              this.form_data = {
                username: cred.id,
                password: cred.password,
              };
              this.checkGA(this.form_data.username).then(is_GA => {
                if (is_GA) {
                  this.activeTab = 1;
                  return this.$q.reject();
                }
                return this.login();
              });
            }
          } else {
            return this.$q.reject();
          }
        });
    }
    return this.$q.reject();
  };

  private get ChromeVersion() {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

    return raw ? parseInt(raw[2], 10) : false;
  }

  private get isMacPlatform() {
    return navigator.platform === 'MacIntel';
  }

  private checkSeeDataRedirect() {
    const see_data_callback =
      this.$location.search().see_data_callback ||
      sessionStorage.getItem('__see_data_callback__');

    if (see_data_callback) {
      sessionStorage.removeItem('__see_data_callback__');
      window.location.href = decodeURIComponent(see_data_callback);
      return true;
    }
  }

  private setLoginRedirect: (
    nonNeedUpgrade: boolean,
  ) => void = nonNeedUpgrade => {
    if (nonNeedUpgrade) {
      if (this.checkSeeDataRedirect()) {
        return;
      }
      this.$window.location.href = '/';
    } else {
      this.$location.path('/bind');
    }
  };

  private getLocalStorageValue: () => void = () => {
    this.is_remember_account = true;
    const _u = JSON.parse(localStorage.getItem('userInfo'));
    this.form_data.username = _u.userName;
    this.form_data.password = _u.password;
  };
}

export const loginComponent: ng.IComponentOptions = {
  template: require('./login.template.html'),
  controller: LoginComponentController,
};
