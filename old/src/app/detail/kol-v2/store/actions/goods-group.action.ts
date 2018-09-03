import { Action } from '@ngrx/store';

import { GoodsGroup, GoodsGroups, GoodsGroupSearch } from '../../models';

// load GoodsGroups list
export const LOAD_GOODS_GROUPS = '[Kol] Load GoodsGroups';
export const LOAD_GOODS_GROUPS_FAIL = '[Kol] Load GoodsGroups Fail';
export const LOAD_GOODS_GROUPS_SUCCESS = '[Kol] Load GoodsGroups Success';

export class LoadGoodsGroups implements Action {
  readonly type = LOAD_GOODS_GROUPS;
  constructor(public payload: GoodsGroupSearch) {}
}

export class LoadGoodsGroupsFail implements Action {
  readonly type = LOAD_GOODS_GROUPS_FAIL;
  constructor(public payload: any) {}
}

export class LoadGoodsGroupsSuccess implements Action {
  readonly type = LOAD_GOODS_GROUPS_SUCCESS;
  constructor(public payload: GoodsGroups) {}
}

// create GoodsGroup
export const CREATE_GOODS_GROUP = '[Kol] Create GoodsGroup';
export const CREATE_GOODS_GROUP_FAIL = '[Kol] Create GoodsGroup Fail';
export const CREATE_GOODS_GROUP_SUCCESS = '[Kol] Create GoodsGroup Success';

export class CreateGoodsGroup implements Action {
  readonly type = CREATE_GOODS_GROUP;
  constructor(public payload: any) {}
}

export class CreateGoodsGroupFail implements Action {
  readonly type = CREATE_GOODS_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class CreateGoodsGroupSuccess implements Action {
  readonly type = CREATE_GOODS_GROUP_SUCCESS;
}

// update GoodsGroup
export const UPDATE_GOODS_GROUP = '[Kol] Update GoodsGroup';
export const UPDATE_GOODS_GROUP_FAIL = '[Kol] Update GoodsGroup Fail';
export const UPDATE_GOODS_GROUP_SUCCESS = '[Kol] Update GoodsGroup Success';

export class UpdateGoodsGroup implements Action {
  readonly type = UPDATE_GOODS_GROUP;
  constructor(
    public payload: {
      categoryId: number;
      categoryName: string;
    },
  ) {}
}

export class UpdateGoodsGroupFail implements Action {
  readonly type = UPDATE_GOODS_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class UpdateGoodsGroupSuccess implements Action {
  readonly type = UPDATE_GOODS_GROUP_SUCCESS;
}

// delete GoodsGroup
export const DELETE_GOODS_GROUP = '[Kol] Delete GoodsGroup';
export const DELETE_GOODS_GROUP_FAIL = '[Kol] Delete GoodsGroup Fail';
export const DELETE_GOODS_GROUP_SUCCESS = '[Kol] Delete GoodsGroup Success';

export class DeleteGoodsGroup implements Action {
  readonly type = DELETE_GOODS_GROUP;
  constructor(public payload: number) {}
}

export class DeleteGoodsGroupFail implements Action {
  readonly type = DELETE_GOODS_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class DeleteGoodsGroupSuccess implements Action {
  readonly type = DELETE_GOODS_GROUP_SUCCESS;
}

// action types
export type GoodsGroupsAction =
  | LoadGoodsGroups
  | LoadGoodsGroupsFail
  | LoadGoodsGroupsSuccess
  | CreateGoodsGroup
  | CreateGoodsGroupFail
  | CreateGoodsGroupSuccess
  | DeleteGoodsGroup
  | DeleteGoodsGroupSuccess
  | DeleteGoodsGroupFail
  | UpdateGoodsGroup
  | UpdateGoodsGroupSuccess
  | UpdateGoodsGroupFail;
