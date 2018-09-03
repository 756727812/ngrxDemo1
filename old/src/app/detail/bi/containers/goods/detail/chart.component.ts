import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Input,
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
import * as moment from 'moment';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
// import { CtrlPaneComponent } from '../ctrl-pane/ctrl-pane.component';
// import { PreviewPaneComponent } from '../preview-pane/preview-pane.component';
import { applicationService } from 'app/services/application/application.service';
import echarts from 'echarts';
import { get, map, find, merge, isEmpty } from 'lodash';
import { catchError } from 'rxjs/operators';
import { genSerLine, LINE_COLORS } from '../../../utils/chart';
import { DATE_TYPE } from '../../../components/date-filter/date-filter.component';

@Component({
  selector: 'bi-goods-trend-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
})
export class BiGoodsTrendChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartElement: ElementRef;

  _item: any;
  _dateVal: any;
  chart: any;
  lineData: any;
  busy = false;
  items: any[] = [
    {
      name: 'item_pv',
      desc: '浏览量',
    },
    {
      name: 'item_uv',
      desc: '商品访客数',
    },
    {
      name: 'order_num',
      desc: '下单量',
    },
    {
      name: 'sale_quantity',
      desc: '销量',
    },
    {
      name: 'pay_user_num',
      desc: '付款人数',
    },
    {
      name: 'conver_rate',
      desc: '转化率',
      fmtFn: val=>`${val}%`,
      yAxisIndex: 1,
    },
  ].map((item, index) => {
    return {
      ...item,
      color: LINE_COLORS[index],
    };
  });

  @Input()
  set item(value: string) {
    this._item = value;
  }

  @Input()
  set dateVal(value: string) {
    this._dateVal = value;
  }

  emitDataOutside() {
    this.subject.next('传出数据');
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  constructor(private subject: NzModalSubject, private biService: BiService) {
    this.subject.on('onDestory', () => {});
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // TODO fetch in init
    const { item_id } = this._item;
    const { type, val } = this._dateVal;
    const [start, end] = val;
    this.busy = true;
    this.biService
      .fetchGoodsTrendLineData(
        item_id,
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
        if (data) {
          this.lineData = (data || []).map(item => {
            return {
              ...item,
              conver_rate: ~~(item.conver_rate * 10000) / 100,
            };
          });
          this.refreshChart();
          this.busy = false;
        }
      });
  }

  refreshChart() {
    if (!this.chart) {
      this.chart = echarts.init(this.chartElement.nativeElement); // TODO 改成 ng 写法
      // TODO refresh size
    }

    const arr: any = this.items.map((item, index) => {
      return {
        ...item,
        color: LINE_COLORS[index],
      };
    });

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
        <span class="date">${point.stat_date}</span><ul>${htmls}</ul></div>`;
        },
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
        top: 35,
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
