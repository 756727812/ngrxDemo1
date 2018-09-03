import { createSelector } from '@ngrx/store';

import * as fromRoot from 'app/store';
import * as fromFeature from '../reducers';
import * as fromGroup from '../reducers/group.reducer';

export const getBenefitGroupsState = createSelector(
  fromFeature.getBenefitState,
  (state: fromFeature.BenefitState) => state.groups,
);

export const getBenefitGroupAllGroups = createSelector(
  getBenefitGroupsState,
  fromGroup.getBenefitGroupsList,
);

export const getBenefitGroupsCount = createSelector(
  getBenefitGroupsState,
  fromGroup.getBenefitGroupsCount,
);

export const getBenefitGroupsLoading = createSelector(
  getBenefitGroupsState,
  fromGroup.getBenefitGroupsLoading,
);
