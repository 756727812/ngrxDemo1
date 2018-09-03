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
import { get, map, find } from 'lodash';
import echarts from 'echarts';

import {
  xAxis,
  yAxis,
  COLOR_CARDS,
  autoResizeChart,
} from '../../../utils/chart';
import { DATE_TYPE } from '../../../components/date-filter/date-filter.component';
import * as moment from 'moment';
import { LifeCycleComponent } from '../../../LifeCycleComponent';

const nowDate = moment();

@Component({
  selector: 'app-bi-trade-dist-block',
  templateUrl: './dist-block.component.html',
  styleUrls: ['./dist-block.component.less'],
})
export class BiTradeDistBlockComponent extends LifeCycleComponent
  implements OnDestroy {
  barData: any;
  @ViewChild('barChart') barChartElement: ElementRef;
  barChart: any;

  pieData: any;
  @ViewChild('pieChart') pieChartElement: ElementRef;
  pieChart: any;
  busy = false;

  exportParams: any;

  dateTypeOptions: any = [
    {
      type: DATE_TYPE.SINLGE_DAY_4_RANGE,
      delta: [-6, 'days'],
      label: '自然天',
      options: {
        showToday: false,
        disabledDate(mDate) {
          return mDate.diff(nowDate, 'days') >= 0;
        },
      },
    },
    {
      type: DATE_TYPE.SINGLE_WEEK,
      delta: [-3, 'weeks'],
    },
    {
      type: DATE_TYPE.SINGLE_MONTH,
      delta: [-5, 'months'],
      options: {
        disabledDate(date) {
          return date.diff(nowDate, 'months') > 0;
        },
      },
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

  refresh(dateVal) {
    const { type, val } = dateVal;

    let start;
    let end;

    if (val && val.length === 2) {
      [start, end] = val;
    }

    const map = {
      [DATE_TYPE.SINLGE_DAY_4_RANGE]: 'day',
      [DATE_TYPE.SINGLE_WEEK]: 'week',
      [DATE_TYPE.SINGLE_MONTH]: 'month',
    };
    const cycleType = map[type] || 'day';

    if (end && start) {
      this.busy = true;
      const strStart = start.format('YYYY-MM-DD');
      const strEnd = end.format('YYYY-MM-DD');
      const bar$ = this.biService
        .fetchMarketingDistBar(cycleType, strStart, strEnd)
        .share(); //
      bar$.subscribe(({ data }) => {
        this.barData = data;
        // TODO 分成两个组件
        this.refreshBarChart();
      });
      this.exportParams = {
        begin_date: strStart,
        stat_date: strEnd,
        option: cycleType,
      };

      const pie$ = this.biService
        .fetchOrderAccountPie(strStart, strEnd)
        .share();
      pie$.subscribe(({ data }) => {
        this.pieData = data;
        // TODO 分成两个组件
        this.refreshPieChart();
      });

      Observable.forkJoin(bar$, pie$).subscribe(() => {
        this.busy = false;
      });
    }
  }

  refreshPieChart() {
    if (!this.pieChart) {
      this.pieChart = echarts.init(this.pieChartElement.nativeElement);
      autoResizeChart(this.pieChart, this.onDestroy$);
    }

    const pieData = this.pieData;
    const option = {
      legend: {
        show: false,
        orient: 'vertical',
        right: 24,
        top: 10,
        itemHeight: 9,
        itemGap: 2,
        textStyle: {
          fontSize: 11,
          lineHeight: 16,
          color: '#485465',
        },
        // data: map(pieData, item => ({
        //   name: item.age_range,
        //   icon: 'circle',
        // })),
      },
      series: [
        {
          center: ['50%', 196 + 30],
          type: 'pie',
          radius: [70 - 5, 125 - 5],
          data: pieData.map(item => {
            return {
              value: item.value,
              name: item.desc,
            };
          }),
          color: COLOR_CARDS.slice(0),
          // legendHoverLink: false,
          // hoverAnimation: false,
          cursor: 'default',
          label: {
            normal: {
              show: true,
              color: '#485465',
              formatter: '{b}\n订单量 {c}\n{d}%',
              lineHeight: 16,
              fontSize: 11,
              rich: {
                wrap: {
                  color: '#485465',
                },
              },
            },
            emphasis: {
              show: true,
              color: '#485465',
              formatter: '{b}\n订单量 {c}\n{d}%',
              lineHeight: 16,
              fontSize: 12,
              fontWeight: 'bold',
              rich: {
                wrap: {
                  color: '#485465',
                },
              },
            },
          },
          labelLine: {
            emphasis: {
              lineStyle: {
                width: 2,
              },
            },
          },
        },
      ],
    };
    this.pieChart.setOption(option);
  }

  refreshBarChart() {
    if (!this.barChart) {
      this.barChart = echarts.init(this.barChartElement.nativeElement);
      autoResizeChart(this.barChart, this.onDestroy$);
    }

    const arr = [
      {
        label: '普通商品(元)',
        field: 'normal_order_price_sum',
        color: '#c5cffe',
      },
      { label: '团购(元)', field: 'group_price_sum', color: '#9c7be8' },
      { label: '秒杀(元)', field: 'seckill_order_price_sum', color: '#5971e8' },
      {
        label: '满减商品(元)',
        field: 'sales_promotion_price_sum',
        color: '#5e99fc',
      },
    ];
    const barData = this.barData;
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line', // 默认为直线，可选为：'line' | 'shadow'
          lineStyle: {
            color: '#5971e8',
          },
        },
        textStyle: {},
        padding: [9, 20, 12, 14],
        show: true,
        backgroundColor: '#434655',
        formatter(params) {
          const line = params[0];
          const point = barData[line.dataIndex];
          const htmls = arr
            .map((item, index) => {
              return `
            <li>
            <span class="color-circle" style="background-color:${
              item.color
            }"></span>
            <span class="text">${item.label}：${point[item.field]}</span>
            </li>
            `;
            })
            .join('');
          return `<div class="chart-tooltip">
        <span class="date">${point.begin_date}</span><ul>${htmls}</ul></div>`;
        },
      },
      legend: {
        data: map(arr, item => {
          return {
            name: item.label,
            icon: 'circle',
          };
        }),
        bottom: 0,
      },
      grid: {
        left: 0,
        right: 30,
        top: 41,
        bottom: 40 + 16,
        containLabel: true,
      },
      yAxis: {
        ...yAxis,
        type: 'value',
      },
      xAxis: {
        ...xAxis,
        boundaryGap: ['20%', '20%'],
        type: 'category',
        data: map(this.barData, (item: any) => {
          return moment(item.begin_date).format('MM-DD');
        }),
      },
      series: arr.map(item => {
        return {
          barMaxWidth: 37,
          name: item.label,
          type: 'bar',
          stack: '总量',
          data: map(this.barData, item.field),
          itemStyle: {
            normal: {
              color: item.color,
            },
          },
        };
      }),
    };
    this.barChart.setOption(option);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.pieChart && this.pieChart.dispose();
    this.barChart && this.barChart.dispose();
  }
}
