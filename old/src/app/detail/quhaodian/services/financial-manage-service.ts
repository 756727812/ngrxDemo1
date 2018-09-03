import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class FinancialManageService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getWithdrawList(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('/api/ng/platform/withdrawal/list', params)
      .pipe(catchError(throwObservableError));
  }

  withdraw(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('/api/ng/platform/withdrawal/withdraw', { params })
      .pipe(catchError(throwObservableError));
  }

  withdrawConfirm(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('/api/ng/platform/withdrawal/withdrawConfirm', { params })
      .pipe(catchError(throwObservableError));
  }

  withdrawForceSuccess(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('/api/ng/platform/withdrawal/withdrawForceSuccess', {
        body: params,
      })
      .pipe(catchError(throwObservableError));
  }

  withdrawRefuse(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('/api/ng/platform/withdrawal/withdrawRefuse', { body: params })
      .pipe(catchError(throwObservableError));
  }

  getSellerDetail(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/seller/getSellerDetail', { params })
      .pipe(catchError(throwObservableError));
  }
}
