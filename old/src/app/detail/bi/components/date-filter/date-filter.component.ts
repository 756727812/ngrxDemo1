import {
  Component,
  OnInit,
  Output,
  Input,
  OnDestroy,
  forwardRef,
  ViewChild,
  EventEmitter,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { map as rxMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { NzMessageService } from 'ng-zorro-antd';
import { find, map, get, indexOf, isEmpty } from 'lodash';

// 因为 zorro 目前组件完全完全不满足，如果找个 jq 组件，不如直接用 react antd 更加贴近需求
// 后面如果 zorro 完全实现 ant-design 设计，在考虑换，反正内部封装屏蔽
// import DatePicker from 'antd/lib/date-picker';
// import 'antd/lib/date-picker/style/css';
import * as moment from 'moment';
// import './antd/antd.css';
require('./date-picker/style');
import * as ReactDOM from 'react-dom';
import * as React from 'react';
const { DatePicker } = require('./antd/antd');
import { BiService } from '../../services/bi.service';

// moment 语言设置要不要放到全局
import locale from './zh_CN';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

export enum DATE_TYPE {
  RANGE_DAY = '2', // 自定义天范围（商品分析）
  SINGLE_WEEK = '3', // 单个周
  TODAY_REALTIME = '4', // 今日实时
  SINGLE_MONTH = '5', // 单个月
  LAST_7_DAYS = '6', // 最近 7 天
  LAST_30_DAYS = '7', // 最近 30 天
  LAST_3_MONTHS = '8', // 最近 3 个月
  LAST_6_MONTHS = '9', // 最近 6 个月
  // x
  SINLGE_DAY_4_RANGE = '10', // 选择一个日期，根据配置给出范围
}

declare interface DateFilterVal {
  type: DATE_TYPE;
  val: any;
}

const DATE_TYPE_OPTIONS = [
  { label: '自定义', val: DATE_TYPE.RANGE_DAY },
  { label: '自然周', val: DATE_TYPE.SINGLE_WEEK },
  { label: '今日实时', val: DATE_TYPE.TODAY_REALTIME },
  { label: '自然月', val: DATE_TYPE.SINGLE_MONTH },
  { label: '最近 7 天', val: DATE_TYPE.LAST_7_DAYS },
  { label: '最近 30 天', val: DATE_TYPE.LAST_30_DAYS },
  { label: '最近 3 个月', val: DATE_TYPE.LAST_3_MONTHS },
  { label: '最近半年', val: DATE_TYPE.LAST_6_MONTHS },
  // x
  { label: 'xxx', val: DATE_TYPE.SINLGE_DAY_4_RANGE }, // 单个面板（非范围选择）
];

@Component({
  selector: 'app-bi-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BiDateFilterComponent),
      multi: true,
    },
  ],
})
export class BiDateFilterComponent implements OnInit, ControlValueAccessor {
  @ViewChild('singleDateCt') singleDateCt: ElementRef;
  @ViewChild('rangeDateCt') rangeDateCt: ElementRef;
  @ViewChild('singleWeekCt') singleWeekCt: ElementRef;
  @ViewChild('singleMonthCt') singleMonthCt: ElementRef;
  @ViewChild('singleDay4RangeCt') singleDay4RangeCt: ElementRef;
  @Input() types: any[] = []; // 可以使用 DATE_TYPE 中的值
  objTypes: any[] = [];

  dateType; // TODO 初始化根据
  // 外部可以传，并且要传格式
  options;

  dateReady: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  // ngModel Access
  @Input() _value: any = {};

  private _onChange: (value: DateFilterVal) => void = () => null;
  private _onTouched: () => void = () => null;
  _lastValueMap = {};
  lastAvailDate: any;
  curTime: any;

  constructor(
    private nzMessageService: NzMessageService,
    private biService: BiService,
  ) {}

