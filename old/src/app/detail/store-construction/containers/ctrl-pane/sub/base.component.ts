/**
 * 所有配置面板都继承该类
 *
 * 子类中如果要通知配置修改，则直接调用 onFormValueChanged
 * 子类需要覆盖 getData 方法，返回最新配置值
 *
 * 子类如果要触发后台保存，则调用  emitSave() 方法
 */
import {
  Output,
  EventEmitter,
  Input,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  ValidationErrors,
  AbstractControl,
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  NgModel,
} from '@angular/forms';
import { isEmpty, some, isNil, merge } from 'lodash';
import { ElemType } from 'app/detail/store-construction/models/editor.model';

declare abstract class MyAbstractControl extends AbstractControl {
  _fireForRequiredWith: boolean;
}

const COMMON_VALIDATE_MSG = {
  showTime: {
    required: '请设置时间段',
  },
  activityTime: {
    required: '请设置活动时间',
  },
  // links: {
  //   required: '必须添加',
  // },
  // goodsList: {
  //   required: '你有未设置完成的信息,请补充完整后再提交',
  // },
};

const DEFAULT_ERROR_TYPE_MSG = {
  required: '你有未设置完成的信息,请补充完整后再提交',
};

export abstract class CtrlWidgetBaseComponent implements OnInit, AfterViewInit {
  @Output() configChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() configSave: EventEmitter<any> = new EventEmitter<any>();
  @Input() data: any;
  formGroup: FormGroup;
  private _hasMarkAsDirty: boolean = false;

  constructor() {}

  ngOnInit() {
    const formGroup = this.buildForm();
    if (formGroup) {
      this.formGroup = formGroup;
    }
    this.validationMessages = merge(
      {},
      COMMON_VALIDATE_MSG,
      this.validationMessages,
    );
  }

  markAsDirty() {
    if (this._hasMarkAsDirty) {
      return;
    }
    const form = this.formGroup;
    Object.keys(form.controls).forEach(field => {
      this.formErrors[field] = '';
      const control = form.get(field);
      control.markAsDirty();
    });
    this.collectErrors();
    this._hasMarkAsDirty = true;
  }

  updateFormGroupValue(data: any) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('>>子类需要实现 updateFormGroupValue 方法');
    }
  }

  ngAfterViewInit() {
    // console.log('form', this.formGroup);
    // https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
    setTimeout(() => {
      this.configChange.emit({
        valid: this.isValid(),
        data: {},
      });
    }, 1);
  }

  isValid() {
    if (
      this.formGroup &&
      this.formGroup.value &&
      (this.formGroup.value.method === 1 || this.formGroup.value.method === 2)
    ) {
      return true;
    }
    // tslint:disable-next-line:no-else-after-return
    else return this.formGroup ? this.formGroup.valid : true;
  }

  onFormValueChanged(data?: any) {
    this.collectErrors();
    this.emitChange();
  }

  abstract buildForm(): FormGroup;

  abstract getData();

  verifyInputMaxLength(max: number) {
    return function(control: FormControl): { [s: string]: boolean } {
      if (!this.formGroup) {
        return null;
      }
      if (control.value) {
        const len = Math.ceil(
          control.value.replace(/[\u4e00-\u9fa5]/g, 'xx').length / 2,
        );
        if (len > max) {
          return { [`maxLengthFor${max}`]: true };
        }
      }
      return null;
    };
  }

  verifyPromotionList(control: FormControl): { [s: string]: boolean } {
    if (!this.formGroup) {
      return null;
    }
    if (control.value && control.value.length === 0) {
      return { required: true };
    }
    return null;
  }

  verifyShowTime(control: FormControl): { [s: string]: boolean } {
    if (!this.formGroup) {
      return null;
    }
    const { showType, startTime, endTime } = control.value;
    if (showType === 2 && (isNil(startTime) || isNil(endTime))) {
      return { dateRangeRequired: true };
    }
    return null;
  }

  /*
  required(control: AbstractControl): ValidationErrors|null {
    return isEmptyInputValue(control.value) ? {'required': true} : null;
  }
  */

  // 当另一个不为空，才校验必填，`withName` 表示另一个字段 formControl 的名称
  buildRequiredWith(withName) {
    return function validateRequriedWith(
      control: MyAbstractControl,
    ): ValidationErrors | null {
      const formGroup = control.parent;
      if (!formGroup) {
        return null;
      }
      const anotherControl = formGroup.controls[withName];
      const isMyEmpty = isEmpty(control.value);
      const isAnotherEmpty = anotherControl
        ? isEmpty(anotherControl.value)
        : true;
      const { _fireForRequiredWith } = control;
      delete control._fireForRequiredWith;

      if (isAnotherEmpty) {
        // 我不空，则让别人校验
        // _fireForRequiredWith 防止死循环校验
        if (!_fireForRequiredWith && anotherControl) {
          anotherControl._fireForRequiredWith = true;
          // TODO 看下源码确保一下
          try {
            anotherControl.updateValueAndValidity({ emitEvent: false });
            anotherControl.markAsDirty();
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              throw e;
            }
          }
        }
        // this._parent.updateValueAndValidity();
        return null; // 别人空，则不管
      }
      return isMyEmpty ? { required: true } : null;
    };
  }

  emitChange() {
    this.collectErrors();
    this.configChange.emit({
      data: this.getData(),
      valid: this.isValid(),
    });
  }

  // 这里触发后台保存请求
  emitSave() {
    this.configSave.emit(this.getData());
  }

  collectErrors() {
    // TODO 考虑不用配置 formErrors,如果漏了配置就完蛋了
    const form = this.formGroup;
    Object.keys(form.controls).forEach(field => {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages =
          this.validationMessages[field] || '内容有误，请重新填写';
        for (const key in control.errors) {
          const msg = messages[key] || DEFAULT_ERROR_TYPE_MSG[key];
          this.formErrors[field] += msg + ' ';
        }
      }
    });
  }
  formErrors = {};
  validationMessages = {};
}
