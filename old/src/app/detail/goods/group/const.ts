export const CUSTOM_GROUP_TYPE_VAL = {
  AUTO: 1,
  MANNUAL: 2
};

export const T_CUSTOM_GROUP_TYPE = {
  [CUSTOM_GROUP_TYPE_VAL.AUTO]: '自动',
  [CUSTOM_GROUP_TYPE_VAL.MANNUAL]: '手动',
};

export const RULE_VAL = {
  CATEGORY: 1,
  BRAND: 2,
  PRICE: 3,
  DATE: 4,
};

export const CHANNEL_VAL = {
  ALL: 0,
  SELF: 1,
  DIST: 2
};

export const CHANNEL_OPTIONS = [
  { id: CHANNEL_VAL.ALL, name: '全部' },
  { id: CHANNEL_VAL.SELF, name: '自营' },
  { id: CHANNEL_VAL.DIST, name: '分销' }
];

export const ORDER_TYPE_VAL = {
  NEW_FIRST: 1,
  HOT_FIRST: 2,
};

export const ORDER_TYPE_TEXT = {
  NEW_FIRST: '新品优先',
  HOT_FIRST: '销量优先',
};

export const ORDER_OPTIONS = [
  { val: ORDER_TYPE_VAL.NEW_FIRST, text: ORDER_TYPE_TEXT.NEW_FIRST },
  { val: ORDER_TYPE_VAL.HOT_FIRST, text: ORDER_TYPE_TEXT.HOT_FIRST },
];

export const T_ORDER_TYPE = {
  [ORDER_TYPE_VAL.NEW_FIRST]: ORDER_TYPE_TEXT.NEW_FIRST,
  [ORDER_TYPE_VAL.HOT_FIRST]: ORDER_TYPE_TEXT.HOT_FIRST
};
