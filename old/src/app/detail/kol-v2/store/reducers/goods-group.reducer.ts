import * as fromGoodsGroups from '../actions/goods-group.action';
import { GoodsGroup } from '../../models';

export interface GoodsGroupState {
  list: GoodsGroup[];
  count: number;
  loading: boolean;
}

export const initialState: GoodsGroupState = {
  list: [],
  count: 0,
  loading: false,
};

export function reducer(
  state = initialState,
  action: fromGoodsGroups.GoodsGroupsAction,
): GoodsGroupState {
  switch (action.type) {
    case fromGoodsGroups.LOAD_GOODS_GROUPS: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromGoodsGroups.LOAD_GOODS_GROUPS_SUCCESS: {
      const { list, count } = action.payload;

      return {
        ...state,
        list,
        count,
        loading: false,
      };
    }

    case fromGoodsGroups.LOAD_GOODS_GROUPS_FAIL: {
      return {
        ...state,
        loading: false,
      };
    }
  }

  return state;
}

export const getGoodsGroupsList = (state: GoodsGroupState) => state.list;
export const getGoodsGroupsLoading = (state: GoodsGroupState) => state.loading;
export const getGoodsGroupsCount = (state: GoodsGroupState) => state.count;
