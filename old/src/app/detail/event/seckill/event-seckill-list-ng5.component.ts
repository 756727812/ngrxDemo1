import { Component, OnInit, Inject } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as _ from 'lodash';
import { EventKolSelectorV2Component } from '../../event-ng-module/components/kol-selector-v2/kol-selector-v2.component';
import { EventChildItemsResultV2Component } from '../../event-ng-module/components/child-items-result-v2/child-items-result-v2.component';
import { EventAssignActResultV2Component } from '../../event-ng-module/components/assign-activity-result-v2/assign-activity-result-v2.component';
import { ActivatedRoute, Router } from '@angular/router';

import { GoodsLinkInfoController } from '../../kol/article-goods/link-info/link-info.component';

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

// 活动状态，1-待开始，2-进行中，3-已结束(时间到)，4-强制结束（使失效）
enum ACTIVITY_STATUS {
  WAITING = 1,
  PENDING = 2,
  FINISH = 3,
  CANCEL = 4,
}

type ISeckillData = {
  list: any[];
  count: number;
};

@Component({
  selector: 'event-seckill-list-ng5',
  templateUrl: './event-seckill-list-ng5.component.html',
  styleUrls: ['./event-seckill-list-ng5.component.less'],
})
export class EventSeckillListNg5 implements OnInit {
  isAdmin = true;
  kolId: string = this.$routeParams['kolId'];
  wechatId: string = this.$routeParams['wechat_id'];

  searchKey = '';
  _keyword = '';

  seckillData: ISeckillData = {
    list: [],
    count: 0,
  };

  get seckillList(): any[] {
    return this.seckillData.list;
  }

  public loading = 0;

  activityStatus: any = {
    [ACTIVITY_STATUS.WAITING]: '待开始',
    [ACTIVITY_STATUS.PENDING]: '进行中',
    [ACTIVITY_STATUS.FINISH]: '已结束',
    [ACTIVITY_STATUS.CANCEL]: '强制结束',
  };

  constructor(
    @Inject('$routeParams') private $routeParams: ng.route.IRouteParamsService,
    @Inject('$q') private $q: ng.IQService,
    @Inject('Notification') private notification: see.INotificationService,
    @Inject('dataService') private dataService: see.IDataService,
    @Inject('seeModal') private seeModal: see.ISeeModalService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.initFilter();
    this.getSeckillList();
  }

  ngAfterViewChecked() {
    const disabledChks = document.querySelectorAll(
      '.ant-checkbox-disabled .ant-checkbox-inner',
    );
    for (let i = 0; i < disabledChks.length; i = i + 1) {
      disabledChks[i].setAttribute('style', 'background-color: #d9d9d9;');
    }

    // 自定义快速跳转
    const pagination = document.querySelector(
      '.ant-table-pagination.ant-pagination',
    );
    if (pagination) {
      this.showPaginaton = true;
      pagination.setAttribute('style', 'margin-right: 100px;');
    }
    const quickJumper = document.querySelector('.quick-jumper-container');
    if (quickJumper) {
      quickJumper.setAttribute('style', 'top: -28px;');
    }
  }

  /**** 使用自定义快速跳转 start ****/
  showPaginaton = false;

  get max_page(): number {
    return Math.ceil(this.seckillData.count / this.pageSize);
  }

  quickJumperFun = newPage => {
    this.page = newPage;
    this.showPaginaton = false;
    this.getSeckillList();
  };

  /**** 使用自定义快速跳转 end ****/

  page = 1;
  pageSize = 20;

  filterStatusArray = [];
  get _filterStatus(): ACTIVITY_STATUS[] {
    return this.filterStatusArray.filter(f => f.check).map(f => +f.status);
  }
  filterStatus: ACTIVITY_STATUS[] = [];

  targetKols: any[] = [];
  get xdpIdList(): number[] {
    return this.targetKols.map(cur => cur.weixinAuthInfoId);
  }
  get kolOrders(): number[] {
    return this.targetKols.map(cur => cur.kolId);
  }

