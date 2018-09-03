import { Injectable } from '@angular/core';
import { _HttpClient } from '@shared/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { isPlainObject, isArray, merge } from 'lodash';
import * as moment from 'moment';
import { BiDateCycle } from '../models/bi.model';
import { Router, ActivatedRoute, Params } from '@angular/router';

const host = window.location.host;
const biHost =
  host === 'portal.xiaodianpu.com'
    ? 'https://bi.xiaodianpu.com/'
    : host.includes('localhost')
      ? 'http://seedata-test.seecsee.com:14180/'
      : '';

const API_URL = {
  EXPORT: {
    TRADE_SUMMARY: 'dapi/bbi/trade/profile_day_sum/export',
    TRADE_DIST: 'dapi/bbi/trade/market_dist/export',
    // TRADE_PIE: 'dapi/bbi/trade/money_dist/export',
    AFTER_SALE: 'dapi/bbi/trade/return_day/export',
    GOODS_SUMMARY: 'dapi/bbi/item/profile_day_sum/export',
    GOODS_DETAIL: 'dapi/bbi/item/detail/export',
  },
};

@Injectable()
export class BiService {
  lastAvailDate$: Observable<any>;
  kolId = '';
  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      // TODO 每次订阅不够优雅
      console.log(this.activatedRoute);
      this.kolId = params.kolId;
    });

    this.lastAvailDate$ = this.fetch('dapi/bbi/latestDate', {}).share();
  }

  // TODO url 根据测试还是正式更换host
  fetch(url, parmas) {
    // TODO 这里判断是否 200 并且 data 有值
    return this.http
      .get(
        biHost + url,
        merge({}, parmas, this.kolId ? { kol_id: this.kolId } : null),
        {
          withCredentials: true,
        },
      )
      .share()
      .pipe(
        catchError((error: any) => {
          return Observable.throw(error.json ? error.json() : error);
        }),
      );
  }

  fetchLastAvailDate(): Observable<see.ICommonResponse<any>> {
    return this.lastAvailDate$;
  }

  /*******************************************************
   ******************** 数据概览  *************************
   ******************************************************/
  // 数据概览/实时数据汇总(今日、昨日)
  fetchSummaryRealtime() {
    return this.fetch('dapi/bbi/overview/realtime_sum', {});
  }

  // 数据概览/实时数据折线图(今日、昨日
  fetchSummaryRealtimeLines() {
    return this.fetch('dapi/bbi/overview/realtime_detail', {});
  }

  // TODO 第一个参数枚举时间范围类型
  // 数据概览/交易概况/自然天汇总
  fetchSummaryTradeData(
    type = 0, // 0 - 天， 1-周
    begin_date,
    stat_date,
  ): Observable<see.ICommonResponse<any>> {
    const url =
      type === 0
        ? 'dapi/bbi/overview/trade_day_sum'
        : 'dapi/bbi/overview/trade_week_sum';
    return this.fetch(url, {
      // TODO  reset
      begin_date,
      stat_date,
    });
  }

  // 数据概览/交易概况/折线
  fetchSummaryTradeLine(
    type = 0, // 0- 天， 1-周
    begin_date,
    stat_date,
  ) {
    const url =
      type === 0
        ? 'dapi/bbi/overview/trade_day_detail'
        : 'dapi/bbi/overview/trade_week_detail';
    return this.fetch(url, {
      // TODO  reset
      begin_date,
      stat_date,
    });
  }

  fetchTopSaleList() {
    return this.fetch('dapi/bbi/overview/best_sold_item', null);
  }

  fetchArticleList() {
    return this.fetch('dapi/bbi/overview/article_profile', null);
  }

  /*******************************************************
   ******************** 交易分析  *************************
   ******************************************************/

  // 交易分析/交易概况/汇总 今日实时
  fetchTradeSummaryRealtime(): Observable<see.ICommonResponse<any>> {
    return this.fetch('dapi/bbi/trade/realtime_sum', {});
  }

  // 交易分析/交易概况/自然天、自然月、最近7天、最近30天、自定义汇总
  fetchTradeSummary(
    begin_date,
    stat_date,
  ): Observable<see.ICommonResponse<any>> {
    return this.fetch('dapi/bbi/trade/profile_day_sum', {
      begin_date,
      stat_date,
    });
  }

  // 交易分析/交易概况/今日实时折现
  fetchTradeSummaryRealtimeLineData() {
    return this.fetch('dapi/bbi/trade/realtime_detail', {});
  }

  // 交易分析/交易概况/自然天、最近7天、最近30天、自定义折线图
  fetchTradeSummaryLine(
    type: BiDateCycle,
    begin_date,
    stat_date,
  ): Observable<see.ICommonResponse<any>> {
    return this.fetch(
      type === BiDateCycle.MONTH
        ? 'dapi/bbi/trade/profile_month_detail'
        : 'dapi/bbi/trade/profile_day_detail',
      {
        begin_date,
        stat_date,
      },
    );
  }
  // 交易分析实时折线图
  fetchTradeSummaryLineRealtime(): Observable<see.ICommonResponse<any>> {
    return this.fetch('dapi/bbi/trade/realtime_detail', {});
  }

  // 交易分析/营销分布
  fetchMarketingDistBar(option, begin_date, stat_date) {
    return this.fetch('dapi/bbi/trade/market_dist', {
      option,
      begin_date,
      stat_date,
      // TODO reset
    });
  }

  // 交易分析/营销分布/自然天 http://10.104.194.62:18033dapi/bbi/trade/market_dist_day/mock
  // 交易分析/营销分布/自然周 http://10.104.194.62:18033dapi/bbi/trade/market_dist_week/mock
  // 交易分析/营销分布/自然月 http://10.104.194.62:18033dapi/bbi/trade/market_dist_month/mock

  // 交易分析/金额分布/自然天、周、月
  fetchOrderAccountPie(begin_date, stat_date) {
    return this.fetch('dapi/bbi/trade/money_dist', {
      begin_date,
      stat_date,
    });
  }

  // 交易分析/访客复购/自然月、最近一个月 http://10.104.194.62:18033dapi/bbi/trade/rebuy/mock
  fetchTradeRebuy(option, begin_date, stat_date) {
    return this.fetch('dapi/bbi/trade/rebuy', {
      option,
      begin_date,
      stat_date,
    });
  }

  fetchTradeAfterSaleData(begin_date, stat_date) {
    return this.fetch('dapi/bbi/trade/return_day', {
      begin_date,
      stat_date,
      // TODO reset
    });
  }

  /*******************************************************
   ******************** 商品分析  *************************
   ******************************************************/
  fetchGoodsOverviewData(begin_date, stat_date) {
    return this.fetch('dapi/bbi/item/profile_day_sum', {
      begin_date,
      stat_date,
    });
  }

  fetchGoodsOverviewLine(begin_date, stat_date) {
    return this.fetch('dapi/bbi/item/profile_day_detail', {
      // begin_date,: '2018-01-01',
      // stat_date: '2018-01-02',
      // TODO reset
      begin_date,
      stat_date,
    });
  }

  fetchGoodsTableData(begin_date, stat_date, params) {
    return this.fetch('dapi/bbi/item/detail', {
      ...params,
      begin_date,
      stat_date,
    });
  }

  // 类目列表
  fetchClassList() {
    return this.fetch('dapi/bbi/item/class_list', {});
  }

  // 商品状态选项
  fetchGoodsStatusOptions() {
    return this.fetch('dapi/bbi/item/status_list', {});
  }

  // 商品趋势图
  fetchGoodsTrendLineData(item_id, begin_date, stat_date) {
    return this.fetch('dapi/bbi/item/item_chart', {
      item_id,
      begin_date,
      stat_date,
    });
  }

  genDownloadUrl(name: string, argParams) {
    let params = argParams;
    if (Array.isArray(argParams)) {
      params = {
        begin_date: argParams[0],
        stat_date: argParams[1],
      };
    }
    const queryArr = [];
    // 暂时不需要 encode
    Object.keys(params).forEach(key => {
      queryArr.push(`${key}=${params[key]}`);
    });
    this.kolId && queryArr.push(`kol_id=${this.kolId}`);
    const url = `${biHost}${API_URL.EXPORT[name]}?${queryArr.join('&')}`;
    return url;
  }
}
