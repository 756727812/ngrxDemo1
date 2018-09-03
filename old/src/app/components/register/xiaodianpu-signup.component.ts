import { IDataService } from '../../services/data-service/data-service.interface';

export class xiaodianpuSignupController {
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
  };

  static $inject: string[] = ['$q', '$window', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $window: ng.IWindowService,
    private dataService: IDataService,
  ) {
    // Plugin.handleiCheck()
    this.is_term_checked = true;
    this.btn_disabled = false;
    this.validate_form = {
      country_code: '86',
      code: '',
    };
    this.verify_btn = {
      text: '获取验证码',
      seconds: 60,
      is_msg_sended: false,
    };

    const promises: ng.IPromise<any>[] = [this.getCountryCode()];
    this.$q.all(promises);
  }

  signup: () => ng.IPromise<any> = () => {
    console.log(123);
    this.errors = [];
    if (!this.is_term_checked)
      this.errors.push('请同意遵守《See购服务商日常交易行为规范》');
    //if (!document.getElementById('terms')['checked']) this.errors.push('请同意遵守《See购服务商日常交易行为规范》')
    if (this.errors.length) return;
    this.btn_disabled = true;

    return this.dataService
      .auth_registerPGC(this.formData)
      .then(
        res => {
          alert('恭喜，注册成功！');
          this.$window.location.href = 'login.html';
        },
        err => this.errors.push(err),
      )
      .finally(() => (this.btn_disabled = false));
  };

  validateEmail: (registerForm) => ng.IPromise<any> = registerForm => {
    if (!registerForm.email.$error.email && !registerForm.email.$error.required)
      return this.dataService
        .auth_verifySellerEmail({
          seller_email: registerForm.email.$viewValue,
        })
        .then(
          res => {
            if (res.data.result === 1)
              this.email_validate_result = '该邮箱可以使用。';
            else this.email_validate_result = '该邮箱已被注册，换一个试试？';
          },
          err => console.error(err.data),
        );
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
}

export const xiaodianpuSignup: ng.IComponentOptions = {
  controller: xiaodianpuSignupController,
  template: require('./xiaodianpu-signup.template.html'),
};
