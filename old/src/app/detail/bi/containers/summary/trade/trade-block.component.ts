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
import { get, map, find, merge } from 'lodash';
// TODO 把配置导入统一 merge ，暴露一个方法
import {
  xAxis,
  yAxis,
  COLOR_CARDS,
  genSerLine,
  getLinearColor,
  fmtDateMD,
  autoResizeChart,
} from '../../../utils/chart';
import * as moment from 'moment';

import {
  DATE_TYPE,
  BiDateFilterComponent,
} from '../../../components/date-filter/date-filter.component';
import { LifeCycleComponent } from '../../../LifeCycleComponent';

const nowDate = moment();

@Component({
  selector: 'app-bi-summary-trade-block',
  templateUrl: './trade-block.component.html',
  styleUrls: ['./trade-block.component.less'],
})
export class BiSummaryTradeBlockComponent extends LifeCycleComponent
  implements OnInit {
  @ViewChild('chart') chartElement: ElementRef;
  chart: any;
  data = {};
  busy = false;
  lineData = [];
  dateTypeOptions: any = [
    {
      type: DATE_TYPE.SINLGE_DAY_4_RANGE,
      delta: [-6, 'days'],
      label: '自然天',
    },
    {
      type: DATE_TYPE.SINGLE_WEEK,
      delta: [-3, 'weeks'],
    },
  ]; // TODO 自然天不包含当天数据

  @ViewChild(BiDateFilterComponent) dateFilterComp: BiDateFilterComponent;

  items: any[] = [
    {
      name: 'user_num',
      desc: '访客量',
      color: '#ff6b6b',
      fmt: 'number',
      active: true,
    },
    {
      name: 'order_num',
      desc: '下单数量',
      color: '#5971e8',
      fmt: 'number',
      active: true,
    },
    {
      name: 'order_tran_rate',
      desc: '下单转化率',
      color: '#f5a623',
      fmt: 'percent',
      active: true,
      fmtFn: val => `${val}%`,
      options: {
        yAxisIndex: 1,
      },
    },
    { name: 'pay_user_num', desc: '付款人数', color: '#7ed321', fmt: 'number' },
    {
      name: 'pay_price_sum',
      desc: '付款金额 (元)',
      color: '#85fdff',
      fmt: 'currency',
    },
    {
      name: 'user_avg_price',
      desc: '客单价 (元)',
      color: '#f8e71c',
      fmt: 'currency',
    },
    {
      name: 'profit_sum',
      desc: '收益 (元)',
      color: '#d55231',
      fmt: 'currency',
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

  onDateFilterModelChange(dateVal) {
    this.afterViewInitEver.then(() => {
      this.refresh(dateVal);
    });
  }

  onClickItem(item, index) {
    // const old = item.active;
    // item.active =
    //   !item.active && this.items.filter(item => item.active).length < 3;
    // if (old !== item.active) {
    //   this.renderChart();
    // }
    item.active = !item.active;
    this.renderChart();
  }

  refresh(dateVal) {
    this.busy = true;
    Observable.forkJoin(this.refreshTradeData(dateVal)) //
      .subscribe(() => {
        this.busy = false;
      });
  }

  refreshTradeData(dateVal) {
    const { val, type } = dateVal;

    let start;
    let end;
    if (val && val.length === 2) {
      [start, end] = val;
    }
    const urlType = type === DATE_TYPE.SINLGE_DAY_4_RANGE ? 0 : 1;
    const strStart = start.format('YYYY-MM-DD');
    const strEnd = end.format('YYYY-MM-DD');

    // TODO datefilter 搞两套
    const starDate4Data =
      type === DATE_TYPE.SINLGE_DAY_4_RANGE
        ? moment(end)
        : type === DATE_TYPE.SINGLE_WEEK ? moment(end).startOf('week') : start;

    const ob$ = this.biService
      .fetchSummaryTradeData(
        urlType,
        starDate4Data.format('YYYY-MM-DD'),
        strEnd,
      )
      .share();
    ob$.subscribe(({ data }) => {
      this.data = data || {};
    });

    const lineData$ = this.biService
      .fetchSummaryTradeLine(urlType, strStart, strEnd)
      .share(); //
    lineData$.subscribe(({ data }) => {
      if (data) {
        this.lineData = (data || []).map(item => {
          return {
            ...item,
            order_tran_rate: ~~(item.order_tran_rate * 10000) / 100,
          };
        });
        this.renderChart();
      }
    });
    return [ob$, lineData$];
  }

  renderChart() {
    if (!this.chart) {
      this.chart = echarts.init(this.chartElement.nativeElement); // TODO 改成 ng 写法
      // this.chart.on('legendselectchanged', () => false);
      autoResizeChart(this.chart, this.onDestroy$);
      // TODO refresh size
    }
    const arr = this.items;
    const chartWidth = $(this.chartElement.nativeElement).width();
    const lineData = this.lineData;
    const yAxisConfig = {
      splitLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#485465',
        fontSize: 10,
      },
      nameTextStyle: {
        fontSize: 10,
        color: '#485465',
        align: 'center',
        padding: [0, 0, 16, 0],
      },
    };
    const legendSelected = {};

    arr.forEach(item => {
      legendSelected[item.desc] = item.active;
    });

    const legendMinCtWidth =
      map(arr, 'desc').join('').length * 10 + arr.length * 20;

    const options = {
      title: false,
      tooltip: {
        formatter: params => {
          const line = params[0];
          const point = lineData[line.dataIndex];
          const htmls = this.items
            .map(item => {
              return `
            <li>
            <span class="color-circle" style="background-color:${
              item.color
            }"></span>
            <span class="text">${item.desc}：${
                item.fmtFn ? item.fmtFn(point[item.name]) : point[item.name]
              }</span>
            </li>
            `;
            })
            .join('');
          return `<div class="chart-tooltip">
        <span class="date">${point.stat_date}</span><ul>${htmls}</ul></div>`;
        },
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
        // TODO 样式抄 see data
        // formatter(params) {
        //   const line = params[0];
        //   const point = lineData[line.dataIndex];
        //   const htmls = `
        //   <li>
        // <span class="text">周复购率：${point.after_week_1.toFixed(2)}</span>
        // </li>
        //   `;
        //   return `<div class="chart-tooltip">
        // <span class="date">${point.begin_date} ~ ${
        //     point.stat_date
        //   }</span><ul>${htmls}</ul></div>`;
        // },
      },
      xAxis: {
        axisLine: {
          lineStyle: {
            color: '#d9d9d9',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          // interval: ~~(lineData.length / 8),
          color: '#485465',
          fontSize: 10,
        },
        boundaryGap: false,
        data: map(lineData, item => fmtDateMD(item.stat_date)), // TODO
      },
      yAxis: [
        merge({}, yAxisConfig, {
          nameTextStyle: {
            padding: [0, 0, 6, 0],
          },
        }),
        merge({}, yAxisConfig, {
          splitLine: {
            show: false,
          },
          nameTextStyle: {
            padding: [0, 0, 6, 0],
          },
          axisLabel: {
            formatter: '{value}%',
          },
        }),
      ],
      legend: {
        selectedMode: false,
        selected: legendSelected,
        animation: false,
        textStyle: {
          color: '#485465',
          fontSize: '11px',
        },
        padding: [0, 0, 0, 0],
        margin: 0,
        // itemWidth: 84,
        // itemGap: 43, chartWidth  - arr.length * 80
        itemGap: Math.min(
          (chartWidth - legendMinCtWidth) / (arr.length - 1),
          33,
        ),
        itemHeight: 12,
        itemWidth: 12,
        bottom: 0,
        // left: '8.35%',
        data: arr.map(item => ({
          name: item.desc,
          icon: 'circle',
        })),
      },
      grid: {
        left: '10%',
        right: 67,
        top: 30,
        bottom: 58 + 12,
      },
      series: arr.map((item, index) => {
        return genSerLine(
          item.desc,
          map(lineData, item.name),
          item.color,
          item.options,
        );
      }),
    };
    this.chart.setOption(options);
  }
}
