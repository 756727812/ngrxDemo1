import {
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Params,
  CanDeactivate,
  Router,
  Event as NavigationEvent,
  NavigationEnd,
} from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { parse, stringify } from 'query-string';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';
import { EventKolSelectorComponent } from '../../components/kol-selector/kol-selector.component';
import { EventAssignActResultNg5Component } from '../../components/assign-activity-result-ng5/assign-activity-result-ng5.component';

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
  selector: 'app-order-coupon-list',
  templateUrl: './order-coupon-list.component.html',
  styleUrls: ['./order-coupon-list.component.less'],
})
export class OrderCouponListComponent implements OnInit {
  urlFrom: string;
  urlBack: string;
  kolId: number = 1;
  wechatId: number = 1;

  pageIndex = 1;
  pageSize = 10;
  total = 1;
  dataSet = [];
  loading = false;

  sortType: string;
  isSorted: boolean = false;

  checkedMap = {};
  selectTemplates = {};
  keyword = '';
  _keyword = '';
  status = '';
  _allChecked = false;
  _indeterminate = false;

  modalVisible: boolean = false;
  modalText: string;
  modalEventId: string; // modal确认结束的活动ID
  modalError: string;
  queryParams = {
    xdpId: 0,
    kolId: 0,
    wechat_id: 1,
    from: 0,
  };

  statusFilter = [
    { name: '全部', value: '' },
    { name: '待开始', value: '1' },
    { name: '进行中', value: '2' },
    { name: '已结束', value: '3' },
  ];

  get canBatchAssign(): boolean {
    return this.status === '1';
  }

