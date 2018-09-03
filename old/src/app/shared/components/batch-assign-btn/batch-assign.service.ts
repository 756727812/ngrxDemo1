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
export class BatchAssignService {
  constructor(private http: _HttpClient) {}

  // 开启任务
  ng_batchCopy_add(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/batchCopy/add', {
        body,
      }),
    );
  }

  // 任务结果
  ng_batchCopy_listTask(batchId): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/batchCopy/listTask', { batchId }),
    );
  }

  // 批次任务统计(任务状态、任务进度)
  ng_batchCopy_statistics(batchId): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/batchCopy/statistics', { batchId }),
    );
  }
}
