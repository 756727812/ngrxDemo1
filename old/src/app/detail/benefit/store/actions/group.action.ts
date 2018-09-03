import { Action } from '@ngrx/store';

import { BenefitGroup} from '../../models';

export const LOAD_GROUPS = '[Benefit Group] Load GoodsGroups';
export const LOAD_GROUPS_FAIL = '[Benefit Group] Load GoodsGroups Fail';
export const LOAD_GROUPS_SUCCESS = '[Benefit Group] Load GoodsGroups Success';

export class LoadGroups implements Action {
  readonly type = LOAD_GROUPS;
  constructor(public payload: any) {}
}

export class LoadGroupsFail implements Action {
  readonly type = LOAD_GROUPS_FAIL;
  constructor(public payload: any) {}
}

export class LoadGroupsSuccess implements Action {
  readonly type = LOAD_GROUPS_SUCCESS;
  constructor(public payload: any) {}
}

// create GoodsGroup
export const CREATE_GROUP = '[Benefit Group] Create Benefit Group';
export const CREATE_GROUP_FAIL = '[Benefit Group] Create Benefit Group Fail';
export const CREATE_GROUP_SUCCESS = '[Benefit Group] Create Benefit Group Success';

export class CreateGroup implements Action {
  readonly type = CREATE_GROUP;
  constructor(public payload: any) {}
}

export class CreateGroupFail implements Action {
  readonly type = CREATE_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class CreateGroupSuccess implements Action {
  readonly type = CREATE_GROUP_SUCCESS;
  constructor(public payload: any) {}
}

// update Benefit Group
export const UPDATE_GROUP = '[Benefit Group] Update Benefit Group';
export const UPDATE_GROUP_FAIL = '[Benefit Group] Update Benefit Group Fail';
export const UPDATE_GROUP_SUCCESS = '[Benefit Group] Update Benefit Group Success';

export class UpdateGroup implements Action {
  readonly type = UPDATE_GROUP;
  constructor(
    public payload: {
      categoryId: number;
      categoryName: string;
    },
  ) {}
}

export class UpdateGroupFail implements Action {
  readonly type = UPDATE_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class UpdateGroupSuccess implements Action {
  readonly type = UPDATE_GROUP_SUCCESS;
}

// delete Benefit Group
export const DELETE_GROUP = '[Benefit Group] Delete Benefit Group';
export const DELETE_GROUP_FAIL = '[Benefit Group] Delete Benefit Group Fail';
export const DELETE_GROUP_SUCCESS = '[Benefit Group] Delete Benefit Group Success';

export class DeleteGroup implements Action {
  readonly type = DELETE_GROUP;
  constructor(public payload: number) {}
}

export class DeleteGroupFail implements Action {
  readonly type = DELETE_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class DeleteGroupSuccess implements Action {
  readonly type = DELETE_GROUP_SUCCESS;
}

// action types
export type BenefitGroupActions =
  | LoadGroups
  | LoadGroupsFail
  | LoadGroupsSuccess
  | CreateGroup
  | CreateGroupFail
  | CreateGroupSuccess
  | DeleteGroup
  | DeleteGroupSuccess
  | DeleteGroupFail
  | UpdateGroup
  | UpdateGroupSuccess
  | UpdateGroupFail;
