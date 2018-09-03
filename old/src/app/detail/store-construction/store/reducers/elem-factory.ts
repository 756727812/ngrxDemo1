// TODO re place

// a = {
//   vid: 'old-1',
//   type: 'basic-info',
//   data: { name: 'SEE小电铺', introduct: '', logoImgUrl: '', links: [] },
// };
import { ElemType, ShowType } from '../../models/editor.model';
import { get } from 'lodash';

const MAP = {
  [ElemType.BASIC_INFO]: { default: { name: '页面基础信息' } },
  [ElemType.EXPLORE_COL_GOODS]: {
    default: {
      name: '爆款商品',
    },
  },
  [ElemType.COMMON_DOUBLE_COL_GOODS]: { default: { name: '日常双列商品' } },
  [ElemType.COL_IMG]: { default: { name: '单列图' } },
  [ElemType.CAROUSEL]: { default: { name: '活动轮播图' } },
  [ElemType.MAGIC_CUBE]: { default: { name: '魔方' } },
  [ElemType.MAGIC_CUBE_VIRTUAL]: { default: { name: '魔方' } },
  [ElemType.COUPON]: { default: { name: '优惠劵' } },
  [ElemType.GROUP_BUY]: { default: { name: '爆款拼团' } },
  [ElemType.SPEED_KILL]: { default: { name: '秒杀' } },
  [ElemType.GROUP_LOTTERY]: { default: { name: '抽奖团' } },
  [ElemType.SALES_PROMOTION]: { default: { name: '满减活动' } },
  [ElemType.VIDEO_INFO]: { default: { name: '视频' } },
};

export default {
  buildInitData(type) {
    const ret: any = {
      type,
      name: this.getDefaultName(type),
      config: {},
      showType: ShowType.ALWAYS,
    };
    switch (type) {
      case ElemType.BASIC_INFO:
        break;
      case ElemType.EXPLORE_COL_GOODS:
        Object.assign(ret, {
          mainTitle: '爆款推荐',
          subTitle: 'Explosion recommended',
        });
        break;
      case ElemType.GROUP_LOTTERY:
        Object.assign(ret, {
          mainTitle: '抽奖团',
          subTitle: 'lottery buy',
        });
        break;
      case ElemType.GROUP_BUY:
        Object.assign(ret, {
          mainTitle: '爆款拼团',
          subTitle: 'popular fight group',
        });
        break;
      case ElemType.SPEED_KILL:
        Object.assign(ret, {
          mainTitle: '惊喜秒杀',
          subTitle: 'flash sale',
        });
        break;
    }
    return ret;
  },
  getDefaultName(type) {
    return get(MAP, `${type}.default.name`);
  },
};
