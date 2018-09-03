import { IDataService } from '../../services/data-service/data-service.interface';

export class LoginController {
  static $inject: string[] = ['$timeout', 'dataService', '$window'];

  form_data: any;
  form: {
    is_GA: boolean;
  };
  error: string;
  is_GA: boolean;
  is_btn_disabled: boolean;
  is_remember_account: boolean;
  constructor(
    private $timeout: ng.ITimeoutService,
    private dataService: IDataService,
    private $window: ng.IWindowService,
  ) {
    this.form_data = {};
    this.form = {
      is_GA: false,
    };
  }

  $onInit() {
    this.copyrightPos();
    $(window).resize(() => this.copyrightPos());
    this.is_remember_account = localStorage.getItem('remember') === 'true';
    if (this.is_remember_account) {
      this.getLocalStorageValue();
    }
    this.checkGA(this.form_data.username);
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '%c \u5b89\u5168\u8b66\u544a\uff01',
        'font-size:50px;color:red;-webkit-text-fill-color:red;-webkit-text-stroke: 1px black;',
      );
      console.log(
        [
          '%c ',
          '\u6b64\u6d4f\u89c8\u5668\u529f\u80fd\u4e13\u4f9b\u5f00\u53d1\u8005\u4f7f\u7528\u3002',
          '\u82e5\u67d0\u4eba\u8ba9\u60a8\u5728\u6b64\u590d\u5236\u7c98\u8d34\u67d0\u5185\u5bb9',
          '\u4ee5\u542f\u7528\u67d0\u0020\u0053\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u529f',
          '\u80fd\u6216\u201c\u5165\u4fb5\u201d\u67d0\u4eba\u5e10\u6237\uff0c\u6b64\u4e3a\u6b3a',
          '\u8bc8\uff0c\u4f1a\u4f7f\u5bf9\u65b9\u83b7\u6743\u8fdb\u5165\u60a8\u7684\u0020\u0053',
          '\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u5e10\u6237\uff0c\u7ed9\u60a8\u9020\u6210',
          '\u635f\u5931\u3002',
        ].join(''),
        'font-size: 20px;color:#333',
      );
    }
  }

  login: () => void = () => {
    this.is_btn_disabled = true;
    return this.dataService
      .auth_login(this.form_data)
      .then(
        res => {
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
          window.location.href = '/';
        },
        res => {
          this.error = res.msg;
          this.$timeout(() => {
            $('#error').removeClass('hidden');
          });
        },
      )
      .finally(() => (this.is_btn_disabled = false));
  };

  /**
   * 验证当前输入的用户名是否开启了谷歌验证
   * @param _username { String } 登录输入框的用户邮箱
   */
  checkGA: (username: string) => ng.IPromise<any> = username =>
    this.dataService.auth_isGoogleAuthenticated({ username }).then(res => {
      this.is_GA = res.data.result;
      if (this.is_GA) {
        this.$timeout(() => $('#GACode').css('display', 'block'));
      }
      return this.is_GA;
    });

  getRegUrlPrefix: () => string = () =>
    this.$window.location.host === 'portal.xiaodianpu.com'
      ? 'https://portal.xiaodianpu.com'
      : '';

  private copyrightPos: () => void = () => {
    const windowHeight = $(window).height();
    windowHeight < 700
      ? $('.account-copyright')
          .css('position', 'relative')
          .css('margin-top', 40)
      : $('.account-copyright')
          .css('position', '')
          .css('margin-top', '');
  };

  private getLocalStorageValue: () => void = () => {
    this.is_remember_account = true;
    const _u = JSON.parse(localStorage.getItem('userInfo'));
    this.form_data.username = _u.userName;
    this.form_data.password = _u.password;
  };

  // private playBGVideo: () => void = () => {
  //   let i = Math.floor(Math.random() * 4),
  //     video = <any>document.getElementById('VidageVideo'),
  //     source = video.getElementsByTagName('source')
  //   source[0].src = `//static.seecsee.com/static/video/${i}.webm`
  //   source[1].src = `//static.seecsee.com/static/video/${i}.mp4`
  //   video.load()
  //   video.play()
  // }

  // private is_mobile: () => boolean = () => {
  //   const ua = navigator.userAgent,
  //     isAndroid = /Android/i.test(ua),
  //     isWindowPhone = /IEMobile/i.test(ua),
  //     isIOS = /iPhone|iPad|iPod/i.test(ua),
  //     isMobile = isAndroid || isWindowPhone || isIOS;
  //   return isMobile
  // }
}

export const login: ng.IComponentOptions = {
  template: require('./login.html'),
  controller: LoginController,
};
