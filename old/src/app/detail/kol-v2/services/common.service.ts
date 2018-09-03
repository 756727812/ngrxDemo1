import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import * as moment from 'moment';
import * as md5 from 'md5';
import * as _ from 'lodash';

@Injectable()
export class CommonService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getKolInfo(formdata): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/kol_mgr/checkUserPri', { formdata })
      .pipe(catchError(throwObservableError));
  }

  shop_checkCurrentStatus(
    params: any,
    isHanldeAuthRedirect?: boolean,
  ): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/xiaodianpu/checkCurrentStatus', {
        params,
        isHanldeAuthRedirect,
        cache: true,
      })
      .pipe(catchError(throwObservableError));
  }

  kol_mgr_articleList(params: any): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/kol_mgr/articleList', this.getSeeApiSign(params))
      .pipe(catchError(throwObservableError));
  }

  kol_mgr_articleList_v2(params: any) {
    return this.http
      .get('/api/ng/data/article/list', { ...params })
      .pipe(catchError(throwObservableError));
  }

  /**
   * 生成see_api_sign验证码，按参数排序，然后md5参数值
   * 如果后台修改成post后，只需要在seePost接口全量接入
   * 所以任何接口不能用 see_api_sign 和 see_api_time参数，否则会被覆盖
   */
  private getSeeApiSign: (params: any) => any = (params = []) => {
    params.see_api_time = moment().format('YYYYMMDDHHMMSS');
    let list_key = [];
    _.forEach(params, (value, key) => {
      if (typeof value !== 'undefined' && String(key) !== 'see_api_sign') {
        list_key.push(key);
      }
    });
    list_key = list_key.sort();

    // 先写死
    let token: string = 'SeeTest001#';
    _.forEach(list_key, (value: any) => {
      token += params[value];
    });
    params.see_api_sign = md5(token);
    return { params };
  };

  // 获取微信信息
  seller_getSellerDetail(
    cache?: boolean,
  ): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/seller/getSellerDetail', { cache })
      .pipe(catchError(throwObservableError));
  }
  // 获取微信信息
  seller_getSellerDetailv2(
    cache?: boolean,
  ): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/seller/getSellerDetailv2', { cache })
      .pipe(catchError(throwObservableError));
  }

  kol_mgr_goodsList(params: any): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/kol_mgr/itemList', {
        formdata: this.getSeeApiSign(params).params,
      })
      .pipe(catchError(throwObservableError));
  }
}
