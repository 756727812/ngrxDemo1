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
import { DataService } from '../../../../services/data-service/data-service';

import { TableExport } from 'tableexport';
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

// 子商品状态：1=等待开始 2=正在进行中 3=成功 4=失败
enum TASK_STATUS {
  WAITING = 1,
  PENDING = 2,
  SUCCESS = 3,
  FAIL = 4,
}

// 聚合后的母商品状态：1=等待开始 2=正在进行中 3=全部成功 4=全部失败 5=部分失败
enum GOODS_STATUS {
  WAITING = 1,
  PENDING = 2,
  SUCCESS = 3,
  FAIL = 4,
  PART_FAIL = 5,
}

// 针对具体批量复制类型，格式化获取表头字段
const formatResult = {
  [BATCH_COPY_TYPE.GOODS]: (list: any[]) => {
    const _list = list.filter(item => item.destId !== item.sourceId);
    return _.toPairs(_.groupBy(_list, 'sourceId')).map(pairs => {
      const childList = pairs[1];
      const parentItemName = getParentName(childList[0].sourceInfo);
      const parentItemId = childList[0].sourceId;
      const generateResult = getGoodsStatus(childList);
      const failedReason = getFailReason(generateResult, childList);
      return {
        parentItemName,
        parentItemId,
        generateResult,
        failedReason,
      };
    });
  },
  [BATCH_COPY_TYPE.GROUP]: (list: any[]) => {
    return [];
  },
  [BATCH_COPY_TYPE.SECKILL]: (list: any[]) => {
    return [];
  },
  [BATCH_COPY_TYPE.COUPON]: (list: any[]) => {
    return [];
  },
  [BATCH_COPY_TYPE.ORDER_RETURN_COUPON]: (list: any[]) => {
    return [];
  },
  [BATCH_COPY_TYPE.REDUCE]: (list: any[]) => {
    return [];
  },
  [BATCH_COPY_TYPE.MICRO_PAGE]: (list: any[]) => {
    return [];
  },
};

const getParentName = (sourceInfo: string) => {
  let parentItemName = '-';
  if (sourceInfo) {
    const itemName = JSON.parse(sourceInfo).itemName;
    itemName && (parentItemName = itemName);
  }
  return parentItemName;
};

const getGoodsStatus = (childList: any[]) => {
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
    return GOODS_STATUS.WAITING;
  }
  if (
    allStatus[TASK_STATUS.WAITING] > 0 ||
    allStatus[TASK_STATUS.PENDING] > 0
  ) {
    return GOODS_STATUS.PENDING;
  }
  if (allStatus[TASK_STATUS.SUCCESS] === count) {
    return GOODS_STATUS.SUCCESS;
  }
  if (allStatus[TASK_STATUS.FAIL] === count) {
    return GOODS_STATUS.FAIL;
  }
  return GOODS_STATUS.PART_FAIL;
};

const getFailReason = (goodsStatus: GOODS_STATUS, childList: any[]): string => {
  if (
    goodsStatus === GOODS_STATUS.FAIL ||
    goodsStatus === GOODS_STATUS.PART_FAIL
  ) {
    const oneFail = childList.filter(
      item => item.status === TASK_STATUS.FAIL && item.publicErrmsg,
    )[0];
    if (oneFail && oneFail.publicErrmsg) {
      return oneFail.publicErrmsg;
    }
    return '(失败原因缺失)';
  }
  return '';
};

// 状态排序列表
const statusOrders: GOODS_STATUS[] = [
  GOODS_STATUS.PENDING,
  GOODS_STATUS.WAITING,
  GOODS_STATUS.PART_FAIL,
  GOODS_STATUS.FAIL,
  GOODS_STATUS.SUCCESS,
];

// 排序
const sortResult = (list: any[]) => {
  return list.sort((a, b) => {
    const statusCmp =
      statusOrders.indexOf(a.generateResult) -
      statusOrders.indexOf(b.generateResult);
    if (statusCmp !== 0) {
      return statusCmp;
    }
    return a.parentItemId - b.parentItemId;
  });
};

