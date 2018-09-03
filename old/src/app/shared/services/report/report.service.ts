import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import {
  _HttpClient,
  getData,
  throwObservableError,
} from '@shared/services/http/http.client';
import { map, filter, mergeMap } from 'rxjs/operators';
import { merge, result, isNil } from 'lodash';
import {
  ReportDataItem,
  IReportService,
} from 'app/services/report-service/report-service.interface';
import { assertService } from 'app/services/assert-service/assert.service';
import { EVENT_MAP } from 'app/services/report-service/event-map-dont-edit-manually';
import {
  STORAGE_KEY,
  QUERY_NAME_2_STORAGE_KEY,
  DEFAULT_REPORT_DATA,
  getParameterByName,
  ReportService as ng1ReportService,
} from 'app/services/report-service/report-service';

@Injectable()
export class ReportService {
  static _instance = null;

  static checkReferFrom() {
    ng1ReportService.checkReferFrom();
  }

  readyPromise: any;
  private backend_id: string;
  private xdp_id: any;
  private assertService = assertService();

  constructor(
    private http: _HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.readyPromise = new Promise((resolve, reject) => {
      // TODO 考虑怎么复用数据，避免多次 checkShopStatus
      if (location.href.includes('auth.html')) {
        reject();
      } else {
        this.http
          .get('api/xiaodianpu/checkCurrentStatus')
          .subscribe(({ data }) => {
            this.backend_id = data.backend_id;
            this.xdp_id = data.xdp_id;
            resolve();
          });
      }
    });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) route = route.firstChild; // tslint:disable-line no-parameter-reassignment
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data),
        filter(data => data['report']),
      )
      .subscribe(data => {
        const reportKey = data['report'];
        const extOptions = {};
        [1, 2, 3].forEach(v => {
          const reportExtName = data[`reportExt${v}`];
          if (reportExtName) {
            extOptions[`ext${v}`] = reportExtName;
          }
        });
        this.reportByPageKey(reportKey, extOptions);
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
      // 注册页才有，暂时用 ng1
      // return ReportService.getReferSellerFrom();
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

    this.http
      .request('POST', url, {
        body: JSON.stringify({ dynamic_args: [data] }),
        headers: new HttpHeaders().set(
          'Content-Type',
          'application/x-www-form-urlencoded;charset=utf-8',
        ),
      })
      .retry(3)
      .subscribe();
  };
}
