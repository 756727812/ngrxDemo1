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
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
// import * as fromStore from '../../store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { BiService } from '../../services/bi.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
// import { CtrlPaneComponent } from '../ctrl-pane/ctrl-pane.component';
// import { PreviewPaneComponent } from '../preview-pane/preview-pane.component';
import { applicationService } from 'app/services/application/application.service';
import { findIndex, find, padStart, get, map, debounce, merge } from 'lodash';
import echarts from 'echarts';
import { BiDateCycle } from '../../models/bi.model';
import { autoResizeChart, wrapChartOptions } from '../../utils/chart';
// import * as XLSX from 'xlsx';

const fmtDateMD = (str = '') =>
  str == null ? str : (str + '').replace(/\d{4}-/, '');

const LINE_CONFIG: any[] = [
  {
    label: '付款金额',
    name: 'pay_price_sum',
    color: '#ff6b6b',
    options: { yAxisIndex: 1 },
  },
  { label: '付款单量', name: 'pay_num', color: '#5971e8' },
  { label: '下单量', name: 'order_num', color: '#f5a623' },
  { label: '下单人数', name: 'order_user_num', color: '#09bb07' },
];

const genSerLine = (name, data, color, other?) => {
  return {
    name,
    data,
    symbol: 'circle',
    type: 'line',
    showSymbol: false,
    smooth: true,
    itemStyle: {
      normal: {
        color,
      },
    },
    ...other,
  };
};
import { DATE_TYPE } from '../../components/date-filter/date-filter.component';
import { LifeCycleComponent } from '../../LifeCycleComponent';

@Component({
  selector: 'app-bi-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.less'],
})
export class BiTradeComponent extends LifeCycleComponent
  implements OnInit, OnDestroy {
  data: any = {};
  lineData: any = [];
  myChart: any;
  @ViewChild('chart') chartElement: ElementRef;
  @ViewChild('export') exportBtn: ElementRef;
  uvTipContent = '';
  chartBusy = false;
  exportParams: string[];

  dateTypeOptions = [
    DATE_TYPE.TODAY_REALTIME,
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

  constructor(
    private el: ElementRef,
    private modelService: NzModalService,
    // private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private biService: BiService,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {
    super();
  }

  export() {
    // const wb = XLSX.utils.table_to_book($('.bi-rebuy-table')[0]);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.myChart && this.myChart.dispose();
  }

  onDateFilterModelChange(dateVal) {
    this.refresh(dateVal);
  }

  refresh(dateVal) {
    const { type, val } = dateVal;
    let start;
    let end;
    let data$;
    let lineData$;
    if (type === DATE_TYPE.TODAY_REALTIME) {
      data$ = this.biService.fetchTradeSummaryRealtime();
      lineData$ = this.biService.fetchTradeSummaryLineRealtime();
    } else if (val && val.length === 2) {
      [start, end] = val;
    }

    if (type === DATE_TYPE.SINGLE_MONTH) {
      start = moment(end).startOf('month');
    }

    // TODO 日历控件两台时间吧
    let startDate4Amount = start;
    if (type === DATE_TYPE.SINLGE_DAY_4_RANGE) {
      startDate4Amount = moment(end);
    }

    if (start && end) {
      const strStart = start.format('YYYY-MM-DD');
      const strEnd = end.format('YYYY-MM-DD');

      data$ = this.biService.fetchTradeSummary(
        startDate4Amount.format('YYYY-MM-DD'),
        strEnd,
      );

      this.exportParams = [startDate4Amount.format('YYYY-MM-DD'), strEnd];

      lineData$ = this.biService.fetchTradeSummaryLine(
        // BiDateCycle.MONTH  作为 datefilter 里面给
        type === DATE_TYPE.SINGLE_MONTH ? BiDateCycle.MONTH : BiDateCycle.DAY,
        strStart,
        strEnd,
      );
    }

    data$ &&
      data$.subscribe(({ data }) => {
        this.data = data || {};

        // TODO 封装方法
        const { no_lottery_user_num } = this.data;
        let uvTermTip =
          '访客数量已包含抽奖团数据，其余数据不包含抽奖团数据。</br>';
        if (no_lottery_user_num) {
          uvTermTip += `剔除抽奖团的访客数量为：${no_lottery_user_num}`;
        }
        this.uvTipContent = uvTermTip;
      });

    this.chartBusy = true;
    lineData$ &&
      lineData$
        .pipe(
          catchError((error: any) => {
            this.chartBusy = false;
            return Observable.of(error);
          }),
        )
        .subscribe(({ data }) => {
          this.chartBusy = false;
          this.lineData = data || [];
          const nowIndex = findIndex(data, { now: true });
          if (nowIndex !== -1) {
            this.lineData = this.lineData.slice(0, nowIndex);
          }
          this.refreshChart();
        });
  }

  refreshChart() {
    if (!this.myChart) {
      this.myChart = echarts.init(this.chartElement.nativeElement); // TODO 改成 ng 写法
      autoResizeChart(this.myChart, this.onDestroy$);
      // TODO refresh size
    }

    const lineData = this.lineData;
    const chartWidth = $(this.chartElement.nativeElement).width();
    const options = wrapChartOptions({
      title: false,
      tooltip: {
        axisPointer: {
          lineStyle: {
            color: '#5971e8',
          },
        },
        textStyle: {},
        padding: [9, 20, 12, 14],
        show: true,
        trigger: 'axis',
        backgroundColor: '#434655',
        formatter(params) {
          const line = params[0];
          const point = lineData[line.dataIndex];
          let xLabel = '';
          if (typeof point.hour !== 'undefined') {
            const leftPadHour = padStart(point.hour, 2, '0');
            xLabel = `${leftPadHour}:00 ~ ${leftPadHour}:59`;
          } else {
            xLabel = point.begin_date;
          }
          const htmls = LINE_CONFIG.map(item => {
            return `
            <li>
            <span class="color-circle" style="background-color:${
              item.color
            }"></span>
            <span class="text">${item.label}：${point[item.name]}</span>
            </li>
            `;
          }).join('');
          return `<div class="chart-tooltip">
        <span class="date">${xLabel}</span><ul>${htmls}</ul></div>`;
        },
      },
      xAxis: {
        axisLabel: {
          showMaxLabel: true,
          interval: ~~(50 / (chartWidth / lineData.length)),
        },
        data: map(lineData, (item: any) => {
          return typeof item.hour !== 'undefined'
            ? `${~~item.hour + 1}:00`
            : fmtDateMD(item.begin_date);
        }),
      },
      yAxis: [
        {
          nameTextStyle: {
            padding: [0, 0, 6, -6],
          },
        },
        {
          splitLine: {
            show: false,
          },
          nameTextStyle: {
            padding: [0, 0, 6, 32],
          },
          name: '金额（元）',
        },
      ],
      legend: {
        padding: [0, 0, 0, 0],
        itemGap: 67,
        data: ['付款金额', '付款单量', '下单量', '下单人数'].map(name => ({
          name,
          icon: 'circle',
        })),
      },
      grid: {
        left: '5%',
        right: '5.88%',
        top: 88,
        bottom: 57 + 16,
      },
      series: LINE_CONFIG.map(item => {
        return genSerLine(
          item.label,
          map(lineData, item.name),
          item.color,
          item.options,
        );
      }),
    });
    this.myChart.setOption(options);
  }
}
