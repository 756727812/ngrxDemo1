import { IAssertService } from '../assert-service/assert.service.interface';
import { IDataService } from '../data-service/data-service.interface';
import { ReportDataItem, IReportService } from './report-service.interface';

import { merge, result, isNil, each, isEmpty, find } from 'lodash';
import { EVENT_MAP } from './event-map-dont-edit-manually';
import * as angular from 'angular';

/*
TODO 弄个队列，保证上报队列依次上报，失败重新上报，批量上报
*/
export const STORAGE_KEY = {
  SEARCH_KEYWORD: '__searchKeyword__',
  IS_SEE_DATA: '__isSeeData__',
};

export const QUERY_NAME_2_STORAGE_KEY = {
  _search: STORAGE_KEY.SEARCH_KEYWORD,
  _see_data: STORAGE_KEY.IS_SEE_DATA,
};

const DEFAULT_SELLER_FROM = 99;

const ROUTE_PARAMS_SELLER_FROM = '__routeParamsSellerFrom__';

export const DEFAULT_REPORT_DATA = {
  user_id: 0,
  content_id: 0,
  module_id: 101,
  opt_id: 1,
  extend_str1: '',
  extend_str2: '',
  extend_str3: '',
};

let lastRouteReportKey = null;

// tslint:disable-next-line:max-line-length
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144
export const getParameterByName = (argName, argUrl?: string) => {
  const url = argUrl || window.location.href;
  const name = argName.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const recordInitSellerFrom = () => {
  const $routeParams: any = angular
    .element(document.body)
    .injector()
    .get('$routeParams');

  if ($routeParams && $routeParams.seller_from) {
    sessionStorage.setItem(ROUTE_PARAMS_SELLER_FROM, $routeParams.seller_from);
  }
};

export class ReportService {
  static $inject: string[] = ['assertService', 'dataService'];

  static _instance = null;

  // 尴尬~
  /*
  seller_from 入口出现在
  ....auth.html#!/entry?seller_from=xx
  NOTE: 这个 url 参数不是标准的 url 参数，整个session storage 存储也没有考虑这个参数
  */
  static getReferSellerFrom() {
    // TODO `feature-code-mgr` 合并之后改造
    const $routeParams: any = angular
      .element(document.body)
      .injector()
      .get('$routeParams');
    // TODO 如果非官网过来 xxx
    return (
      // 浏览器窗口跟第一次访问所带的 $routeParams.seller_from 绑定
      sessionStorage.getItem(ROUTE_PARAMS_SELLER_FROM) ||
      $routeParams.seller_from ||
      DEFAULT_SELLER_FROM
    );
  }

  static setupRouteReport = [
    '$rootScope',
    $rootScope => {
      const getReportKey = routeWrapObj => {
        const reportKey =
          routeWrapObj &&
          routeWrapObj.$$route &&
          routeWrapObj.$$route.reportKey;
        return reportKey
          ? typeof reportKey === 'function'
            ? reportKey(routeWrapObj)
            : reportKey
          : null;
      };
      const fn = (reportKey, routeWrapObj) => {
        const { $$route, pathParams } = routeWrapObj;
        const extOptions = {};
        // 检测路由配置有无 reportExt1 ...
        [1, 2, 3].forEach(v => {
          const reportExtName = $$route[`reportExt${v}`];
          if (reportExtName) {
            if (/^:/.test(reportExtName)) {
              const pathKey = reportExtName.substring(1);
              if (pathParams[pathKey]) {
                extOptions[`ext${v}`] = pathParams[pathKey];
              } else {
                // TODO err when dev
              }
            } else {
              // TODO err when dev
            }
          }
        });
        ReportService.reportByPageKey(reportKey, extOptions);
      };
      $rootScope.$on('$routeChangeSuccess', (event, current, previous) => {
        const preRoute = previous && previous.$$route;
        const preRouteReportKey = getReportKey(previous);
        if (preRoute && preRoute.redirectTo && preRouteReportKey) {
          fn(preRouteReportKey, previous);
        }
        const curRouteReportKey = getReportKey(current);
        if (curRouteReportKey && curRouteReportKey !== lastRouteReportKey) {
          fn(curRouteReportKey, current);
          lastRouteReportKey = curRouteReportKey;
        }
      });
    },
  ];

  static checkReferFrom() {
    Object.keys(QUERY_NAME_2_STORAGE_KEY).forEach(queryName => {
      const queryVal = getParameterByName(queryName);
      if (queryVal) {
        sessionStorage.setItem(QUERY_NAME_2_STORAGE_KEY[queryName], queryVal);
      }
    });
  }

  static reportByPageKey(str, extOption) {
    if (!ReportService._instance) {
      ReportService._instance = angular
        .element(document.body)
        .injector()
        .get('reportService');
    }
    const reportService: IReportService = ReportService._instance;
    reportService.reportByPageKey(str, extOption);
  }

  readyPromise: any;
  private queue = [];
  private backend_id: string;
  private xdp_id: any;

  constructor(
    private assertService: IAssertService,
    private dataService: IDataService,
  ) {
    recordInitSellerFrom();

    this.readyPromise = new Promise((resolve, reject) => {
      // TODO 考虑怎么复用数据，避免多次 checkShopStatus
      if (location.href.includes('auth.html')) {
        reject();
      } else {
        this.dataService
          .shop_checkCurrentStatus({}, false)
          .then(({ result, data }) => {
            if (result === 1) {
              this.backend_id = data.backend_id;
              // TODO 如果多店铺那就 呵呵
              this.xdp_id = data.xdp_id;
            }
            resolve();
          })
          .catch(resolve);
      }
    });
  }

  getCommonExtInfo(name) {
    switch (name) {
      case 'x':
        return null;
      case 'seedata':
        return sessionStorage.getItem(STORAGE_KEY.IS_SEE_DATA) ? 1 : 2;
      case 'refer':
        // 20180123，志鹏：动态扩展字段1填充：来自SEE数注册登录为1，其他为2，动态扩展字段2填充seller_from
        return ReportService.getReferSellerFrom();
      case 'kw':
        return sessionStorage.getItem(STORAGE_KEY.SEARCH_KEYWORD);
      default:
        this.assertService.whenDev(() => {
          throw new Error(`${name} 类型的公共信息获取不到内容`);
        });
        break;
    }
  }

  getContentIdByType(type): string {
    switch (type) {
      case 'x':
        return null;
      case 'shop_id':
        return this.xdp_id;
      default:
        this.assertService.whenDev(() => {
          throw new Error(`${type} 类型的 内容 Id 获取不到内容`);
        });
        break;
    }
  }

  /*
  TODO 先做成上报时直接请求
后续要达到：
    1. 队列，依次上报，保证前一次上报完成，后一次再发请求
    2. 后续的请求可批量
    3. 支持重试，如果是一个完整漏斗路径统计，丢了一个就不好
*/
  reportByPageModuleKey(pageKey, moduleKey, ext1, ext2, ext3) {
    const obj: any = result(EVENT_MAP, `${pageKey}.${moduleKey}`);
    const code = obj.code;

    this.assertService.isOk(code, `${pageKey}.${moduleKey} 找不到相应 code`);
    this.assertCodeIsOk(pageKey, moduleKey, code);

    const splitArr = code.split('-');
    const [
      pageId,
      contentIdType,
      moduleId,
      optId,
      extName1,
      extName2,
      extName3,
    ] = splitArr;
    this.report(
      ~~pageId,
      contentIdType === 'x' ? null : contentIdType,
      ~~moduleId,
      ~~optId,
      !isNil(ext1) ? ext1 : extName1 ? this.getCommonExtInfo(extName1) : null,
      !isNil(ext2) ? ext2 : extName2 ? this.getCommonExtInfo(extName2) : null,
      !isNil(ext3) ? ext3 : extName3 ? this.getCommonExtInfo(extName3) : null,
    );
  }

  reportByPageKey(pageKey, extOption: any = {}) {
    const { ext1, ext2, ext3 } = extOption;
    const splitArr = pageKey.split('.');
    return this.reportByPageModuleKey(
      splitArr[0],
      splitArr[1] || 'PV',
      ext1,
      ext2,
      ext3,
    );
  }

  reportByKey(fullKey, extOption?: any) {
    const [pageKey, moduleKey] = fullKey.split('.');
    let ext1 = null;
    let ext2 = null;
    let ext3 = null;
    if (extOption) {
      ext1 = extOption.ext1;
      ext2 = extOption.ext2;
      ext3 = extOption.ext3;
    }
    if (moduleKey) {
      this.reportByPageModuleKey(pageKey, moduleKey, ext1, ext2, ext3);
    } else {
      this.reportByPageKey(pageKey);
    }
  }

  report(
    page_id: number,
    contentIdType: string,
    module_id: number,
    opt_id: number,
    extend_str1?: string | number,
    extend_str2?: string | number,
    extend_str3?: string | number,
  ) {
    const fn = () => {
      const data: any = {
        page_id,
        module_id,
        opt_id,
        time: Math.round(Date.now() / 1000),
      };
      if (!isNil(this.backend_id)) {
        data.user_id = this.backend_id;
      }
      if (!isNil(contentIdType)) {
        data.content_id = this.getContentIdByType(contentIdType);
      }
      if (!isNil(extend_str1)) {
        data.extend_str1 = extend_str1;
      }
      if (!isNil(extend_str2)) {
        data.extend_str2 = extend_str2;
      }
      if (!isNil(extend_str3)) {
        data.extend_str3 = extend_str3;
      }
      this.assertReportDataIsOk(data);
      this.doReport(data);
    };
    this.readyPromise.then(fn).catch(e => e);
  }

  private assertCodeIsOk(pageKey, moduleKey, code) {
    this.assertService.whenDev(() => {
      const splitArr = code.split('-');
      const [pageId, contentIdType, moduleId, optId] = splitArr;

      this.assertService.isOk(
        pageId,
        `${pageKey}.${moduleKey} code 下 页面 id 不合法`,
      );
      this.assertService.isOk(
        contentIdType,
        `${pageKey}.${moduleKey} code 下 内容 id 类型 不合法`,
      );
      this.assertService.isOk(
        moduleId,
        `${pageKey}.${moduleKey} code 下 控件 id 不合法`,
      );
      this.assertService.isOk(
        optId,
        `${pageKey}.${moduleKey} code 下 操作 id 不合法`,
      );
    });
  }

  private assertReportDataIsOk(data: ReportDataItem) {
    this.assertService.whenDev(() => {
      this.assertService.isOk(data.time, '上报数据需包含 time');
      // this.assertService.isOk(data.user_id, '上报数据需包含 user_id')
      this.assertService.isOk(data.page_id, '上报数据需包含 page_id');
      // this.assertService.isOk(data.content_id, '上报数据需包含 content_id')
      this.assertService.isOk(data.module_id, '上报数据需包含 module_id');
      this.assertService.isOk(data.opt_id, '上报数据需包含 opt_id');
    });
  }

  private doReport = argData => {
    const data = merge({}, DEFAULT_REPORT_DATA, argData);
    const PRD_URL = 'https://da.seeapp.com/report/page';
    const TEST_URL = 'https://da.seeapp.com/report/test/page';
    const url = process.env.NODE_ENV === 'production' ? PRD_URL : TEST_URL;
    // console.log('>>>report', JSON.stringify(data))
    $.ajax({
      url,
      type: 'POST',
      crossDomain: true,
      data: JSON.stringify({
        dynamic_args: [data],
      }),
    });
  };
}
