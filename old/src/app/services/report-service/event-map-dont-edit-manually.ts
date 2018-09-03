export const EVENT_MAP = {
  PAGE_SITE: {
    // 官网首页
    PV: { code: '1001-x-101-1-x-x-x' }, // 加载
    TOP_SELF_MEDIA: { code: '1001-x-1-1-x-x-x' }, // 顶部-自媒体
    TOP_BRAND: { code: '1001-x-2-1-x-x-x' }, // 顶部-品牌
    TOP_LOGIN: { code: '1001-x-3-1-x-x-x' }, // 顶部-登录see
    SELF_MEDIA_COOP_TAB: { code: '1001-x-4-1-x-x-x' }, // 自媒体合作tab
    BRAND_COOP_TAB: { code: '1001-x-5-1-x-x-x' }, // 品牌合作tab
    SELF_MEDIA_DETAIL: { code: '1001-x-6-1-x-x-x' }, // 自媒体查看详情
    BRAND_DETAIL: { code: '1001-x-7-1-x-x-x' }, // 品牌查看详情
    TOP_REGISTER: { code: '1001-x-8-1-x-x-x' }, // 顶部-注册
    BTN_FAST_CREATE_SHOW: { code: '1001-x-9-1-x-x-x' }, // 一键创建小程序电商btn
    QUICK_APPLY: { code: '1001-x-10-1-x-x-x' }, // 快速申请
    OPEN_SHOP: { code: '1001-x-11-1-x-x-x' }, // 开通
    REGISTER: { code: '1001-x-12-1-x-x-x' }, // 注册
  },
  PAGE_ENTRY: {
    // 后台登陆页
    PV: { code: '2001-x-101-1-seedata-refer-kw' }, // 加载
    PV_ENTER_REGISTER: { code: '2001-x-1-1-seedata-refer-kw' }, // 后台注册页加载
    PV_INFO_FORM: { code: '2001-x-2-1-x-refer-kw' }, // 信息收集页加载
    PV_REGISTER_SUCC: { code: '2001-x-3-1-x-refer-kw' }, // 注册成功页加载
    BTN_LOGIN: { code: '2001-x-4-1-x-refer-kw' }, // 登录btn
  },
  PAGE_CREATE_SHOP: {
    // 小电铺创建页
    PV: { code: '2002-x-101-1-x-refer-kw' }, // 加载
    BTN_OPEN_BASIC: { code: '2002-x-1-1-x-refer-kw' }, // 基础版-开通btn
    BTN_OPEN_ADVANCE: { code: '2002-x-2-1-x-refer-kw' }, // 进阶版-开通btn
    BTN_OPEN_PROFESSION: { code: '2002-x-3-1-x-refer-kw' }, // 专业版-开通btn
    SEL_SUBJECT_SEE: { code: '2002-x-4-1-x-refer-kw' }, // 选择SEE主体
    SEL_SUBJECT_OWN: { code: '2002-x-5-1-x-refer-kw' }, // 选择自己主体
    BTN_TO_REGISTER: { code: '2002-x-6-1-x-refer-kw' }, // 去注册btn
    BTN_TO_COMPLETE_DATA: { code: '2002-x-7-1-x-refer-kw' }, // 去完善btn
    BTN_TO_OPEN: { code: '2002-x-8-1-x-refer-kw' }, // 去开通btn
  },
  PAGE_OVERVIEW: {
    // 后台概况页
    PV: { code: '2003-x-101-1-x-x-x' }, // 加载
  },
  PAGE_SHOP_OVERVIEW: {
    // 小电铺-概况页
    PV: { code: '2004-shop_id-101-1-x-x-x' }, // 加载
    BTN_ACCESS_SHOP: { code: '2004-shop_id-1-1-x-x-x' }, // 访问小电铺btn
  },
  PAGE_SHOP_OPERATE: {
    // 小电铺-装修页
    PV: { code: '2005-shop_id-101-1-x-x-x' }, // 加载
    PV_SHOP_BANNER: { code: '2005-shop_id-1-1-x-x-x' }, // 店铺banner
    PV_ACT_BANNER: { code: '2005-shop_id-2-1-x-x-x' }, // 活动banner
    PV_HOT_COMMODITY: { code: '2005-shop_id-3-1-x-x-x' }, // 爆款商品
    PV_COMMODITY_GROUP: { code: '2005-shop_id-4-1-x-x-x' }, // 商品分组
    PV_COUPON: { code: '2005-shop_id-5-1-x-x-x' }, // 优惠券
  },
  PAGE_CONTENT_ELEC_MARKET: {
    // 小电铺-内容电商页
    PV: { code: '2006-shop_id-101-1-x-x-x' }, // 加载
    BTN_ADD_ARTICLE: { code: '2006-shop_id-1-1-x-x-x' }, // 添加文章btn
    BTN_ADD_COMMODITY: { code: '2006-shop_id-305-1-x-x-x' }, // 添加商品btn
    BTN_LINK: { code: '2006-shop_id-2-1-x-x-x' }, // 链接btn
  },
  PAGE_ARTICLE_DETAIL: {
    // 小电铺-文章详情页
    PV: { code: '2007-shop_id-101-1-x-x-x' }, // 加载
    BTN_ADD_COMMODITY: { code: '2007-shop_id-305-1-x-x-x' }, // 添加商品btn
  },
  PAGE_HOT_COMMODITY: {
    // 选品中心-热门单品页
    PV: { code: '2008-shop_id-101-1-x-x-x' }, // 加载
    CLICK_COMMODITY: { code: '2008-shop_id-302-1-x-x-x' }, // 商品点击
    BTN_ADD_TO_SHOP: { code: '2008-shop_id-2-1-x-x-x' }, // 添加至小电铺btn
    BTN_OFF_SALE: { code: '2008-shop_id-306-1-x-x-x' }, // 添加至仓库btn
    BTN_FAVOR: { code: '2008-shop_id-4-1-x-x-x' }, // 收藏btn
    PV_FAVOR_CART: { code: '2008-shop_id-5-1-x-x-x' }, // 选品库
  },
  PAGE_THEME_LIST: {
    // 选品中心-主题选品页
    PV: { code: '2009-shop_id-101-1-x-x-x' }, // 加载
    CLICK_THEME: { code: '2009-shop_id-1-1-x-x-x' }, // 主题点击
    BTN_ADD_TO_ARTICLE: { code: '2009-shop_id-2-1-x-x-x' }, // 添加至文章btn
    BTN_OFF_SALE: { code: '2009-shop_id-306-1-x-x-x' }, // 添加至仓库btn
  },
  PAGE_THEME_DETAIL: {
    // 选品中心-主题详情页
    PV: { code: '2010-shop_id-101-1-x-x-x' }, // 加载
    CLICK_COMMODITY: { code: '2010-shop_id-302-1-x-x-x' }, // 商品点击
  },
  PAGE_CM_ALL_COMMODITY: {
    // 商品管理-所有商品页
    PV: { code: '2011-shop_id-101-1-x-x-x' }, // 加载
    POST_COMMODITY: { code: '2011-shop_id-1-1-x-x-x' }, // 发布商品btn
  },
  PAGE_CM_FREIGHT_TPL: {
    // 商品管理-运费模板页
    PV: { code: '2012-shop_id-101-1-x-x-x' }, // 加载
    BTN_CREATE_FREIGHT_TPL: { code: '2012-shop_id-1-1-x-x-x' }, // 创建运费模板btn
  },
  PAGE_CM_ADJUST_PRICE: {
    // 商品管理-我的调价申请页
    PV: { code: '2013-shop_id-101-1-x-x-x' }, // 加载
  },
  PAGE_CM_COMMODITY_GROUP: {
    // 商品管理-商品分组页
    PV: { code: '2014-shop_id-101-1-x-x-x' }, // 加载
    BTN_ADD_MANNUAL_GROUP: { code: '2014-shop_id-1-1-x-x-x' }, // 添加手动分组btn
    BTN_ADD_AUTO_GROUP: { code: '2014-shop_id-2-1-x-x-x' }, // 添加自动分组btn
  },
  PAGE_OM_MY_DIST: {
    // 订单管理-我的分销订单页
    PV: { code: '2015-shop_id-101-1-x-x-x' }, // 加载
  },
  PAGE_OM_ALL_ORDER: {
    // 订单管理-所有订单页
    PV: { code: '2016-shop_id-101-1-x-x-x' }, // 加载
  },
  PAGE_OM_ORDER_BATCH_OP: {
    // 订单管理-订单批量操作页
    PV: { code: '2017-shop_id-101-1-x-x-x' }, // 加载
  },
  PAGE_ASSET_OVERVIEW: {
    // 资产管理-概况页
    PV: { code: '2018-shop_id-101-1-x-x-x' }, // 加载
    BTN_WITHDRAW_CASH: { code: '2018-shop_id-1-1-x-x-x' }, // 提现btn
  },
  PAGE_ASSET_ENTER_ACCOUNT: {
    // 资产管理-订单入账页
    PV: { code: '2019-shop_id-101-1-x-x-x' }, // 加载
  },
  PAGE_WITHDRAW_CASH: {
    // 资产管理-提现记录页
    PV: { code: '2020-shop_id-101-1-x-x-x' }, // 加载
  },
  PAGE_LOGISTICS_FAQ: {
    // 帮助中心-物流说明
    PV: { code: '2021-shop_id-101-1-x-x-x' }, // 加载
  },
  PAGE_FAQ: {
    // 帮助中心-小电铺说明
    PV: { code: '2022-shop_id-101-1-x-x-x' }, // 加载
  },
};
