import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromEditor from '../reducers/editor.reducer';
import { createScanner } from 'typescript';

export const getEditorState = createSelector(
  fromFeature.getStoreConstructionState,
  (state: fromFeature.StoreConstructionState) => state.editor,
);

export const getEditorElems = createSelector(
  getEditorState,
  fromEditor.getEditorElems,
);

export const getEditorElemsCount = createSelector(
  getEditorState,
  fromEditor.getEditorElemsCount,
);

export const getCurFocusElemVid = createSelector(
  getEditorState,
  fromEditor.getCurFocusElemVid,
);

export const getModuleInsertId = createSelector(
  getEditorState,
  fromEditor.getModuleInsertId,
);

export const getCurElemVidForCtrl = createSelector(
  getEditorState,
  fromEditor.getCurElemVidForCtrl,
);

export const getTargetKolId = createSelector(
  getEditorState,
  fromEditor.getTargetKolId,
);

export const getTargetWechatId = createSelector(
  getEditorState,
  fromEditor.getTargetWechatId,
);

export const getTargetSellerMobile = createSelector(
  getEditorState,
  fromEditor.getTargetSellerMobile,
);

export const getTargetXdpId = createSelector(
  getEditorState,
  fromEditor.getTargetXdpId,
);

export const isEditorBusy = createSelector(
  getEditorState,
  fromEditor.isEditorBusy,
);

export const getEditorElemSorter = createSelector(
  getEditorState,
  fromEditor.getEditorElemSorter,
);

export const getEditorFirstInvalidElem = createSelector(
  getEditorState,
  fromEditor.getEditorFirstInvalidElem,
);

export const getEditorNearestInvalidElem = createSelector(
  getEditorState,
  fromEditor.getEditorNearestInvalidElem,
);

export const getEditorLastAppendedElem = createSelector(
  getEditorState,
  fromEditor.getEditorLastAppendedElem,
);

export const getEditorIsAdmin = createSelector(
  getEditorState,
  fromEditor.getEditorIsAdmine,
);

export const getEditorLoading = createSelector(
  getEditorState,
  fromEditor.getEditorLoading,
);

export const getEditorMeta = createSelector(
  getEditorState,
  fromEditor.getEditorMeta,
);
export const getXdpStatus = createSelector(
  getEditorState,
  fromEditor.getXdpStatus,
);
