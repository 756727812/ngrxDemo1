import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class UserManageService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getUserList(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('/api/ng/platform/user/list', params)
      .pipe(catchError(throwObservableError));
  }

  getIdentifyInfo(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('/api/ng/platform/user/identify', params)
      .pipe(catchError(throwObservableError));
  }

  updateWechatgroup(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('/api/ng/platform/user/updateWechatgroup', { params })
      .pipe(catchError(throwObservableError));
  }
}
