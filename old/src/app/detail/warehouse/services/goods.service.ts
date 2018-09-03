import { Injectable } from '@angular/core';
import { _HttpClient, throwObservableError } from '@shared/services';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/observable/throw';

@Injectable()
export class WarehouseGoodsService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getClass2Tree(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .get('api/item/class2Tree', params)
      .pipe(catchError(throwObservableError));
  }

  getWarehouseGoodsList(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/inventory/warehouseItem/list', { body })
      .pipe(catchError(throwObservableError));
  }

  addWarehouseGoods(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/inventory/warehouseItem/add', { body })
      .pipe(catchError(throwObservableError));
  }

  editWarehouseGoods(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/inventory/warehouseItem/edit', { body })
      .pipe(catchError(throwObservableError));
  }

  getWarehouseGoodsDetail(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/ng/inventory/warehouseItem/detail', params)
      .pipe(catchError(throwObservableError));
  }
}
