import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { map } from 'rxjs/operators';
import * as bower from 'bowser';

import { AuthService, ReportService } from '../../services';

import { CookieService } from 'ngx-cookie';

import { show as showMobileTips } from '../../../../utils/mobile-tip';

declare const PasswordCredential: any;

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm: FormGroup;
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
  shouldQrFrame: boolean = false;
  queryParams: any;
  private seller_from: string;
  private enableCredential: boolean = Boolean((<any>navigator).credentials);
  iFrameUrl: SafeResourceUrl;

  formErrors = {
    username: '',
    password: '',
  };

  // 为每一项表单验证添加说明文字
  validationMessage = {
    username: {
      required: '输入的用户名不能为空',
    },
    password: {
      required: '密码不能为空',
    },
  };

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loginService: AuthService,
    private reportService: ReportService,
    private fb: FormBuilder,
    private cookeService: CookieService,
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.queryParams = params;
      if (params.registerRightNow && ~~params.registerRightNow === 1) {
        this.activeTab = 1;
      }
    });
    // this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    //   `https://seecsee.com/authority/loginByQRCode?platform=1&action=login&host=${encodeURIComponent(
    //     window.location.protocol + '//' + window.location.host
    //   )}`,
    // );
    this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `/api/ng/common/redirect?redirectUrl=${encodeURIComponent(
        'https://seecsee.com/common/redirect?redirect_to=' +
          window.location.protocol +
          '//' +
          window.location.host +
          '/api/ng/wxauth?host=' +
          window.location.protocol +
          '//' +
          window.location.host,
      )}`,
    );
    this.activeTab = 1;
  }

  ngOnInit() {
    this.buildForm();
    // 只要是 mobile 则不显示「扫一扫」
    this.isMobile = bower.mobile;
    this.isWechat = /MicroMessenger/i.test(window.navigator.userAgent);
    this.seller_from = this.reportService.getReferSellerFrom();
    this.shouldQrFrame = !this.isMobile;

    if (this.queryParams.see_data_callback) {
      sessionStorage.setItem(
        '__see_data_callback__',
        this.queryParams.see_data_callback,
      );
    }

    if (this.queryParams.token && this.activeTab === 1) {
      this.login();
    } else {
      if (this.isMobile) {
        this.activeTab = 2;
      }
      this.is_remember_account = localStorage.getItem('remember') === 'true';
      if (this.is_remember_account) {
        this.getLocalStorageValue();
      }
      if (this.form_data.username) {
        this.checkGA(this.form_data.username).subscribe();
      }
      if (this.queryParams.from !== 'logout' && this.enableCredential) {
        console.log('自动登录开始...');
        this.autoSignIn();
      }
    }

    // 注册标记
    if (this.seller_from) {
      this.cookeService.put('seller_from', this.seller_from);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loginForm.valueChanges.subscribe(data => this.onValueChanged(data));
    }, 0);
  }

  buildForm(): void {
    // 通过 formBuilder构建表单
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      is_remember_account: [],
      code: [],
    });
  }

  onValueChanged(data?: any, isForce?: boolean) {
    const form = this.loginForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && (control.dirty || isForce) && !control.valid) {
        const messages = this.validationMessage[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key];
        }
      }
    }
  }

  /**
   * 点击登陆按钮触发
   */
  handleLoginBtnClick() {
    if (!this.loginForm.valid) {
      this.onValueChanged('', true);
      return;
    }
    this.login();
  }

  /**
   * 点击立即注册按钮触发，去扫码安全注册
   */
  goToRegisterRightNow() {
    this.activeTab = 1;
    this.router.navigate(['/entry'], {
      queryParams: { registerRightNow: 1 },
    });
  }

  login() {
    showMobileTips();
    const token = this.queryParams.token || '';
    const params = {
      ...this.form_data,
      token,
    };
    if (token) {
      this.authLogin(params);
    } else {
      this.checkGA(this.form_data.username).subscribe((is_GA: boolean) => {
        if (is_GA && !this.form_data.code) {
          this.error = '请填写 Google 验证码';
          return;
        }
        delete params.token;
        this.authLogin(params);
      });
    }
  }

  /**
   * 填写用户名失去焦点checkGA
   */
  handleBlur(): void {
    const username = this.form_data.username;
    this.checkGA(username).subscribe();
  }

  /**
   * 验证当前输入的用户名是否开启了谷歌验证
   * @param username { String } 登录输入框的用户邮箱
   */
  checkGA(username: string) {
    if (!username) {
      return;
    }
    return this.loginService.checkGA({ username }).pipe(
      map((res: any) => {
        this.is_GA = res.data.result;
        return this.is_GA;
      }),
    );
  }

  /**
   * 认证登陆
   * @param params
   */
  authLogin(params: any) {
    console.log('auth login');
    this.is_btn_disabled = true;
    this.loginService.auth_login(params).subscribe(
      (res: any) => {
        this.loginService.login_setUser(res.data);
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

        if (res.data.token) {
          // 表示微信扫码进来
          const ua = window.navigator.userAgent.toLowerCase();
          if (res.data.seller_mobile) {
            // seller_mobile 表示已经有手机号，进入功能入口页
            if (this.checkSeeDataRedirect()) {
              return;
            }

            // 微信入口登录后跳转
            if (String(ua.match(/MicroMessenger/i)) === 'micromessenger') {
              this.router.navigate(['/register/4']); // 这里 /register/4 理解成微信 dashboard 页
            } else {
              window.location.href = '/';
            }
          } else {
            this.router.navigate(['/register']);
          }
        } else {
          this.setLoginRedirect(res.data.use_weixin);
        }
      },
      (e: any) => {
        this.is_btn_disabled = false;
        this.activeTab = 2;
        this.error = e.res.msg;
      },
      () => {
        this.is_btn_disabled = false;
      },
    );
  }

  /**
   * 自动登陆
   * @returns {any}
   */
  autoSignIn() {
    if ((<any>navigator).credentials) {
      return (<any>navigator).credentials
        .get({
          password: true,
        })
        .then(cred => {
          if (cred) {
            if (cred.type === 'password') {
              if (cred.password === undefined) {
                return;
              }
              this.form_data = {
                username: cred.id,
                password: cred.password,
              };
              this.checkGA(this.form_data.username).subscribe(
                (is_GA: boolean) => {
                  if (is_GA) {
                    this.activeTab = 2;
                    return;
                  }
                  this.login();
                },
              );
            }
          }
        });
    }
  }

  private getLocalStorageValue: () => void = () => {
    this.is_remember_account = true;
    const _u = JSON.parse(localStorage.getItem('userInfo'));
    this.form_data.username = _u.userName;
    this.form_data.password = _u.password;
  };

  private checkSeeDataRedirect() {
    const see_data_callback =
      this.queryParams.see_data_callback ||
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
      window.location.href = '/';
    } else {
      this.router.navigate(['/bind']);
    }
  };
}
