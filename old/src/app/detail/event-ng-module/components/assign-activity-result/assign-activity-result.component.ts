import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Input,
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
let retryTime: number = 0;

type operationInfo = {
  name: string;
  link: string;
};

@Component({
  selector: 'app-event-assign-activity-result',
  templateUrl: './assign-activity-result.component.html',
  styleUrls: ['./assign-activity-result.component.less'],
})
export class EventAssignActResultComponent implements OnInit {
  @Input() assignActResult: any[] = [];
  @Input() assignParams: any;
  @Input() targetKols: any[] = [];
  @Input() isView: boolean = false;
  _dateRange: object = {};
  _dateRangeAll: object = {};
  _loading: boolean = false;
  assignOutput = { failList: [], successResult: [] };
  failAssignList: any[] = [];
  successAssignResult: any[] = [];

  _isSpinning: boolean = false;
  _spinTip: string = '正在批量指派营销活动...';

  _isLoading: boolean = true;
  progress: number = 0;

  constructor(
    private subject: NzModalSubject,
    private eventService: EventService,
    private _message: NzMessageService,
  ) {}

  ngOnInit() {
    // this.assignActResult = [{"kolId":null,"kolName":"ERROR-批量指派营销活动异常,请联系研发处理!异常信息：org.apache.shiro.session.InvalidSessionException: java.lang.IllegalStateException: Invalid for read: id=node0e1qrk5i9fph617yj9b50s576n0 created=1524923311750 accessed=1524923442531 lastaccessed=1524923441404 maxInactiveMs=1800000 expiry=1524925242531","generateResult":null,"allGenerateCount":null,"generateSuccessCount":null,"generateResultItemList":null}];
    // this._isSpinning = false;
    // this.initExpand();
    if (!this.isView) {
      retryTime = 0;
      this.getAssign();
    } else {
      this._isLoading = false;
      this.initExpand();
    }
  }

  initExpand() {
    this.assignActResult = this.assignActResult.map(result => {
      result.expand = result.generateResult;
      return result;
    });
  }

  ngOnDestroy() {
    clearTimeout(timer);
  }

  initResult(results) {
    this.assignActResult = this.removeUndisplayItem(results);
    // 初始化参数！！
    this._dateRange = {};
    this._dateRangeAll = {};
    this.assignOutput = { failList: [], successResult: [] };
    this.assignActResult.forEach((result, index_1) => {
      let tmpResult;
      if (!result.generateResult) {
        this.assignOutput.successResult.push(result);
      } else {
        tmpResult = {
          ...result,
          generateResultItemList: [],
        };
      }
      result.generateResultItemList.forEach((item, index_2) => {
        if (!item.generateResult) {
          this._dateRange[`${index_1}-${index_2}`] = this.generateDateRange(
            item.startTime,
            item.endTime,
          );
          this._dateRangeAll[index_1] = [null, null];
          if (result.generateResult) {
            tmpResult.generateResultItemList.push(item);
          }
        } else {
          this.assignOutput.failList.push({
            kolId: result.kolId,
            templateId: item.templateId,
          });
        }
      });
      if (result.generateResult) {
        this.assignOutput.successResult.push(tmpResult);
      }
    });

    this.initExpand();
  }

  removeUndisplayItem(assignActResult: any[]): any[] {
    const tmpResult = assignActResult.slice(0);
    const emptyIndex = [];
    tmpResult.forEach((result, index) => {
      if (result.generateResultItemList) {
        let itemList = result.generateResultItemList;
        const oldLen = itemList.length;
        itemList = itemList.filter(item => item.operationType !== 4);
        if (itemList.length) {
          result.generateResultItemList = itemList;
          const newLen = itemList.length;
          if (oldLen !== newLen) {
            const {
              allGenerateCount,
              generateSuccessCount,
              generateResult,
            } = this.refreshTotalStatus(itemList);
            result.allGenerateCount = allGenerateCount;
            result.generateSuccessCount = generateSuccessCount;
            result.generateResult = generateResult;
          }
        } else {
          emptyIndex.push(index);
        }
      }
    });
    return tmpResult.filter((result, index) => !emptyIndex.includes(index));
  }

  generateDateRange(start: string, end: string): Date[] {
    return [moment(start).toDate(), moment(end).toDate()];
  }

