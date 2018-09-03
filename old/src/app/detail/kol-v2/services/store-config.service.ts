import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

const wrapCatchError = (ob: Observable<see.ICommonResponse<any>>) => {
  return ob.pipe(
    catchError((error: any) => {
      return Observable.throw(error.json ? error.json() : error);
    }),
  );
};

@Injectable()
export class StoreConfigService {
  private kolId: number;

  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  // 根据xdpId查询豆腐块
  getKolShare(xdpId): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/api/ng/getXdpShare?xdpId=${xdpId}`, {}),
    );
  }

  // 保存豆腐块
  saveKolShare(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/saveXdpShare', {
        body,
      }),
    );
  }
}
