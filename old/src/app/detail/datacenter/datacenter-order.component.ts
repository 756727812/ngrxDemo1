import './datacenter-order.less';

declare let AmCharts: any;
import * as moment from 'moment';
import { forEach } from 'lodash';

datacenterOrderController.$inject = ['$q', 'dataService'];
export function datacenterOrderController($q, dataService) {
  const $ctrl = this;

  const _str_month_data_loading = '加载中...';
  const _str_month_data_more = '>>查看2016年订单数据';

  $ctrl.str_more_month_data = _str_month_data_more;
  $ctrl.trendStatData = [];
  $ctrl.trendMonthStatData = [];
  $ctrl.statOrderSearch = statOrderSearch;
  $ctrl.statOrderMonthSearch = statOrderMonthSearch;
  $ctrl.dataShow = dataShow;
  $ctrl.range = {
    startDate: moment().subtract(8, 'days'),
    endDate: moment(),
  };
  $ctrl.month_range = {
    startDate: moment(),
    endDate: moment(),
  };
  $ctrl.$onInit = activate;

  function dataShow(item) {
    for (let i = 0; i < $ctrl.trendStatData.length; i++) {
      if (item.date == $ctrl.trendStatData[i].date) {
        $ctrl.trendStatData[i].is_click = !$ctrl.trendStatData[i].is_click;
        break;
      }
    }
  }

  function activate() {
    const promises = [
      getTotalStatData(),
      getTrendStatData(),
      getMonthTrendStatData(),
    ];
    return $q.all(promises);
  }

  function getTotalStatData() {
    return dataService.datacenter_getTotalStatData().then(function(res) {
      $ctrl.totalStatData = res.data;
      return $ctrl.totalStatData;
    });
  }

  function getTrendStatData(params?) {
    return dataService
      .datacenter_getTrendStatData({
        begin_date:
          params && params.startDate ? params.startDate._d : undefined,
        end_date: params && params.endDate ? params.endDate._d : undefined,
      })
      .then(function(res) {
        $ctrl.trendStatData = res.data;
        for (let i = 0; i < $ctrl.trendStatData.length; i++) {
          $ctrl.trendStatData[i].is_click = false;
        }
        //console.log(res.data);
        formatOrderData(res.data);
        return $ctrl.trendStatData;
      });
  }

  function getMonthTrendStatData(params?) {
    return dataService
      .datacenter_getMonthTrendStatData({
        begin_date:
          params && params.startDate ? params.startDate._d : undefined,
        end_date: params && params.endDate ? params.endDate._d : undefined,
      })
      .then(function(res) {
        $ctrl.trendMonthStatData = res.data;

        if ($ctrl.str_more_month_data === _str_month_data_loading) {
          $ctrl.str_more_month_data = '';
        }
        return $ctrl.trendMonthStatData;
      });
  }

  function statOrderSearch() {
    return getTrendStatData($ctrl.range);
  }

  function statOrderMonthSearch() {
    $ctrl.month_range = {
      startDate: moment('2016-01-01 00:00:00'),
      endDate: moment(),
    };
    $ctrl.str_more_month_data = _str_month_data_loading;
    return getMonthTrendStatData($ctrl.month_range);
  }

  function formatOrderData(data) {
    if (!data) {
      return;
    }
    let chartData = data.slice(0);
    chartData[0].bulletClass = 'lastBullet';
    chartData = chartData.reverse();
    forEach(chartData, function(ele) {
      ele['needpay_order_count'] =
        ele['total_order_count'] - ele['pay_order_count'];
    });
    initializeOrderChart('orderChart', chartData);
  }

  function initializeOrderChart(id, data) {
    const chart = AmCharts.makeChart(id, {
      type: 'serial',
      fontSize: 12,
      fontFamily: 'Open Sans',
      dataDateFormat: 'YYYY-MM-DD',
      dataProvider: data,

      addClassNames: true,
      startDuration: 1,
      color: '#6c7b88',
      marginLeft: 0,

      categoryField: 'date',
      categoryAxis: {
        title: '日期',
        parseDates: true,
        minPeriod: 'DD',
        autoGridCount: false,
        gridCount: 50,
        gridAlpha: 0.1,
        gridColor: '#FFFFFF',
        axisColor: '#555555',
        dateFormats: [
          {
            period: 'DD',
            format: 'MM-DD',
          },
          {
            period: 'WW',
            format: 'MMM DD',
          },
          {
            period: 'MM',
            format: 'MMM',
          },
          {
            period: 'YYYY',
            format: 'YYYY',
          },
        ],
      },

      valueAxes: [
        {
          id: 'a1',
          title: '总交易额',
          gridAlpha: 0,
          axisAlpha: 0,
        },
        {
          id: 'a2',
          position: 'right',
          gridAlpha: 0,
          axisAlpha: 0,
          labelsEnabled: false,
        },
        {
          id: 'a3',
          title: '订单数',
          position: 'right',
          gridAlpha: 0,
          axisAlpha: 0,
          inside: false,
          /*duration: "mm",
        durationUnits: {
          DD: "d. ",
          hh: "h ",
          mm: "min",
          ss: ""
        }*/
        },
      ],
      graphs: [
        {
          id: 'g1',
          valueField: 'pay_total_fee',
          title: '总交易额',
          type: 'column',
          fillAlphas: 0.7,
          valueAxis: 'a1',
          balloonText: '总交易额：[[value]]元',
          legendValueText: '[[value]] 元',
          legendPeriodValueText: '总计: [[value.sum]] 元',
          lineColor: '#08a3cc',
          alphaField: 'alpha',
        },
        {
          id: 'g2',
          valueField: 'avr_buy_price',
          classNameField: 'bulletClass',
          title: '笔单价',
          type: 'line',
          valueAxis: 'a2',
          lineColor: '#786c56',
          lineThickness: 1,
          legendValueText: '[[value]]元',
          bullet: 'round',
          bulletBorderColor: '#02617a',
          bulletBorderAlpha: 1,
          bulletBorderThickness: 2,
          bulletColor: '#89c4f4',
          balloonText: '笔单价：[[value]]元',
          showBalloon: true,
          animationPlayed: true,
        },
        {
          id: 'g3',
          title: '付款订单数',
          valueField: 'pay_order_count',
          type: 'line',
          valueAxis: 'a3',
          lineAlpha: 0.8,
          lineColor: '#e26a6a',
          balloonText: '付款订单数：[[value]]笔',
          lineThickness: 1,
          legendValueText: '[[value]]笔',
          bullet: 'square',
          bulletBorderColor: '#e26a6a',
          bulletBorderThickness: 1,
          bulletBorderAlpha: 0.8,
          dashLengthField: 'dashLength',
          animationPlayed: true,
        },
      ],

      chartCursor: {
        zoomable: false,
        categoryBalloonDateFormat: 'DD',
        cursorAlpha: 0,
        categoryBalloonColor: '#e26a6a',
        categoryBalloonAlpha: 0.8,
        valueBalloonsEnabled: false,
      },
      legend: {
        bulletType: 'round',
        equalWidths: false,
        valueWidth: 100,
        useGraphSettings: true,
        color: '#6c7b88',
      },
    });
  }
}

export const datacenterOrder: ng.IComponentOptions = {
  template: require('./datacenter-order.template.html'),
  controller: datacenterOrderController,
};
