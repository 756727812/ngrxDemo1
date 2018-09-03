import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';

import * as fromRoot from 'app/store';
import * as microPageActions from '../actions/micro-page.action';
import * as fromServices from '../../services';
import * as fromSelectors from '../selectors';

@Injectable()
export class MicroPageEffects {
  constructor(
    private store: Store<fromRoot.State>,
    private actions$: Actions,
    private microPageService: fromServices.MicroPageService,
    private message: NzMessageService,
  ) {}

  @Effect()
  loadMicroPages$ = this.actions$.ofType(microPageActions.LOAD_MICROPAGES).pipe(
    map((action: microPageActions.LoadMicroPages) => action.payload),
    withLatestFrom(this.store.select(fromSelectors.getCurrentKolDataSelector)),
    switchMap(([search, { xdpId }]) => {
      return this.microPageService.getMicroPagesList({ ...search, xdpId }).pipe(
        map(
          microPages => new microPageActions.LoadMicroPagesSuccess(microPages),
        ),
        catchError(error => of(new microPageActions.LoadMicroPagesFail(error))),
      );
    }),
  );

  @Effect()
  createMicroPage$ = this.actions$
    .ofType(microPageActions.CREATE_MICROPAGE)
    .pipe(
      map((action: microPageActions.CreateMicroPage) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      switchMap(([name, { xdpId }]) => {
        return this.microPageService.addMicroPage({ xdpId, name }).pipe(
          map(res => new microPageActions.CreateMicroPageSuccess(res.data.id)),
          catchError(error =>
            of(new microPageActions.CreateMicroPageFail(error)),
          ),
        );
      }),
    );

  @Effect()
  updateMicroPage$ = this.actions$
    .ofType(microPageActions.UPDATE_MICROPAGE)
    .pipe(
      map((action: microPageActions.UpdateMicroPage) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      switchMap(([params, { xdpId }]) => {
        const { id, name } = params;
        return this.microPageService.editMicroPage({ xdpId, id, name }).pipe(
          map(res => new microPageActions.UpdateMicroPageSuccess(res.data)),
          catchError(error =>
            of(new microPageActions.UpdateMicroPageFail(error)),
          ),
        );
      }),
    );

  @Effect()
  handleCopyMicroPage$ = this.actions$
    .ofType(microPageActions.COPY_MICROPAGE)
    .pipe(
      map((action: microPageActions.CopyMicroPage) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      switchMap(([id, { xdpId }]) => {
        return this.microPageService.copyMicroPage({ id, xdpId }).pipe(
          map(() => new microPageActions.CopyMicroPageSuccess()),
          catchError(error =>
            of(new microPageActions.CopyMicroPageFail(error)),
          ),
        );
      }),
    );

  @Effect()
  handleSetHomePage$ = this.actions$.ofType(microPageActions.SET_HOMEPAGE).pipe(
    map((action: microPageActions.SetHomePage) => action.payload),
    withLatestFrom(this.store.select(fromSelectors.getCurrentKolDataSelector)),
    switchMap(([id, { xdpId }]) => {
      return this.microPageService.setHomePage({ id, xdpId }).pipe(
        map(() => new microPageActions.SetHomePageSuccess()),
        catchError(error => of(new microPageActions.SetHomePageFail(error))),
      );
    }),
  );

  @Effect()
  handleCreateMicroPageSuccess$ = this.actions$
    .ofType(microPageActions.CREATE_MICROPAGE_SUCCESS)
    .pipe(
      map((action: microPageActions.CreateMicroPageSuccess) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      map(([microPageId, { kolId, xdpId, wechatId }]) => {
        return new fromRoot.Go({
          path: ['/store-construction'],
          query: {
            kolId,
            xdpId,
            wechatId,
            micropageId: microPageId,
          },
        });
      }),
    );

  @Effect()
  handleOperationSuccess$ = this.actions$
    .ofType(
      microPageActions.UPDATE_MICROPAGE_SUCCESS,
      microPageActions.SET_HOMEPAGE_SUCCESS,
      microPageActions.COPY_MICROPAGE_SUCCESS,
      microPageActions.UPDATE_THEME_SUCCESS,
    )
    .pipe(
      withLatestFrom(this.store.select(fromRoot.getRouterState)),
      map(
        ([
          action,
          {
            state: {
              queryParams: { name, range, page = 1, pageSize = 30 },
            },
          },
        ]) => {
          // 趣好店设置主题暂时提示无效
          if (
            action.type === microPageActions.UPDATE_THEME_SUCCESS &&
            localStorage.getItem('is_quhaodian') === '1'
          ) {
            this.message.warning('设置无效！');
          } else {
            this.message.success('操作成功！');
          }

          return new microPageActions.LoadMicroPages({
            name,
            range,
            page,
            pageSize,
          });
        },
      ),
    );

  @Effect()
  handleUpdateTheme$ = this.actions$.ofType(microPageActions.UPDATE_THEME).pipe(
    map((action: microPageActions.UpdateTheme) => action.payload),
    withLatestFrom(this.store.select(fromSelectors.getCurrentKolDataSelector)),
    switchMap(([params, { xdpId, theme }]) => {
      return this.microPageService.updateTheme({ params }).pipe(
        map(() => new microPageActions.UpdateThemeSuccess()),
        catchError(error => of(new microPageActions.UpdateThemeFail(error))),
      );
    }),
  );
}
