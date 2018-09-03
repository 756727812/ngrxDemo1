import { Component, OnInit, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { AuthService } from '../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'forget-step-one',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.less'],
})
export class ForgetStepOneComponent implements OnInit, AfterViewInit {
  codeImg: string = '/api/auth/createCaptcha';
  isGetSMSCodeBtnDisabled: boolean = false;
  getSMSCodeBtnText: string = '获取验证码';
  error: string = '';

  forgetFormOne: FormGroup;
  formData: {
    seller_mobile: string;
    code: string;
    captcha: string;
  } = {
    seller_mobile: '',
    code: '',
    captcha: '',
  };

  formErrors = {
    seller_mobile: '',
    code: '',
    captcha: '',
  };

  stop: any;

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
  };

  private seconds: number = 60;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.forgetFormOne.valueChanges.subscribe(data =>
        this.onValueChanged(data),
      );
    }, 0);
  }

  /**
   * 表单验证正则
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
   * 创建可验证的表单
   */
  buildForm(): void {
    this.forgetFormOne = this.fb.group({
      seller_mobile: [
        '',
        [Validators.required, this.validateRex('format', /^\d{11}$/)],
      ],
      code: ['', [Validators.required]],
      captcha: ['', [Validators.required]],
    });
  }

  /**
   * 表单改变时触发验证信息
   * @param data
   * @param {boolean} isForce
   */
  onValueChanged(data?: any, isForce?: boolean): void {
    const form = this.forgetFormOne;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      console.log(control);
      if (control && (control.dirty || isForce) && !control.valid) {
        const messages = this.validationMessage[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key];
          break;
        }
      }
    }
    console.log(this.formErrors);
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
      })
      .subscribe(
        (res: any) => {
          this.error = '';
          this.getSMSCodeBtnText = `${this.seconds}s`;
          this.startCountDown();
        },
        (e: any) => {
          this.error = e.res.msg;
          this.getCaptcha();
        },
      );
  }

  /**
   * 发送短信成功开始倒计时
   */
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

  /**
   * 结束倒计时
   */
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
    if (!this.forgetFormOne.valid) {
      this.onValueChanged('', true);
      return;
    }
    this.authService
      .resetPasswordStepOne({
        seller_mobile: this.formData.seller_mobile,
        code: this.formData.code,
      })
      .subscribe(
        (res: any) => {
          this.error = '';
          this.router.navigate(['/forget/2'], {
            queryParams: { seller_mobile: this.formData.seller_mobile },
          });
        },
        (e: any) => {
          this.error = e.res.msg;
        },
      );
  }
}
