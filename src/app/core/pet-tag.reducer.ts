import { Action } from '@ngrx/store';
import { combineReducers } from '@ngrx/store';
import { PetTag, initialTag } from './../core/pet-tag.model';
// import { SELECT_SHAPE, SELECT_FONT, ADD_TEXT, TOGGLE_CLIP, TOGGLE_GEMS, COMPLETE, RESET } from './pet-tag.actions';

import * as Tag from './pet-tag.actions';
// 如果有多个Action的话，会看到在不同的 Action 定义文件中，导出的 Action 类型名称都是 Actions ，
// 在导入的时候，同时导入同名的类型就是问题了。
// 这里首先使用了 import as 语法进行重命名。

export function petTagReducer(state: PetTag = initialTag, action: Tag.Actions) {
    switch (action.type) {
    //   case SELECT_SHAPE:
    //     return Object.assign({}, state, {
    //       font: action.payload
    //     });
      case Tag.ActionTypes.SELECT_SHAPE:
        return Object.assign({}, state, {
          shape: action.payload
        });
      case Tag.ActionTypes.SELECT_FONT:
        return Object.assign({}, state, {
          font: action.payload
        });
      case Tag.ActionTypes.ADD_TEXT:
        return Object.assign({}, state, {
          text: action.payload
        });
      case Tag.ActionTypes.TOGGLE_CLIP:
        return Object.assign({}, state, {
          clip: !state.clip
        });
      case Tag.ActionTypes.TOGGLE_GEMS:
        return Object.assign({}, state, {
          gems: !state.gems
        });
      case Tag.ActionTypes.COMPLETE:
        return Object.assign({}, state, {
          complete: action.payload
        });
      case Tag.ActionTypes.RESET:
        return Object.assign({}, state, initialTag);
      default:
        return state;
    }
}