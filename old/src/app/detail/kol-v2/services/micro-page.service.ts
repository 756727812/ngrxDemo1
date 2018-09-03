import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import { MicroPages, IPathsTypes } from '../models';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class MicroPageService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getMicroPagesList(params): Observable<MicroPages> {
    return this.http
      .get('api/ng/microPage/list', { ...params, order: 1 })
      .pipe(map(getData), catchError(throwObservableError));
  }

  addMicroPage(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/microPage/add', { body })
      .pipe(catchError(throwObservableError));
  }

  copyMicroPage(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/microPage/copy', { body })
      .pipe(catchError(throwObservableError));
  }

  setHomePage(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/microPage/setHomePage', { body })
      .pipe(catchError(throwObservableError));
  }

  editMicroPage(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/microPage/edit', { body })
      .pipe(catchError(throwObservableError));
  }

  getMicroPagePaths(params): Observable<IPathsTypes> {
    return this.http
      .get('api/ng/pathAQrUrl/getMicropage', params)
      .pipe(map(getData), catchError(throwObservableError));
  }

  updateTheme(params): Observable<MicroPages> {
    return this.http
      .post('api/ng/microPage/updateTheme', params)
      .pipe(map(getData), catchError(throwObservableError));
  }
}
