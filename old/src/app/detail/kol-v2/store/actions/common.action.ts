import { Action } from '@ngrx/store';

export interface IKolData {
  /** KOL ID */
  kolId: number;
  /** wechat ID */
  wechatId: string;
  /** 小电铺 ID */
  xdpId?: number;
  /** KOL 头像 */
  avatar?: string;
  /** KOL 头像 */
  kolName?: string;
  sellerMobile?: string;
  theme?: number;
  /** 是否是趣好店小电铺 */
  is_quhaodian?: boolean;
}

export const SET_COMMON_DATA = '[Kol] Set Common Data';
export const SET_SELECTED_KOL_ID = '[Kol] Set Selected Kol Id';

export class SetCommonData implements Action {
  readonly type = SET_COMMON_DATA;
  constructor(public payload: IKolData) {}
}

export class SetSelectedKolId implements Action {
  readonly type = SET_SELECTED_KOL_ID;
  constructor(public payload: string) {}
}

export const LOAD_KOL_INFO = '[Kol] Load KolInfo';
export const LOAD_KOL_INFO_FAIL = '[Kol] Load KolInfo Fail';
export const LOAD_KOL_INFO_SUCCESS = '[Kol] Load KolInfo Success';

export class LoadKolInfo implements Action {
  readonly type = LOAD_KOL_INFO;
  constructor(public payload: number) {}
}

export class LoadKolInfoFail implements Action {
  readonly type = LOAD_KOL_INFO_FAIL;
  constructor(public payload: any) {}
}

export class LoadKolInfoSuccess implements Action {
  readonly type = LOAD_KOL_INFO_SUCCESS;
  constructor(public payload: any) {}
}

// action types
export type CommonAction =
  | SetCommonData
  | SetSelectedKolId
  | LoadKolInfo
  | LoadKolInfoSuccess
  | LoadKolInfoFail;
