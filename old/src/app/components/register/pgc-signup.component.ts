import { IDataService } from '../../services/data-service/data-service.interface';

export class pgcSignupController {
  user_tag: string[] = this.USERTAG;
  formData: any = {};
  email_validate_result: string;
  errors: string[];
  btn_disabled: boolean;

  static $inject: string[] = ['$window', 'USERTAG', 'dataService'];
  constructor(
    private $window: ng.IWindowService,
    private USERTAG: string[],
    private dataService: IDataService,
  ) {
    // Plugin.handleiCheck()
  }

  signup: () => ng.IPromise<any> = () => {
    this.errors = [];
    if (!document.getElementById('terms')['checked'])
      this.errors.push('请同意遵守《See购服务商日常交易行为规范》');
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
}

export const pgcSignup: ng.IComponentOptions = {
  controller: pgcSignupController,
  template: require('./pgc-signup.template.html'),
};