  onOptionChange(type) {
    // TODO 如果切回自然月之类的，如果原来有初始值，怎么弄?
    // TODO 如果切回自然天之类的，如果原来有初始值，怎么弄?
    const ld = this.lastAvailDate;
    let val = void 0;
    switch (type) {
      case DATE_TYPE.TODAY_REALTIME:
        val = [moment(), moment()];
        break;
      case DATE_TYPE.LAST_7_DAYS:
        val = [moment(ld).add(-6, 'days'), moment(ld)];
        break;
      case DATE_TYPE.LAST_30_DAYS:
        val = [moment(ld).add(-29, 'days'), moment(ld)];
        break;
      case DATE_TYPE.LAST_3_MONTHS:
        val = [
          moment()
            .add(-2, 'months')
            .startOf('month'),
          moment().endOf('month'),
        ];
        break;
      case DATE_TYPE.LAST_6_MONTHS:
        val = [
          moment()
            .add(-5, 'months')
            .startOf('month'),
          moment().endOf('month'),
        ];
        break;
      // TODO 其他有日历面板的都要处理触发
      case DATE_TYPE.SINGLE_MONTH:
      case DATE_TYPE.SINGLE_WEEK:
      case DATE_TYPE.RANGE_DAY:
      case DATE_TYPE.SINLGE_DAY_4_RANGE:
        val = this._lastValueMap[type];
        break;
    }
    if (!isEmpty(val)) {
      this._onDateFilterValueChange(val, type);
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
  }

  ngOnInit() {
    this.objTypes = this.types.map(item => {
      return typeof item === 'string' ? { type: item } : item;
    });
    const strTypes = map(this.objTypes, 'type');
    this.options = this.objTypes.map(({ type, label }) => {
      const op = find(DATE_TYPE_OPTIONS, { val: type });
      return {
        ...op,
        label: label || op.label,
      };
    });
    this.dateType = get(this.options, '0.val');
    this.curTime = moment().format('YYYY-MM-DD HH:mm:ss');
    // Observable.interval(1000)//
    // .takeUntil(this.destroy$)
    // .subscribe(()=>{
    //   this.curTime = moment().format
    // })
    // setInterval(()=>{
    //   curTime
    // }, 1000)
  }

  _onDateFilterValueChange(val, type) {
    this._value = { val, type };
    this._onChange(this._value);
    this._lastValueMap[type] = val;
  }
  _onSingleDay4RangeChange(val) {
    this._onDateFilterValueChange(val, DATE_TYPE.SINLGE_DAY_4_RANGE);
  }

  _onRangeDateChange(val) {
    this._onDateFilterValueChange(val, DATE_TYPE.RANGE_DAY);
  }

  _onSingleWeekChange(val) {
    this._onDateFilterValueChange(val, DATE_TYPE.SINGLE_WEEK);
  }

  _onSingleMonthChange(val) {
    this._onDateFilterValueChange(val, DATE_TYPE.SINGLE_MONTH);
  }

  ngAfterViewInit() {
    this.biService
      .fetchLastAvailDate() //
      .subscribe(({ data }) => {
        let lastAvailDate =
          data && data.latestDate ? moment(data.latestDate) : moment();
        lastAvailDate = lastAvailDate.endOf('day');
        console.log('>>>lastAvailDate', lastAvailDate.format());
        this.lastAvailDate = lastAvailDate;
        this.renderDatePickers(lastAvailDate);
      });
  }

  renderDatePickers(lastAvailDate) {
    // TODO 处理销毁
    const renderFn = (comp, props, ct) => {
      ReactDOM.render(
        React.createElement(comp, {
          locale,
          ...props,
        }),
        ct,
      );
    };

    const disabledDateAfterLastAvail = mDate => {
      return mDate.diff(lastAvailDate, 'days', true) > 0;
    };
    this.objTypes.forEach(config => {
      // TODO 动态添加dom容器，把配置映射
      const { type, delta } = config;
      const options = config.options || {};
      if (type === DATE_TYPE.RANGE_DAY) {
        let otherOptions;
        if (config.limit) {
          let start;
          otherOptions = {
            disabledDate(date) {
              if (start) {
                return (
                  date.diff(start, 'days') >= 30 ||
                  disabledDateAfterLastAvail(date)
                );
              }
              return false;
            },
            onCalendarChange(dates) {
              if (dates.length === 1) {
                start = dates[0];
              } else {
                start = null;
              }
            },
          };
        }
        renderFn(
          DatePicker.RangePicker,
          {
            showToday: false,
            // TODO 在最后拦截包装 disabledDateAfterLastAvail
            disabledDate: disabledDateAfterLastAvail,
            ...options,
            ...otherOptions,
            onChange: mDates => {
              this._onRangeDateChange(mDates);
            },
          },
          this.rangeDateCt.nativeElement,
        );
      } else if (type === DATE_TYPE.SINGLE_WEEK) {
        renderFn(
          DatePicker.WeekPicker,
          {
            ...options,
            defaultValue: moment(lastAvailDate),
            disabledDate(mDate) {
              // TODO 不能点了，但是没有 ui 提示 disabled
              // TODO 所有 diff 都加上 true
              return (
                mDate.diff(moment(lastAvailDate).endOf('week'), 'days', true) >
                0
              );
            },
            onChange: mDate => {
              this._onSingleWeekChange(this._calcRangeValue(mDate, delta));
            },
          },
          this.singleWeekCt.nativeElement,
        );
        this._lastValueMap[type] = this._calcRangeValue(lastAvailDate, delta);
      } else if (type === DATE_TYPE.SINGLE_MONTH) {
        renderFn(
          DatePicker.MonthPicker,
          {
            ...options,
            defaultValue: moment(lastAvailDate),
            disabledDate(mDate) {
              return (
                mDate.startOf('month').diff(lastAvailDate, 'days', true) > 0
              );
            },
            onChange: mDate => {
              this._onSingleMonthChange(this._calcRangeValue(mDate, delta));
            },
          },
          this.singleMonthCt.nativeElement,
        );
        this._lastValueMap[type] = this._calcRangeValue(lastAvailDate, delta);
      } else if (type === DATE_TYPE.SINLGE_DAY_4_RANGE) {
        renderFn(
          DatePicker,
          {
            ...options,
            disabledDate(mDate) {
              return mDate.diff(lastAvailDate, 'days') > 0;
            },
            defaultValue: moment(lastAvailDate),
            onChange: mDate => {
              this._onSingleDay4RangeChange(this._calcRangeValue(mDate, delta));
            },
          },
          this.singleDay4RangeCt.nativeElement,
        );
        this._lastValueMap[type] = this._calcRangeValue(lastAvailDate, delta);
      }

      // TODO 提供配置，初次不要触发
    });
    this.onOptionChange(this.dateType);
  }

  getValue() {
    return this.biService.fetchLastAvailDate().pipe(
      rxMap(() => {
        return {
          type: this.dateType,
          val: this._lastValueMap[this.dateType],
        };
      }),
    );
  }

  _calcRangeValue(endDate, [dis, strCycle]) {
    let end = moment(endDate);
    let start = moment(endDate).add(dis, strCycle);
    const longTermCycle = {
      weeks: 'week',
      months: 'month',
    };
    if (longTermCycle[strCycle]) {
      start = start.startOf(longTermCycle[strCycle]);
      end = end.endOf(longTermCycle[strCycle]);
      if (end.diff(moment(), 'days', true) > 0) {
        end = moment(this.lastAvailDate);
      }
    }
    return [start, end];
  }

  /* model access start */

  writeValue(value: DateFilterVal) {
    this._value = value;
  }

  registerOnChange(fn: (_: DateFilterVal) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}
