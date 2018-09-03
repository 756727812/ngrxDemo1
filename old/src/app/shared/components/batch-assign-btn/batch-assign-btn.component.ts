import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { BatchAssignService } from './batch-assign.service';
import { SeeKolSelectorComponent } from '@shared/components/kol-selector/kol-selector.component';
import { ProgressLoadingModalComponent } from '@shared/components/progress-loading-modal/progress-loading-modal.component';

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

@Component({
  selector: 'see-batch-assign-btn',
  templateUrl: './batch-assign-btn.component.html',
  styleUrls: ['./batch-assign-btn.component.less'],
  providers: [BatchAssignService],
})
export class SeeBatchAssignBtnComponent implements OnInit {
  @Input() btnText: string = '批量指派';
  @Input() useLinkBtn: boolean = false; // 是否使用链接a标签(文字链)，默认使用nz-button

  // nz-button 属性
  @Input() disabled: boolean = false;
  @Input() nzType: string = 'default';
  @Input() nzSize: string = 'large';

  // 批量指派相关属性
  @Input() sourceIdsRequiredTips: string = '请至少选择一个模板';
  @Input() sourceIds: number[] = [];
  @Input() sourceKolId: number;

  @Output() onBusyStatusChange = new EventEmitter<any>(); // 忙碌状态变化回调

  targetKols: any[] = [];
  get xdpIdList(): number[] {
    return this.targetKols.map(cur => cur.weixinAuthInfoId);
  }

  constructor(
    private subject: NzModalSubject,
    private batchAssignService: BatchAssignService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
  ) {}

  ngOnInit() {}

  // 点击批量指派按钮
  batchAssign() {
    if (!this.sourceIds.length) {
      this.messageService.create('warning', this.sourceIdsRequiredTips);
      return;
    }
    this.modalService
      .open({
        title: 'KOL选择',
        content: SeeKolSelectorComponent,
        onOk() {},
        width: 1000,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          confirmText: '批量指派',
        },
      })
      .subscribe(targetKols => {
        if (typeof targetKols === 'object' && targetKols.length) {
          this.targetKols = targetKols;
          console.log('targetKols:', this.targetKols);
          this.startBatchAssign();
        }
      });
  }

  // 开启批量复制任务
  startBatchAssign() {
    this.onBusyStatusChange.emit(true);

    const BatchCopyAddReq: any = {
      destXdpIds: this.xdpIdList,
      sourceIds: this.sourceIds,
      type: BATCH_COPY_TYPE.MICRO_PAGE,
      // sourceKolId: this.queryParams.kolId,
    };
    if (typeof this.sourceKolId === 'number') {
      BatchCopyAddReq.sourceKolId = this.sourceKolId;
    }
    this.batchAssignService
      .ng_batchCopy_add(BatchCopyAddReq)
      .pipe(
        catchError((err: any) => {
          this.onBusyStatusChange.emit(false);
          this.messageService.create('error', '创建任务失败！');
          console.log('add_err', err);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this.onBusyStatusChange.emit(false);
        if (!res) {
          return;
        }
        const { batchId } = res.data;
        if (!batchId) {
          this.messageService.create('error', '无法获取任务ID！');
          return;
        }

        this.showAssignLoading(batchId);
      });
  }

  // 展示批量指派loading界面
  showAssignLoading(batchId: string): void {
    this.modalService
      .open({
        title: '批量指派中...',
        content: ProgressLoadingModalComponent,
        onOk() {},
        width: 800,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          asyncProgressFun: () => this.getAssignPercent(batchId),
        },
      })
      .subscribe(output => {
        if (output === 'complete') {
          console.log('loading 100% complete!');
          /* // 指派结果
          this.getAssignResult(
            batchId,
            BATCH_COPY_TYPE.MICRO_PAGE,
            // this.kolOrders,
          ); */
        }
      });
  }

  // 查询批量指派进度
  getAssignPercent(batchId: string): Promise<string | number> {
    return new Promise((resolve, reject) => {
      this.batchAssignService
        .ng_batchCopy_statistics(batchId)
        .pipe(
          catchError((err: any) => {
            this.messageService.create('error', '查询批量指派进度失败！');
            console.log('add_err', err);
            reject(String(err));
            return Observable.of(null);
          }),
        )
        .subscribe(res => {
          if (!res || res.result !== 1) {
            this.messageService.create('error', '查询批量指派进度失败！');
            reject('接口返回出错！');
            return;
          }

          const {
            data: { percent },
          } = res;
          resolve(percent);
        });
    });
  }

  // 查询批量指派结果
  getAssignResult(
    batchId: string,
    type: BATCH_COPY_TYPE,
    // kolOrders: any[],
  ): void {
    this.onBusyStatusChange.emit(true);
    this.batchAssignService
      .ng_batchCopy_listTask(batchId)
      .pipe(
        catchError((err: any) => {
          this.onBusyStatusChange.emit(false);
          this.messageService.create('error', '查询批量复制结果失败！');
          console.log('task_err', err);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res || res.result !== 1) {
          this.messageService.create('error', '查询批量复制结果失败！');
          return;
        }
        this.onBusyStatusChange.emit(false);
        this.showAssignResult(res.data);
      });
  }

  // 展示批量指派结果
  showAssignResult(resData) {
    const { list, count } = resData;
    this.modalService
      .open({
        title: '指派结果',
        // content: EventAssignActResultNg5Component,
        content: JSON.stringify(list)
          .replace(/,/g, ', ')
          .replace(/:/g, ': '),
        onOk() {},
        width: 1100,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          // batchId,
          // type,
          // // kolOrders,
        },
      })
      .subscribe(output => {});
  }
}
