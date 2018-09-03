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
import {
  xAxis,
  yAxis,
  COLOR_CARDS,
  genSerLine,
  getLinearColor,
  autoResizeChart,
} from '../../../utils/chart';

import {
  // TODO 这样耦合好吗
  DATE_TYPE,
} from '../../../components/date-filter/date-filter.component';
import * as moment from 'moment';
import { LifeCycleComponent } from '../../../LifeCycleComponent';

@Component({
  selector: 'app-bi-goods-overview-block',
  templateUrl: './overview-block.component.html',
  styleUrls: ['./overview-block.component.less'],
})
export class BiGoodsOverviewBlockComponent extends LifeCycleComponent
  implements OnDestroy {
  @ViewChild('chart') chartElement: ElementRef;
  chart: any;
  lineData = [];
  data = {};
  dateTypeOptions: any = [
    {
      type: DATE_TYPE.SINLGE_DAY_4_RANGE,
      delta: [-6, 'days'],
      label: '自然天',
    },
    DATE_TYPE.RANGE_DAY,
  ];
  busy = false;
  exportParams: any;
  items: any[] = [
    {
      name: 'item_user_num',
      desc: '商品访客数',
      color: '#ff6b6b',
    },
    {
      name: 'pay_user_num',
      desc: '付款人数',
      color: '#5971e8',
    },
    {
      name: 'pay_quantity_sum',
      desc: '销量',
      color: '#f5a623',
    },
    {
      name: 'tran_rate',
      desc: '转化率',
      color: '#7ed321',
      yAxisIndex: 1,
      fmtFn: val => `${val}%`,
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
      this.refreshData(dateVal);
    });
  }

  refreshData(dateVal) {
    this.busy = true;
    const { type, val } = dateVal;

    const [start, end] = val;
    const strStart = start.format('YYYY-MM-DD');
    const strEnd = end.format('YYYY-MM-DD');
    const newStrStart = type === '10' ? strEnd : strStart; // 日期类型自然天传当天值
    const ob$ = this.biService
      .fetchGoodsOverviewData(newStrStart, strEnd)
      .share(); //
    ob$.subscribe(({ data }) => {
      if (data) {
        this.data = data;
      }
    });
    this.exportParams = [strStart, strEnd];

    const line$ = this.biService
      .fetchGoodsOverviewLine(strStart, strEnd)
      .share();
    line$.subscribe(({ data }) => {
      if (data) {
        this.lineData = (data || []).map(item => {
          return {
            ...item,
            tran_rate: ~~(item.tran_rate * 10000) / 100,
          };
        });
        this.refreshChart();
      }
    });
    Observable.forkJoin(ob$, line$).subscribe(() => {
      this.busy = false;
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.chart && this.chart.dispose();
  }

  refreshChart() {
    if (!this.chart) {
      this.chart = echarts.init(this.chartElement.nativeElement); // TODO 改成 ng 写法
      autoResizeChart(this.chart, this.onDestroy$);
      // TODO refresh size
    }

    const arr: any = this.items;

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
    const options = {
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
        <span class="date">${point.begin_date}</span><ul>${htmls}</ul></div>`;
        },
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
          interval: ~~(lineData.length / 9),
          color: '#485465',
          fontSize: 10,
        },
        boundaryGap: false,
        data: map(lineData, 'begin_date'), // TODO
      },
      yAxis: [
        merge({}, yAxisConfig, {
          nameTextStyle: {
            padding: [0, 12, 0, 0],
          },
          name: '人数/单量',
        }),
        merge({}, yAxisConfig, {
          splitLine: {
            show: false,
          },
          nameTextStyle: {
            padding: [0, 0, 6, 34],
          },
          axisLabel: {
            formatter: '{value}%',
          },
          name: '转化率',
        }),
      ],
      legend: {
        animation: false,
        textStyle: {
          color: '#485465',
          fontSize: '11px',
        },
        padding: [0, 0, 0, 0],
        margin: 0,
        // itemWidth: 84,
        itemGap: 43,
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
        left: 66,
        right: 75,
        top: 95,
        bottom: 58 + 12,
      },
      series: arr.map((item, index) => {
        const ret: any = genSerLine(
          item.desc,
          map(lineData, item.name),
          item.color,
        );
        if (typeof item.yAxisIndex !== void 0) {
          ret.yAxisIndex = item.yAxisIndex;
        }
        return ret;
      }),
    };
    this.chart.setOption(options);
  }
}
