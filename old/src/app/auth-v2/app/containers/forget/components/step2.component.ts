import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormControl,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'forget-step-two',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.less'],
})
export class ForgetStepTwoComponent implements OnInit, AfterViewInit {
  forgetFormTwo: FormGroup;
  sellerMobile: any;
  error: string = '';

  formData: {
    seller_pwd: string;
    seller_confirm_pwd: string;
  } = {
    seller_pwd: '',
    seller_confirm_pwd: '',
  };

  formErrors = {
    seller_pwd: '',
    seller_confirm_pwd: '',
  };

  // 为每一项表单验证添加说明文字
  validationMessage = {
    seller_pwd: {
      required: '密码不能为空',
      format: '密码需至少包含字母和数字，长度8~16位，区分大小写',
    },
    seller_confirm_pwd: {
      required: '重复密码不能为空',
      pass: '两次密码输入不一致',
    },
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.activatedRoute.queryParams.subscribe(
      (params: Params) => (this.sellerMobile = params['seller_mobile']),
    );
  }

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.forgetFormTwo.valueChanges.subscribe(data =>
        this.onValueChanged(data),
      );
    }, 0);
  }

  /**
   * 表单正则验证
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

  /**
   * 创建可验证的表单
   */
  buildForm(): void {
    this.forgetFormTwo = this.fb.group(
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
    );
  }

  /**
   * 表单改变触发
   * @param data
   * @param {boolean} isForce
   */
  onValueChanged(data?: any, isForce?: boolean): void {
    const form = this.forgetFormTwo;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && (control.dirty || isForce) && !control.valid) {
        const messages = this.validationMessage[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key];
          break;
        }
      }
    }

    if (
      !this.formErrors['seller_confirm_pwd'] &&
      form.errors &&
      form.errors.equalPassword
    ) {
      const pass = this.validationMessage['seller_confirm_pwd'].pass;
      this.formErrors['seller_confirm_pwd'] = pass;
    }
  }

  /**
   * 提交表单
   */
  onSubmitStepTwo(): void {
    if (!this.forgetFormTwo.valid) {
      this.onValueChanged('', true);
      return;
    }

    this.authService
      .resetPasswordStepTwo({
        seller_pwd: this.formData.seller_pwd,
        seller_mobile: this.sellerMobile,
      })
      .subscribe(
        (res: any) => {
          this.router.navigate(['/forget/3']);
        },
        (e: any) => {
          this.error = e.res.msg;
        },
      );
  }
}
