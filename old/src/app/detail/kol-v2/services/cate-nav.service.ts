import { Injectable } from '@angular/core';
import {
  _HttpClient,
  getData,
  throwObservableError,
} from '../../../shared/services/index';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class CateNavService {
  constructor(private http: _HttpClient) {}
  get loading() {
    return this.http.loading;
  }

  private get(url, params) {
    return this.http.get(url, params).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }
  private post(url, params) {
    return this.http.post(url, { params }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  cateList(kolId: { kolId: number }) {
    return this.post(`/api/ng/cgs/kol/category/list`, kolId);
  }

  cateMallKolClass(params: { kolId: number; mallKolClassId?: number }) {
    return this.get(`/api/ng/cgs/kol/category/getMallKolClass`, params);
  }

  cateSave(body: {
    kolId: number;
    mallClassName: 'string';
    mallKolClassId?: number;
    relateList: any;
  }) {
    return this.http.post(`/api/ng/cgs/kol/category/save`, { body }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  cateSort(sortMallKolClassIds: { sortMallKolClassIds: string }) {
    return this.post(`/api/ng/cgs/kol/category/sort`, sortMallKolClassIds);
  }

  cateSwitch(params: { mallKolClassId: number; isPublic: number }) {
    return this.post(`/api/ng/cgs/kol/category/switch`, params);
  }

  cateDel(params: { mallKolClassId: number }) {
    return this.post(`/api/ng/cgs/kol/category/delete`, params);
  }
}
