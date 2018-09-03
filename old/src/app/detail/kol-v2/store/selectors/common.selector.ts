import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromCommon from '../reducers/common.reducer';

export const getCommonState = createSelector(
  fromFeature.getKolState,
  (state: fromFeature.KolState) => state.common,
);

export const getCurrentKolDataSelector = createSelector(
  getCommonState,
  fromCommon.getCurrentKolData,
);
