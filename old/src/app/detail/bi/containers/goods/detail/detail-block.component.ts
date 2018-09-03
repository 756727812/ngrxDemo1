import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import {
  ActivatedRoute,
  Params,
  CanDeactivate,
  Router,
  Event as NavigationEvent,
  NavigationEnd,
} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
// import * as fromStore from '../../store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { BiService } from '../../../services/bi.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
// import { CtrlPaneComponent } from '../ctrl-pane/ctrl-pane.component';
// import { PreviewPaneComponent } from '../preview-pane/preview-pane.component';
import { applicationService } from 'app/services/application/application.service';
import echarts from 'echarts';
import { get, map, find, merge, isEmpty } from 'lodash';
import { catchError } from 'rxjs/operators';
import {
  xAxis,
  yAxis,
  COLOR_CARDS,
  genSerLine,
  getLinearColor,
} from '../../../utils/chart';
import { BiGoodsTrendChartComponent } from './chart.component';
import { LifeCycleComponent } from '../../../LifeCycleComponent';

declare type DateVal = {
  type: string;
  val: any;
};

import {
  // TODO 这样耦合好吗
  DATE_TYPE,
} from '../../../components/date-filter/date-filter.component';
import * as moment from 'moment';
@Component({
  selector: 'app-bi-goods-detail-block',
  templateUrl: './detail-block.component.html',
  styleUrls: ['./detail-block.component.less'],
})
export class BiGoodsDetailBlockComponent implements OnInit {
  lastStrDateRange: string[];
  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  busy = false;
  cols = [
    { label: '商品信息', name: 'item_name' },
    { label: '上架时间', name: 'created_date', sortable: true },
    { label: '访客数', name: 'item_uv', sortable: true },
    { label: '浏览量', name: 'item_pv', sortable: true },
    { label: '下单量', name: 'order_num', sortable: true },
    { label: '销量', name: 'sale_quantity', sortable: true },
    { label: '付款人数', name: 'pay_user_num', sortable: true },
    {
      label: '转化率',
      name: 'conver_rate',
      sortable: true,
    },
    { label: '品类', name: 'class_name' },
    { label: '状态', name: 'status' },
    { label: '操作', name: 'op' },
  ];

  dateTypeOptions: any = [
    {
      type: DATE_TYPE.SINLGE_DAY_4_RANGE,
      delta: [-6, 'days'],
      label: '自然天',
    },
    {
      type: DATE_TYPE.SINGLE_MONTH,
      delta: [-5, 'months'],
    },
    DATE_TYPE.LAST_7_DAYS,
    DATE_TYPE.LAST_30_DAYS,
    {
      type: DATE_TYPE.RANGE_DAY,
      limit: 30,
    },
  ];
  dateVal: DateVal;
  classOptions = [
    {
      class_name_1: '全部品类',
      class_id_1: 0,
    },
  ];
  statusOptions = [
    {
      status_name: '全部',
      status_id: 0,
    },
  ];
  status = 0;
  class_id = 0;
  keyword = '';
  sortMap = {};
  sortName = '';
  sortValue = '';
  exportParams: any;

  constructor(
    private el: ElementRef,
    private modelService: NzModalService,
    // private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private biService: BiService,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
    private modalService: NzModalService,
  ) {}

  ngOnInit() {
    this.biService.fetchClassList().subscribe(({ data }) => {
      if (data) {
        this.classOptions = [...this.classOptions, ...data];
      }
    });
    this.biService.fetchGoodsStatusOptions().subscribe(({ data }) => {
      if (data) {
        this.statusOptions = [...this.statusOptions, ...data];
      }
    });
  }

  sort(name, value) {
    this.sortName = name;
    this.sortValue = value;
    Object.keys(this.sortMap).forEach(key => {
      if (key !== name) {
        this.sortMap[key] = null;
      } else {
        this.sortMap[key] = value;
      }
    });
    this.refresh();
  }

  submitKeyword() {
    this.refresh();
  }

  onClassChange(type) {
    this.class_id = type;
    this.refresh();
  }
  onStatusOptionChange(status) {
    this.status = status;
    this.refresh();
  }

  onPageIndexChange() {
    this.refresh();
  }

  refresh(dateVal = this.dateVal) {
    const { type, val } = dateVal;
    let start;
    let end;

    if (val && val.length === 2) {
      [start, end] = val;
    }

    // TODO 以后 datefilter 的值分两种，一个针对折线图
    if (type === DATE_TYPE.SINGLE_MONTH) {
      start = moment(end).startOf('month');
    }

    if (type === DATE_TYPE.SINLGE_DAY_4_RANGE) {
      start = moment(end)
    }

    if (start && end) {
      const strStart = start.format('YYYY-MM-DD');
      const strEnd = end.format('YYYY-MM-DD');
      this.busy = true;

      // field: 'sale_quantity',
      // order: 'desc',
      const params: any = {
        page: this._current,
        pageSize: this._pageSize,
        class_id: this.class_id,
        search: this.keyword,
        status: this.status,
        // descend ascend
      };
      const orderMap = {
        descend: 'desc',
        ascend: 'asc',
      };
      if (this.sortName && this.sortValue) {
        params.field = this.sortName;
        params.order = orderMap[this.sortValue];
      }
      this.biService
        .fetchGoodsTableData(strStart, strEnd, params)
        .pipe(
          catchError((error: any) => {
            // TODO 所有都要抛出
            this.busy = false;
            return Observable.of(null);
          }),
        )
        .subscribe(({ data }) => {
          if (data) {
            this._total = data.count;
            this._dataSet = data.list || [];
            this.busy = false;
          }
        });
      this.exportParams = {
        begin_date: strStart,
        stat_date: strEnd,
        ...params,
      };
    }
  }

  onDateFilterModelChange(dateVal) {
    this.refresh(dateVal);
  }

  openTrendChart(item) {
    const subscription = this.modalService.open({
      title: '商品趋势图',
      content: BiGoodsTrendChartComponent,
      onOk() {},
      width: 800,
      onCancel() {},
      footer: false,
      componentParams: {
        item,
        dateVal: this.dateVal,
      },
    });
  }
}
