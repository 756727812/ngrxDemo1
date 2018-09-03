import { Injectable } from '@angular/core';

import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import {
  map,
  switchMap,
  catchError,
  groupBy,
  mergeMap,
  withLatestFrom,
  distinctUntilChanged,
} from 'rxjs/operators';
import { merge, result } from 'lodash';

import {
  getModuleInsertId,
  getEditorState,
  getTargetXdpId,
} from '../selectors/editor.selectors';

import * as editorActions from '../actions/editor.action';
import * as fromServices from '../../services';
import { Elem, ShowType } from '../../models/editor.model';
import {
  EditorState,
  genElemVirtualId,
  findPreProperId,
} from '../reducers/editor.reducer';
import { Store } from '@ngrx/store';
import ElemFactory from '../reducers/elem-factory';
import { editableRun } from 'app/configs/editable.run';

let counter4SaveNonId = 1;
const genHackGroupId4SavingNew = () => {
  // tslint:disable-next-line
  return `hackGroupBy${counter4SaveNonId++}`;
};

/*
保存的顺序，同个元素以最后为主
整体要按照顺序，同个元素的，在序列中可以合并以最后一个为主

装修排序注意：

1. 新建的模块如果没有 id（假如），preModuleId、nextModuleId 一直往相应方向取取到有值为止
2. 删除的时候注意更新 preModuleId、nextModuleId

如果 preId 是基础模块信息，就不传

A —> 基础信息
B —>  其他模块

如果保存 B 模块信息，preId 不传


*/
@Injectable()
export class EditorEffects {
  constructor(
    private actions$: Actions,
    private service: fromServices.EditorService,
    private store$: Store<EditorState>,
  ) {}

  @Effect()
  loadAllData$ = this.actions$
    .ofType(editorActions.EditorActionTypes.LOAD)
    .pipe(
      map((action: editorActions.EditorLoad) => {
        const { id, xdpId, micropageId } = action.payload;
        return { id, xdpId, micropageId };
      }),
      switchMap(params => {
        return Observable.forkJoin(
          // .first 才能使用 forkJoin
          this.service.fetchAllConfiguration(params).first(),
          this.service.getLastTime(params).first(),
          this.service.getXDPStatus(params).first(),
        ).pipe(
          map(
            ([configurationResp, lastTimeResp, XDPStatusResp]) =>
              new editorActions.EditorLoadSuccess({
                list: configurationResp.data,
                meta: lastTimeResp.data,
                xdpStatus: XDPStatusResp.data,
              }),
          ),
          catchError(error => {
            return of(new editorActions.EditorLoadFail(error));
          }),
        );
      }),
    );

  @Effect()
  saveAll$ = this.actions$
    .ofType(editorActions.EditorActionTypes.SAVE_ELEM)
    .pipe(
      withLatestFrom(this.store$.select(getEditorState)),
      map(
        ([action, editorState]: [
          editorActions.EditorSaveElem,
          EditorState
        ]) => {
          const { vid } = action.payload;
          return {
            elem: editorState.elemMap[vid],
          };
        },
      ),
      groupBy(({ elem }) => elem.vid),
      mergeMap(group =>
        group.pipe(
          switchMap(({ elem }) => {
            return (
              this.service
                // .saveElem(payload.data) //
                .saveElem(elem.data) //
                .pipe(
                  switchMap((resp: any) => [
                    new editorActions.EditorSaveElemSuccess({
                      vid: elem.vid,
                      id: resp.data.id,
                    }),
                    new editorActions.EditorReLoadElem({
                      vid: elem.vid,
                      id: resp.data.id,
                    }),
                  ]),
                  catchError(error =>
                    of(new editorActions.EditorSaveElemFail(error)),
                  ),
                )
            );
          }),
        ),
      ),

      // switchMap(),
    );

