import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class BaseInfoService {
  constructor(private http: _HttpClient) {}

  getXdpInfo(params: { kolId: number }) {
    return this.http.get(`/api/ng/xiaodianpu/info`, { ...params }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }
}
