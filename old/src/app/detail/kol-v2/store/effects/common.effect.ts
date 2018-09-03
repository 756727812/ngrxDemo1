import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { map, switchMap, catchError, pluck } from 'rxjs/operators';

import * as fromRoot from 'app/store';
import * as commonActions from '../actions/common.action';
import * as fromServices from '../../services';

@Injectable()
export class CommonEffects {
  constructor(
    private store: Store<fromRoot.State>,
    private actions$: Actions,
    private commonService: fromServices.CommonService,
  ) {}

  @Effect()
  loadKolInfo$ = this.actions$.ofType(commonActions.LOAD_KOL_INFO).pipe(
    map((action: commonActions.LoadKolInfo) => action.payload),
    switchMap(kol_id => {
      return this.commonService
        .getKolInfo({ kol_id })
        .pipe(
          map(res => new commonActions.LoadKolInfoSuccess(res.data.kol_info)),
          catchError(error => of(new commonActions.LoadKolInfoFail(error))),
        );
    }),
  );
}
