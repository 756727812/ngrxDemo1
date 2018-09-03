import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromBenefitGroup from './group.reducer';

export interface BenefitState {
  groups:fromBenefitGroup.BenefitGroupState
}

export const reducers: ActionReducerMap<BenefitState> = {
  groups:fromBenefitGroup.reducer
};

export const getBenefitState = createFeatureSelector<BenefitState>('benefit');
