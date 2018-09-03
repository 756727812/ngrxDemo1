import {
  forwardRef,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Inject,
  Self,
  Optional,
  Host,
  SkipSelf,
} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  Validators,
  AbstractControl,
  NgModel,
} from '@angular/forms';

import { ShowType } from '../../models/editor.model';
import * as moment from 'moment';

const customRequiredValidator = (
  control: AbstractControl,
): {
  [key: string]: any;
} => {
  const { dateRange, showType, startTime, endTime } = (control.value ||
    {}) as VALUE;
  if (showType === ShowType.RANGE) {
    if (dateRange && (!dateRange[0] || !dateRange[1])) {
      return { required: true };
    }
    if (!dateRange && (!startTime || !endTime)) {
      return { required: true };
    }
  }
  return null;
};

declare interface VALUE {
  dateRange: any[];
  showType: ShowType;
  startTime?: string;
  endTime?: string;
}

@Component({
  selector: 'app-show-time',
  templateUrl: './show-time.component.html',
  styleUrls: ['./show-time.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ShowTimeComponent),
      multi: true,
    },
  ],
})
export class ShowTimeComponent implements OnInit, ControlValueAccessor {
  @Input()
  _value: VALUE = { dateRange: [null, null], showType: ShowType.ALWAYS };
  @Input() _showType;
  @Output('change') handleChange: EventEmitter<any> = new EventEmitter<any>();

  private _onChange: (value: VALUE) => void = () => null;
  private _onTouched: () => void = () => null;
  private control: AbstractControl;
  @Input() formControlName: string;
  @Input() type: number;

  get value(): any {
    return this._value;
  }

  set value(val: any) {
    this._value = val;
    this._onChange(val);
  }

  get dateRange() {
    return this._value.dateRange;
  }

  set dateRange(val: any) {
    this._setDateRange(val);
    this._onChange(this._value);
    this.handleChange.emit();
  }

  get showType() {
    return this.type === 0 ? 2 : this._value.showType;
  }

  set showType(val: number) {
    if (this._value.showType === val) {
      return;
    }
    this._value.showType = val;
    if (val === ShowType.ALWAYS) {
      this._value.dateRange = [null, null];
      this._value.startTime = null;
      this._value.endTime = null;
    }
    this._onChange(this._value);
    this.handleChange.emit();
  }

  setDisabledDate: boolean = true; // 是否禁选以前时间

  /* life hook */
  constructor(
    @Optional()
    @Host()
    @SkipSelf()
    private controlContainer: ControlContainer,
  ) {}

  ngOnInit() {
    if (this.controlContainer) {
      if (this.formControlName) {
        this.control = this.controlContainer.control.get(this.formControlName);
        // TODO 如果外部配置，这里就挂了，暂定外部不配置吧
        // 如果外部要配置，这里取出来 Validators.compose
        if (this.type !== 0) {
          this.control.setValidators(customRequiredValidator);
        }
        // else this.control.clearValidators();
      } else {
        console.warn('缺少 FormControlName 指令');
      }
      this.setDisabledDate = this._showType === 'all' ? false : true;
    } else {
      console.warn('show time 组件找不到父级 FormGroup');
    }
  }

  private _setDateRange(dateRange = [null, null]) {
    this._value.dateRange = dateRange;
    this._value.startTime = dateRange[0]
      ? moment(dateRange[0]).format('YYYY-MM-DD HH:mm:ss')
      : null;
    this._value.endTime = dateRange[1]
      ? moment(dateRange[1]).format('YYYY-MM-DD HH:mm:ss')
      : null;
  }
  _disabledDate(current: Date): boolean {
    return (
      current &&
      current.getTime() <
        moment()
          .startOf('day')
          .toDate()
          .getTime()
    );
  }

  /* model access start */

  /*
  兼容 {showType: xx, dateRange: []}
  和  {showTyype: xx, startTime: 'xxxx-xx-xx xx:xx:xx', endTime:''}
  // TODO 后面改成不兼容穿入 dateRange,外部无须感知 dateRange
  */
  writeValue(value: VALUE) {
    this._value = { ...value };
    // const {startTime, endTime} = this._
    const { dateRange } = value;
    if (value.startTime || value.endTime) {
      this._value.dateRange = [
        value.startTime ? new Date(value.startTime) : null,
        value.endTime ? new Date(value.endTime) : null,
      ];
    }
    // 这里没有判断 startTime 是否存在，默认传了 dateRange 就不传 startTime
    if (dateRange) {
      this._setDateRange(dateRange);
    }
  }

  registerOnChange(fn: (_: VALUE) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}