  @Effect()
  reloadElem = this.actions$
    .ofType(editorActions.EditorActionTypes.RELOAD_ELEM)
    .pipe(
      map((action: editorActions.EditorSaveElemSuccess) => {
        const { vid, id } = action.payload;
        return { vid, id: String(id) };
      }),
      mergeMap(params =>
        this.store$.select(getTargetXdpId).map(xdpId => ({
          ...params,
          xdpId,
        })),
      ),
    )
    .switchMap(params => {
      return this.service.fetchAllConfiguration(params).pipe(
        map(
          ({ data }) =>
            new editorActions.EditorReLoadElemSuccess({
              data,
              vid: params.vid,
            }),
        ),
        catchError(error => of(new editorActions.EditorReLoadElemFail(error))),
      );
    });

  @Effect()
  removeElem$ = this.actions$
    .ofType(editorActions.EditorActionTypes.REMOVE_ELEM)
    .pipe(
      map((action: editorActions.EditorRemoveElem) => action.payload.elem),
      mergeMap(elem => {
        if (elem.data.id) {
          return this.service.removeElem(elem.data.id).pipe(
            map(
              ({ data }) => new editorActions.EditorRemoveElemSuccess({ elem }),
            ),
            catchError(error =>
              of(new editorActions.EditorRemoveElemFail(error)),
            ),
          );
        }
        return of(new editorActions.EditorRemoveElemSuccess({ elem }));
      }),
    );

  // TODO 怎么实现 reducer 之后再执行一个
  @Effect()
  appendElem$ = this.actions$
    .ofType(editorActions.EditorActionTypes.APPEND_ELEM)
    .pipe(
      withLatestFrom(
        this.store$.select(getEditorState),
        this.store$.select(getModuleInsertId),
      ),
      // map(([, lastAppendedElem]) => {
      //   debugger
      //   return new editorActions.EditorSaveElem({ vid: lastAppendedElem.vid });
      // }),
      switchMap(
        ([action, state, moduleInfo]: [
          editorActions.EditorAppendElem,
          EditorState,
          {
            isLast: boolean;
            curVid: string;
            preModuleId: number;
            nextModuleId: number;
          }
        ]) => {
          const { type } = action.payload;
          // 一直往前取，遇到店铺基础信息模块停止（pre modlue id 不能是店铺基础信息的）
          const vid = genElemVirtualId();
          // this.service.
          // NOTE: 这样设置默认值还是有风险,一方面前后台要同步默认值
          const defaultElemData = ElemFactory.buildInitData(type);
          const elem: Elem = {
            vid,
            valid: true,
            data: merge(defaultElemData, {
              type,
              id: null,
              config: {},
              // TODO 工厂创建默认值
            }),
          };
          let lastProperId = findPreProperId(state.elemMap, state.elemSorter);
          let mInfo = {
            prevId: '',
            isLast: true,
          };

          if (moduleInfo && state.elemMap[moduleInfo.curVid]) {
            lastProperId = state.elemMap[moduleInfo.curVid].data.id;
            if (moduleInfo && moduleInfo.nextModuleId) {
              elem.data.nextModuleId = moduleInfo.nextModuleId;
            }
            mInfo = {
              prevId: moduleInfo.curVid,
              isLast: false,
            };
          }
          if (lastProperId) {
            elem.data.preModuleId = lastProperId;
          }

          return this.service.saveElem(elem.data).pipe(
            map(
              (resp: any) =>
                new editorActions.EditorAppendElemSuccess({
                  elem: {
                    ...elem,
                    data: {
                      ...elem.data,
                      ...mInfo,
                      id: resp.data.id,
                    },
                  },
                }),
            ),
            catchError(error => {
              return of(new editorActions.EditorAppendElemFail(error));
            }),
          );
        },
      ),
    );

  // this.onInit$ = this.actions$
  // .ofType('[app] init')
  // .startWith('[app] init')
  // .withLatestFrom(this.store.select(state => state.isAuthorized)) // < ---- Not sure where your prop is exactly.
  // .map(([, isAuthorized]) => {
  //   if (isAuthorized) {
  //     this.accountService.fetchAll();
  //     this.imgService.fetchAll();
  //     this.personService.fetchAll();
  //     this.roleService.fetchAll();
  //   }
  // });
}
