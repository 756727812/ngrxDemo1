import { Action } from '@ngrx/store';
// import { Book } from '../models/book';
import { type } from './util'; //用于避免Action定义重名

export const ActionTypes = {
    SELECT_SHAPE:     type('[Tag] Select Shap'),
    SELECT_FONT:  type('[Tag] Select Font'),
    ADD_TEXT:             type('[Tag] Add Text'),
    TOGGLE_CLIP:           type('[Tag] Toggle Clip'),
    TOGGLE_GEMS :         type('[Tag] Toggle Gems'),
    COMPLETE   :       type('[Tag] Complete'),
    RESET     :     type('[Tag] Reset'),
  };
  export class Select_ShapeAction implements Action {
    type = ActionTypes.SELECT_SHAPE;
  
    constructor(public payload: string) { }
  }
  export class Select_FontAction implements Action {
    type = ActionTypes.SELECT_FONT;
  
    constructor(public payload: string) { }
  }
  export class Add_TextAction implements Action {
    type = ActionTypes.ADD_TEXT;
  
    constructor(public payload: string) { }
  }
  export class Toggle_ClipAction implements Action {
    type = ActionTypes.TOGGLE_CLIP;
  
    constructor(public payload: string) { }
  }
  export class Toggle_GemsAction implements Action {
    type = ActionTypes.TOGGLE_GEMS;
  
    constructor(public payload: string) { }
  }
  export class CompleteAction implements Action {
    type = ActionTypes.SELECT_SHAPE;
  
    constructor(public payload: string) { }
  }
  export class ResetAction implements Action {
    type = ActionTypes.RESET;
  
    constructor(public payload: string) { }
  }
  
  /**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type Actions
= Select_ShapeAction
| Select_FontAction
| Add_TextAction
| Toggle_ClipAction
| Toggle_GemsAction
| CompleteAction
| ResetAction;

// export const SELECT_SHAPE = 'SELECT_SHAPE';
// export const SELECT_FONT = 'SELECT_FONT';
// export const ADD_TEXT = 'ADD_TEXT';
// export const TOGGLE_CLIP = 'TOGGLE_CLIP';
// export const TOGGLE_GEMS = 'TOGGLE_GEMS';
// export const COMPLETE = 'COMPLETE';
// export const RESET = 'RESET';