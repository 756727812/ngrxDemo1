import { Injectable } from '@angular/core';
import { _HttpClient } from '@shared/services';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import * as md5 from 'md5';
import { CookieService } from 'ngx-cookie';

export const isNumber = /^\d+$/;

const wrapCatchError = (ob: Observable<see.ICommonResponse<any>>) => {
  return ob.pipe(
    catchError((error: any) => {
      return Observable.throw(error.json ? error.json() : error);
    }),
  );
};

@Injectable()
export class ActivityClusterService {
  constructor(
    private _http: _HttpClient,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private cookieService: CookieService,
  ) {
    this.getCookie();
  }
  head;

  // 拼团查询
  grouponActivityAllList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this._http.post('api/ng/groupon/activity/allList', { formdata: params }),
    );
  }

  // 秒杀查询
  seckill_activityActivities(params) {
    return wrapCatchError(
      this._http.get('api/ng/seckill/activity/activities', params),
    );
  }

  // 满减查询
  fullOff_activityActivities(params) {
    return wrapCatchError(
      this._http.get('api/ng/fulloff/activity/searchByCondition', params),
    );
  }

  getActivityAllList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this._http.post('api/ng/activitybatch/activityLists', {
        params,
      }),
    );
  }

  activityBatchStop(params): Observable<see.ICommonResponse<any>> {
    // this.cookieService.put(
    //   'MANAGER_TOKEN',
    //   'A0nVkz%2B3Yl2SHVl3kurvUe9wTtIRJMBP26eNIgRILNDRz4N0vhO16Duc7JMsrWmxb9v%2FIgHYGPloXzmMHbqbSDv6QjA1bX9brm5CY2mXyGTkul7n0b1mfAcFJmFbnCjC',
    // );
    return wrapCatchError(
      this._http.post('api/ng/activitybatch/batchStop', { formdata: params }),
    );
  }

  private getCookie() {
    const cookies = this.cookieService.getAll();
    let coode = '';
    Object.keys(cookies).forEach(k => (coode += k + '=' + cookies[k] + ';'));
    console.log(coode);
    const token =
      'MANAGER_TOKEN=A0nVkz%2B3Yl2SHVl3kurvUe9wTtIRJMBP26eNIgRILNDRz4N0vhO16Duc7JMsrWmxb9v%2FIgHYGPloXzmMHbqbSDv6QjA1bX9brm5CY2mXyGTkul7n0b1mfAcFJmFbnCjC';
    // return coode.substring(0, coode.length-1);
    return coode + token;
  }

  setDisabled(data){
    if(!data||data[length]===0)return false;
    return data.every(
      (value, index) =>
        value.activityStatus === '3' ||
        value.activityStatus === '4'
    )
  }

  productIdValid(productId){
    const value = productId.trim();
    if(!value)return false;
    if (value.length>0) {
      const arr  = value.split(/[,，]/g);
      const ret = [];
      const result = arr.every(r=>{
        const s:string = `${r}`.trim() || '';
        ret.push(s);
        return isNumber.test(s) && s.length<=9
      });
      if(!result){
        return false;
      }
      return ret;
    }
    return false;
  }

}