  dateRangeToString(date: Date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  validateTime(index_1: number, index_2: number, range: Date[]): boolean {
    if (!range.length || range[0] === null) {
      return false;
    }
    if (moment(range[0]).isBefore(moment())) {
      this._message.create('warning', '活动开始时间需晚于当前时间');
      this.resetTime(index_1, index_2);
      return false;
    }
    if (!moment(range[0]).isBefore(moment(range[1]))) {
      this._message.create('warning', '活动结束时间需晚于开始时间');
      this.resetTime(index_1, index_2);
      return false;
    }
    return true;
  }

  resetTime(index_1: number, index_2: number = -1): void {
    if (index_2 !== -1) {
      const { startTime, endTime } = this.assignActResult[
        index_1
      ].generateResultItemList[index_2];
      this._dateRange[`${index_1}-${index_2}`] = this.generateDateRange(
        startTime,
        endTime,
      );
      return;
    }
    // this._dateRangeAll[index_1] = [null,null];
  }

  selectTime(index_1: number, index_2: number, value: Date[]) {
    if (!this.validateTime(index_1, index_2, value)) {
      return;
    }
    this._loading = true;
    // this._message.create('info', '正在设置活动时间...');
    const newStartTime = this.dateRangeToString(value[0]);
    const newEndTime = this.dateRangeToString(value[1]);
    const updateList = [];
    if (index_2 !== -1) {
      const targetResult = this.assignActResult[index_1].generateResultItemList[
        index_2
      ];
      const { xdpId, grouponActivityId } = targetResult;
      // targetResult.startTime = newStartTime;
      // targetResult.endTime = newEndTime;
      // targetResult.edit = false;
      updateList.push({
        xdpId,
        grouponActivityId,
        startTime: newStartTime,
        endTime: newEndTime,
      });
    } else {
      this.assignActResult[index_1].generateResultItemList.forEach(
        (item, i) => {
          if (!item.generateResult) {
            const { xdpId, grouponActivityId } = item;
            // item.startTime = newStartTime;
            // item.endTime = newEndTime;
            updateList.push({
              xdpId,
              grouponActivityId,
              startTime: newStartTime,
              endTime: newEndTime,
            });
            // 更新所有成功的时间
            this._dateRange[`${index_1}-${i}`] = value;
          }
        },
      );
    }

    this.updateActivityTime(
      updateList,
      index_1,
      index_2,
      value,
      newStartTime,
      newEndTime,
    );
  }

  setSeckillTime(
    index_1: number,
    index_2: number,
    value: Date[],
    newStartTime: string,
    newEndTime: string,
  ) {
    if (index_2 !== -1) {
      const targetResult = this.assignActResult[index_1].generateResultItemList[
        index_2
      ];
      const { xdpId, grouponActivityId } = targetResult;
      targetResult.startTime = newStartTime;
      targetResult.endTime = newEndTime;
      targetResult.edit = false;
    } else {
      this.assignActResult[index_1].generateResultItemList.forEach(
        (item, i) => {
          if (!item.generateResult) {
            const { xdpId, grouponActivityId } = item;
            item.startTime = newStartTime;
            item.endTime = newEndTime;
            // 更新所有成功的时间
            this._dateRange[`${index_1}-${i}`] = value;
          }
        },
      );
    }
  }

  updateActivityTime(
    updateList: any[],
    index_1: number,
    index_2: number,
    value: Date[],
    newStartTime: string,
    newEndTime: string,
  ) {
    const params: any = {};
    params['grouponBatchUpdateDtoStr'] = JSON.stringify(updateList);
    this.eventService
      .updateActivityTime(params)
      .pipe(
        catchError((error: any) => {
          // debugger;
          this._loading = false;
          this._message.create('error', '修改失败！');
          this.resetTime(index_1, index_2);
          console.log('setSeckillTime_err', error);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        // debugger;
        this._loading = false;
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          this._message.create('error', '修改失败！');
          this.resetTime(index_1, index_2);
          console.log('setSeckillTime_err', res.msg);
          return;
        }
        this._message.create('success', '修改成功！');
        this.setSeckillTime(index_1, index_2, value, newStartTime, newEndTime);
      });
  }

  reAssignActivities() {
    // this.subject.next(this.assignOutput);
    // this.subject.destroy();

    this._spinTip = '正在重新指派失败的营销活动...';
    this._isSpinning = true;
    this.eventService
      .postReAssignActivities({
        reGenerateGrouponActivityDtoStr: JSON.stringify(
          this.assignOutput.failList,
        ),
      })
      .pipe(
        catchError((error: any) => {
          // debugger;
          this._isSpinning = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        // debugger;
        this._isSpinning = false;
        if (res && res.data) {
          let result = this.mergeAssignResult(
            res.data,
            this.assignOutput.successResult,
          );
          result = this.sortAssignResult(result);
          this.initResult(result);
        }
      });
  }

  mergeAssignResult(resData: any[], successResult: any[]) {
    return successResult.map(result => {
      const targets = resData.filter(cur => cur.kolId === result.kolId);
      if (targets.length && result.generateResultItemList) {
        let generateResultItemList = result.generateResultItemList;
        targets.forEach(target => {
          generateResultItemList = generateResultItemList.concat(
            target.generateResultItemList,
          );
        });
        const {
          allGenerateCount,
          generateSuccessCount,
          generateResult,
        } = this.refreshTotalStatus(generateResultItemList);
        return {
          ...result,
          generateResultItemList,
          allGenerateCount,
          generateSuccessCount,
          generateResult,
        };
      }
      return result;
    });
  }

  refreshTotalStatus(itemList) {
    const allGenerateCount = itemList.length;
    const generateSuccessCount = itemList.filter(cur => !cur.generateResult)
      .length;
    const generateResult = allGenerateCount === generateSuccessCount ? 0 : 1;
    return {
      allGenerateCount,
      generateSuccessCount,
      generateResult,
    };
  }

  complete() {
    this.subject.destroy();
  }

  getOperationInfo(
    operationType: number,
    index_1: number,
    index_2: number,
  ): operationInfo {
    if (operationType === 1) {
      const kolId = this.assignActResult[index_1].kolId;
      return {
        name: '目标店铺拼团列表',
        link: `/event/group?kolId=${kolId}`,
      };
    }
    if (operationType === 5) {
      const kolId = this.assignActResult[index_1].kolId;
      return {
        name: '目标店铺秒杀列表',
        link: `/event/seckill?kolId=${kolId}`,
      };
    }
    if (operationType === 2) {
      const targetId = this.assignActResult[index_1].generateResultItemList[
        index_2
      ].targetId;
      return {
        name: '子商品编辑',
        link: `/goods/generate-sub-goods/${targetId}`,
      };
    }
    if (operationType === 3) {
      const grouponActivityId = this.assignActResult[index_1]
        .generateResultItemList[index_2].grouponActivityId;
      const kolId = this.assignActResult[index_1].kolId;
      return {
        name: '活动编辑',
        link: `/event/group/${grouponActivityId}/edit?kolId=${kolId}&wechat_id=`,
      };
    }
    return {
      name: '',
      link: '#',
    };
  }

  getAssign() {
    this.eventService
      .postBatchAssignActivities_asyn(this.assignParams)
      .pipe(
        catchError((error: any) => {
          // debugger;
          this._isLoading = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        // debugger;
        if (!res) {
          return;
        }
        if (res.msg.toLowerCase() === 'pending') {
          // this.progress = Math.floor(+res.data);
          this.progress = +(+res.data).toFixed(1);
          timer = setTimeout(() => {
            this.getAssign();
          }, 200);
        } else if (res.msg.toLowerCase() === 'success' && res.data) {
          if (res.data.length) {
            // 展现100%状态
            this.progress = 100;
            timer = setTimeout(() => {
              this._isLoading = false;
              const results = this.sortAssignResult(res.data);
              this.initResult(results);
            }, 300);
          } else {
            if (retryTime < 3) {
              timer = setTimeout(() => {
                this.getAssign();
              }, 500);
              retryTime += 1;
            }
          }
        }
      });
  }

  findKolIndex(kolName: string): number {
    return _.findIndex(this.targetKols, o => o.kolName === kolName);
  }

  sortAssignResult(result: any[]): any[] {
    // 母列表项排序
    const assignActResult: any[] = result.sort((a, b) => {
      const failComp = b.generateResult - a.generateResult;
      if (failComp !== 0) {
        return failComp;
      }
      return this.findKolIndex(a.kolName) - this.findKolIndex(b.kolName);
    });
    // 子列表项排序
    assignActResult.forEach(result => {
      if (result.generateResultItemList) {
        result.generateResultItemList.sort((a, b) => {
          const failComp = b.generateResult - a.generateResult;
          if (failComp !== 0) {
            return failComp;
          }
          return moment(b.startTime).isBefore(a.startTime);
        });
      }
    });
    return assignActResult;
  }
}
