import { Action } from '@ngrx/store';

import { MicroPage } from '../../models';

// load microPages list
export const LOAD_MICROPAGES = '[Kol] Load MicroPages';
export const LOAD_MICROPAGES_FAIL = '[Kol] Load MicroPages Fail';
export const LOAD_MICROPAGES_SUCCESS = '[Kol] Load MicroPages Success';

export class LoadMicroPages implements Action {
  readonly type = LOAD_MICROPAGES;
  constructor(public payload: any) {}
}

export class LoadMicroPagesFail implements Action {
  readonly type = LOAD_MICROPAGES_FAIL;
  constructor(public payload: any) {}
}

export class LoadMicroPagesSuccess implements Action {
  readonly type = LOAD_MICROPAGES_SUCCESS;
  constructor(
    public payload: {
      count: number;
      list: MicroPage[];
    },
  ) {}
}

// create microPage
export const CREATE_MICROPAGE = '[Kol] Create MicroPage';
export const CREATE_MICROPAGE_FAIL = '[Kol] Create MicroPage Fail';
export const CREATE_MICROPAGE_SUCCESS = '[Kol] Create MicroPage Success';

export class CreateMicroPage implements Action {
  readonly type = CREATE_MICROPAGE;
  constructor(public payload: string) {}
}

export class CreateMicroPageFail implements Action {
  readonly type = CREATE_MICROPAGE_FAIL;
  constructor(public payload: any) {}
}

export class CreateMicroPageSuccess implements Action {
  readonly type = CREATE_MICROPAGE_SUCCESS;
  constructor(
    /** 创建成功后的微页面 ID */
    public payload: number,
  ) {}
}

// update microPage
export const UPDATE_MICROPAGE = '[Kol] Update MicroPage';
export const UPDATE_MICROPAGE_FAIL = '[Kol] Update MicroPage Fail';
export const UPDATE_MICROPAGE_SUCCESS = '[Kol] Update MicroPage Success';

export class UpdateMicroPage implements Action {
  readonly type = UPDATE_MICROPAGE;
  constructor(public payload: { id: number; name: string }) {}
}

export class UpdateMicroPageFail implements Action {
  readonly type = UPDATE_MICROPAGE_FAIL;
  constructor(public payload: any) {}
}

export class UpdateMicroPageSuccess implements Action {
  readonly type = UPDATE_MICROPAGE_SUCCESS;
  constructor(public payload: any) {}
}

// copy microPage
export const COPY_MICROPAGE = '[Kol] Copy MicroPage';
export const COPY_MICROPAGE_FAIL = '[Kol] Copy MicroPage Fail';
export const COPY_MICROPAGE_SUCCESS = '[Kol] Copy MicroPage Success';

export class CopyMicroPage implements Action {
  readonly type = COPY_MICROPAGE;
  constructor(public payload: number) {}
}

export class CopyMicroPageFail implements Action {
  readonly type = COPY_MICROPAGE_FAIL;
  constructor(public payload: any) {}
}

export class CopyMicroPageSuccess implements Action {
  readonly type = COPY_MICROPAGE_SUCCESS;
}

// setHomePage
export const SET_HOMEPAGE = '[Kol] setHomePage';
export const SET_HOMEPAGE_FAIL = '[Kol] setHomePage Fail';
export const SET_HOMEPAGE_SUCCESS = '[Kol] setHomePage Success';

export class SetHomePage implements Action {
  readonly type = SET_HOMEPAGE;
  constructor(public payload: number) {}
}

export class SetHomePageFail implements Action {
  readonly type = SET_HOMEPAGE_FAIL;
  constructor(public payload: any) {}
}

export class SetHomePageSuccess implements Action {
  readonly type = SET_HOMEPAGE_SUCCESS;
}

// updateTheme
export const UPDATE_THEME = '[Kol] updateTheme';
export const UPDATE_THEME_FAIL = '[Kol] updateTheme Fail';
export const UPDATE_THEME_SUCCESS = '[Kol] updateTheme Success';

export class UpdateTheme implements Action {
  readonly type = UPDATE_THEME;
  constructor(public payload: any) {}
}

export class UpdateThemeFail implements Action {
  readonly type = UPDATE_THEME_FAIL;
  constructor(public payload: any) {}
}

export class UpdateThemeSuccess implements Action {
  readonly type = UPDATE_THEME_SUCCESS;
}

// action types
export type MicroPagesAction =
  | LoadMicroPages
  | LoadMicroPagesFail
  | LoadMicroPagesSuccess
  | CreateMicroPage
  | CreateMicroPageFail
  | CreateMicroPageSuccess
  | UpdateMicroPage
  | UpdateMicroPageFail
  | UpdateMicroPageSuccess
  | CopyMicroPage
  | CopyMicroPageSuccess
  | CopyMicroPageFail
  | SetHomePage
  | SetHomePageSuccess
  | SetHomePageFail
  | UpdateTheme
  | UpdateThemeSuccess
  | UpdateThemeFail;
