import * as fromGroup from '../actions/group.action';
import { BenefitGroup } from '../../models';

export interface BenefitGroupState {
  list: BenefitGroup[];
  count: number;
  loading: boolean;
}

export const initialState: BenefitGroupState = {
  list: [],
  count: 0,
  loading: false,
};

export function reducer(
  state = initialState,
  action: fromGroup.BenefitGroupActions,
): BenefitGroupState {
  switch (action.type) {
    case fromGroup.LOAD_GROUPS: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromGroup.LOAD_GROUPS_SUCCESS: {
      const { list, count } = action.payload;
      return {
        ...state,
        list,
        count,
        loading: false,
      };
    }

    case fromGroup.LOAD_GROUPS_FAIL: {
      return {
        ...state,
        loading: false,
      };
    }
  }

  return state;
}

export const getBenefitGroupsList = (state: BenefitGroupState) => state.list;
export const getBenefitGroupsLoading = (state: BenefitGroupState) => state.loading;
export const getBenefitGroupsCount = (state: BenefitGroupState) => state.count;
