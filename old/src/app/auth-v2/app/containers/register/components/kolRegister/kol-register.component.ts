import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormControl,
} from '@angular/forms';
import { AuthService, ReportService } from '../../../../services';
import { Router } from '@angular/router';
import * as bowser from 'bowser';
@Component({
  selector: 'kol-register',
  templateUrl: './kol-register.component.html',
  styleUrls: ['./kol-register.component.less'],
})
export class KolRegisterComponent implements OnInit, AfterViewInit {
  error: string; // 错误提示
  btn_disabled: boolean; // 提交按钮是否禁用
  isMobile: boolean = bowser.mobile;
  kolRegisterForm: FormGroup;

  formData: {
    account_name: string;
    account_id: string;
    company_name: string;
    linkman_name: string;
    linkman_mobile: string;
    fans_count: string;
    account_type: string;
    from_where: string;
    connection_man_name: string;
  } = {
    account_name: '',
    account_id: '',
    company_name: '',
    linkman_name: '',
    linkman_mobile: '',
    fans_count: '',
    account_type: '',
    from_where: '',
    connection_man_name: '',
  };

  formErrors = {
    account_name: '',
    account_id: '',
    company_name: '',
    linkman_name: '',
    linkman_mobile: '',
    fans_count: '',
    account_type: '',
    from_where: '',
    connection_man_name: '',
  };

  // 为每一项表单验证添加说明文字
  validationMessage = {
    account_name: {
      required: '公众号名称不能为空',
    },
    account_id: {
      required: '请正确填写微信号，以便追踪小电铺运营数据效果',
    },
    linkman_name: {
      required: '联系人姓名不能为空',
    },
    linkman_mobile: {
      required: '联系人电话不能为空',
    },
    fans_count: {
      required: '请选择你的粉丝数',
    },
    account_type: {
      required: '请选择你的账号类型',
    },
  };
  account_type: any;
  from_where: any;
  fans_range: string[] = [
    '少于5000',
    '5000~2w',
    '2w~5w',
    '5w~10w',
    '10w~20w',
    '20w~50w',
    '50w~75w',
    '75w~100w',
    '100w以上',
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reportService: ReportService,
    private router: Router,
  ) {
    this.getAccountTypeList();
    this.getFromWhereList();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.kolRegisterForm.valueChanges.subscribe(data =>
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

  buildForm(): void {
    this.kolRegisterForm = this.fb.group({
      account_name: ['', [Validators.required]],
      account_id: ['', [Validators.required]],
      company_name: [],
      linkman_name: ['', [Validators.required]],
      linkman_mobile: ['', [Validators.required]],
      fans_count: ['', [Validators.required]],
      account_type: ['', [Validators.required]],
      from_where: [],
      connection_man_name: [],
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
    setMessage(this.kolRegisterForm);
  }

  /**
   * 获取账号类型列表
   */
  getAccountTypeList() {
    this.authService.getAccountTypeList({}).subscribe((res: any) => {
      this.account_type = res.data;
    });
  }

  getFromWhereList() {
    this.authService.getFromWhereList({}).subscribe((res: any) => {
      this.from_where = res.data;
    });
  }

  onSubmit(): void {
    if (!this.kolRegisterForm.valid) {
      this.onValueChanged('', true);
      return;
    }
    this.btn_disabled = true;

    const { account_name, account_id, fans_count, ...others } = this.formData;
    const platform_info = [
      {
        account_name,
        account_id,
        fans_count,
        platform_type: 1,
      },
    ];
    const params = {
      ...others,
      platform_info: JSON.stringify(platform_info),
      seller_type: 4,
    };

    this.authService.addAndUpdateInfo(params).subscribe(
      (res: any) => {
        this.router.navigate(['/register/3']);
      },
      () => {
        this.btn_disabled = false;
      },
      () => {
        this.btn_disabled = false;
      },
    );
  }
}
