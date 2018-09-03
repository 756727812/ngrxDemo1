import { EditorActionTypes, EditorActions } from '../actions/editor.action';
import { Elem, ElemType, ShowType, Meta } from '../../models/editor.model';
import {
  get,
  merge,
  findLast,
  values,
  countBy,
  omit,
  without,
  findIndex,
  find,
  indexOf,
  isNil,
  map,
  assign,
} from 'lodash';
import { accessChecker } from '@utils/permission-helper';

declare interface ElemMap {
  [key: string]: Elem;
}

declare type ElemSorter = string[];

export interface EditorState {
  isAdmin?: boolean;
  lastAppendedElem?: Elem;
  loaded: boolean;
  loading: boolean;
  curFocusElemVid?: string;
  curElemVidForCtrl?: string;
  elemSorter: ElemSorter;
  elemMap: ElemMap;
  /** 内部权限需要，针对某个 kol 的店铺装修 */
  targetKolId?: string;
  /** 内部权限需要，针对某个 xdp 的店铺装修 */
  targetXdpId?: string;
  targetWechatId?: string;
  /** 跳转优惠券列表需要 */
  targetSellerMobile?: string;
  busyCount: number;
  meta: Meta;
  xdpStatus: Object;
}
/*

'模块类型
1=店铺基础信息
11=爆款商品
12=日常双列商品
21=单列图
22=活动轮播图
31=优惠劵
32=爆款拼团
33=秒杀
34=抽奖团',
*/

// TODO enum as key
const TYPE_ALIAS = {
  '1': 'basic-info',
  '11': 'explore-col-goods',
  '12': 'common-double-col-goods',
  '21': 'col-img',
  '22': 'carousel',
  '31': 'coupon',
  '32': 'group-buy', // 爆款拼团
  '33': 'speed-kill',
  '41': 'magic-cube', // 魔法
  '35': 'sales-promotion',
};

import elemFactory from './elem-factory';
import { EditorService } from 'app/detail/store-construction/services';
export const initialState: EditorState = {
  isAdmin: accessChecker.isShopConstructAdmin(),
  busyCount: 0,
  loaded: false,
  loading: false,
  curFocusElemVid: '', // 标志预览去选中，!== curElemVidForCtrl
  curElemVidForCtrl: '', // 标识当前要展示的控制面板对应的元素
  elemMap: {},
  // NOTE: 后台会有一个字段 sortno，不要使用
  elemSorter: [],
  meta: {
    editTime: null,
    publishTime: null,
    versionFlag: 1,
  },
  xdpStatus: {},
};

let ELEM_VIRTUAL_ID_COUNT = 1;
// 其中 `new-` 是为了区分进入编辑器前，已经存在的元素
// tslint:disable-next-line
export const genElemVirtualId: () => string = () =>
  // tslint:disable-next-line
  `vid-${ELEM_VIRTUAL_ID_COUNT++}`;

const buildFindProperIdFn: (
  fromIndexFn: (a: ElemSorter, b: string) => number,
  findMethod: (a: string[], b: (string) => boolean, c: number) => string,
) => (c: ElemMap, d: ElemSorter, e?: string) => string | null = (
  fromIndexFn,
  findMethod,
) => (elemMap, elemSorter, baseVid) => {
  const vid: string = findMethod(
    elemSorter,
    vid => {
      const elem = elemMap[vid];
      const { data } = elem;
      // NOTE：现在新增模块就是已经后台保存后的，所以可以不判断 ?.id
      // 往 前/后 找到一个已经保存的模块，并且忽略「店铺基础信息」模块
      return data && data.id && data.type !== ElemType.BASIC_INFO;
    },
    fromIndexFn(elemSorter, baseVid),
  );
  return vid ? elemMap[vid].data.id : null;
};

export const findPreProperId = buildFindProperIdFn(
  // 从目标的前一个开始，往前找
  (elemSorter, baseVid) =>
    (baseVid ? indexOf(elemSorter, baseVid) : elemSorter.length) - 1,
  findLast,
);

export const findNextProperId = buildFindProperIdFn(
  // 从目标的后一个开始，往后找
  (elemSorter, baseVid) => (baseVid ? indexOf(elemSorter, baseVid) : 0) + 1,
  find,
);

