import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Input,
  Inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';
import * as _ from 'lodash';

let timer: any;

// 1=商品 2=拼团 3=秒杀 4=优惠劵 5=下单返券 6=满减 7=微页面
enum BATCH_COPY_TYPE {
  GOODS = 1,
  GROUP = 2,
  SECKILL = 3,
  COUPON = 4,
  ORDER_RETURN_COUPON = 5,
  REDUCE = 6,
  MICRO_PAGE = 7,
}

// 任务状态：1=等待开始 2=正在进行中 3=成功 4=失败
enum TASK_STATUS {
  WAITING = 1,
  PENDING = 2,
  SUCCESS = 3,
  FAIL = 4,
}

// 聚合后的KOL指派状态：1=等待开始 2=正在进行中 3=全部成功 4=全部失败 5=部分失败
enum KOL_STATUS {
  WAITING = 1,
  PENDING = 2,
  SUCCESS = 3,
  FAIL = 4,
  PART_FAIL = 5,
}

// 针对具体批量复制类型，格式化获取表头字段
const formatResult = {
  common: (
    list: any[],
    customFun?: (
      item: any,
    ) => {
      id?: number;
      productName?: string;
      generateResult?: number;
      failedReason?: string;
      startTime?: string;
      endTime?: string;
      jump?: { jumpText: string; jumpLink: string };
    },
  ) => {
    return _.toPairs(_.groupBy(list, 'destKolId')).map(pairs => {
      const childList = pairs[1];

      // 母列表
      const kolId = +childList[0].destKolId;
      const kolName = childList[0].destKolName;
      const generateResult = getMergeStatus(childList);
      const generateSuccessCount = getResultByStatus(childList, [
        TASK_STATUS.SUCCESS,
      ]).length;
      const allGenerateCount = childList.length;

      // 子列表
      const generateResultItemList = childList.map(item => {
        let customObj = {};
        if (customFun) {
          customObj = customFun(item);
        }
        return {
          id: +item.id,
          productName: getItemInfo(item, 'itemName'),
          generateResult: item.status,
          failedReason: item.publicErrmsg,
          startTime: getItemInfo(item, 'startTime'),
          endTime: getItemInfo(item, 'endTime'),
          jump: getJumpInfo(item.opHref),
          ...customObj,
        };
      });

      return {
        kolId,
        kolName,
        generateResult,
        generateSuccessCount,
        allGenerateCount,
        generateResultItemList,
      };
    });
  },
  [BATCH_COPY_TYPE.GROUP]: (list: any[]) => {
    return formatResult.common(list);
  },
  [BATCH_COPY_TYPE.SECKILL]: (list: any[]) => {
    return formatResult.common(list);
  },
  [BATCH_COPY_TYPE.COUPON]: (list: any[]) => {
    return formatResult.common(list);
  },
  [BATCH_COPY_TYPE.ORDER_RETURN_COUPON]: (list: any[]) => {
    // return formatResult.common(list);
    const myFun = item => {
      return {
        productName: getItemInfo(item, 'activityName'),
      };
    };
    return formatResult.common(list, myFun);
  },
  [BATCH_COPY_TYPE.REDUCE]: (list: any[]) => {
    return formatResult.common(list);
  },
  [BATCH_COPY_TYPE.MICRO_PAGE]: (list: any[]) => {
    return formatResult.common(list);
  },
};

const getMergeStatus = (childList: any[]) => {
  const count = childList.length;
  const allStatus = {
    [TASK_STATUS.WAITING]: 0,
    [TASK_STATUS.PENDING]: 0,
    [TASK_STATUS.SUCCESS]: 0,
    [TASK_STATUS.FAIL]: 0,
  };
  childList.forEach(
    child => (allStatus[child.status] = allStatus[child.status] + 1),
  );
  if (allStatus[TASK_STATUS.WAITING] === count) {
    return KOL_STATUS.WAITING;
  }
  if (
    allStatus[TASK_STATUS.WAITING] > 0 ||
    allStatus[TASK_STATUS.PENDING] > 0
  ) {
    return KOL_STATUS.PENDING;
  }
  if (allStatus[TASK_STATUS.SUCCESS] === count) {
    return KOL_STATUS.SUCCESS;
  }
  if (allStatus[TASK_STATUS.FAIL] === count) {
    return KOL_STATUS.FAIL;
  }
  return KOL_STATUS.PART_FAIL;
};

const getResultByStatus = (list: any[], statusArr: TASK_STATUS[]): any[] => {
  return list.filter(item => statusArr.includes(item.status));
};

const getItemInfo = (item: any, key: string) => {
  let value = '';
  if (item.destInfo) {
    const itemInfo = JSON.parse(item.destInfo)[key];
    itemInfo && (value = itemInfo);
    return value;
  }
  if (item.sourceInfo) {
    const itemInfo = JSON.parse(item.sourceInfo)[key];
    itemInfo && (value = itemInfo);
    return value;
  }
  return value;
};

