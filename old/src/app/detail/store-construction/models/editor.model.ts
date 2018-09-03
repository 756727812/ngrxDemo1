export interface Meta {
  editTime?: Date;
  publishTime?: Date;
  versionFlag?: number; // 标记是否隐藏版本判断的提示弹框
  userType?: number;
}

export interface Elem {
  valid: boolean;
  vid: string;
  typeAlias?: any; // TODO
  data: any;
  formErrorVisible?: boolean;
}

export enum ShowType {
  ALWAYS = 1,
  RANGE = 2,
}

export enum ElemUserVisible {
  HIDDEN = 1,
  SHOW = 0,
}

/*

'模块类型
1=店铺基础信息
*/

export enum ElemType {
  HOME_DIALOG = -2, // -2=首页弹窗 -- 虚拟模块
  SHOP_SUSPEND = -3, // -3=商城悬浮框 -- 虚拟模块
  ITEM_DETAIL_BANNER = -4, // -4=商详页banner位 -- 虚拟模块
  MAGIC_CUBE_VIRTUAL = -5, // -5= 魔方图 -- 虚拟模块
  BASIC_INFO = 1, // 1=店铺基础信息
  EXPLORE_COL_GOODS = 11, // 11=爆款商品
  COMMON_DOUBLE_COL_GOODS = 12, // 12=日常双列商品
  COL_IMG = 21, // 21=单列图
  CAROUSEL = 22, // 22=活动轮播图
  COUPON = 31, // 31=优惠劵
  GROUP_BUY = 32, // 32=爆款拼团
  SPEED_KILL = 33, // 33=秒杀
  MAGIC_CUBE = 41, // 41=魔方图
  GROUP_LOTTERY = 34, // TODO 34=抽奖团'
  SALES_PROMOTION = 35, // 35=满减活动',
  VIDEO_INFO = 42,
}

export interface ElemModel4Save {
  vid: string;
}

export interface ImgLinkModel {
  imgUrl: string;
  linkType?: number;
  target?: {
    id: string;
  };
  showType: number;
  startTime?: string;
  endTime?: string;
  rectangle?: {
    x1: string;
    y1: string;
    x2: string;
    y2: string;
  };
}