@Component({
  selector: 'app-event-child-items-result-v2',
  templateUrl: './child-items-result-v2.component.html',
  styleUrls: ['./child-items-result-v2.component.less'],
})
export class EventChildItemsResultV2Component implements OnInit {
  @Input() isView: boolean = false;
  @Input() hasComplete: boolean = false;
  @Input() batchId: string;
  @Input() type: BATCH_COPY_TYPE;
  @Input() exitBtn: any = { show: false, type: 'default' };
  @Input() exportBtn: any = { show: false, type: 'default' };
  @Input() assignBtn: any = { show: false, type: 'primary' };
  childItemsResult: any[] = [];
  failChildItems: any[] = [];
  successCount: number = 0;

  tableExportInstance: any;

  _isSpinning: boolean = true;
  showProgress: boolean = true;
  progress: number = 0;

  hasDestroy: boolean = false;

  constructor(
    private subject: NzModalSubject,
    private eventService: EventService,
    private _message: NzMessageService,
    @Inject('dataService') private dataService: see.IDataService,
  ) {}

  ngOnInit() {
    const batchId = this.batchId;
    const type = this.type;
    if (batchId && type) {
      this.getTaskResult(batchId, type);
    }
  }

  // 查询批量复制结果
  getTaskResult(batchId: string, type: BATCH_COPY_TYPE): void {
    this.dataService.ng_batchCopy_listTask({ batchId }).then(
      res => {
        if (!res) {
          return;
        }
        if (this._isSpinning) {
          this._isSpinning = false;
        }
        this.setResultData(BATCH_COPY_TYPE.GOODS, res.data.list);
        const progress = this.getTaskProgress(res.data);
        this.progress = progress;
        if (progress !== 100 && !this.hasDestroy) {
          timer = setTimeout(() => this.getTaskResult(batchId, type), 500);
          return;
        }
        // 延迟展示100%进度条
        timer = setTimeout(() => (this.showProgress = false), 300);
      },
      err => {
        this._isSpinning = false;
        this._message.create('error', '查询批量复制结果失败！');
        console.log('task_err', err);
      },
    );
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
    this.childItemsResult = sortedList;
    this.failChildItems = this.getResultByStatus(sortedList, [
      GOODS_STATUS.FAIL,
      GOODS_STATUS.PART_FAIL,
    ]);
    this.successCount = this.getResultByStatus(sortedList, [
      GOODS_STATUS.SUCCESS,
    ]).length;

    // 配置excel导出信息
    this.configExportInstance();
  }

  getResultByStatus(list: any[], statusArr: GOODS_STATUS[]): any[] {
    return list.filter(item => statusArr.includes(item.generateResult));
  }

  batchAssignActivities() {
    if (this.successCount > 0) {
      this.subject.next('batchAssign');
      this.subject.destroy();
    } else {
      this._message.create('warning', '没有成功生成的子商品条目');
    }
  }

  exit() {
    this.subject.destroy();
  }

  ngOnDestroy() {
    this.hasDestroy = true;
    clearTimeout(timer);
  }

  configExportInstance() {
    const dom = document.querySelector('.child-items-table');
    if (dom) {
      setTimeout(() => {
        const nowStr = moment().format('YYYYMMDD_HHmmss');
        this.tableExportInstance = new TableExport(dom, {
          formats: ['xlsx'],
          filename: `问题母商品列表-${nowStr}`,
          exportButtons: false,
        });
        this.tableExportInstance.reset();
      });
    }
  }

  exportFailItems() {
    try {
      if (this.tableExportInstance) {
        const dataInfo = this.tableExportInstance.getExportData()[
          'child-items-table'
        ].xlsx;
        const { data, fileExtension, filename, merges, mimeType } = dataInfo;
        this.tableExportInstance.export2file(
          data,
          mimeType,
          filename,
          fileExtension,
          merges,
        );
      }
    } catch (e) {}
  }
}
