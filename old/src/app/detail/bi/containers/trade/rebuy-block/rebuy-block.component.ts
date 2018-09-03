import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { catchError } from 'rxjs/operators';
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
import { indexOf, get, map, find, merge } from 'lodash';
import echarts from 'echarts';

import { TableExport } from 'tableexport';

import {
  xAxis,
  yAxis,
  COLOR_CARDS,
  genSerLine,
  getLinearColor,
  autoResizeChart,
} from '../../../utils/chart';
import { BiDateCycle } from '../../../models/bi.model';
import { DATE_TYPE } from '../../../components/date-filter/date-filter.component';
import * as moment from 'moment';
import { LifeCycleComponent } from '../../../LifeCycleComponent';

enum CYCLE_TYPE {
  WEEK = 'week',
  MONTH = 'month',
}

const fmtDateMD = (str = '') =>
  str == null ? str : (str + '').replace(/\d{4}-/, '');

const nowDate = moment();

@Component({
  selector: 'app-bi-trade-rebuy-block',
  templateUrl: './rebuy-block.component.html',
  styleUrls: ['./rebuy-block.component.less'],
})
export class BiTradeRebuyBlockComponent extends LifeCycleComponent
  implements OnDestroy {
  lineData: any;
  @ViewChild('chart') chartElement: ElementRef;
  chart: any;
  busy = false;
  tableExportInstance: any;
  curCycleType = CYCLE_TYPE.WEEK;
  cycleTypeOptions = [
    { label: '周复购', value: CYCLE_TYPE.WEEK },
    { label: '月复购', value: CYCLE_TYPE.MONTH, hidden: true },
  ];

  // TODO remove any
  dateTypeOptions: any = [
    {
      type: DATE_TYPE.SINGLE_MONTH,
      delta: [0, 'months'],
    },
    DATE_TYPE.LAST_30_DAYS,
    DATE_TYPE.LAST_3_MONTHS,
    DATE_TYPE.LAST_6_MONTHS,
  ];

  dateVal = {};

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

  exportExcel() {
    try {
      const dataInfo = this.tableExportInstance.getExportData()[
        'bi-trade-rebuy-table'
      ].xlsx;
      const { data, fileExtension, filename, merges, mimeType } = dataInfo;
      this.tableExportInstance.export2file(
        data,
        mimeType,
        filename,
        fileExtension,
        merges,
      );
    } catch (e) {}
  }

  onDateFilterModelChange(dateVal) {
    const { type } = dateVal;
    const shouldShowMonthCycle =
      indexOf([DATE_TYPE.LAST_3_MONTHS, DATE_TYPE.LAST_6_MONTHS], type) !== -1;
    this.toggleCycleMonth(shouldShowMonthCycle);
    this.afterViewInitEver.then(() => {
      this.refreshData(dateVal);
    });
  }

  toggleCycleMonth(visible) {
    this.cycleTypeOptions = this.cycleTypeOptions.map(item => {
      return {
        ...item,
        hidden: item.value === CYCLE_TYPE.MONTH ? !visible : false,
      };
    });
    if (!visible) {
      this.curCycleType = CYCLE_TYPE.WEEK;
    }
  }

  refreshData(dateVal) {
    const { type, val } = dateVal;

    let start;
    let end;
    if (val && val.length === 2) {
      [start, end] = val;
    }

    if (type === DATE_TYPE.SINGLE_MONTH) {
      start = moment(start).startOf('week');
      const lastDayOfEndWeek = moment(end).endOf('week');
      if (end.isAfter(lastDayOfEndWeek, 'day')) {
        end = lastDayOfEndWeek;
      }
    }

    if (start && end) {
      this.busy = true;
      this.biService
        .fetchTradeRebuy(
          this.curCycleType,
          start.format('YYYY-MM-DD'),
          end.format('YYYY-MM-DD'),
        ) //
        .pipe(
          // TODO functional
          catchError((error: any) => {
            // TODO 所有都要抛出
            this.busy = false;
            return Observable.of(null);
          }),
        )
        .subscribe(({ data }) => {
          this.lineData = data || {};
          this.busy = false;
          this.refreshChart();
          if (data && data.length) {
            setTimeout(() => {
              if (!this.tableExportInstance) {
                this.tableExportInstance = new TableExport(
                  document.querySelector('.bi-rebuy-table'),
                  {
                    formats: ['xlsx'],
                    filename: '交易分析-访客复购率',
                    exportButtons: false,
                  },
                );
              }
              this.tableExportInstance.reset();
            });
          }
        });
    }
  }

  ngOnDestroy() {
    this.chart && this.chart.dispose();
  }

  onToggleCycle(item) {
    this.curCycleType = item.value;
    this.refreshData(this.dateVal);
  }

  fmtTableDate(item) {
    return item.begin_date === item.stat_date
      ? fmtDateMD('' + item.begin_date)
      : `${fmtDateMD('' + item.begin_date)} ~ ${fmtDateMD(
          '' + item.stat_date,
        )}`;
  }

  refreshChart() {
    if (!this.chart) {
      this.chart = echarts.init(this.chartElement.nativeElement); // TODO 改成 ng 写法
      autoResizeChart(this.chart, this.onDestroy$);
    }

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
    const xAxisData = map(lineData, (item: any) => {
      return item.begin_date === item.stat_date
        ? item.begin_date
        : `${fmtDateMD(item.begin_date)} ~ ${fmtDateMD(item.stat_date)}`;
    });
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
        // TODO 样式抄 see data
        formatter: params => {
          const line = params[0];
          const point = lineData[line.dataIndex];
          const val = get(point, 'rebuy_list.0.rebuy_rate', 0) * 100;
          const label = this.curCycleType === CYCLE_TYPE.WEEK ? '周' : '月';
          const last_ratio = get(point, 'last_ratio', 0);
          const growthIcon =
            last_ratio > 0 ? '&#8593;' : last_ratio < 0 ? '&#8595;' : '';
          const htmls = `
          <li>
        <span class="text">${label}复购率：${val.toFixed(2)}%</span>
        </li>
        <li>
        <span class="text">相较上${label}：${growthIcon}${(
            last_ratio * 100
          ).toFixed(2)}</span>
        </li>
          `;
          return `<div class="chart-tooltip">
        <span class="date">${
          xAxisData[line.dataIndex]
        }</span><ul>${htmls}</ul></div>`;
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
          interval: 0,
          color: '#485465',
          fontSize: 10,
        },
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: [
        merge({}, yAxisConfig, {
          nameTextStyle: {
            padding: [0, 0, 6, 0],
          },
          axisLabel: {
            formatter: '{value}%',
          },
        }),
      ],
      legend: false,
      grid: {
        left: '5%',
        right: '5.88%',
        top: 54,
        bottom: 13 + 14,
      },
      series: [
        // TODO after_week_1 或者 after_month_1
        {
          ...genSerLine(
            '周复购率',
            map(
              lineData,
              (item: any) => get(item, 'rebuy_list.0.rebuy_rate', 0) * 100,
            ),
            '#5971e8',
          ),
          areaStyle: {
            normal: {
              color: getLinearColor('#d9def8', '#fff'),
            },
          },
        },
      ],
    };
    this.chart.setOption(options);
  }
}