const getJumpInfo = (opHref): any => {
  if (opHref) {
    return {
      jumpText: opHref.split(':')[0],
      jumpLink: opHref.split(':')[1],
    };
  }
  return { jumpText: '', jumpLink: '' };
};

// 状态排序列表 - 母列表
const mergeOrders: KOL_STATUS[] = [
  KOL_STATUS.PENDING,
  KOL_STATUS.WAITING,
  KOL_STATUS.PART_FAIL,
  KOL_STATUS.FAIL,
  KOL_STATUS.SUCCESS,
];

// 母列表KOL排序列表
let kolOrders = [];

// 状态排序列表 - 子列表
const childOrders: TASK_STATUS[] = [
  TASK_STATUS.PENDING,
  TASK_STATUS.WAITING,
  TASK_STATUS.FAIL,
  TASK_STATUS.SUCCESS,
];

// 排序
const sortResult = (list: any[]): any[] => {
  list.sort((a, b) => {
    const statusCmp =
      mergeOrders.indexOf(a.generateResult) -
      mergeOrders.indexOf(b.generateResult);
    if (statusCmp !== 0) {
      return statusCmp;
    }
    return kolOrders.length
      ? kolOrders.indexOf(a.kolId) - kolOrders.indexOf(b.kolId)
      : a.kolId - b.kolId;
  });
  list.forEach(kolItem => {
    kolItem.generateResultItemList.sort((a, b) => {
      const statusCmp =
        childOrders.indexOf(a.generateResult) -
        childOrders.indexOf(b.generateResult);
      if (statusCmp !== 0) {
        return statusCmp;
      }
      return moment(b.startTime).isBefore(a.startTime);
    });
  });
  return list;
};

@Component({
  selector: 'app-event-assign-activity-result-ng5',
  templateUrl: './assign-activity-result-ng5.component.html',
  styleUrls: ['./assign-activity-result-ng5.component.less'],
})
export class EventAssignActResultNg5Component implements OnInit {
  @Input() assignActResult: any[] = [];
  @Input() isView: boolean = false;
  @Input() hasComplete: boolean = false;
  @Input() batchId: string;
  @Input() type: BATCH_COPY_TYPE;
  @Input() kolOrders: any[] = [];

  itemName: string = '商品名';
  enableTimeEdit: boolean = true;

  _dateRange: object = {};
  _dateRangeAll: object = {};

  _isSpinning: boolean = false;
  showProgress: boolean = false;
  progress: number = 0;

  hasDestroy: boolean = false;

  get allSuccess(): boolean {
    return this.assignActResult.every(
      result => result.generateResult === KOL_STATUS.SUCCESS,
    );
  }

  constructor(
    private subject: NzModalSubject,
    private eventService: EventService,
    private _message: NzMessageService,
  ) {}

  ngOnInit() {
    kolOrders = this.kolOrders;

    const batchId = this.batchId;
    const type = this.type;
    this.intForBatchType(type);
    if (batchId && type) {
      this.getTaskResult(batchId, type);
    }
  }

  intForBatchType(type: BATCH_COPY_TYPE) {
    if (type === BATCH_COPY_TYPE.ORDER_RETURN_COUPON) {
      this.itemName = '活动名称';
      this.enableTimeEdit = false;
    }
  }

  ngOnDestroy() {
    this.hasDestroy = true;

    clearTimeout(timer);
  }

  // 查询批量复制结果
  getTaskResult(batchId: string, type: BATCH_COPY_TYPE): void {
    this._isSpinning = true;
    this.showProgress = true;
    this.progress = 0;
    this.getTaskInterval(batchId, type);
  }

