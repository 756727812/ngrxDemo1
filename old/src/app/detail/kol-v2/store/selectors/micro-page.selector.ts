import { createSelector } from '@ngrx/store';

import * as fromRoot from 'app/store';
import * as fromFeature from '../reducers';
import * as fromMicroPage from '../reducers/micro-page.reducer';

export const getMicroPagesState = createSelector(
  fromFeature.getKolState,
  (state: fromFeature.KolState) => state.microPage,
);

export const getAllMicroPages = createSelector(
  getMicroPagesState,
  fromMicroPage.getMicroPagesList,
);

export const getMicroPagesCount = createSelector(
  getMicroPagesState,
  fromMicroPage.getMicroPagesCount,
);

export const getMicroPagesLoading = createSelector(
  getMicroPagesState,
  fromMicroPage.getMicroPagesLoading,
);
