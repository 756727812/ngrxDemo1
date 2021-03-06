declare let AmCharts: any;
import * as moment from 'moment';
import { forEach } from 'lodash';

datacenterOrderDetailController.$inject = ['$q', 'dataService'];
export function datacenterOrderDetailController($q, dataService) {
  const $ctrl = this;

  $ctrl.statOrderSearch = statOrderSearch;
  $ctrl.range = {
    startDate: moment().subtract(8, 'days'),
    endDate: moment(),
  };
  $ctrl.$onInit = activate;

  if (Number(moment().format('X')) > 1490976000) {
    $ctrl.range.startDate = moment().subtract(30, 'days');
  } else {
    $ctrl.range.startDate = '2017-03-01';
  }

  function activate() {
    const promises = [getTotalStatData(), getTrendStatData()];
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
        $ctrl.trendStatData_inv = [];

        forEach($ctrl.trendStatData, function(item) {
          const d1 = new Date(item.date);
          const d2 = new Date('2017-03-01');
          if (d1 >= d2) {
            $ctrl.trendStatData_inv.push(item);
          }
        });

        formatOrderData(res.data);
        return $ctrl.trendStatData;
      });
  }

  function statOrderSearch() {
    return getTrendStatData($ctrl.range);
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

export const datacenterOrderDetail: ng.IComponentOptions = {
  template: require('./datacenter-order-detail.template.html'),
  controller: datacenterOrderDetailController,
};
