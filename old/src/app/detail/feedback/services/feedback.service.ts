import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class FeedbackService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getFeedbackList(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('/api/ng/feedback/query', { params })
      .pipe(catchError(throwObservableError));
  }

  exportFeedbackList(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('/api/ng/feedback/user-feedback-export', { params })
      .pipe(catchError(throwObservableError));
  }
}
