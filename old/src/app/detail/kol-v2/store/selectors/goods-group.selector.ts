import { createSelector } from '@ngrx/store';

import * as fromRoot from 'app/store';
import * as fromFeature from '../reducers';
import * as fromGoodsGroup from '../reducers/goods-group.reducer';

export const getGoodsGroupsState = createSelector(
  fromFeature.getKolState,
  (state: fromFeature.KolState) => state.goodsGroup,
);

export const getAllGoodsGroups = createSelector(
  getGoodsGroupsState,
  fromGoodsGroup.getGoodsGroupsList,
);

export const getGoodsGroupsCount = createSelector(
  getGoodsGroupsState,
  fromGoodsGroup.getGoodsGroupsCount,
);

export const getGoodsGroupsLoading = createSelector(
  getGoodsGroupsState,
  fromGoodsGroup.getGoodsGroupsLoading,
);
