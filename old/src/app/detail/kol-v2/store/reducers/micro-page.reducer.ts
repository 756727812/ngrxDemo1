import * as fromMicroPages from '../actions/micro-page.action';
import { MicroPage } from '../../models';

export interface MicroPageState {
  list: MicroPage[];
  count: number;
  loading: boolean;
}

export const initialState: MicroPageState = {
  list: [],
  count: 0,
  loading: false,
};

export function reducer(
  state = initialState,
  action: fromMicroPages.MicroPagesAction,
): MicroPageState {
  switch (action.type) {
    case fromMicroPages.LOAD_MICROPAGES: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromMicroPages.LOAD_MICROPAGES_SUCCESS: {
      const { list, count } = action.payload;

      return {
        ...state,
        list,
        count,
        loading: false,
      };
    }

    case fromMicroPages.LOAD_MICROPAGES_FAIL: {
      return {
        ...state,
        loading: false,
      };
    }
  }

  return state;
}

export const getMicroPagesList = (state: MicroPageState) => state.list;
export const getMicroPagesLoading = (state: MicroPageState) => state.loading;
export const getMicroPagesCount = (state: MicroPageState) => state.count;
