import { Injectable } from '@angular/core';
import { _HttpClient } from '@shared/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

const wrapCatchError = (ob: Observable<see.ICommonResponse<any>>) => {
  return ob.pipe(
    catchError((error: any) => {
      return Observable.throw(error.json ? error.json() : error);
    }),
  );
};

@Injectable()
export class TemplateService {
  constructor(private http: _HttpClient) {}

  // 发送模板消息
  send(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/api/ng/message-template/custom/send`, { body }),
    );
  }

  // 模板消息列表
  list(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/message-template/custom/list', { ...params }),
    );
  }

  // 商品列表http://localhost:3000/api/xiaodianpu/getItemList?newversion=1
  // getItemList(params): Observable<see.ICommonResponse<any>> {
  //   return wrapCatchError(
  //     this.http.post('/api/xiaodianpu/getItemList?newversion=1', {
  //       formdata: params,
  //     }),
  //   );
  // }

  getItemList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.get('/api/ng/item/products', params));
  }

  // 活动列表 (/api/ng/template/groupon/list - 无状态)
  // getGrouponList(params): Observable<see.ICommonResponse<any>> {
  //   return wrapCatchError(
  //     this.http.post('/api/ng/groupon/activity/allList',  {formdata:params} )
  //   );
  // }

  getGrouponList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/groupon/config/allList', { formdata: params }),
    );
  }

  // 页面列表
  getPageList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.get('/api/ng/microPage/list', params));
  }
}
