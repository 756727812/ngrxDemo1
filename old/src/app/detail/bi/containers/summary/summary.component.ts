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
import { BiService } from '../../services/bi.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
// import { CtrlPaneComponent } from '../ctrl-pane/ctrl-pane.component';
// import { PreviewPaneComponent } from '../preview-pane/preview-pane.component';
import { applicationService } from 'app/services/application/application.service';
import echarts from 'echarts';
import { get, map, find, merge, padStart } from 'lodash';
import {
  xAxis,
  yAxis,
  COLOR_CARDS,
  genSerLine,
  getLinearColor,
  wrapChartOptions,
  autoResizeChart,
} from '../../utils/chart';
import { LifeCycleComponent } from '../../LifeCycleComponent';

@Component({
  selector: 'app-bi-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.less'],
})
export class BiSummaryComponent extends LifeCycleComponent
  implements OnInit, AfterViewInit {
  @ViewChild('chart') chartElement: ElementRef;
  chart: any;
  lineData = [];
  yData = {};
  tData = {};
  lineData$: Observable<any>;
  chartLoading = false;

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

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.lineData$.subscribe(({ data }) => {
      if (data) {
        let cut = false;
        this.lineData = data.map(item => {
          const ret = {
            ...item,
            cut,
            hour: item.hour,
            today_price_calc: cut ? null : item.today_price,
          };
          if (item.now) {
            cut = true;
          }
          return ret;
        });
        this.refreshChart();
      }
    });
  }

  ngOnInit() {
    this.biService
      .fetchSummaryRealtime() //
      .subscribe(({ data }) => {
        if (data) {
          this.yData = data.yesterday_sum;
          this.tData = data.today_sum;
        }
      });
    this.lineData$ = this.biService.fetchSummaryRealtimeLines().share(); //
  }

  refreshChart() {
    if (!this.chart) {
      this.chart = echarts.init(this.chartElement.nativeElement);
    }
    const options = this._calcChartOptions();
    setTimeout(() => {
      this.chart.setOption(options);
    }, 10);
    autoResizeChart(this.chart, this.onDestroy$);
  }
  _calcChartOptions() {
    const chartWidth = $(this.chartElement.nativeElement).width();

    const lineData = this.lineData;

    const options = wrapChartOptions({
      title: false,
      tooltip: {
        // TODO 样式抄 see data
        formatter(params) {
          const line = params[0];
          const point = lineData[line.dataIndex];
          const growthIcon =
            point.growth > 0 ? '&#8593;' : point.growth < 0 ? '&#8595;' : '';
          const leftPadHour = padStart(point.hour, 2, '0');
          const todayLine = !point.cut
            ? `
          <li>
          <span class="color-circle" style="background-color:#5971e8"></span>
        <span class="text">今日：${point.today_price.toFixed(2)} ${
                point.growth !== 0
                  ? growthIcon + (point.growth * 100).toFixed(2) + '%'
                  : ''
              }</span>
        </li>`
            : '';
          const htmls = `
          ${todayLine}
        <li>
        <span class="color-circle" style="background-color:#ff6b6b"></span>
        <span class="text">昨日：${point.yesterday_price.toFixed(2)}</span>
        </li>
          `;
          return `<div class="chart-tooltip">
        <span class="date">${point.hour}:00 ~ ${
            point.hour
          }:59</span><ul>${htmls}</ul></div>`;
        },
      },
      xAxis: {
        axisLabel: {
          interval: ~~(24 / (chartWidth / 60)),
        },
        data: map(lineData, item => `${item.hour + 1}:00`),
        // name: '小时',
      },
      yAxis: [
        {
          nameTextStyle: {
            padding: [0, 0, 6, 0],
          },
        },
      ],
      legend: {
        itemGap: 67,
        data: ['昨日', '今日'].map(name => ({
          name,
          icon: 'circle',
        })),
      },
      grid: {
        left: 44,
        right: 10,
        top: 50,
        bottom: 47 + 16,
      },
      series: [
        {
          ...genSerLine('昨日', map(lineData, 'yesterday_price'), '#ff6b6b'),
          areaStyle: {
            normal: {
              color: getLinearColor('#FCDADB', '#fff'),
            },
          },
        },
        {
          ...genSerLine('今日', map(lineData, 'today_price_calc'), '#5971e8'),
          areaStyle: {
            normal: {
              color: getLinearColor('#d9def8', '#fff'),
            },
          },
        },
      ],
    });
    return options;
  }
}
