import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';

import * as fromRoot from 'app/store';
import * as goodsGroupActions from '../actions/goods-group.action';
import * as fromServices from '../../services';
import * as fromSelectors from '../selectors';

@Injectable()
export class GoodsGroupEffects {
  constructor(
    private store: Store<fromRoot.State>,
    private actions$: Actions,
    private goodsGroupService: fromServices.GoodsGroupService,
    private message: NzMessageService,
  ) {}

  @Effect()
  loadGoodsGroups$ = this.actions$
    .ofType(goodsGroupActions.LOAD_GOODS_GROUPS)
    .pipe(
      map((action: goodsGroupActions.LoadGoodsGroups) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      switchMap(([search, { kolId }]) => {
        return this.goodsGroupService
          .getGoodsGroupsList({
            ...search,
            kolId,
          })
          .pipe(
            map(groups => new goodsGroupActions.LoadGoodsGroupsSuccess(groups)),
            catchError(error =>
              of(new goodsGroupActions.LoadGoodsGroupsFail(error)),
            ),
          );
      }),
    );

  @Effect()
  createGoodsGroup$ = this.actions$
    .ofType(goodsGroupActions.CREATE_GOODS_GROUP)
    .pipe(
      map((action: goodsGroupActions.CreateGoodsGroup) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      switchMap(([payload, { kolId }]) => {
        return this.goodsGroupService
          .createGoodsGroup({ ...payload, kolId })
          .pipe(
            map(res => new goodsGroupActions.CreateGoodsGroupSuccess()),
            catchError(error =>
              of(new goodsGroupActions.CreateGoodsGroupFail(error)),
            ),
          );
      }),
    );

  @Effect()
  deleteGoodsGroup$ = this.actions$
    .ofType(goodsGroupActions.DELETE_GOODS_GROUP)
    .pipe(
      map((action: goodsGroupActions.DeleteGoodsGroup) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      switchMap(([categoryId, { kolId }]) => {
        return this.goodsGroupService
          .deleteGoodsGroup({ categoryId, kolId })
          .pipe(
            map(res => new goodsGroupActions.DeleteGoodsGroupSuccess()),
            catchError(error =>
              of(new goodsGroupActions.DeleteGoodsGroupFail(error)),
            ),
          );
      }),
    );

  @Effect()
  updateGoodsGroup$ = this.actions$
    .ofType(goodsGroupActions.UPDATE_GOODS_GROUP)
    .pipe(
      map((action: goodsGroupActions.UpdateGoodsGroup) => action.payload),
      withLatestFrom(
        this.store.select(fromSelectors.getCurrentKolDataSelector),
      ),
      switchMap(([payload, { kolId }]) => {
        return this.goodsGroupService
          .updateGoodsGroup({ ...payload, kolId })
          .pipe(
            map(res => new goodsGroupActions.UpdateGoodsGroupSuccess()),
            catchError(error =>
              of(new goodsGroupActions.UpdateGoodsGroupFail(error)),
            ),
          );
      }),
    );

  @Effect()
  handleOperationSuccess$ = this.actions$
    .ofType(
      goodsGroupActions.CREATE_GOODS_GROUP_SUCCESS,
      goodsGroupActions.DELETE_GOODS_GROUP_SUCCESS,
      goodsGroupActions.UPDATE_GOODS_GROUP_SUCCESS,
      goodsGroupActions.CREATE_GOODS_GROUP_SUCCESS,
    )
    .pipe(
      withLatestFrom(this.store.select(fromRoot.getRouterState)),
      map(
        ([
          action,
          { state: { queryParams: { keyword, page = 1, pageSize = 30 } } },
        ]) => {
          this.message.success('操作成功！');
          return new goodsGroupActions.LoadGoodsGroups({
            keyword,
            pageSize,
            page,
          });
        },
      ),
    );
}
