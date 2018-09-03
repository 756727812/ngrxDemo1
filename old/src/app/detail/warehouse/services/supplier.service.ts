import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import { Suppliers, Supplier, Accessor } from '../models';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import { switchMap } from 'rxjs/operator/switchMap';

@Injectable()
export class SupplierService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  addSupplier(formdata): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/inventory/supplier/add', { formdata })
      .pipe(catchError(throwObservableError));
  }

  getSuppliersDetail(params): Observable<Supplier> {
    return this.http
      .get('api/ng/inventory/supplier/detail', params)
      .pipe(map(getData), catchError(throwObservableError));
  }

  editSupplierItem(formdata): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/inventory/supplier/edit', { formdata })
      .pipe(catchError(throwObservableError));
  }

  checkIfCompanyNameExists(formdata): Observable<boolean> {
    return this.http
      .post('api/ng/inventory/supplier/exist', { formdata })
      .pipe(map(getData), catchError(throwObservableError));
  }

  getSuppliersList(params): Observable<Suppliers> {
    return this.http
      .get('api/ng/inventory/supplier/list', params)
      .pipe(map(getData), catchError(throwObservableError));
  }

  querySupplierList(params) {
    return this.http
      .get('/api/ng/inventory/supplier/queryList', params) /* 改成get */
      .pipe(catchError(throwObservableError));
  }

  getAccessorsList(): Observable<Accessor[]> {
    return this.http
      .post('api/ng/inventory/supplier/accessList', Object.create(null))
      .pipe(map(getData), catchError(throwObservableError));
  }
  getSupplierTypeOptions() {
    return [
      {
        value: 0,
        label: '品牌商',
      },
      {
        value: 1,
        label: '一级代理商',
      },
      {
        value: 2,
        label: '二级代理商',
      },
      {
        value: 3,
        label: '贸易商',
      },
    ];
  }
}
