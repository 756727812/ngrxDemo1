import { Injectable } from '@angular/core';
import { _HttpClient, throwObservableError } from './http/http.client';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/observable/throw';
import { DatePipe } from '@angular/common';
import { forEach, get } from 'lodash';
import * as md5 from 'md5';

@Injectable()
export class AuthService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient, private datePipe: DatePipe) {}

  createSeeApiSign = params => this.getSeeApiSign(params);

  /**
   * 生成see_api_sign验证码，按参数排序，然后md5参数值
   * 如果后台修改成post后，只需要在seePost接口全量接入
   * 所以任何接口不能用 see_api_sign 和 see_api_time参数，否则会被覆盖
   */
  private getSeeApiSign: (params: any) => any = (params = []) => {
    params.see_api_time = this.datePipe.transform(new Date(), 'yyyyMMddHHMMSS');
    let list_key = [];
    forEach(params, (value, key) => {
      if (typeof value !== 'undefined' && String(key) !== 'see_api_sign') {
        list_key.push(key);
      }
    });
    list_key = list_key.sort();

    // 先写死
    let token: string = 'SeeTest001#';
    forEach(list_key, (value: any) => {
      token += params[value];
    });
    params.see_api_sign = md5(token);
    return params;
  };

  checkGA(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/auth/isGoogleAuthenticated', { formdata: params })
      .pipe(catchError(throwObservableError));
  }

  login_setUser = params => {
    const {
      block_with_dd,
      seller_name,
      seller_privilege,
      kol_id,
      seller_email,
    } = params;
    document.cookie = `block_with_dd=${block_with_dd}`;
    document.cookie = `seller_name=${seller_name}`;
    document.cookie = `seller_privilege=${seller_privilege}`;
    document.cookie = `seller_email=${seller_email}`;
    localStorage.setItem('seller_email', seller_email);
    localStorage.setItem('seller_name', seller_name);
    localStorage.setItem('seller_privilege', seller_privilege);
    localStorage.setItem('block_with_dd', block_with_dd);
    localStorage.setItem('kolId', kol_id);
  };

  // 已添加验证
  auth_login(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/auth/login', { params: this.createSeeApiSign(params) })
      .pipe(catchError(throwObservableError));
  }

  sendSmsCode(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/auth/sendSmsV2Code', {
        formdata: this.createSeeApiSign(params),
      })
      .pipe(catchError(throwObservableError));
  }

  resetPasswordStepOne(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/auth/resetPasswdStep1', { formdata: params })
      .pipe(catchError(throwObservableError));
  }

  resetPasswordStepTwo(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/auth/resetPasswdStep2', { formdata: params })
      .pipe(catchError(throwObservableError));
  }

  bindSellerMobile(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/authv2/bindSellerMobile', { formdata: params })
      .pipe(catchError(throwObservableError));
  }

  registerXiaodianpu(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/authv2/registerXiaodianpu', { formdata: params })
      .pipe(catchError(throwObservableError));
  }

  getAccountTypeList(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/authv2/getAccountTypeList', { formdata: params })
      .pipe(catchError(throwObservableError));
  }

  getFromWhereList(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/authv2/getFromWhereList', { formdata: params })
      .pipe(catchError(throwObservableError));
  }

  addAndUpdateInfo(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/authv2/addAndUpdateInfo', { formdata: params })
      .pipe(catchError(throwObservableError));
  }
}
