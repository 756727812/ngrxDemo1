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
export class KOLService {
  constructor(private http: _HttpClient) {}

  // kol列表
  fetchKolList(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/kol/list', {
        pageSize: 99999,
      }),
    );
  }
}
