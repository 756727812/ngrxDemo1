import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Inject,
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
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';
import echarts from 'echarts';
import * as _ from 'lodash';
import { EventAssignActResultV2Component } from '../assign-activity-result-v2/assign-activity-result-v2.component';
import { EventChildItemsResultV2Component } from '../child-items-result-v2/child-items-result-v2.component';

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

// 前端过滤日志显示
const DISPLAY_TYPES: BATCH_COPY_TYPE[] = [
  BATCH_COPY_TYPE.GOODS,
  BATCH_COPY_TYPE.SECKILL,
  BATCH_COPY_TYPE.ORDER_RETURN_COUPON,
];

// 批次任务状态：1=等待开始 2=正在进行中 3=全部成功 4=全部失败 5=部分失败
enum BATCH_COPY_STATUS {
  WAITING = 1,
  PENDING = 2,
  SUCCESS = 3,
  FAIL = 4,
  PART_FAIL = 5,
}

@Component({
  selector: 'batch-assign-logs',
  templateUrl: './batch-assign-logs.component.html',
  styleUrls: ['./batch-assign-logs.component.less'],
})
export class BatchAssignLogsComponent implements OnInit {
  assignTypes: any = {
    [BATCH_COPY_TYPE.GOODS]: '商品',
    [BATCH_COPY_TYPE.GROUP]: '拼团',
    [BATCH_COPY_TYPE.SECKILL]: '秒杀',
    [BATCH_COPY_TYPE.COUPON]: '优惠劵',
    [BATCH_COPY_TYPE.ORDER_RETURN_COUPON]: '下单返券',
    [BATCH_COPY_TYPE.REDUCE]: '满减',
    [BATCH_COPY_TYPE.MICRO_PAGE]: '微页面',
  };

  assignStatus: any = {
    [BATCH_COPY_STATUS.WAITING]: '等待开始',
    [BATCH_COPY_STATUS.PENDING]: '正在进行中',
    [BATCH_COPY_STATUS.SUCCESS]: '全部成功',
    [BATCH_COPY_STATUS.FAIL]: '全部失败',
    [BATCH_COPY_STATUS.PART_FAIL]: '部分失败',
  };

  constructor(
    private el: ElementRef,
    private eventService: EventService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    private nzMessageService: NzMessageService,
    @Inject('dataService') private dataService: see.IDataService,
  ) {}

  ngOnInit() {
    this.initFilter();
    this.getTasks();
  }

  /**** 使用自定义快速跳转 start ****/
  ngAfterViewChecked() {
    const pagination = document.querySelector(
      '.ant-table-pagination.ant-pagination',
    );
    if (pagination) {
      this.showPaginaton = true;
      pagination.setAttribute('style', 'margin-right: 100px;');
    }
    const quickJumper = document.querySelector('.quick-jumper-container');
    if (quickJumper) {
      quickJumper.setAttribute('style', 'top: -30px;');
    }
  }

  showPaginaton = false;

  get max_page(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  quickJumperFun = newPage => {
    this.page = newPage;
    this.showPaginaton = false;
    this.getTasks();
  };

  /**** 使用自定义快速跳转 end ****/

  dataSet = [];
  totalCount = 0;
  loading = false;
  page = 1;
  pageSize = 10;
  _createUser: string = '';
  createUser: string = '';

  filterTypeArray = [];
  get _filterType(): BATCH_COPY_TYPE {
    return this.filterTypeArray.filter(f => f.check).map(f => +f.type)[0];
  }
  filterType: BATCH_COPY_TYPE = null;

  getTasks(reset: boolean = false): void {
    this.loading = true;
    if (reset) {
      this.page = 1;
    }
    const params = {
      page: this.page,
      pageSize: this.pageSize,
    };
    if (this.createUser) params['createUser'] = this.createUser;
    if (this.filterType) params['type'] = this.filterType;
    this.dataService.ng_batchCopy_listBatch(params).then(
      res => {
        this.loading = false;
        if (!res) {
          return;
        }
        /* if (DISPLAY_TYPES.length) {
          this.dataSet = res.data.list.filter(item =>
            DISPLAY_TYPES.includes(+item.type),
          );
        } else {
          this.dataSet = res.data.list;
        } */
        this.dataSet = res.data.list;
        this.totalCount = res.data.count;
      },
      err => {
        this.loading = false;
        this.nzMessageService.create('error', '查询批量复制任务失败！');
        console.log('getTasks_err', err);
      },
    );
  }

  searchClick() {
    this.createUser = this._createUser.trim();
    this.getTasks(true);
  }

  filterClick() {
    this.filterType = this._filterType;
    this.getTasks(true);
  }

  filterReset(array: any[]) {
    array.forEach(item => {
      item.check = false;
    });
    this.filterClick();
  }

  updateFilter(name, check) {
    if (!check) {
      return;
    }
    this.filterTypeArray.filter(f => f.name !== name).forEach(f => {
      f.check = false;
    });
  }

  initFilter() {
    this.filterTypeArray = Object.keys(this.assignTypes).map(type => {
      return {
        type,
        name: this.assignTypes[type],
        check: false,
      };
    });
    // 前端过滤显示
    if (DISPLAY_TYPES.length) {
      this.filterTypeArray = this.filterTypeArray.filter(f =>
        DISPLAY_TYPES.includes(+f.type),
      );
    }
  }

  getTaskDetail(
    batchId: string,
    type: BATCH_COPY_TYPE,
    hasComplete: boolean,
  ): void {
    if (type === BATCH_COPY_TYPE.GOODS) {
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
            hasComplete,
            isView: true,
            exitBtn: { show: true, type: 'default' },
            exportBtn: { show: true, type: 'primary' },
          },
        })
        .subscribe(exitSignal => {});
      return;
    }
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
          hasComplete,
          isView: true,
        },
      })
      .subscribe(output => {});
  }
}
