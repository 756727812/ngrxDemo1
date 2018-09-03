import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class GoodsManageService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getGoodsList(params): Observable<see.ICommonResponse<any>> {
    return this.http.get('api/ng/item/itemList', { ...params }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }
}