  getTaskInterval(batchId: string, type: BATCH_COPY_TYPE): void {
    this.eventService
      .ng_batchCopy_listTask({ batchId })
      .pipe(
        catchError((err: any) => {
          this._isSpinning = false;
          this._message.create('error', '查询批量复制结果失败！');
          console.log('task_err', err);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (this._isSpinning) {
          this._isSpinning = false;
        }
        this.setResultData(type, res.data.list);
        const progress = this.getTaskProgress(res.data);
        this.progress = progress;
        if (progress !== 100 && !this.hasDestroy) {
          timer = setTimeout(() => this.getTaskInterval(batchId, type), 500);
          return;
        }
        // 延迟展示100%进度条
        timer = setTimeout(() => (this.showProgress = false), 300);
      });
  }

  getTaskProgress(data: any): number {
    let progress = 0;
    const { list, count } = data;
    if (count > 0) {
      const completeResult = list.filter(item =>
        [TASK_STATUS.SUCCESS, TASK_STATUS.FAIL].includes(item.status),
      );
      progress = +(completeResult.length / count * 100).toFixed(1);
    }
    return progress;
  }

  setResultData(type: BATCH_COPY_TYPE, list: any[]): void {
    const formatList = formatResult[type](list);
    const sortedList = sortResult(formatList);
    this.assignActResult = sortedList;
    this.initDateRange();
    this.initExpand();
  }

  initDateRange() {
    this._dateRange = {};
    this._dateRangeAll = {};
    this.assignActResult.forEach(result => {
      result.generateResultItemList.forEach(item => {
        if (item.generateResult === TASK_STATUS.SUCCESS) {
          this._dateRange[item.id] = this.generateDateRange(
            item.startTime,
            item.endTime,
          );
          this._dateRangeAll[result.kolId] = [null, null];
        }
      });
    });
  }

  initExpand() {
    this.assignActResult = this.assignActResult.map(result => {
      result.expand =
        this.progress !== 100 ||
        [KOL_STATUS.PART_FAIL, KOL_STATUS.FAIL].includes(result.generateResult);
      return result;
    });
  }

  generateDateRange(start: string, end: string): Date[] {
    return [moment(start).toDate(), moment(end).toDate()];
  }

  dateRangeToString(date: Date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  validateTime(kolId: number, id: number, range: Date[]): boolean {
    if (!range.length || range[0] === null) {
      return false;
    }
    if (moment(range[0]).isBefore(moment())) {
      this._message.create('warning', '活动开始时间需晚于当前时间');
      this.resetTime(kolId, id);
      return false;
    }
    if (!moment(range[0]).isBefore(moment(range[1]))) {
      this._message.create('warning', '活动结束时间需晚于开始时间');
      this.resetTime(kolId, id);
      return false;
    }
    return true;
  }

  searchArryByKey(list: any[], key: string, value: any): any {
    return _.find(list, o => o[key] === value);
  }

  getMergeItem(kolId: number): any {
    return this.searchArryByKey(this.assignActResult, 'kolId', kolId);
  }

  getChildItem(kolId: number, id: number): any {
    const mergeItem = this.getMergeItem(kolId);
    return this.searchArryByKey(mergeItem.generateResultItemList, 'id', id);
  }

  resetTime(kolId: number, id: number = -1): void {
    if (id !== -1) {
      const { startTime, endTime } = this.getChildItem(kolId, id);
      this._dateRange[id] = this.generateDateRange(startTime, endTime);
      return;
    }
  }

  selectTime(kolId: number, id: number, value: Date[]) {
    if (!this.validateTime(kolId, id, value)) {
      return;
    }
    this._isSpinning = true;

    if (id !== -1) {
      this.setSeckillTime(kolId, [id], value);
      return;
    }
    const childList = this.getMergeItem(kolId).generateResultItemList;
    const ids = childList
      .filter(t => t.generateResult === TASK_STATUS.SUCCESS)
      .map(t => t.id);
    this.setSeckillTime(kolId, ids, value);
  }

  // 设置秒杀时间
  setSeckillTime(kolId: number, logIds: number[], value: Date[]) {
    const newStartTime = this.dateRangeToString(value[0]);
    const newEndTime = this.dateRangeToString(value[1]);
    this.eventService
      .ng_batchCopy_setSeckillTime({
        logIds,
        startTime: newStartTime,
        endTime: newEndTime,
      })
      .pipe(
        catchError((err: any) => {
          this._isSpinning = false;
          this._message.create('error', '修改失败！');
          logIds.forEach(id => this.resetTime(kolId, id));
          console.log('setSeckillTime_err', err);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this._isSpinning = false;
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          this._message.create('error', '修改失败！');
          logIds.forEach(id => this.resetTime(kolId, id));
          console.log('setSeckillTime_err', res.msg);
          return;
        }
        this._message.create('success', '修改成功！');
        logIds.forEach(id =>
          this.updateResultSeckillTime(
            kolId,
            id,
            value,
            newStartTime,
            newEndTime,
          ),
        );
      });
  }

  updateResultSeckillTime(
    kolId: number,
    id: number,
    value: Date[],
    newStartTime: string,
    newEndTime: string,
  ) {
    const targetResult = this.getChildItem(kolId, id);
    targetResult.startTime = newStartTime;
    targetResult.endTime = newEndTime;
    targetResult.edit = false;
    this._dateRange[id] = value;
  }

  complete() {
    this.subject.destroy();
  }

  // 重新指派
  reAssign(batchId, type) {
    this._isSpinning = true;
    this.eventService
      .ng_batchCopy_reAdd(batchId)
      .pipe(
        catchError((err: any) => {
          this._isSpinning = false;
          this._message.create('error', '重新指派失败！');
          console.log('reAssign_err', err);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this._isSpinning = false;
        if (!res) {
          return;
        }
        this.getTaskResult(batchId, type);
      });
  }
}