export function reducer(
  state = initialState,
  action: EditorActions,
): EditorState {
  switch (action.type) {
    case EditorActionTypes.RESET: {
      return initialState;
    }

    case EditorActionTypes.UPDATE_META: {
      return {
        ...state,
        meta: merge({}, state.meta, action.payload),
      };
    }

    case EditorActionTypes.FOCUS_FIRST_ELEM_BY_TYPE: {
      const { type } = action.payload;
      const { elemSorter, elemMap } = state;
      const targetVid = find(elemSorter, vid => {
        return get(elemMap[vid], 'data.type') === type;
      });
      if (targetVid) {
        return {
          ...state,
          curFocusElemVid: targetVid,
          curElemVidForCtrl: targetVid,
        };
      }
      return state;
    }

    case EditorActionTypes.GLOBAL_SAVE: {
      const newElemMap = {};
      Object.keys(state.elemMap).forEach(vid => {
        newElemMap[vid] = {
          ...state.elemMap[vid],
          formErrorVisible: true,
        };
      });
      return {
        ...state,
        elemMap: newElemMap,
      };
    }

    case EditorActionTypes.UPDATE_ELEM_ORDER: {
      const { vid, dir } = action.payload;
      const elemSorter = state.elemSorter;
      const len = elemSorter.length;
      const elemIndex = indexOf(elemSorter, vid);
      const elem = state.elemMap[vid];
      // 下移动 && 不是最后一个
      // 上移 && 不是第一个
      const newElemSorter = [...elemSorter];
      if ((dir > 0 && elemIndex !== len - 1) || (dir < 0 && elemIndex !== 0)) {
        const targetIndex = elemIndex + (dir > 0 ? 1 : -1);
        const tmp = newElemSorter[elemIndex];
        newElemSorter[elemIndex] = elemSorter[targetIndex];
        newElemSorter[targetIndex] = tmp;
      }

      const preModuleId = findPreProperId(state.elemMap, newElemSorter, vid);
      const nextModuleId = findNextProperId(state.elemMap, newElemSorter, vid);

      return {
        ...state,
        elemMap: {
          ...state.elemMap,
          [vid]: {
            ...elem,
            data: {
              ...elem.data,
              preModuleId,
              nextModuleId,
            },
          },
        },
        elemSorter: newElemSorter,
      };
    }

    // TODO 这个 busy 换个方式
    case EditorActionTypes.REMOVE_ELEM: {
      const { elem } = action.payload;
      const vid = elem.vid;
      return {
        ...state,
        elemMap: omit(state.elemMap, [vid]),
        elemSorter: without(state.elemSorter, vid),
      };
    }
    case EditorActionTypes.REMOVE_ELEM_SUCCESS: {
      return {
        ...state,
        busyCount: state.busyCount - 1,
        meta: {
          ...state.meta,
          editTime: new Date(),
        },
      };
    }
    case EditorActionTypes.REMOVE_ELEM_FAIL: {
      return {
        ...state,
        busyCount: state.busyCount - 1,
      };
    }

    case EditorActionTypes.LOAD: {
      return {
        ...state,
        loading: true,
        targetKolId: action.payload.kolId,
        targetXdpId: action.payload.xdpId,
        // targetXdpId: action.payload.xdpId,
      };
    }

    case EditorActionTypes.LOAD_SUCCESS: {
      const { list, meta, xdpStatus } = action.payload;
      const elemMap = {};
      const elemSorter = [];
      let curVid = null;
      if (list && list.length) {
        list.forEach(item => {
          const vid = genElemVirtualId();
          if (item.type === ElemType.BASIC_INFO) {
            curVid = vid;
          }
          const defaultElemData = elemFactory.buildInitData(item.type);
          elemMap[vid] = {
            vid,
            data: merge(defaultElemData, item),
          };
          elemSorter.push(vid);
        });
      } else {
        // TODO 单纯判断长度还不够严谨，判断没有店铺基础信息吧
        const vid = genElemVirtualId();
        elemMap[vid] = {
          vid,
          data: elemFactory.buildInitData(ElemType.BASIC_INFO),
        };
        elemSorter.unshift(vid);
      }
      return {
        ...state,
        elemMap,
        elemSorter,
        xdpStatus,
        loaded: true,
        loading: false,
        meta: {
          publishTime: meta.publishTime ? new Date(meta.publishTime) : null,
          editTime: meta.editTime ? new Date(meta.editTime) : null,
          versionFlag: xdpStatus.version_flag,
          userType: xdpStatus.user_type,
        },
        curElemVidForCtrl: curVid || state.curElemVidForCtrl,
        curFocusElemVid: curVid || state.curFocusElemVid,
        targetKolId: xdpStatus.kol_id,
        targetWechatId: xdpStatus.wechat_id,
        targetSellerMobile: xdpStatus.seller_mobile,
      };
    }

    case EditorActionTypes.IGNORE_VERSION_MODAL: {
      return {
        ...state,
        meta: {
          ...state.meta,
          versionFlag: 1,
        },
      };
    }

    case EditorActionTypes.RELOAD_ELEM_SUCCESS: {
      const { vid, data } = action.payload;
      if (!data) {
        return state;
      }
      const oldElem = state.elemMap[vid];
      return {
        ...state,
        elemMap: {
          ...state.elemMap,
          [vid]: {
            ...oldElem,
            data: assign({}, oldElem.data, data[0]),
          },
        },
      };
    }

    case EditorActionTypes.APPEND_ELEM: {
      return {
        ...state,
        busyCount: state.busyCount + 1,
      };
    }
    case EditorActionTypes.APPEND_ELEM_SUCCESS: {
      const { elem } = action.payload;
      const { vid } = elem;
      const { prevId, isLast } = elem.data;
      let elemSorters = [...state.elemSorter, vid];
      if (!isLast) {
        const prevIndex = state.elemSorter.findIndex(r => r === prevId);
        elemSorters = [...state.elemSorter];
        elemSorters.splice(prevIndex + 1, 0, vid);
      }
      return {
        ...state,
        elemMap: {
          ...state.elemMap,
          [vid]: { ...elem, formErrorVisible: false },
        },
        curFocusElemVid: vid,
        curElemVidForCtrl: vid,
        elemSorter: elemSorters,
        lastAppendedElem: elem,
        busyCount: state.busyCount - 1,
        meta: {
          ...state.meta,
          editTime: new Date(),
        },
      };
    }

    case EditorActionTypes.APPEND_ELEM_FAIL: {
      return {
        ...state,
        busyCount: state.busyCount - 1,
      };
    }

    case EditorActionTypes.FOCUS_ELEM: {
      const { vid } = action.payload;
      return {
        ...state,
        curFocusElemVid: vid,
        curElemVidForCtrl: vid,
      };
    }

    case EditorActionTypes.UPDATE_ELEM: {
      const { vid, value, valid } = action.payload;
      const elemMap = state.elemMap;
      const elemOldValue = elemMap[vid];
      if (!elemOldValue) {
        return;
      }
      const preModuleId = findPreProperId(state.elemMap, state.elemSorter, vid);
      const nextModuleId = findNextProperId(
        state.elemMap,
        state.elemSorter,
        vid,
      );
      // console.log('>>>old', elemOldValue);
      // console.log('>>>new', value);
      // NOTE: data 里面的数据会用新的覆盖旧的，如果要清除属性，要在新的值里赋值为 空
      return {
        ...state,
        elemMap: {
          ...elemMap,
          [vid]: {
            ...elemOldValue,
            valid: !isNil(valid) ? valid : elemOldValue.valid,
            data: {
              ...elemOldValue.data,
              ...value,
              preModuleId,
              nextModuleId,
            },
          },
        },
      };
    }

    case EditorActionTypes.SAVE_ELEM_SUCCESS: {
      const { vid, id } = action.payload;
      const elemMap = state.elemMap;
      return {
        ...state,
        elemMap: merge({}, elemMap, {
          [vid]: {
            data: { id },
          },
        }),
        meta: {
          ...state.meta,
          editTime: new Date(),
        },
      };
    }

    case EditorActionTypes.CLOSE_ELEM_CTRL: {
      return {
        ...state,
        curElemVidForCtrl: null,
      };
    }

    default: {
      return state;
    }
  }
}

