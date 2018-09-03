import './flow-chart-block.less';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;


const SALES_CHANNEL = {
  SELF_SUPPORT: 'self_support', // 自营
  EXTEND: 'extend', // 推广
  SUPPLY: 'supply', // 供货
  DISTRIBUTION: 'distribution', // 分销
};
const APP_TYPE = {
  XDP: 'xdp',
  H5: 'h5',
};

export class FlowChartBlockController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal', '$echarts', '$element', '$window'];

  data: any;
  chart: any;
  chartPromise: ng.IPromise<any>;
  chartToggleOption: any;
  channelTags: Array<any>;
  appTags: Array<any>;
  lines: Array<any>;
  _chartResolve: Function;
  _off: Function;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private $echarts: any,
    private $element: any,
    private $window: Window,
  ) {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
    this.chartPromise = $q((resolve) => {
      this._chartResolve = resolve;
    });
  }

  $postLink() {
    const chartCtEl = this.$element[0].querySelector('.echart-ct');
    setTimeout(() => {
      this.chart = this.$echarts.create('vintage', { width: 'auto', height: 288 }, []);
      setTimeout(() => {
        this._chartResolve(this.chart);
      },         1);
      // 开发阶段 style-loader 加载样式会晚一点，所以恶心的延迟便于获取最终宽高
      // 发布阶段因为 extractxxx 插件保证样式打包先加载，所以无须延迟
    },         process.env.NODE_ENV === 'development' ? 2000 : 1);
  }

  $onDestroy() {
    this._off && this._off();
  }

  attachEvents() {
    const fn = _.throttle(
      () => this.chartPromise.then(chart => chart.resize()),
      300,
      { leading: false },
    );
    this.$window.addEventListener('resize', fn, false);
    this._off = () => this.$window.removeEventListener('resize', fn, false);
  }

  $onInit() {
    this.attachEvents();
    this.chart = this.$echarts.create('vintage', {}, []);
    this.chart.showLoading();
    this.getData();
    this.chartToggleOption = {
      saleChannel: {
        [SALES_CHANNEL.SELF_SUPPORT]: true,
        [SALES_CHANNEL.SUPPLY]: true,
        [SALES_CHANNEL.DISTRIBUTION]: true,
      },
      appType: {
        [APP_TYPE.XDP]: true,
        [APP_TYPE.H5]: true,
      },
    };

    this.dataService.shop_checkCurrentStatus({}).then(({ data }) => {
      // 1、2 级套餐的情况下，“自营” btn 置灰
      const isChannelSelfSupportDisabled = data.type < 3;
      // 1 级套餐下，“小程序” btn 置灰
      const isAppXCXDisabled = data.type === 1;

      this.channelTags = [
        {
          id: SALES_CHANNEL.SELF_SUPPORT,
          label: '自营',
          disabled: isChannelSelfSupportDisabled,
        },
        // {id: SALES_CHANNEL.EXTEND, label: '推广'}, // 本期不显示
        { id: SALES_CHANNEL.SUPPLY, label: '供货' },
        { id: SALES_CHANNEL.DISTRIBUTION, label: '分销' },
      ];
      this.appTags = [
        { id: APP_TYPE.H5, label: 'H5' },
        { id: APP_TYPE.XDP, label: '小程序', disabled: isAppXCXDisabled },
      ];
    });

    this.lines = [
      //* 暂时屏蔽，后台还没数据返回
      {
        id: 'flow_num',
        label: '流量',
        lineStyle: { normal: { color: '#b8e986' } },
        areaStyle: { normal: { color: '#e4f8cf' } },
      },
      {
        id: 'user_num',
        label: '用户数',
        lineStyle: { normal: { color: '#ff6b6b' } },
        areaStyle: { normal: { color: '#ffc8c8' } },
      },//*/
      {
        id: 'deal_item_num',
        label: '成交商品量',
        lineStyle: { normal: { color: '#5971e8' } },
        areaStyle: { normal: { color: '#d9def8' } },
      },
      // {id: 'percent_conversion', label: '转化率'}, // 本期不现实
    ];
  }

  onToggleChanelTag(tag: any) {
    if (tag.disabled) {
      return;
    }
    this.chartToggleOption.saleChannel[tag.id] = !this.chartToggleOption.saleChannel[tag.id];
    this.refreshChart();
  }

  onToggleAppTag(tag: any) {
    if (tag.disabled) {
      return;
    }
    this.chartToggleOption.appType[tag.id] = !this.chartToggleOption.appType[tag.id];
    this.refreshChart();
  }

  getData() {
    /*
     h5{
     distribution: 分销
     :{
     deal_item_num
     flow_num
     "percent_conversion "
     user_num
     }
     extend: 推广
     self_support: 自营
     supply: 供货
     }
     */
    this.dataService.shop_getTendencyData()
      .then(({ data }) => {
        this.data = data;
        this.refreshChart();
      });
  }

  refreshChart() {
    this.chartPromise.then(chart => {
      chart.hideLoading();
      chart.setOption(this.calcChartOptions()).resize();
    });
  }

  calcChartOptions() {
    const data = { ...this.data };
    delete data.date;
    const toggleMap = this.chartToggleOption;
    const channelTags = this.channelTags;
    let lineDataMap;
    // console.log(this.chartToggleOption)

    Object.keys(data).forEach(appType => {
      // 按照应用类型遍历
      if (toggleMap.appType[appType]) {
        const appTypeData = data[appType];
        // 按照渠道（自营、分销 ...）标签 遍历
        channelTags.forEach(({ id: channelType }) => {
          if (toggleMap.saleChannel[channelType]) {
            const channelData = appTypeData[channelType];
            // console.log(`显示 ${appType} 应用的 ${channelType} 数据`)
            if (!lineDataMap) {
              lineDataMap = _.merge({}, channelData);
            } else {
              // 叠加每种数据
              Object.keys(lineDataMap).forEach(lineName => {
                // TODO remove 后台给的 key 多了一个空格，暂时也不展示转化率
                if (lineName.trim() === 'percent_conversion') {
                  return;
                }
                const lineData = lineDataMap[lineName];
                lineDataMap[lineName] = lineData.map(
                  (val, i) => (lineData[i] + channelData[lineName][i]),
                );
              });
            }
          }
        });
      }
    });

    const series = this.lines.map(lineItem => ({
      itemStyle: {
        normal: {
          color: lineItem.lineStyle.normal.color,
          borderWidth: 3,
          borderColor: lineItem.areaStyle.normal.color,
        },
      },
      symbol: 'circle',
      symbolSize: 9,
      showSymbol: false,
      data: _.isEmpty(lineDataMap) ? [] : lineDataMap[lineItem.id],
      name: lineItem.label,
      lineStyle: lineItem.lineStyle,
      areaStyle: lineItem.areaStyle,
      type: 'line',
      smooth: true,
    }));

    // const AXIS_LINE_STYLE_COLOR = {
    //   type: 'radial',
    //   x: 0.5,
    //   y: 0.5,
    //   r: 0.5,
    //   colorStops: [{
    //     offset: 0, color: '#f5f7f9' // 0% 处的颜色
    //   }, {
    //     offset: 1, color: '#e7ebef' // 100% 处的颜色
    //   }],
    //   globalCoord: false,
    // }
    const AXIS_LINE_STYLE_COLOR = '#f5f7f9';

    const AXIS_LABEL_COLOR = '#485465';

    return {
      grid: {},
      color: this.lines.map(l => l.lineStyle.normal.color),
      // title: {
      //   text: '近7日数据'
      // },
      legend: {
        padding: 3,
        align: 'left',
        textStyle: {
          color: '#485465',
          fontSize: '12px',
        },
        // itemWidth: 84,
        itemGap: 30,
        itemHeight: 16,
        bottom: 0,
        left: 83,
        data: this.lines.map(l => ({
          name: l.label,
          icon: 'circle',
        })),
      },
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
        formatter (params, ticket, cb) {
          /*
           olor:"#b8e986"
           componentSubType:"line"
           componentType:"series"
           data:90
           dataIndex:4
           dataType:undefined
           name:"2016-06-23"
           seriesIndex:0
           seriesName:"流量"
           seriesType:"line"
           value:90
           */
          return `<div class="chart-tooltip">
<span class="date">${params[0] ? params[0].name : ''}</span>
<ul>
${params.map(item => (
              `<li>
<span class="color-circle" style="background-color:${item.color}"></span>
<span class="text">${item.seriesName}：${item.value}</span>
</li>`
            )).join('')
            }
</ul></div>`;
        },
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: this.data.date,
          axisLabel: {
            margin: 4,
            textStyle: {
              align: 'left',
              color: AXIS_LABEL_COLOR,
              fontSize: '11px',
            },
            formatter: (value) => (moment(value).format('M/DD')),
          },
          axisLine: {
            lineStyle: {
              color: AXIS_LINE_STYLE_COLOR,
            },
          },
          axisTick: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            margin: 20,
            textStyle: {
              color: AXIS_LABEL_COLOR,
              fontSize: '11px',
            },
          },
          axisLine: {
            lineStyle: {
              color: AXIS_LINE_STYLE_COLOR,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: AXIS_LINE_STYLE_COLOR,
            },
          },
          axisTick: {
            show: false,
          },
        },
      ],
      series,
    };
  }
}

export const shopInfoFlowChartBlock: ng.IComponentOptions = {
  template: require('./flow-chart-block.template.html'),
  controller: FlowChartBlockController,
  bindings: {
    data: '<',
  },
};

