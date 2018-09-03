import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormControl,
} from '@angular/forms';
import { AuthService, ReportService } from '../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'register-step-one',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.less'],
})
export class RegisterStepOneComponent implements OnInit, AfterViewInit {
  codeImg: string = '/api/auth/createCaptcha'; // 图像验证码
  isGetSMSCodeBtnDisabled: boolean = false; // 获取密码按钮是否禁用
  getSMSCodeBtnText: string = '获取验证码'; // 获取密码按钮文本
  error: string; // 错误提示
  btn_disabled: boolean; // 提交按钮是否禁用
  is_term_checked: boolean; // 是否同意条款
  isFromSeeData: boolean = false; // 是否来自seeData

  registerFormOne: FormGroup;
  formData: {
    seller_mobile: string;
    code: string;
    captcha: string;
    seller_pwd: string;
    seller_confirm_pwd: string;
  } = {
    seller_mobile: '',
    code: '',
    captcha: '',
    seller_pwd: '',
    seller_confirm_pwd: '',
  };

  formErrors = {
    seller_mobile: '',
    code: '',
    captcha: '',
    seller_pwd: '',
    seller_confirm_pwd: '',
    password: '',
  };

  // 为每一项表单验证添加说明文字
  validationMessage = {
    seller_mobile: {
      required: '手机号不能为空',
      format: '手机号码格式不正确',
    },
    code: {
      required: '短信验证不能为空',
    },
    captcha: {
      required: '验证码不能为空',
    },
    seller_pwd: {
      required: '密码不能为空',
      format: '密码需至少包含字母和数字，长度8~16位，区分大小写',
    },
    seller_confirm_pwd: {
      required: '重复密码不能为空',
    },
    password: {
      equalPassword: '两次密码输入不一致',
    },
  };

  private seconds: number = 60;
  stop: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reportService: ReportService,
    private router: Router,
  ) {
    if (sessionStorage.getItem('__isSeeData__') === '1') {
      this.isFromSeeData = true;
    }
  }

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.registerFormOne.valueChanges.subscribe(data =>
        this.onValueChanged(data),
      );
    }, 0);
  }

  /**
   * 表单正则校验
   * @param {string} type
   * @param {RegExp} validateRex
   * @returns {ValidatorFn}
   */
  validateRex(type: string, validateRex: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      // 获取当前控件的内容
      const str = control.value;
      // 设置我们自定义的严重类型
      const res = {};
      res[type] = { str };
      // 如果验证通过则返回 null 否则返回一个对象（包含我们自定义的属性）
      return validateRex.test(str) ? null : res;
    };
  }

  /**
   * 重复密码校验
   * @param {FormGroup} controlGroup
   * @returns {any}
   */
  passValidator(controlGroup: FormGroup): any {
    // 获取密码输入框的值
    const pass1 = controlGroup.get('seller_pwd').value as FormControl;
    const pass2 = controlGroup.get('seller_confirm_pwd').value as FormControl;
    return pass1 === pass2 ? null : { equalPassword: `${pass1},${pass2}` };
  }

  buildForm(): void {
    this.registerFormOne = this.fb.group({
      seller_mobile: [
        '',
        [Validators.required, this.validateRex('format', /^\d{11}$/)],
      ],
      code: ['', [Validators.required]],
      captcha: ['', [Validators.required]],
      password: this.fb.group(
        {
          seller_pwd: [
            '',
            [
              Validators.required,
              this.validateRex(
                'format',
                /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%&_]{8,16}$/,
              ),
            ],
          ],
          seller_confirm_pwd: ['', [Validators.required]],
        },
        { validator: this.passValidator },
      ),
      is_term_checked: ['', []],
    });
  }

  /**
   * 表单改变时触发验证
   * @param data
   * @param {boolean} isForce
   */
  onValueChanged(data?: any, isForce?: boolean): void {
    const validationMessage = this.validationMessage;
    const formErrors = this.formErrors;

    const setMessage = function(form: any): void {
      const value = form.value;
      for (const field in value) {
        formErrors[field] = '';
        const control = form.get(field);
        if (control && (control.dirty || isForce) && !control.valid) {
          const messages = validationMessage[field];
          for (const key in control.errors) {
            formErrors[field] = messages[key];
            break;
          }
        }
        if (
          Object.prototype.toString.call(value[field]) === '[object Object]'
        ) {
          setMessage(control);
        }
      }
    };
    setMessage(this.registerFormOne);
  }

  /**
   * 获取图像验证码
   */
  getCaptcha(): void {
    this.codeImg = '/api/auth/createCaptcha?_' + new Date().getTime();
  }

  /**
   * 获取短信验证码
   */
  getSMSCode(): void {
    this.authService
      .sendSmsCode({
        country: 86,
        mobile: this.formData.seller_mobile,
        captcha: this.formData.captcha,
        type: 1,
      })
      .subscribe(
        (res: any) => {
          this.error = '';
          this.getSMSCodeBtnText = `${this.seconds}s`;
          this.startCountDown();
        },
        (e: any) => {
          this.error = e.res.msg;
        },
      );
  }

  private startCountDown(): void {
    if (this.stop) {
      return;
    }
    this.isGetSMSCodeBtnDisabled = true;
    let seconds = this.seconds;
    this.stop = setInterval(() => {
      seconds -= 1;
      if (seconds > 0) {
        this.getSMSCodeBtnText = `${seconds}s`;
      } else {
        this.stopCountDown();
      }
    }, 1000);
  }

  private stopCountDown: () => void = () => {
    if (this.stop) {
      clearInterval(this.stop);
      this.stop = undefined;
      this.getSMSCodeBtnText = '获取验证码';
      this.isGetSMSCodeBtnDisabled = false;
    }
  };

  /**
   * 点击下一步，提交表单
   */
  onSubmitStepOne(): void {
    if (!this.registerFormOne.valid) {
      this.onValueChanged('', true);
      return;
    }
    this.error = '';
    if (!this.is_term_checked) {
      this.error = '请同意遵守《See购服务商日常交易行为规范》';
      return;
    }

    this.btn_disabled = true;
    const {
      seller_mobile,
      code,
      seller_pwd,
      seller_confirm_pwd,
    } = this.formData;
    this.authService
      .registerXiaodianpu({
        seller_mobile,
        code,
        seller_pwd,
        seller_confirm_pwd,
        country: '86',
        seller_from: this.reportService.getReferSellerFrom() || undefined,
      })
      .subscribe(
        (res: any) => {
          const path = this.isFromSeeData ? '/register/3' : '/register/2';
          this.router.navigate([path]);
        },
        (e: any) => {
          this.btn_disabled = false;
          this.error = e.res.msg;
        },
        () => {
          this.btn_disabled = false;
        },
      );
  }
}
