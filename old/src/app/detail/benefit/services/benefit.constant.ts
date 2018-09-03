export const costTypes = [
  {
    name: '所有',
    value: '',
  },
  {
    name: 'SEE',
    value: 0,
  },
  {
    name: '小电铺',
    value: 1,
  },
];

export const userTypes = [
  {
    name: '所有用户',
    value: 0,
  },
  {
    name: '老用户',
    value: 1,
  },
  {
    name: '新用户',
    value: 2,
  },
];

export const statusTypes = [
  {
    name: '全部',
    value: '',
  },
  {
    name: '未开始',
    value: 0,
  },
  {
    name: '进行中',
    value: 1,
  },
  {
    name: '已结束',
    value: 2,
  },
  {
    name: '已废弃',
    value: 3,
  },
];

export const mapStatusTypes = {
  0: '未开始',
  1: '进行中',
  2: '已结束',
  3: '已废弃',
};
export const mapCostBearerTypes = {
  0: 'SEE承担',
  1: '小电铺承担 ',
};

export const mapUserTypes = {
  0: '所有用户',
  1: '老用户 ',
  2: '新用户',
};

export const mapCappingTypes = {
  0: '不封顶',
  1: '封顶',
};

export const mapOverRanges = {
  0: '可叠加SEE承担优惠券',
  1: '可叠加自己店铺承担优惠券',
  2: '可叠加全部优惠券',
  3: '可承担指定优惠券',
  4: '不可叠加优惠券',
};

export const productTypes = {
  1: '自营',
  2: '分销',
};

export const salesSates = {
  0: '已下架',
  1: '售卖中',
  2: '已售罄',
};

export const discountRule = {
  1: '满件折',
  0: '满额减',
};

export const discountRules: object[] = [
  { label: '满额减', value: 0 },
  { label: '满件折', value: 1 },
];
