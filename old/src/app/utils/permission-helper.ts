import { includes, memoize, negate } from 'lodash';
import { getItem } from './storage';

/**
 * NOTE: 原来 see-access="C2C-Seller" 中使用了横线，现在兼容横线 C2C-Seller 和下划线 C2C_Seller
 */
export const CODES = {
  /** 商户 */
  C2C_Seller: 1,
  /** C2C客服 */
  C2C_Service: 2,
  /** B2C 110 */
  B2C_Service: 3,
  /** seego心愿兼职 */
  Part_time: 4,
  /** 财务 */
  Fin_Admin: 5,
  /** 运营管理员--废弃 */
  Oper_Admin: 6,
  /** 超级管理员 */
  Super_Admin: 7,
  /** 自媒体 */
  PGC_Service: 8,
  /** 内容 */
  See_Admin: 9,
  /** 产品运营 */
  Oper: 20,
  /** 电商管理员 */
  Elect_Admin: 10,
  /** 内容兼职 */
  PGC_Part: 21,
  /** 数据部门 */
  Data_BI: 22,
  /** 首屏互动兼职 */
  Interact_Part: 23,
  /** kol */
  KOL: 24,
  /** 流量组（市场运营）（测试有时候说是「运营」） */
  KOL_Admin: 25,
  /** 投资人 */
  Investors: 26,
  /** 流量采买 */
  Traffic_Buy: 40,
  /** 新品牌后台 */
  New_Brand: 30,
  /** DD时间段，隐藏数据显示 */
  Hide_DD: -2,
  /** DD时间段，只对超管隐藏 */
  Hide_DD_Super_Admin: -7,
  /** DD时间段，只对内容隐藏 */
  Hide_DD_See_Admin: -9,
  /** DD时间段，只对运营隐藏 */
  Hide_DD_Oper: -20,
  /** DD时间段，只对财务权限隐藏 */
  Hide_DD_Fin_Admin: -5,
};

if (Object.freeze) {
  // Object.freeze(NAMES);
  Object.freeze(CODES);
}

function getCookie(key) {
  const match = document.cookie.match(`(^|; )${key}=([^;]*)`);
  return match ? match[2] : null;
}

// 目前登录入口就一个，如果在 dashboard 也有登录入口
// 那么 memoize 的 cache key 要加上 cookie 值
const includeFn = memoize(
  codesList => () => includes(codesList, ~~getCookie('seller_privilege')),
  codesList => codesList.join(','),
);

const excludeFn = negate(includeFn);

const BIZ_PERMISSION = {
  // 店铺装修内部权限
  SHOP_CONSTRUCT_ADMIN: [CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin],
  // 商品主题库，内部权限
  GOODS_THEME_ADMIN: [CODES.Super_Admin, CODES.Elect_Admin],
  // 代码管理-模板列表
  CODE_MGR_TPL_HIDDEN: [CODES.KOL_Admin, CODES.Elect_Admin],
  // KOL合作管理
  KOL_COOPERATION_MGR_ADMIN: [
    CODES.Super_Admin,
    CODES.KOL_Admin,
    CODES.Elect_Admin,
  ],
  KOL: [CODES.KOL, CODES.New_Brand],
  ADMIN: [CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin],
};

export const checkFn = includeFn;

export const accessChecker: {
  isGoodsThemeAdmin: any;
  isCodeTplVisible: any;
  isKolCoopMgrAdmin: any;
  isShopConstructAdmin: any;
  isKol: any;
  isAdmin: any;
} = {
  isGoodsThemeAdmin: includeFn(BIZ_PERMISSION.GOODS_THEME_ADMIN),
  isCodeTplVisible: excludeFn(BIZ_PERMISSION.CODE_MGR_TPL_HIDDEN),
  isKolCoopMgrAdmin: includeFn(BIZ_PERMISSION.KOL_COOPERATION_MGR_ADMIN),
  isShopConstructAdmin: includeFn(BIZ_PERMISSION.SHOP_CONSTRUCT_ADMIN),
  isKol: includeFn(BIZ_PERMISSION.KOL),
  isAdmin: includeFn(BIZ_PERMISSION.ADMIN),
};

// @deprecate 兼容
export const bizAccessChecker = accessChecker;

const UNKNOW_NAME_CODE = -1;

export const normalizePermission: (
  allowedAccess: string[],
) => number[] = allowedAccess =>
  allowedAccess.map(permissionName => {
    /*
    模板中可能这么用
     see-access="Super-Admin PGC-Service See-Admin Oper KOL"
     其中权限名称都是用横线 '-'，但是为了方便变量访问"静态"变量，
     权限映射(src/const/permisson.ts)内部使用下划线，所以这里统一将横线转为下划线
     */
    const underscoredName = permissionName.replace(/-/g, '_');
    return CODES[underscoredName] !== void 0
      ? CODES[underscoredName]
      : UNKNOW_NAME_CODE;
  });

export function getAccessFlag(attrs: string) {
  const allowedAccess = attrs.split(' ');
  const list = normalizePermission(allowedAccess);
  const seller_privilege = ~~(document.cookie.match(
    '(^|; )seller_privilege=([^;]*)',
  ) || 0)[2];
  return list.some(i => i === seller_privilege);
}

export function isAdmin() {
  return [CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin].includes(
    getItem('seller_privilege') >>> 0,
  );
}