export const getEditorElems = (state: EditorState) =>
  state.elemSorter.map(vid => state.elemMap[vid]);

export const getEditorElemsCount = (state: EditorState) => {
  return countBy(values(state.elemMap), e => e.data.type);
};

export const getCurFocusElemVid = (state: EditorState) => state.curFocusElemVid;
export const getModuleInsertId = (state: EditorState) => {
  if (state.elemSorter.length) {
    const curVid = state.curFocusElemVid || state.elemSorter[0];
    const index = state.elemSorter.findIndex(r => r === curVid);
    if (index > -1) {
      const preItem = state.elemSorter[index];
      const nextItem = state.elemSorter[index + 1];
      const preModuleId = state.elemMap[preItem].data.id;
      const nextModuleId = state.elemMap[nextItem]
        ? state.elemMap[nextItem].data.id
        : null;
      return {
        curVid,
        preModuleId,
        nextModuleId,
      };
    }
  }
  return null;
};
export const getCurElemForCtrl = (state: EditorState) =>
  state.elemMap[state.curElemVidForCtrl];

export const getCurElemVidForCtrl = (state: EditorState) => {
  const { curElemVidForCtrl } = state;
  return curElemVidForCtrl
    ? (get(state.elemMap[curElemVidForCtrl], 'vid') as string | null)
    : null;
};

export const getTargetKolId = (state: EditorState) => state.targetKolId;

export const getTargetWechatId = (state: EditorState) => state.targetWechatId;

export const getTargetSellerMobile = (state: EditorState) =>
  state.targetSellerMobile;

export const getTargetXdpId = (state: EditorState) => state.targetXdpId;

export const getEditorLoading = (state: EditorState) => state.loading;

export const isEditorBusy = (state: EditorState) => state.busyCount > 0;

export const getEditorElemSorter = (state: EditorState) => state.elemSorter;

export const isEditorAllValid = (state: EditorState) =>
  !!getEditorFirstInvalidElem(state);

export const getEditorFirstInvalidElem = (state: EditorState) =>
  find(getEditorElems(state), elem => elem.valid === false);

// 获取最近一个有错误的模块元素（当前focus / 位置最靠前）
export const getEditorNearestInvalidElem = (state: EditorState) => {
  const { elemMap, curFocusElemVid, curElemVidForCtrl } = state;
  const curVid = curElemVidForCtrl || curFocusElemVid;
  return curVid && elemMap[curVid] && elemMap[curVid].valid === false
    ? elemMap[curVid]
    : getEditorFirstInvalidElem(state);
};

export const getEditorLastAppendedElem = (state: EditorState) =>
  state.lastAppendedElem;

export const getEditorIsAdmine = (state: EditorState) => state.isAdmin;

export const getEditorMeta = (state: EditorState) => state.meta;

export const getXdpStatus = (state: EditorState) => state.xdpStatus;