  constructor(
    private el: ElementRef,
    private eventService: EventService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.queryParams = {
        kolId: params.kolId,
        xdpId: params.xdpId,
        wechat_id: params.wechat_id,
        from: params.from,
      };
      // kol/kol-cooperation-management/130/1/marketing-tools -- 旧
      // kol-v2/kol-cooperation-management/130/1/marketing-tools -- 新

      // if (params.from !== 'kolV2') {
      //   this.urlBack = `/kol/kol-cooperation-management/${
      //     params.kolId
      //   }/marketing-tools?wechat_id=${params.wechat_id}`;
      // } else {
      //   this.urlBack = `/kol-v2/kol-cooperation-management/${params.kolId}/${
      //     params.wechat_id
      //   }/marketing-tools&from=kolV2`;
      // }
      this.urlBack = `/kol-v2/kol-cooperation-management/${params.kolId}/${
        params.wechat_id
      }/marketing-tools&from=kolV2`;
      this.searchData(false);
    });
  }

  searchData(reset: boolean = false): void {
    if (reset) {
      this.pageIndex = 1;
    }
    this.loading = true;
    const params = {
      page: this.pageIndex,
      pageSize: this.pageSize,
      keyword: this.keyword,
      status: this.status,
      xdpId: this.queryParams.xdpId,
    };
    if (this.isSorted) {
      params['order'] = this.sortType === 'ascend' ? 1 : 2;
    }

    this.eventService
      .getCouponActivityList(params)
      .pipe(
        catchError((error: any) => {
          this.loading = false;
          return Observable.of(null);
        }),
      )
      .subscribe(data => {
        this.loading = false;
        if (data) {
          const { count, list = [] } = data.data;
          this.total = count;
          this.dataSet = list;
        }
      });
  }
  get selectedCount(): number {
    let tmpCount = 0;
    const activityIdList = Object.keys(this.checkedMap);
    activityIdList.forEach(id => {
      if (this.checkedMap[id]) {
        tmpCount += 1;
      }
    });
    return tmpCount;
  }
  sortByTime(value) {
    if (value) {
      this.isSorted = true;
      this.searchData(true);
    } else {
      this.isSorted = false;
      this.searchData(true);
    }
  }

  checkStatus(checked) {
    if (checked) {
      this.status = '1';
    } else {
      this.status = '';
    }
    this.searchData(true);
  }

  searchClick() {
    this.keyword = this._keyword.trim();
    this.searchData(true);
  }

  _displayDataChange($event) {
    this._refreshStatus();
  }

  _refreshStatus() {
    // const allChecked =
    //   this.dataSet.length &&
    //   this.dataSet.every(value => this.checkedMap[value.id] === true);
    // const allUnChecked = this.dataSet.every(
    //   value => !this.checkedMap[value.id],
    // );
    // this._allChecked = allChecked;
    // this._indeterminate = !allChecked && !allUnChecked;
    this._indeterminate = false;
    if (
      this.dataSet.length &&
      this.dataSet.every(value => this.checkedMap[value.id] === true)
    ) {
      this._allChecked = true;
    } else if (
      this.dataSet.every(value => this.checkedMap[value.id] === false)
    ) {
      this._allChecked = false;
    } else {
      this._indeterminate = true;
    }

    // update selectTemplates
    this.dataSet.forEach(item => {
      if (this.checkedMap[item.id] === true) {
        this.selectTemplates[item.id] = {
          parentItemId: item.itemId,
          startTime: item.startTime,
        };
      } else {
        delete this.selectTemplates[item.id];
      }
    });
  }
  clearChecked() {
    this.checkedMap = {};
    this.selectTemplates = {};
    this._refreshStatus();
  }
  _checkAll(checked) {
    this.dataSet.forEach(item => {
      this.checkedMap[item.id] = item.status === 1 && checked; // 只有等待开始状态, 可以选中批量指派
    });
    this._refreshStatus();
  }
  stopEvent(id, status) {
    this.modalEventId = id;
    this.modalText =
      status === 1
        ? '是否强制结束该活动？确定后活动不可恢复！'
        : '是否强制结束该活动？确定后活动不可恢复，但不影响已发放的优惠券使用！';
    this.modalVisible = true;
  }
  modalCancel() {
    this.modalVisible = false;
  }

  modalOk(value) {
    this.modalVisible = false;
    this.loading = true;
    if (!this.modalEventId) {
      return (this.modalError = '无法获取活动ID, 请刷新页面重试');
    }
    const param = {
      id: this.modalEventId,
    };
    this.eventService
      .endCouponActivity(param)
      .pipe(
        catchError((error: any) => {
          this.loading = false;
          return Observable.of(null);
        }),
      )
      .subscribe(data => {
        console.log('data------', data);
        this.loading = false;
        if (data) {
          this.dataSet = this.dataSet.map(item => {
            if (item.id === this.modalEventId) {
              item.status = 3;
            }
            return item;
          });
        }
      });
    // alert(value)
  }

  /************************ 批量指派  start ***********************/
  _isSpinning: boolean = false;

  targetKols: any[] = [];

  get xdpIdList(): number[] {
    return this.targetKols.map(cur => cur.weixinAuthInfoId);
  }

  get kolOrders(): number[] {
    return this.targetKols.map(cur => cur.kolId);
  }

  selectKOLs(couponId) {
    this.modalService
      .open({
        title: 'KOL选择',
        content: EventKolSelectorComponent,
        onOk() {},
        width: 1000,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          hideKOLs: [+this.queryParams.kolId],
        },
      })
      .subscribe(targetKols => {
        if (typeof targetKols === 'object' && targetKols.length) {
          this.targetKols = targetKols;
          this.batchOrderCoupons(couponId);
        }
      });
  }

  // 批量生成下单返券
  batchOrderCoupons(couponId) {
    this._isSpinning = true;

    const BatchCopyAddReq = {
      destXdpIds: this.xdpIdList,
      sourceIds: [+couponId],
      type: BATCH_COPY_TYPE.ORDER_RETURN_COUPON,
      sourceKolId: this.queryParams.kolId,
    };
    // 开启批量复制任务
    this.eventService
      .ng_batchCopy_add(BatchCopyAddReq)
      .pipe(
        catchError((err: any) => {
          this._isSpinning = false;
          this.nzMessageService.create('error', '创建任务失败！');
          console.log('add_err', err);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this._isSpinning = false;
        if (!res) {
          return;
        }
        const { batchId } = res.data;
        if (!batchId) {
          this.nzMessageService.create('error', '无法获取任务ID！');
          return;
        }
        this.showAssignActResult(
          batchId,
          BATCH_COPY_TYPE.ORDER_RETURN_COUPON,
          this.kolOrders,
        );
      });
  }

  showAssignActResult(
    batchId: string,
    type: BATCH_COPY_TYPE,
    kolOrders: any[],
  ): void {
    this.modalService
      .open({
        title: '指派结果',
        content: EventAssignActResultNg5Component,
        onOk() {},
        width: 1100,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          batchId,
          type,
          kolOrders,
        },
      })
      .subscribe(output => {});
  }
  /************************ 批量指派  end ***********************/
}
