import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class CommonServices {

  kolInfo:any;
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getKolInfo(formdata):Observable<any>{
    return this.http
      .post('api/kol_mgr/checkUserPri', { formdata })
      .pipe(catchError(throwObservableError));
  }
}
