import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventCouponPickerComponent } from '../../components/coupon-picker/coupon-picker.component';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

const moment = require('moment');

// type ICoupon = {
//   itemId: number;
//   itemName: string;
//   couponPrice:number; // 面额
//   limitMoney: number; // 门槛
//   startTime: Date;
//   endTime: Date;
//   status: string;
//   moneyPayer: string
// };

@Component({
  selector: 'app-order-coupon-create',
  templateUrl: './order-coupon-create.component.html',
  styleUrls: [
    '../event-form/event-form.component.less',
    './order-coupon-create.component.less',
  ],
})
export class OrderCouponCreateComponent implements OnInit {
  @ViewChild(EventCouponPickerComponent) formGroup: FormGroup;
  actTimeResult: number = 0;
  couponList: any[]; // 当前选中的优惠券
  eventId: number;
  xdpId: number;
  queryParams: any = {};

  isView: boolean = false;
  isEdit: boolean = false;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  _isSpinning: boolean = false;
  modalVisible: boolean = false;

  constructor(
    private eventService: EventService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _message: NzMessageService,
  ) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      activityName: ['', Validators.required],
      rangeTime: [[], Validators.required],
      couponList: [[], Validators.required],
      MinPaymentAmount: [99, Validators.required],
      limitCount: [1, Validators.required],
    });

    this.route.queryParams.subscribe(params => {
      this.eventId = params.id;
      this.xdpId = params.xdpId;
      const action = params.action;
      this.queryParams = params;
      if (this.eventId) {
        this._isSpinning = true;
        this.isView = action === 'view';
        this.isEdit = action === 'edit';
        const params = { id: this.eventId };
        this.eventService
          .getCouponActivityDetail(params)
          .pipe(
            catchError((error: any) => {
              this._isSpinning = false;
              return Observable.of(null);
            }),
          )
          .subscribe(res => {
            this._isSpinning = false;
            if (res && res.data) {
              this.patchFormGroup(res.data);
            }
          });
      }
    });
  }
  // 解决 nz-input-number bug: 输入框为0时, 显示为空
  handleZero(ctrlName) {
    const val = this.formGroup.get(ctrlName).value;
    if (val === undefined) {
      return false;
    }
    if (val === 0) {
      this.formGroup.patchValue({ [ctrlName]: '0' });
    }
  }

  // 编辑活动详情
  patchFormGroup(data) {
    if (data.status === 3) {
      this.isView = true;
    }
    const mStartTime = new Date(data.startTime);
    const mEndTime = new Date(data.endTime);
    const groupData = {
      activityName: data.activityName,
      rangeTime: [mStartTime, mEndTime],
      couponList: [],
      MinPaymentAmount: data.payLimitMoney === 0 ? '0' : data.payLimitMoney,
      limitCount: data.limitPer,
    };
    this.formGroup.patchValue(groupData);
    this.couponList = data.couponv3List;
  }

  openCouponPicker() {
    // this.dummyCoupon();
    // return true;
    if (this.isView) {
      return;
    }
    this.modalService
      .open({
        title: '添加优惠券',
        content: EventCouponPickerComponent,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        componentParams: {
          addedCoupon: this.couponList ? this.couponList.concat() : [],
          kolId: this.queryParams.kolId,
        },
      })
      .subscribe(data => {
        if (Array.isArray(data) && data.length > 0) {
          this.couponList = data;
        }
      });
    return false;
  }
  removeCoupon(id) {
    this.couponList.forEach((item, index) => {
      console.log('item=', item, ',index=', index);
      if (item.id === id) {
        this.couponList.splice(index, 1);
        return;
      }
    });
  }
  cancelSubmit(isDirty) {
    if (isDirty) {
      this.modalVisible = true;
    } else {
      this.goBack();
    }
  }
  modalOk() {
    this.goBack();
  }
  modalCancel() {
    this.modalVisible = false;
  }
  submit() {
    for (const i in this.formGroup.controls) {
      this.formGroup.controls[i].markAsDirty();
      this.formGroup.controls[i].updateValueAndValidity();
    }

    const formValue = this.formGroup.value;
    if (
      !formValue.activityName ||
      !this.couponList ||
      this.couponList.length === 0 ||
      this.actTimeResult !== 0 ||
      !formValue.MinPaymentAmount ||
      formValue.MinPaymentAmount < 0 ||
      !formValue.limitCount ||
      formValue.limitCount < 1
    ) {
      return;
    }
    const couponIdList = [];
    this.couponList.forEach(element => {
      couponIdList.push(element.id);
    });
    const param = {
      activityName: formValue.activityName,
      couponIds: couponIdList,
      startTime: moment(formValue.rangeTime[0]).format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment(formValue.rangeTime[1]).format('YYYY-MM-DD HH:mm:ss'),
      limitPer: formValue.limitCount,
      payLimitMoney: formValue.MinPaymentAmount,
      xiaodianpuId: this.xdpId,
    };

    if (this.isEdit) {
      param['id'] = this.eventId;
      this.editActivity(param);
    } else {
      this.addActivity(param);
    }
  }

  addActivity(param) {
    this.eventService
      .addCouponActivity(param)
      .pipe(
        catchError((error: any) => {
          this.isSubmitting = false;
          const err: string = error.currentTarget.responseText;
          const errMsg = JSON.parse(err);
          return Observable.of(errMsg);
        }),
      )
      .subscribe(
        data => {
          this.isSubmitting = false;
          if (!data || data.result !== 1) {
            return this._message.create('error', data.msg, {
              nzDuration: 5000,
            });
          }
          this._message.create('success', '添加活动成功.');
          this.goBack();
        },
        data => {},
      );
  }
  editActivity(param) {
    const index = this.couponList.findIndex(item => {
      return item.status !== 3;
    });
    if (index !== -1) {
      const msg =
        '错误: 优惠券礼包中包含非 [发放中] 状态的优惠券, 不能修改活动.';
      return this._message.create('error', msg, { nzDuration: 5000 });
    }
    this.eventService
      .editCouponActivity(param)
      .pipe(
        catchError((error: any) => {
          this.isSubmitting = false;
          const err: string = error.currentTarget.responseText;
          const errMsg = JSON.parse(err);
          return Observable.of(errMsg);
        }),
      )
      .subscribe(
        data => {
          this.isSubmitting = false;
          if (!data || data.result !== 1) {
            return this._message.create('error', data.msg, {
              nzDuration: 5000,
            });
          }
          this._message.create('success', '编辑活动成功.');
          this.goBack();
        },
        data => {},
      );
  }

  formatName(ctrlName) {
    let val = this.formGroup.get(ctrlName).value;
    val = val.replace(/[^\u4e00-\u9fa5_a-zA-Z0-9]/g, ''); // 只能输入: 中文/英文/数字
    this.formGroup.patchValue({ [ctrlName]: val });
  }
  /*
  formatPrice(type) {
    let val = this.formGroup.get(type).value;
    val = val.replace(/[^\d.]|\./g, ''); // 只接受正整数
    if (val) {
      val = parseInt(val, 10);
    }
    this.formGroup.patchValue({ [type]: val });
  }

  initActTime() {
    const rangeTime = this.formGroup.get('rangeTime').value;
    if (rangeTime && rangeTime[0] != null) {
      return true;
    }
    const fiveMinsLater = new Date(Date.now() + 60 * 5 * 1000);
    this.formGroup.patchValue({
      rangeTime: [fiveMinsLater, null],
    });
  }
  */
  disabledDate(current: Date): boolean {
    const oneday = 1000 * 60 * 60 * 24;
    return current && current.getTime() < Date.now() - oneday;
  }
  validateActTime(value) {
    if (!value.length || value[0] === null || this.isView) {
      return;
    }
    if (moment(value[0]).isBefore(moment())) {
      this.actTimeResult = 1;
      return;
    }
    if (!moment(value[0]).isBefore(moment(value[1]))) {
      this.actTimeResult = 2;
      return;
    }
    this.actTimeResult = 0;
  }

  private goBack(): void {
    this.router.navigate(['/event2/coupon/'], {
      queryParams: this.queryParams,
    });
  }
}
