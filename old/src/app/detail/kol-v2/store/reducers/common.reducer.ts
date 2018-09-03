import * as fromCommon from '../actions/common.action';

export interface CommonState {
  selectedKolId: number;
  kolData: {
    [kolId: string]: fromCommon.IKolData;
  };
}

export const initialState: CommonState = {
  selectedKolId: null,
  kolData: Object.create(null),
};

export function reducer(
  state = initialState,
  action: fromCommon.CommonAction,
): CommonState {
  switch (action.type) {
    case fromCommon.SET_COMMON_DATA: {
      const {
        payload: { kolId },
        payload,
      } = action;
      const { kolData } = state;
      return {
        selectedKolId: kolId,
        kolData: {
          ...kolData,
          [kolId]: {
            ...kolData[kolId],
            ...payload,
          },
        },
      };
    }

    case fromCommon.LOAD_KOL_INFO_SUCCESS: {
      const {
        payload: {
          is_quhaodian,
          kol_id: kolId,
          kol_u_heading: avatar,
          kol_name: kolName,
          seller_mobile: sellerMobile,
          xdp_info: { id: xdpId },
        },
      } = action;
      const { kolData } = state;
      return {
        ...state,
        kolData: {
          ...kolData,
          [kolId]: {
            ...kolData[kolId],
            xdpId,
            avatar,
            kolName,
            sellerMobile,
            is_quhaodian,
          },
        },
      };
    }

    default:
      return state;
  }
}

export const getCurrentKolData = (state: CommonState) =>
  state.kolData[state.selectedKolId];
