import { isEmpty, sumBy, flatten, merge, times, constant } from 'lodash';
import echarts from 'echarts';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export const xAxis = {
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
};

export const yAxis = {
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

export const getLinearColor = (from, end) => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    {
      offset: 0,
      // color: '#CCD3FE', // 0% 处的颜色
      color: from, // '#FCDADB', // 0% 处的颜色
    },
    {
      offset: 1,
      color: end, // '#fff', // 100% 处的颜色
    },
  ],
});

export const convertToPercent = (
  list,
  labelField,
  valField,
  newLabelField = 'label',
  newValField = 'val',
) => {
  if (isEmpty(list)) {
    return;
  }
  const sum = sumBy(list, valField);
  let totalPercentWithoutFirst = 0;
  list.forEach((item, i) => {
    const convertedScore = ~~item[valField] * 100 / sum;
    if (i > 0) {
      totalPercentWithoutFirst += convertedScore;
    }
    item[newValField] = convertedScore;
    item[newLabelField] = item[labelField];
  });
  list[0][newValField] = 100 - totalPercentWithoutFirst;
};

const colorCards = [
  ['#8168ff', '#9885F7', '#D0C8FC'],
  ['#B95DFF', '#D6A1FF', '#F0DFFD'],
  ['#629FFF', '#81AEF7', '#C6DBFC'],
];

export const COLOR_CARDS = [];
for (let i = 0; i < 4; i += 1) {
  for (let j = 0; j < colorCards.length; j += 1) {
    COLOR_CARDS.push(colorCards[j][i]);
  }
}

export const genSerLine = (name, data, color, options?) => {
  return merge(
    {
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
    },
    options,
  );
};

export const LINE_COLORS = [
  '#ff6b6b',
  '#5971e8',
  '#f5a623',
  '#7ed321',
  '#85fdff',
  '#f8e71c',
  '#d55231',
];

export const fmtDateMD = (str = '') =>
  str == null ? str : (str + '').replace(/\d{4}-/, '');

export const wrapChartOptions = argOptions => {
  const yAxisConfig =
    argOptions.yAxis && argOptions.yAxis.length
      ? times(argOptions.yAxis.length, constant(merge({}, yAxis)))
      : merge({}, yAxis);

  const options = merge(
    {},
    {
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
          color: '#485465',
          fontSize: 10,
        },
        boundaryGap: false,
      },
      yAxis: yAxisConfig,
      legend: {
        animation: false,
        textStyle: {
          color: '#485465',
          fontSize: '11px',
        },
        padding: [0, 0, 0, 0],
        margin: 0,
        itemHeight: 12,
        itemWidth: 12,
        bottom: 0,
      },
    },
    argOptions,
  );

  return options;
};

// TODO create chart instance 结合一下
export const autoResizeChart = (chartInstance, takeUtil$) => {
  Observable.fromEvent(window, 'resize') //
    .takeUntil(takeUtil$)
    .debounceTime(200) //
    .subscribe(() => {
      try {
        chartInstance && chartInstance.resize();
      } catch (e) {}
    });
};

export default {};