  selectKOLs() {
    if (!this.seckillIds.length) {
      this.message.create('warning', '请至少选择一个秒杀活动');
      return;
    }
    this.modalService
      .open({
        title: 'KOL选择',
        content: EventKolSelectorV2Component,
        onOk() {},
        width: 1000,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          confirmText: '子商品生成',
          hideKOLs: [+this.kolId],
        },
      })
      .subscribe(targetKols => {
        if (typeof targetKols === 'object' && targetKols.length) {
          this.targetKols = targetKols;
          this.batchChildgoods();
        }
      });
  }

  _allChecked = false;
  _indeterminate = false;
  checkedMap = Object.create(null);
  selectSeckills = {};

  get seckillIds(): any[] {
    return Object.keys(this.checkedMap)
      .filter(item_id => this.checkedMap[item_id])
      .map(idStr => +idStr);
  }

  get productIdList(): number[] {
    const seckillIds = JSON.parse(JSON.stringify(this.seckillIds));
    return seckillIds.map(id => this.selectSeckills[id].productId);
  }

  filterSeckill = false;

  filterChange(value) {
    this.getSeckillList(true);
  }

  get selectedCount(): number {
    let tmpCount = 0;
    const item_ids = Object.keys(this.checkedMap);
    item_ids.forEach(id => {
      if (this.checkedMap[id]) {
        tmpCount += 1;
      }
    });
    return tmpCount;
  }

  clearChecked() {
    this.checkedMap = {};
    this.selectSeckills = {};
    this._refreshStatus();
  }

  _displayDataChange($event) {
    this._refreshStatus();
  }

  _refreshStatus() {
    const allChecked =
      this.seckillList.length &&
      this.seckillList.every(value => this.checkedMap[value.id] === true);
    const allUnChecked = this.seckillList.every(
      value => !this.checkedMap[value.id],
    );
    this._allChecked = allChecked;
    this._indeterminate = !allChecked && !allUnChecked;

    // update selectSeckills
    this.seckillList.forEach(item => {
      if (this.checkedMap[item.id] === true) {
        this.selectSeckills[item.id] = {
          productId: item.productId, // 子商品id
        };
      } else {
        delete this.selectSeckills[item.id];
      }
    });
  }

  _checkAll(value) {
    if (value) {
      this.seckillList.forEach(item => {
        if (item.allowCopy !== 2) this.checkedMap[item.id] = true;
      });
    } else {
      this.seckillList.forEach(item => {
        if (item.allowCopy !== 2) this.checkedMap[item.id] = false;
      });
    }
    this._refreshStatus();
  }

  selectSeckill(event, id, allowCopy) {
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'A' ||
      allowCopy === 2
    )
      return;
    this.checkedMap[id] = !this.checkedMap[id];
    this._refreshStatus();
  }

  _isSpinning: boolean = false;

  // 批量生成子商品
  batchChildgoods() {
    this._isSpinning = true;

    const BatchCopyAddReq = {
      destXdpIds: this.xdpIdList,
      sourceIds: this.productIdList,
      type: BATCH_COPY_TYPE.GOODS,
      // sourceKolId: this.kolId,
    };
    // 开启批量复制任务
    this.dataService.ng_batchCopy_add(BatchCopyAddReq).then(
      res => {
        this._isSpinning = false;
        if (!res) {
          return;
        }
        const { batchId } = res.data;
        if (!batchId) {
          this.message.create('error', '无法获取任务ID！');
          return;
        }
        this.showChildItemsResult(batchId, BATCH_COPY_TYPE.GOODS);
      },
      err => {
        this._isSpinning = false;
        this.message.create('error', '创建任务失败！');
        console.log('add_err', err);
      },
    );
  }

  // 生成子商品结果
  showChildItemsResult(batchId: string, type: BATCH_COPY_TYPE): void {
    this.modalService
      .open({
        title: '生成子商品结果',
        content: EventChildItemsResultV2Component,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          batchId,
          type,
          exportBtn: { show: true, type: 'default' },
          assignBtn: { show: true, type: 'primary' },
        },
      })
      .subscribe(exitSignal => {
        // 批量指派
        if (exitSignal === 'batchAssign') {
          this.batchSeckills();
        }
      });
  }

  // 批量生成秒杀
  batchSeckills() {
    this._isSpinning = true;

    const BatchCopyAddReq = {
      destXdpIds: this.xdpIdList,
      sourceIds: this.seckillIds,
      type: BATCH_COPY_TYPE.SECKILL,
      sourceKolId: this.kolId,
    };
    // 开启批量复制任务
    this.dataService.ng_batchCopy_add(BatchCopyAddReq).then(
      res => {
        this._isSpinning = false;
        if (!res) {
          return;
        }
        const { batchId } = res.data;
        if (!batchId) {
          this.message.create('error', '无法获取任务ID！');
          return;
        }
        this.showAssignActResult(
          batchId,
          BATCH_COPY_TYPE.SECKILL,
          this.kolOrders,
        );
      },
      err => {
        this._isSpinning = false;
        this.message.create('error', '创建任务失败！');
        console.log('add_err', err);
      },
    );
  }

  showAssignActResult(
    batchId: string,
    type: BATCH_COPY_TYPE,
    kolOrders: any[],
  ): void {
    this.modalService
      .open({
        title: '指派结果',
        content: EventAssignActResultV2Component,
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

  createSeckill() {
    this.router.navigate(['event/seckill/add'], {
      relativeTo: this.route,
      queryParams: { kolId: this.kolId, wechat_id: this.wechatId },
    });
  }

  searchClick() {
    this.searchKey = this._keyword.trim();
    this.getSeckillList(true);
  }

  showGoodsLinks(item) {
    const { id: activityId, itemImgurl } = item;
    this.dataService.pathAQrUrl_getSeckill({ activityId }).then(({ data }) => {
      GoodsLinkInfoController.open(
        { xcxCardImgUrl: itemImgurl, ...data },
        { kolId: this.kolId, onlyXcx: true },
      );
    });
  }

  terminateSeckill: (
    activityId: number,
  ) => ng.IPromise<ISeckillData> = activityId =>
    this.seeModal.confirmP('使失效', '确定使该秒杀活动失效？').then(() =>
      this.dataService.seckill_activityDown(activityId).then(() => {
        this.notification.success();
        return this.getSeckillList(true);
      }),
    );

  private getSeckillList: (reset?: boolean) => ng.IPromise<ISeckillData> = (
    reset: boolean = false,
  ) => {
    this.loading = 1;
    if (reset) {
      this.page = 1;
    }
    const params = {
      kolId: ~~this.kolId,
      page: this.page,
      pageSize: this.pageSize,
      allowCopy: this.filterSeckill ? 1 : 0,
      searchKey: this.searchKey,
    };
    if (this.filterStatus.length) params['status'] = this.filterStatus;
    return this.dataService.seckill_activityActivities(params).then(
      ({ data }) => {
        this.loading = 0;
        this.seckillData = data;
        this.updateDisable(data.list);
        return data;
      },
      err => {
        this.loading = 0;
      },
    );
  };

  // 在选中的秒杀上点击“使失效”按钮，更新列表后仍为选中状态，需要同步取消勾选！
  updateDisable(newList) {
    const diffItems = newList.filter(
      item => item.allowCopy === 2 && this.checkedMap[item.id],
    );
    if (diffItems.length) {
      diffItems.forEach(item => {
        delete this.checkedMap[item.id];
        delete this.selectSeckills[item.id];
      });
      this._refreshStatus();
    }
  }

  filterClick() {
    this.filterStatus = this._filterStatus;
    this.getSeckillList(true);
  }

  filterReset(array: any[]) {
    array.forEach(item => {
      item.check = false;
    });
    this.filterClick();
  }

  initFilter() {
    this.filterStatusArray = Object.keys(this.activityStatus).map(status => {
      return {
        status,
        name: this.activityStatus[status],
        check: false,
      };
    });
  }
}
