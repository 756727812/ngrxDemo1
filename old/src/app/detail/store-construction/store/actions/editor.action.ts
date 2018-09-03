import { Action } from '@ngrx/store';
import {
  Elem,
  ElemModel4Save,
  ElemType,
  Meta,
} from '../../models/editor.model';
import { IFetchConfigParams } from 'app/detail/store-construction/services';

export enum EditorActionTypes {
  RESET = '[Store Construction] reset',
  UPDATE_META = '[Store Construction] update meta',
  LOAD = '[Store Construction] Load all configuration',
  LOAD_SUCCESS = '[Store Construction] Load all configuration success',
  LOAD_FAIL = '[Store Construction] Load all configuration fail',
  CLOSE_ELEM_CTRL = '[Store Construction] close elem ctrl pane',
  APPEND_ELEM = '[Store Construction] Append element',
  APPEND_ELEM_SUCCESS = '[Store Construction] Append element success',
  APPEND_ELEM_FAIL = '[Store Construction] Append element fail',
  FOCUS_ELEM = '[Store Construction] Focus element',
  FOCUS_FIRST_ELEM_BY_TYPE = '[Store Construction] Focus first element by type',
  FOCUS_INVALID_ELEM = '[Store Construction] Focus invalid element',
  UPDATE_ELEM = '[Store Construction] Update element',
  SAVE_ELEM = '[Store Construction] Save  element',
  SAVE_ELEM_SUCCESS = '[Store Construction] Save element success',
  SAVE_ELEM_FAIL = '[Store Construction] Save element fail',
  REMOVE_ELEM = '[Store Construction] Remove element',
  REMOVE_ELEM_SUCCESS = '[Store Construction] Remove element success',
  REMOVE_ELEM_FAIL = '[Store Construction] Remove element fail',
  UPDATE_ELEM_ORDER = '[Store Construction] Update element order',
  GLOBAL_SAVE = '[Store Construction] GLOBAL_SAVE',
  XXX = '[Store Construction] XXX',
  RELOAD_ELEM = '[Store Construction] Reload elem configuration',
  RELOAD_ELEM_SUCCESS = '[Store Construction] Reload elem configuration success',
  RELOAD_ELEM_FAIL = '[Store Construction] Reload elem configuration fail',
  IGNORE_VERSION_MODAL = '[Store Construction] Ignore version modal',
}

export class EditorAppendElem implements Action {
  readonly type = EditorActionTypes.APPEND_ELEM;
  constructor(public payload: { type: string }) {}
}

export class EditorAppendElemSuccess implements Action {
  readonly type = EditorActionTypes.APPEND_ELEM_SUCCESS;
  constructor(public payload: { elem: Elem }) {}
}

export class EditorAppendElemFail implements Action {
  readonly type = EditorActionTypes.APPEND_ELEM_FAIL;
  constructor(public payload: any) {}
}

export class EditorFocusElem implements Action {
  readonly type = EditorActionTypes.FOCUS_ELEM;
  constructor(public payload: { vid: string | null }) {}
}

export class EditorUpdateElem implements Action {
  readonly type = EditorActionTypes.UPDATE_ELEM;
  // TODO 直接 merge 会不会不安全，每个模块组件都声明一下可以更新的 model interface
  constructor(public payload: { vid: string; value: any; valid?: boolean }) {}
}

export class EditorLoadSuccess implements Action {
  readonly type = EditorActionTypes.LOAD_SUCCESS;
  // TODO ElemData[]
  constructor(public payload: { list: any[]; meta: any; xdpStatus: any }) {}
}
export class EditorLoadFail implements Action {
  readonly type = EditorActionTypes.LOAD_FAIL;
  constructor(public payload: any) {}
}
export class EditorIgnoreVersionModal implements Action {
  readonly type = EditorActionTypes.IGNORE_VERSION_MODAL;
  constructor(public payload?: any) {}
}

