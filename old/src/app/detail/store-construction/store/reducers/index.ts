import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromEditor from './editor.reducer';

export interface StoreConstructionState {
  editor: fromEditor.EditorState;
}

export const reducers: ActionReducerMap<StoreConstructionState> = {
  editor: fromEditor.reducer,
};

export const getStoreConstructionState = createFeatureSelector<
  StoreConstructionState
>('storeConstruction');
