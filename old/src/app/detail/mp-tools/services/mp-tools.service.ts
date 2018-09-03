import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import { catchError, map } from 'rxjs/operators';

export const urlPattern = /^((https|http)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;

@Injectable()
export class MpToolsService {
  constructor(private http: _HttpClient) {}

  get loading() {
    return this.http.loading;
  }

  getTuiwen() {
    return this.http
      .get(`/api/ng/weixin/temai/menu`)
      .pipe(map(getData), catchError(throwObservableError));
  }

  saveTuiwen(body) {
    return this.http
      .post(`/api/ng/weixin/temai/menu`, { body })
      .pipe(map(getData), catchError(throwObservableError));
  }
}