export interface ILoadPayload extends IFetchConfigParams {
  /** KOL ID：外部权限下可不传 */
  kolId?: string;
  micropageId?: string;
}

export class EditorLoad implements Action {
  readonly type = EditorActionTypes.LOAD;
  constructor(public payload: ILoadPayload) {}
}

export class EditorReLoadElem implements Action {
  readonly type = EditorActionTypes.RELOAD_ELEM;
  constructor(public payload: { vid: string; id: string | number }) {}
}

export class EditorReLoadElemSuccess implements Action {
  readonly type = EditorActionTypes.RELOAD_ELEM_SUCCESS;
  constructor(public payload: any) {}
}

export class EditorReLoadElemFail implements Action {
  readonly type = EditorActionTypes.RELOAD_ELEM_FAIL;
  constructor(public payload: any) {}
}

export class EditorSaveElem implements Action {
  readonly type = EditorActionTypes.SAVE_ELEM;
  constructor(public payload: ElemModel4Save) {}
}

export class EditorSaveElemSuccess implements Action {
  readonly type = EditorActionTypes.SAVE_ELEM_SUCCESS;
  constructor(public payload: { vid: string; id: string | number }) {}
}
export class EditorSaveElemFail implements Action {
  readonly type = EditorActionTypes.SAVE_ELEM_FAIL;
  constructor(public payload: any) {}
}

export class EditorCloseElemCtrl implements Action {
  readonly type = EditorActionTypes.CLOSE_ELEM_CTRL;
  constructor(public payload?: any) {}
}

export class EditorRemoveElem implements Action {
  readonly type = EditorActionTypes.REMOVE_ELEM;
  constructor(public payload: { elem: Elem }) {}
}

export class EditorRemoveElemSuccess implements Action {
  readonly type = EditorActionTypes.REMOVE_ELEM_SUCCESS;
  constructor(public payload: { elem: Elem }) {}
}

export class EditorRemoveElemFail implements Action {
  readonly type = EditorActionTypes.REMOVE_ELEM_FAIL;
  constructor(public payload: any) {}
}

export class EditorUpdateElemOrder implements Action {
  readonly type = EditorActionTypes.UPDATE_ELEM_ORDER;
  // dir > 0 表示下移动一位    dir < 0 表示上移动一位
  constructor(public payload: { vid: string; dir: number }) {}
}

export class EditorFocusInvalidElem implements Action {
  readonly type = EditorActionTypes.FOCUS_INVALID_ELEM;
  constructor(public payload?: any) {}
}

export class EditorGlobalSave implements Action {
  readonly type = EditorActionTypes.GLOBAL_SAVE;
  constructor(public payload?: any) {}
}

export class EditorFocusFirstElemByType implements Action {
  readonly type = EditorActionTypes.FOCUS_FIRST_ELEM_BY_TYPE;
  constructor(public payload: { type: ElemType }) {}
}

export class EditorUpdateMeta implements Action {
  readonly type = EditorActionTypes.UPDATE_META;
  constructor(public payload: Meta) {}
}

export class EditorReset implements Action {
  readonly type = EditorActionTypes.RESET;
  constructor(public payload?: any) {}
}

export type EditorActions =
  | EditorAppendElem
  | EditorAppendElemSuccess
  | EditorAppendElemFail
  | EditorFocusElem
  | EditorUpdateElem
  | EditorLoad
  | EditorLoadSuccess
  | EditorLoadFail
  | EditorIgnoreVersionModal
  | EditorReLoadElem
  | EditorReLoadElemSuccess
  | EditorReLoadElemFail
  | EditorSaveElem
  | EditorSaveElemSuccess
  | EditorSaveElemFail
  | EditorCloseElemCtrl
  | EditorRemoveElem
  | EditorRemoveElemSuccess
  | EditorRemoveElemFail
  | EditorUpdateElemOrder
  | EditorFocusInvalidElem
  | EditorGlobalSave
  | EditorFocusFirstElemByType
  | EditorUpdateMeta
  | EditorReset;
