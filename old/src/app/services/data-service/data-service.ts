import * as moment from 'moment';
import { forEach, get } from 'lodash';
import * as md5 from 'md5';
import * as angular from 'angular';

/* tslint:disable object-shorthand-properties-first */

import { ReportService } from '../report-service/report-service';
import { NzNotificationService } from 'ng-zorro-antd';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};

export class DataService implements see.IDataService {
  static $inject: string[] = [
    '$http',
    '$q',
    '$cookies',
    '$httpParamSerializerJQLike',
    '$window',
    '$location',
    'Notification',
    '$routeParams',
    'NzNotificationService',
  ];

  /** python爬虫服务器地址 */
  private python_url_prefix = `//trend.seeapp.com${
    this.$window.location.protocol === 'https:' ? '/' : ':8580/'
  }`;
  /** 数据服务器地址 */
  private da_url_prefix = `//da.seeapp.com${
    this.$window.location.protocol === 'https:' ? '/' : '/'
  }`;

  private da_test_url_prefix = 'http://10.104.193.158:18880/';

  private g_favor_count = 0;

  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $cookies: ng.cookies.ICookiesService,
    private $httpParamSerializerJQLike: ng.IHttpParamSerializer,
    private $window: ng.IWindowService,
    private $location: ng.ILocationService,
    private Notification: see.INotificationService,
    private $routeParams: ng.route.IRouteParamsService,
    private nzNotification: NzNotificationService,
  ) {}

  getGlobalParams = () => {
    const params: any = {
      g_favor_count: this.g_favor_count,
    };

    return params;
  };
  // KOL文章拼团管理
  articleGrouponList = params =>
    this.seeGet({
      params,
      url: 'api/ng/article/groupon/list',
    });

  articleGrouponAdd = json =>
    this.seePost({
      json,
      url: 'api/ng/article/groupon/add',
    });

  pathAQrUrlArticleGetGroupon = params =>
    this.seeGet({
      params,
      url: 'api/ng/pathAQrUrl/article/getGroupon',
    });

  switchSelectionCenter = params =>
    this.seeGet({
      params,
      url: 'api/user/switchSelectionCenter',
    });

  xiaodianpu_promotionActivityProfile = params =>
    this.seeGet({
      params,
      url: 'api/ng/xiaodianpu/promotion-activity-profile',
    });

  // 运费模板
  express_getExpressDesc = params =>
    this.seeGet({
      params,
      url: 'api/ng/express/getExpressDesc',
    });
  express_getGoodExpress = json =>
    this.seePost({
      json,
      url: 'api/ng/express/getGoodExpress',
    });

  // 退货售后处理
  returngoods_addOrUpdateLogistics = json =>
    this.seePost({
      json,
      url: 'api/ng/returngoods/addOrUpdateLogistics',
    });
  returngoods_existsLogistics = json =>
    this.seePost({
      json,
      url: 'api/ng/returngoods/existsLogistics',
    });
  returngoods_getLogistics = params =>
    this.seeGet({
      params,
      url: 'api/ng/returngoods/getLogistics',
    });
  returngoods_received = params =>
    this.seeGet({
      params,
      url: 'api/ng/returngoods/received',
    });
  returngoods_unreceived = params =>
    this.seeGet({
      params,
      url: 'api/ng/returngoods/unreceived',
    });

  // 商详公告
  productNotice_add = json =>
    this.seePost({
      json,
      url: 'api/ng/productNotice/add',
    });
  productNotice_get = params =>
    this.seeGet({
      params,
      url: 'api/ng/productNotice/get',
    });
  productNotice_list = params =>
    this.seeGet({
      params,
      url: 'api/ng/productNotice/list',
    });
  productNotice_update = json =>
    this.seePost({
      json,
      url: 'api/ng/productNotice/update',
    });
  productNotice_updateStatus = json =>
    this.seePost({
      json,
      url: 'api/ng/productNotice/updateStatus',
    });

  kol_mgr_getXiaoDianPuList = params =>
    this.seeGet({
      params,
      url: 'api/kol_mgr/getXiaoDianPuList',
    });

  express_getProvinseList = () =>
    this.seeGet({ url: 'api/express/getProvinseList' });

  // 购物须知
  notice_shopping_list = json =>
    this.seePost({
      json,
      url: 'api/ng/notice/shopping/list',
    });
  notice_shopping_switch_status = json =>
    this.seePost({
      json,
      url: 'api/ng/notice/shopping/switch-status',
    });
  notice_shopping_add = json =>
    this.seePost({
      json,
      url: 'api/ng/notice/shopping/add',
    });
  notice_shopping_edit = json =>
    this.seePost({
      json,
      url: 'api/ng/notice/shopping/edit',
    });
  notice_shopping_detail = json =>
    this.seePost({
      json,
      url: 'api/ng/notice/shopping/detail',
    });

  // 秒杀
  seckill_activityActivities = params =>
    this.seeGet({
      url: 'api/ng/seckill/activity/activities',
      params,
    });
  seckill_activityAdd = json =>
    this.seePost({
      url: 'api/ng/seckill/activity/add',
      json,
    });
  seckill_configSort = json =>
    this.seePost({
      url: 'api/ng/seckill/activity/sort',
      json,
    });
  seckill_configSetReleaseTime = json =>
    this.seePost({
      url: 'api/ng/seckill/activity/setRelease',
      json,
    });
  seckill_activityDetail = params =>
    this.seeGet({
      url: 'api/ng/seckill/activity/detail',
      params,
    });
  seckill_activityDown = json =>
    this.seePost({
      url: 'api/ng/seckill/activity/down',
      json,
    });
  seckill_activityProducts = params =>
    this.seeGet({
      url: 'api/ng/seckill/activity/products',
      params,
    });
  seckill_activitySetRelease = json =>
    this.seePost({
      url: 'api/ng/seckill/activity/setRelease',
      json,
    });
  seckill_activitySkus = params =>
    this.seeGet({
      url: 'api/ng/seckill/activity/skus',
      params,
    });
  seckill_activityToBanner = json =>
    this.seePost({
      url: 'api/ng/seckill/activity/toBanner',
      json,
    });

  // 拼团操作与列表
  groupon_activity_add = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/add',
      params,
    });
  groupon_activity_detail = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/detail',
      params,
    });
  groupon_activity_list = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/list',
      params,
    });
  groupon_activity_products = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/products',
      params,
    });
  groupon_activity_update = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/update',
      params,
    });
  groupon_activity_sku = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/sku',
      params,
    });
  groupon_activityLottery = () =>
    this.seePost({
      url: 'api/ng/groupon/activity/lottery',
    });
  groupon_activityLotteryConfig = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/lotteryConfig',
      params,
    });
  groupon_activityForceClose = params =>
    this.seePost({
      url: 'api/ng/groupon/activity/force-close',
      params,
    });

  grouponActivityAllList = params =>
    this.seePost({
      params,
      url: 'api/ng/groupon/activity/allList',
    });

  // 小电铺装修
  xiaodianpu_configVideo = params =>
    this.seePost({
      params,
      url: 'api/ng/xiaodianpu/config/video',
    });
  xiaodianpu_configLastVideo = params =>
    this.seePost({
      params,
      url: 'api/ng/xiaodianpu/config/last-video',
    });
  xiaodianpu_configLastShopUrl = params =>
    this.seePost({
      params,
      url: 'api/ng/xiaodianpu/config/last-shop-url',
    });
  xiaodianpu_configShopUrl = params =>
    this.seePost({
      params,
      url: 'api/ng/xiaodianpu/config/shop-url',
    });

  // 拼团配置
  groupon_config_addedList = params =>
    this.seePost({
      url: 'api/ng/groupon/config/addedList',
      params,
    });
  groupon_config_allList = params =>
    this.seePost({
      url: 'api/ng/groupon/config/allList',
      params,
    });
  groupon_config_sort = params =>
    this.seePost({
      url: 'api/ng/groupon/config/sort',
      params,
    });
  groupon_config_switchStatus = params =>
    this.seePost({
      url: 'api/ng/groupon/config/switchStatus',
      params,
    });
  groupon_configSetReleaseTime = params =>
    this.seePost({
      url: 'api/ng/groupon/config/set-release-time',
      params,
    });

  pictureCenter_add = params =>
    this.seePost({ url: 'api/ng/pictureCenter/add', params });
  pictureCenter_del = params =>
    this.seePost({ url: 'api/ng/pictureCenter/del', params });
  pictureCenter_list = params =>
    this.seePost({ url: 'api/ng/pictureCenter/list', params });

  couponv3_add = json => this.seePost({ url: 'api/ng/couponv3/add', json });
  couponv3_detail = params =>
    this.seePost({ url: 'api/ng/couponv3/detail', params });
  couponv3_list = params =>
    this.seePost({ url: 'api/ng/couponv3/list', params });
  couponv3_review = params =>
    this.seePost({ url: 'api/ng/couponv3/review', params });
  couponv3_update = params =>
    this.seePost({ url: 'api/ng/couponv3/update', params });
  couponv3_xdp_list = params =>
    this.seePost({ url: 'api/ng/couponv3/xdp/list', params });
  couponv3_end = params => this.seePost({ url: 'api/ng/couponv3/end', params });
  couponv3_del = params => this.seePost({ url: 'api/ng/couponv3/del', params });

  couponv3_xiaodianpu_add = params =>
    this.seePost({ url: 'api/ng/couponv3/xiaodianpu/add', params });
  couponv3_xiaodianpu_configCouponV3List = params =>
    this.seePost({
      url: 'api/ng/couponv3/xiaodianpu/configCouponV3List',
      params,
    });
  couponv3_xiaodianpu_delete = params =>
    this.seePost({ url: 'api/ng/couponv3/xiaodianpu/delete', params });
  couponv3_xiaodianpu_list = params =>
    this.seePost({ url: 'api/ng/couponv3/xiaodianpu/list', params });
  couponv3_xiaodianpu_update = params =>
    this.seePost({ url: 'api/ng/couponv3/xiaodianpu/update', params });
  couponv3_xiaodianpu_used = params =>
    this.seeGet({ url: 'api/ng/couponv3/xiaodianpu/used', params });
  couponv3_xiaodianpu_usedCount = params =>
    this.seeGet({ url: 'api/ng/couponv3/xiaodianpu/usedCount', params });

  kol_mgr_addDistributionItem = params =>
    this.seePost({ url: 'api/kol_mgr/addDistributionItem', params });
  user_getNewBrandUserList = params =>
    this.seeGet({ params, url: 'api/user/getNewBrandUserList' });
  item_getDistributionItemList = params =>
    this.seePost({ url: 'api/item/getDistributionItemList', params });
  xiaodianpu_updateInContact = params =>
    this.seePost({ url: 'api/xiaodianpu/updateInContact', params });
  xiaodianpu_updateBtnApply = params =>
    this.seePost({ url: 'api/xiaodianpu/updateBtnApply', params });
  xiaodianpu_updateBtnSearch = json =>
    this.seePost({ url: 'api/ng/weixin/openSearch', json });
  xiaodianpu_addExplosionItem = params =>
    this.seePost({ url: 'api/xiaodianpu/addExplosionItem', params });

  xiaodianpu_getItemList = params =>
    this.seePost({ url: 'api/xiaodianpu/getItemList', params });

  xiaodianpu_updateExplosionITitle = params =>
    this.seePost({ url: 'api/xiaodianpu/updateExplosionITitle', params });

  xiaodianpu_delExplosionItem = params =>
    this.seePost({ url: 'api/xiaodianpu/delExplosionItem', params });

  xiaodianpu_sortExplosionItem = params =>
    this.seePost({ url: 'api/xiaodianpu/sortExplosionItem', params });

  xiaodianpu_getExplosionItem = params =>
    this.seeGet({
      params,
      url: 'api/xiaodianpu/getExplosionItem',
    });

  xiaodianpu_getList = params =>
    this.seePost({ url: 'api/xiaodianpu/getList', params });

  xiaodianpu_getTradeDistribution = () =>
    this.seeGet({ url: 'api/xiaodianpu/getTradeDistribution' });

  xiaodianpu_getLastUpdated = () =>
    this.seeGet({ url: 'api/xiaodianpu/getLastUpdated' });

  xiaodianpu_getProfit = () => this.seeGet({ url: 'api/xiaodianpu/getProfit' });

  xiaodianpu_getNewData = () =>
    this.seeGet({ url: 'api/xiaodianpu/getNewData' });

  xiaodianpu_getHeader = () => this.seeGet({ url: 'api/xiaodianpu/getHeader' });

  xiaodianpu_reApply = params =>
    this.seePost({ url: 'api/xiaodianpu/reApply', params });

  xiaodianpu_delApply = params =>
    this.seePost({ url: 'api/xiaodianpu/delApply', params });

  xiaodianpu_applyAuth = params =>
    this.seePost({ url: 'api/ng/xiaodianpu/applyAuth', params });

  xiaodianpu_auth = params =>
    this.seePost({ url: 'api/ng/xiaodianpu/auth', params });

  xiaodianpu_getAuthResult = params =>
    this.seePost({ url: 'api/ng/xiaodianpu/getAuthResult', params });

  xiaodianpu_getDetailAuthInfo = params =>
    this.seePost({ url: 'api/ng/xiaodianpu/getDetailAuthInfo', params });

  seller_saveWeixinInfo = params =>
    this.seePost({ url: 'api/seller/saveWeixinInfo', params });

  authv2_bindSellerMobile = params =>
    this.seePost({
      url: 'api/authv2/bindSellerMobile',
      params,
      isHandleFail: false,
    });

  authv2_bindSellerWechat = params =>
    this.seePost({ url: 'api/authv2/bindSellerWechat', params });

  authv2_getAccountTypeList = params =>
    this.seePost({ url: 'api/authv2/getAccountTypeList', params });

  authv2_getFromWhereList = params =>
    this.seePost({ url: 'api/authv2/getFromWhereList', params });

  authv2_sendSmsCode = params =>
    this.seePost({
      url: 'api/auth/sendSmsV2Code',
      params,
      isHandleFail: false,
    });

  authv2_registerXiaodianpu = params =>
    this.seePost({ url: 'api/authv2/registerXiaodianpu', params });

  authv2_addAndUpdateInfo = params =>
    this.seePost({ url: 'api/authv2/addAndUpdateInfo', params });

  auth_resetPasswdStep2 = params =>
    this.seePost({
      url: 'api/auth/resetPasswdStep2',
      params,
      isHandleFail: false,
    });

  auth_resetPasswdStep1 = params =>
    this.seePost({
      url: 'api/auth/resetPasswdStep1',
      params,
      isHandleFail: false,
    });

  da_sentiment_item_sub_select = params =>
    this.seePost({
      url: `${this.da_url_prefix}service/busi/sentiment/item/sub/select`,
      params,
    });

  user_getAllSeller = params =>
    this.seeGet({ url: 'api/user/getAllSeller', params });

  user_getAllKOL = () => this.seeGet({ url: 'api/user/getAllKOL' });
  user_updateWechatId = params =>
    this.seePost({ url: 'api/user/updateWechatId', params });

  user_getC2CUser = () => this.seeGet({ url: 'api/user/getC2CUser' });

  item_getItemList = params =>
    this.seeGet({ url: 'api/item/getItemList', params });

  product_mgr_addChildProduct = params =>
    this.seePost({ url: 'api/product_mgr/addChildProduct', params });

  product_mgr_editChildProduct = params =>
    this.seePost({ url: 'api/product_mgr/editChildProduct', params });

  product_mgr_getChildProduct = params =>
    this.seeGet({ url: 'api/product_mgr/getChildProduct', params });

  product_mgr_getParentProduct = params =>
    this.seeGet({ url: 'api/product_mgr/getParentProduct', params });

  product_mgr_editProduct = params =>
    this.seePost({ url: 'api/product_mgr/editProduct', params });

  product_mgr_changeProductClass = params =>
    this.seePost({ url: 'api/product_mgr/changeProductClass', params });

  product_mgr_deleteSku = params =>
    this.seePost({ url: 'api/product_mgr/deleteSku', params });

  product_mgr_addProduct = params =>
    this.seePost({ url: 'api/product_mgr/addProduct', params });

  category_getAllLeafCategoryAndAttr = () =>
    this.seeGet({ url: 'api/category/getAllLeafCategoryAndAttr' });

  category_updateAttrRel = params =>
    this.seePost({ url: 'api/category/updateAttrRel', params });

  category_updateAttrOrder = params =>
    this.seePost({ url: 'api/category/updateAttrOrder', params });

  category_deleteAttrFromClass2 = params =>
    this.seePost({ url: 'api/category/deleteAttrFromClass2', params });

  category_addAttrToClass2 = params =>
    this.seePost({ url: 'api/category/addAttrToClass2', params });

  category_getClass2Detail = params =>
    this.seePost({ url: 'api/category/getClass2Detail', params });

  // 已添加验证  attrib接口全量添加了
  attrib_find = params =>
    this.seePost({
      url: 'api/attrib/find',
      params: this.createSeeApiSign(params),
    });

  attrib_update = params =>
    this.seePost({
      url: 'api/attrib/update',
      params: this.createSeeApiSign(params),
    });

  attrib_manage = params =>
    this.seePost({
      url: 'api/attrib/manage',
      params: this.createSeeApiSign(params),
    });

  attrib_get = params =>
    this.seePost({
      url: 'api/attrib/get',
      params: this.createSeeApiSign(params),
    });

  attrib_disable = params =>
    this.seePost({
      url: 'api/attrib/disable',
      params: this.createSeeApiSign(params),
    });

  attrib_getList = params =>
    this.seePost({
      url: 'api/attrib/getList',
      params: this.createSeeApiSign(params),
    });

  attrib_checkExist = params =>
    this.seePost({
      url: 'api/attrib/checkExist',
      params: this.createSeeApiSign(params),
    });

  attrib_create = params =>
    this.seePost({
      url: 'api/attrib/create',
      params: this.createSeeApiSign(params),
    });

  item_getClass2ById = params =>
    this.seeGet({ url: 'api/item/getClass2ById', params });
  // 已添加验证
  item_updateClass2 = params =>
    this.seePost({
      url: 'api/item/updateClass2',
      params: this.createSeeApiSign(params),
    });
  // 已添加验证
  item_createClass2 = params =>
    this.seePost({
      url: 'api/item/createClass2',
      params: this.createSeeApiSign(params),
    });

  item_getLockItemList = params =>
    this.seeGet({ url: 'api/item/getLockItemList', params });

  price_adjust_approveApply = params =>
    this.seePost({ url: 'api/priceAdjust/approveApply', params });

  price_adjust_rejectApply = params =>
    this.seePost({ url: 'api/priceAdjust/rejectApply', params });

  price_adjust_priceAdjustList = params =>
    this.seeGet({ url: 'api/priceAdjust/priceAdjustList', params });

  price_adjust_myPriceAdjustList = params =>
    this.seeGet({ url: 'api/priceAdjust/myPriceAdjustList', params });

  rule_deleteRule = params =>
    this.seePost({ url: 'api/rule/deleteRule', params });

  rule_toggleRuleStatus = params =>
    this.seePost({ url: 'api/rule/toggleRuleStatus', params });

  rule_addRule = params => this.seePost({ url: 'api/rule/addRule', params });

  rule_getRuleItemCount = params =>
    this.seeGet({ url: 'api/rule/getRuleItemCount', params });

  rule_getRuleList = params =>
    this.seeGet({ url: 'api/rule/getRuleList', params });

  item_copyItem = params => this.seePost({ url: 'api/item/copyItem', params });

  item_getCurrencyRate = () => this.seeGet({ url: 'api/item/getCurrencyRate' });
  // 已添加验证
  item_setHidden = params =>
    this.seePost({
      url: 'api/item/setHidden',
      params: this.createSeeApiSign(params),
    });

  item_itemListHidden = params =>
    this.seePost({ url: 'api/item/itemListHidden', params });

  item_updateItem = params =>
    this.seePost({ url: 'api/item/updateItem', params });

  item_notice_getList = params =>
    this.seePost({ url: 'api/item_notice/getList', params });

  item_notice_noticeAdd = params =>
    this.seePost({ url: 'api/item_notice/noticeAdd', params });

  item_notice_noticeSet = params =>
    this.seePost({ url: 'api/item_notice/noticeSet', params });

  item_notice_noticeOnline = params =>
    this.seeGet({ url: 'api/item_notice/noticeOnline', params });

  brand_setRate = params => this.seeGet({ url: 'api/brand/setRate', params });

  brand_getRate = params => this.seeGet({ url: 'api/brand/getRate', params });
  // 已添加验证
  brand_updateBrand = params =>
    this.seePost({
      url: 'api/brand/updateBrand',
      params: this.createSeeApiSign(params),
    });

  brand_mergeItemBrand = params =>
    this.seePost({ url: 'api/brand/mergeItemBrand', params });

  brand_getSimilarBrandList = params =>
    this.seeGet({ url: 'api/brand/getSimilarBrandList', params });

  brand_getBrandDetail = params =>
    this.seeGet({ url: 'api/brand/getBrandDetail', params });

  brand_getBrandList = params =>
    this.seeGet({ url: 'api/brand/getBrandList', params });

  python_api_changeBrandName = params => {
    if (!params || !params.brand_name || !params.item_id) {
      return this.$q.reject();
    }
    const urls = window.location.href;
    let apidomain;
    if (urls.indexOf('devcdn') > -1 || urls.indexOf('localhost') > -1) {
      apidomain = '//see-test.seecsee.com';
    } else if (urls.indexOf('publish') > -1) {
      apidomain = '//publish.seecsee.com';
    } else {
      apidomain = '//seecsee.com';
    }
    const url = `${apidomain}/python_api/changeBrandName?callback=JSON_CALLBACK&brand_name=${
      params.brand_name
    }&item_id=${params.item_id}`;
    return this.$http.jsonp(url);
  };

  python_api_changeToPrepareItemWithURL = url => {
    const urls = window.location.href;
    let apidomain = '';
    if (urls.indexOf('devcdn') > -1 || urls.indexOf('localhost') > -1) {
      apidomain = '//see-test.seecsee.com';
    } else if (urls.indexOf('publish') > -1) {
      apidomain = '//publish.seecsee.com';
    } else {
      apidomain = '//seecsee.com';
    }
    const urlF = `${apidomain}/python_api/changeToPrepareItemWithURL?callback=JSON_CALLBACK&url=${url}`;

    return this.$http.jsonp(urlF);
  };

  order_getUserData = () => this.seeGet({ url: 'api/order/getUserData' });

  item_addBrand = params => this.seePost({ url: 'api/item/addBrand', params });

  item_getAreaList = params =>
    this.seeGet({ url: 'api/item/getAreaList', params });

  item_getCountyList = params =>
    this.seeGet({ url: 'api/item/getCountyList', params });

  item_getBrandList = () => this.seeGet({ url: 'api/item/getBrandList' });

  item_searchItemList = params =>
    this.seeGet({ url: 'api/item/searchItemList', params });

  item_itemListNeedEdit = params =>
    this.seeGet({ url: 'api/item/itemListNeedEdit', params });

  item_outOfStock = params =>
    this.seeGet({ url: 'api/item/outOfStock', params });

  item_itemListOff = params =>
    this.seeGet({ url: 'api/item/itemListOff', params });

  item_matchItemListv2 = params =>
    this.seePost({ url: 'api/item/matchItemListv2', params });

  item_itemList = params => this.seeGet({ url: 'api/item/itemList', params });

  item_getItem = params => this.seeGet({ url: 'api/item/getItem', params });

  item_addItem = params => this.seePost({ url: 'api/item/addItem', params });

  item_getSize = params => this.seeGet({ url: 'api/item/getSize', params });

  item_upload = params => this.seePost({ url: 'api/item/upload', params });

  item_getSizeProperty = params =>
    this.seeGet({ url: 'api/item/getSizeProperty', params });

  item_getColor = () =>
    this.seeGet({ url: 'api/item/getColor', params: undefined, cache: true });

  item_getClassAttr = params =>
    this.seeGet({ url: 'api/item/getClassAttr', params });

  item_classList = () => this.seeGet({ url: 'api/item/classList' });

  wanted_addThemeItem = params =>
    this.seePost({ url: 'api/wanted/addThemeItem', params });

  wanted_getBackendOperateTheme = params =>
    this.seeGet({ url: 'api/wanted/getBackendOperateTheme', params });

  wanted_getKolUidList = () => this.seeGet({ url: 'api/wanted/getKolUidList' });

  wanted_addThemev2 = params =>
    this.seePost({ url: 'api/wanted/addThemev2', params });

  item_getItemInfoArray = params =>
    this.seePost({ url: 'api/item/getItemInfoArray', params });

  item_getBrandAndLocation = () =>
    this.seeGet({ url: 'api/item/getBrandAndLocation' });

  wanted_getUserFirstTheme = params =>
    this.seeGet({ url: 'api/wanted/getUserFirstTheme', params });

  wanted_getUserThemeLayerCount = () =>
    this.seeGet({ url: 'api/wanted/getUserThemeLayerCount' });

  wanted_getUserThemev2 = params =>
    this.seeGet({ url: 'api/wanted/getUserThemev2', params });

  wanted_getUserThemeLayer = params =>
    this.seeGet({ url: 'api/wanted/getUserThemeLayer', params });

  wanted_getThemeItem = params =>
    this.seeGet({ url: 'api/wanted/getThemeItem', params });

  wanted_addSearchItem = params =>
    this.seePost({ url: 'api/wanted/addSearchItem', params });

  wanted_checkIfJZCanAnswer = params =>
    this.seePost({ url: 'api/wanted/checkIfJZCanAnswer', params });

  wanted_addReply = params =>
    this.seePost({ url: 'api/wanted/addReply', params });

  event_editAnswer = params =>
    this.seePost({ url: 'api/event/editAnswer', params });

  wanted_addAnswer = params =>
    this.seePost({ url: 'api/wanted/addAnswer', params });

  wanted_getThemeTmpFinds = params =>
    this.seeGet({ url: 'api/wanted/getThemeTmpFinds', params });

  wanted_getThemeDetail = params =>
    this.seeGet({ url: 'api/wanted/getThemeDetail', params });

  wanted_getThemeFinds = params =>
    this.seeGet({ url: 'api/wanted/getThemeFinds', params });

  wanted_getFindReplies = params =>
    this.seeGet({ url: 'api/wanted/getFindReplies', params });

  wanted_getFind = params => this.seeGet({ url: 'api/wanted/getFind', params });

  wanted_updateTheme = params =>
    this.seePost({ url: 'api/wanted/updateTheme', params });

  wanted_addTheme = params =>
    this.seePost({ url: 'api/wanted/addTheme', params });

  wanted_getTheme = params =>
    this.seeGet({ url: 'api/wanted/getTheme', params });

  wanted_getMatchItems = params =>
    this.seeGet({ url: 'api/wanted/getMatchItems', params });

  wanted_getSellerItems = () =>
    this.seeGet({ url: 'api/wanted/getSellerItems' });

  wanted_getSellerFinds = params =>
    this.seeGet({ url: 'api/wanted/getSellerFinds', params });

  wanted_getAllCategory = () =>
    this.seeGet({ url: 'api/wanted/getAllCategory' });

  wanted_getSearchItems = params =>
    this.seeGet({ url: 'api/wanted/getSearchItems', params });

  wanted_getCircleOwnerTheme = params =>
    this.seeGet({ url: 'api/wanted/getCircleOwnerTheme', params });

  wanted_getSellerTheme = params =>
    this.seeGet({ url: 'api/wanted/getSellerTheme', params });

  wanted_getPgcTheme = params =>
    this.seeGet({ url: 'api/wanted/getPgcTheme', params });

  wanted_getMyFinds = params =>
    this.seeGet({ url: 'api/wanted/getMyFinds', params });

  wanted_getMyEventFinds = params =>
    this.seeGet({ url: 'api/wanted/getMyEventFinds', params });

  wanted_getEventTheme = params =>
    this.seeGet({ url: 'api/wanted/getEventTheme', params });

  wanted_getUserTheme = params =>
    this.seeGet({ url: 'api/wanted/getUserTheme', params });

  topic_getUploadVideoToken = () =>
    this.seeGet({ url: 'api/topic/getUploadVideoToken' });

  topic_delDraftTopic = params =>
    this.seePost({ url: 'api/topic/delDraftTopic', params });

  topic_deleteAnswer = params =>
    this.seeGet({ url: 'api/topic/deleteAnswer', params });

  topic_delContent = params =>
    this.seeGet({ url: 'api/topic/delContent', params });

  topic_getPgcAnswerList = params =>
    this.seeGet({ url: 'api/topic/getPgcAnswerList', params });

  topic_answerQuestion = params =>
    this.seePost({ url: 'api/topic/answerQuestion', params });

  topic_getMyPgcAnswerList = params =>
    this.seeGet({ url: 'api/topic/getMyPgcAnswerList', params });

  topic_getDarenPgcQuestionList = params =>
    this.seeGet({ url: 'api/topic/getDarenPgcQuestionList', params });

  topic_getRecommendPgcQuestionList = params =>
    this.seeGet({ url: 'api/topic/getRecommendPgcQuestionList', params });

  topic_getPgcQuestionList = params =>
    this.seeGet({ url: 'api/topic/getPgcQuestionList', params });

  topic_getTopicDetail = params =>
    this.seeGet({ url: 'api/topic/getTopicDetail', params });

  topic_updateDraftTopic = params =>
    this.seePost({ url: 'api/topic/updateDraftTopic', params });

  topic_delTopic = params =>
    this.seePost({ url: 'api/topic/delTopic', params });

  topic_searchTopicList = params =>
    this.seePost({ url: 'api/topic/searchTopicList', params });

  topic_getCatetory = () => this.seeGet({ url: 'api/topic/getCatetory' });

  topic_getTopicList = params =>
    this.seeGet({ url: 'api/topic/getTopicList', params });

  topic_get_api_url = () => this.seePost({ url: 'api/topic/get_api_url' });

  topic_updateDraftTopicDetail = params =>
    this.seePost({ url: 'api/topic/updateDraftTopicDetail', params });

  topic_updateTopicDetail = params =>
    this.seePost({ url: 'api/topic/updateTopicDetail', params });

  topic_addTopic = params =>
    this.seePost({ url: 'api/topic/addTopic', params });

  pgc_settle_checkCircleBindAccount = params =>
    this.seeGet({ url: 'api/pgc_settle/checkCircleBindAccount', params });

  pgc_settle_getBillStatData = params =>
    this.seeGet({ url: 'api/pgc_settle/getBillStatData', params });

  pgc_settle_getHistoryBillList = params =>
    this.seeGet({ url: 'api/pgc_settle/getHistoryBillList', params });

  pgc_settle_getBillTopicList = params =>
    this.seeGet({ url: 'api/pgc_settle/getBillTopicList', params });

  pgc_settle_adjustItemSellcount = params =>
    this.seePost({ url: 'api/pgc_settle/adjustItemSellcount', params });

  pgc_settle_getTopicItemList = params =>
    this.seeGet({ url: 'api/pgc_settle/getTopicItemList', params });

  user_relateBackendUserAndCircleOwner = params =>
    this.seePost({ url: 'api/user/relateBackendUserAndCircleOwner', params });

  circle_relateBackendCircle = params =>
    this.seeGet({ url: 'api/circle/relateBackendCircle', params });

  // 已添加验证，合作下的操作，已全部添加验证
  collection_getMiniCollection = params =>
    this.seePost({
      url: 'api/collection/getMiniCollection',
      params: this.createSeeApiSign(params),
    });

  collection_getMiniCollectionItem = params =>
    this.seePost({
      url: 'api/collection/getMiniCollectionItem',
      params: this.createSeeApiSign(params),
    });

  collection_updateMiniCollectionItem = params =>
    this.seePost({
      url: 'api/collection/updateMiniCollectionItem',
      params: this.createSeeApiSign(params),
    });

  collection_delMiniCollectionItem = params =>
    this.seePost({
      url: 'api/collection/delMiniCollectionItem',
      params: this.createSeeApiSign(params),
    });

  collection_addMiniCollectionItem = params =>
    this.seePost({
      url: 'api/collection/addMiniCollectionItem',
      params: this.createSeeApiSign(params),
    });

  collection_miniCollectionItem = params =>
    this.seePost({
      url: 'api/collection/miniCollectionItem',
      params: this.createSeeApiSign(params),
    });

  collection_setMiniColPublic = params =>
    this.seePost({
      url: 'api/collection/setMiniColPublic',
      params: this.createSeeApiSign(params),
    });

  collection_updateMiniCollection = params =>
    this.seePost({
      url: 'api/collection/updateMiniCollection',
      params: this.createSeeApiSign(params),
    });

  collection_createMiniCollection = params =>
    this.seePost({
      url: 'api/collection/createMiniCollection',
      params: this.createSeeApiSign(params),
    });

  collection_miniCollectionByCirid = params =>
    this.seePost({
      url: 'api/collection/miniCollectionByCirid',
      params: this.createSeeApiSign(params),
    });

  circle_getCircleOwner = params =>
    this.seeGet({ url: 'api/circle/getCircleOwner', params });

  circle_checkSellerCircle = params =>
    this.seeGet({ url: 'api/circle/checkSellerCircle', params });

  circle_setOwner = params =>
    this.seeGet({ url: 'api/circle/setOwner', params });

  circle_addCircle = params =>
    this.seePost({ url: 'api/circle/addCircle', params });

  circle_getCircleThemeCount = params =>
    this.seeGet({ url: 'api/circle/getCircleThemeCount', params });

  circle_getThemeBycircle = params =>
    this.seeGet({ url: 'api/circle/getThemeBycircle', params });

  circle_getCircleCountByClass = params =>
    this.seeGet({ url: 'api/circle/getCircleCountByClass', params });

  circle_getPgcCircleList = params =>
    this.seeGet({ url: 'api/circle/getPgcCircleList', params });

  circle_getCircleSaleCondition = params =>
    this.$http({
      url: 'api/circle/getCircleSaleCondition',
      method: 'GET',
      params,
    });

  wanted_getCircleDetail = params =>
    this.seeGet({ url: 'api/wanted/getCircleDetail', params });

  chat_setNotice = params =>
    this.seePost({ url: 'api/chat/setNotice', params });

  chat_getNotice = () => this.seeGet({ url: 'api/chat/getNotice' });

  seller_saveRecord = params =>
    this.seePost({ url: 'api/seller/saveRecord', params });

  seller_modifyPwd = params =>
    this.seePost({ url: 'api/seller/modifyPwd', params });

  seller_checkPwd = params =>
    this.seePost({ url: 'api/seller/checkPwd', params });

  seller_checkPopEditKol = () =>
    this.seeGet({ url: 'api/seller/checkPopEditKol' });

  seller_getSellerUser = () => this.seeGet({ url: 'api/seller/getSellerUser' });

  seller_getNotCirOwnerMajia = () =>
    this.seeGet({ url: 'api/seller/getNotCirOwnerMajia' });

  user_setUserDaren = params =>
    this.seeGet({ url: 'api/user/setUserDaren', params });

  seller_getSellerMajia = () =>
    this.seeGet({ url: 'api/seller/getSellerMajia' });

  getPrivilege = () =>
    (document.cookie.match('(^|; )seller_privilege=([^;]*)') || 0)[2];

  seller_saveGASecret = params =>
    this.seePost({ url: 'api/seller/saveGASecret', params });

  seller_isGaSecretOpen = () =>
    this.seeGet({ url: 'api/seller/isGaSecretOpen' });

  seller_createGASecret = () =>
    this.seeGet({ url: 'api/seller/createGASecret' });

  seller_modifyUserInfo = params =>
    this.seePost({ url: 'api/seller/modifyUserInfo', params });

  seller_modifySellerInfo = params =>
    this.seePost({ url: 'api/seller/modifySellerInfo', params });

  wanted_updateCollectionItem = params =>
    this.seePost({ url: 'api/wanted/updateCollectionItem', params });

  wanted_delCollectionItem = params =>
    this.seePost({ url: 'api/wanted/delCollectionItem', params });

  wanted_getCollectionItemData = params =>
    this.seeGet({ url: 'api/wanted/getCollectionItemData', params });

  wanted_updateCollectionItemDesc = params =>
    this.seePost({ url: 'api/wanted/updateCollectionItemDesc', params });

  wanted_updateCollectionItemName = params =>
    this.seePost({ url: 'api/wanted/updateCollectionItemName', params });

  wanted_editCollection = params =>
    this.seePost({ url: 'api/wanted/editCollection', params });

  wanted_createCollection = params =>
    this.seePost({ url: 'api/wanted/createCollection', params });

  wanted_searchItem = params =>
    this.seeGet({ url: 'api/wanted/searchItem', params });

  wanted_getCollectionItemList = params =>
    this.seeGet({ url: 'api/wanted/getCollectionItemList', params });

  wanted_getCollection = params =>
    this.seeGet({ url: 'api/wanted/getCollection', params });

  wanted_getCollectionInfo = params =>
    this.seeGet({ url: 'api/wanted/getCollectionInfo', params });

  wanted_getCircleCollection = params =>
    this.seeGet({ url: 'api/wanted/getCircleCollection', params });

  wanted_getKOLThemeList = params =>
    this.seeGet({ url: 'api/wanted/getKOLThemeList', params });

  wanted_getRecommendThemeList = params =>
    this.seeGet({ url: 'api/wanted/getRecommendThemeList', params });

  parttime_getRecommendTheme = params =>
    this.seeGet({ url: 'api/parttime/getRecommendTheme', params });

  parttime_getThemeListv2 = params =>
    this.seeGet({ url: 'api/parttime/getThemeListv2', params });

  parttime_getParttimerData = () =>
    this.$http({ url: 'api/parttime/getParttimerData', method: 'GET' });

  parttime_getDisqualifiedAnswer = params =>
    this.seeGet({ url: 'api/parttime/getDisqualifiedAnswer', params });

  parttime_getMessagesCount = () =>
    this.seeGet({ url: 'api/parttime/getMessagesCount' });

  parttime_updateReplyStatus = params =>
    this.seeGet({ url: 'api/parttime/updateReplyStatus', params });

  parttime_getNewMsgCount = () =>
    this.seeGet({ url: 'api/parttime/getNewMsgCount' });

  parttime_getMessages = params =>
    this.$http({ url: 'api/parttime/getMessages', method: 'GET', params });

  parttime_getThemeCount = () =>
    this.seeGet({ url: 'api/parttime/getThemeCount' });

  parttime_getThemeList = params =>
    this.seeGet({ url: 'api/parttime/getThemeList', params });

  search_control_showOrHideItems = (params, is_hidden) =>
    this.seeGet({
      url: `api/search_control/${is_hidden ? 'showItems' : 'hideItems'}`,
      params,
    });

  search_control_setGlobalHidden = params =>
    this.seePost({ url: 'api/search_control/setGlobalHidden', params });

  search_control_changeWeight = params =>
    this.seePost({ url: 'api/search_control/changeWeight', params });

  search_control_searchItems = params =>
    this.seeGet({ url: 'api/search_control/searchItems', params });

  seego_partner_commissionDetail = params =>
    this.seePost({ url: 'api/seego_partner/commissionDetail', params });

  seego_partner_finishWithdraw = params =>
    this.seePost({ url: 'api/seego_partner/finishWithdraw', params });

  seego_partner_applyWithdraw = params =>
    this.seePost({ url: 'api/seego_partner/applyWithdraw', params });

  seego_partner_getWithdraw = params =>
    this.seeGet({ url: 'api/seego_partner/getWithdraw', params });

  seego_partner_getSeegoPartnerSummary = params =>
    this.seeGet({ url: 'api/seego_partner/getSeegoPartnerSummary', params });

  event_getDarenTheme = params =>
    this.seeGet({ url: 'api/event/getDarenTheme', params });

  event_getRecommendTheme = params =>
    this.seeGet({ url: 'api/event/getRecommendTheme', params });

  couponmanager_sendCouponByUid = params =>
    this.seePost({ url: 'api/couponmanager/sendCouponByUid', params });

  couponmanager_getApplyInfo = params =>
    this.seePost({ url: 'api/couponmanager/getApplyInfo', params });

  couponmanager_getCouponListByType = params =>
    this.seePost({ url: 'api/couponmanager/getCouponListByType', params });

  couponmanager_search = params =>
    this.seePost({ url: 'api/couponmanager/search', params });

  couponmanager_sendCouponToUser = params =>
    this.seePost({ url: 'api/couponmanager/sendCouponToUser', params });

  couponmanager_updateApply = params =>
    this.seePost({ url: 'api/couponmanager/updateApply', params });

  couponmanager_newApply = params =>
    this.seePost({ url: 'api/couponmanager/newApply', params });

  couponmanager_rejectApply = params =>
    this.seePost({ url: 'api/couponmanager/rejectApply', params });

  couponmanager_acceptApply = params =>
    this.seePost({ url: 'api/couponmanager/acceptApply', params });

  couponmanager_getBrandAndClass = () =>
    this.seePost({ url: 'api/couponmanager/getBrandAndClass' });

  couponmanager_getApplyList = params =>
    this.seePost({ url: 'api/couponmanager/getApplyList', params });

  backend_event_signupEventItem = params =>
    this.seePost({ url: 'api/backend_event/signupEventItem', params });

  backend_event_moveEventItem = params =>
    this.seePost({ url: 'api/backend_event/moveEventItem', params });

  backend_event_rejectEventItem = params =>
    this.seePost({ url: 'api/backend_event/rejectEventItem', params });

  backend_event_acceptEventItem = params =>
    this.seePost({ url: 'api/backend_event/acceptEventItem', params });

  backend_event_updateEventSet = params =>
    this.seePost({ url: 'api/backend_event/updateEventSet', params });

  backend_event_getMyEventItems = params =>
    this.seeGet({ url: 'api/backend_event/getMyEventItems', params });

  backend_event_getEventSetData = params =>
    this.seeGet({ url: 'api/backend_event/getEventSetData', params });

  backend_event_getEventItemStatus = params =>
    this.seeGet({ url: 'api/backend_event/getEventItemStatus', params });

  backend_event_deleteEventSet = params =>
    this.seePost({ url: 'api/backend_event/deleteEventSet', params });

  backend_event_getEventData = params =>
    this.seeGet({ url: 'api/backend_event/getEventData', params });

  backend_event_getBackendUserInfo = params =>
    this.seeGet({ url: 'api/backend_event/getBackendUserInfo', params });

  backend_event_getMyEventItemsStatus = () =>
    this.seeGet({ url: 'api/backend_event/getMyEventItemsStatus' });

  backend_event_getEventItemList = params =>
    this.seeGet({ url: 'api/backend_event/getEventItemList', params });

  backend_event_getEventSetEventList = params =>
    this.seeGet({ url: 'api/backend_event/getEventSetEventList', params });

  backend_event_addEventSet = params =>
    this.seePost({ url: 'api/backend_event/addEventSet', params });

  backend_event_getEventSetList = params =>
    this.seeGet({ url: 'api/backend_event/getEventSetList', params });

  backend_event_addEvent = params =>
    this.seePost({ url: 'api/backend_event/addEvent', params });

  backend_event_getAllEventList = params =>
    this.seeGet({ url: 'api/backend_event/getAllEventList', params });

  common_getAllCategory = () =>
    this.seeGet({ url: 'api/common/getAllCategory' });

  common_getCategory = () => this.seeGet({ url: 'api/common/getCategory' });

  pgc_settle_getWithdrawPgcBillList = params =>
    this.seeGet({ url: 'api/pgc_settle/getWithdrawPgcBillList', params });

  pgc_settle_getPgcBillSummaryData = () =>
    this.seeGet({ url: 'api/pgc_settle/getPgcBillSummaryData' });

  pgc_settle_withdraw = params =>
    this.seeGet({ url: 'api/pgc_settle/withdraw', params });

  asset_getWithdrawDetailGoods = params =>
    this.seeGet({ url: 'api/asset/getWithdrawDetailGoods', params });

  pgc_settle_getBillDetail = params =>
    this.seeGet({ url: 'api/pgc_settle/getBillDetail', params });

  asset_searchWithdrawOrder = params =>
    this.seePost({ url: 'api/asset/searchWithdrawOrder', params });

  asset_searchWithdrawList = params =>
    this.seePost({ url: 'api/asset/searchWithdrawList', params });

  asset_finsihPay = params =>
    this.seeGet({ url: 'api/asset/finsihPay', params });

  asset_getUnSettleList = () =>
    this.seeGet({ url: 'api/asset/getUnSettleList' });

  asset_withdraw = () => this.seeGet({ url: 'api/asset/withdraw' });

  asset_getWithdrawDetail = params =>
    this.seeGet({ url: 'api/asset/getWithdrawDetail', params });

  asset_getWithdrawDetailById = params =>
    this.seeGet({ url: 'api/asset/getWithdrawDetailById', params });

  asset_getWithdrawHistory = params =>
    this.seeGet({ url: 'api/asset/getWithdrawHistory', params });

  asset_generateWithdrawBill = () =>
    this.seeGet({ url: 'api/asset/generateWithdrawBill' });

  asset_getBillStatData = () =>
    this.seeGet({ url: 'api/asset/getBillStatData' });

  orderv2_sendGoods = params =>
    this.seePost({ url: 'api/orderv2/sendGoods', params });

  orderv2_dispatchOrderv2 = params =>
    this.seePost({ url: 'api/orderv2/dispatchOrderv2', params });

  orderv2_splitMidOrder = params =>
    this.seePost({ url: 'api/orderv2/splitMidOrder', params });

  orderv2_batchDispatchOrderEmailConfirm = params =>
    this.seePost({ url: 'api/orderv2/batchDispatchOrderEmailConfirm', params });

  orderv2_finishBuyv2 = params =>
    this.seePost({ url: 'api/orderv2/finishBuyv2', params });

  orderv2_finishBuy = params =>
    this.seePost({ url: 'api/orderv2/finishBuy', params });

  orderv2_cancelDispatch = params =>
    this.seePost({ url: 'api/orderv2/cancelDispatch', params });

  orderv2_sendGoodsv2 = params =>
    this.seePost({ url: 'api/orderv2/sendGoodsv2', params });

  orderv2_notifyTax = params =>
    this.seePost({ url: 'api/orderv2/notifyTax', params });

  orderv2_modifyMiddleOrderPrice = params =>
    this.seePost({ url: 'api/orderv2/modifyMiddleOrderPrice', params });

  orderv2_modifyOrderItemSku = params =>
    this.seePost({ url: 'api/orderv2/modifyOrderItemSku', params });

  orderv2_getOrderItemSkus = params =>
    this.seeGet({ url: 'api/orderv2/getOrderItemSkus', params });

  orderv2_modifyDispatchPrice = params =>
    this.seePost({ url: 'api/orderv2/modifyDispatchPrice', params });

  orderv2_getAddrInfoByUid = params =>
    this.seePost({ url: 'api/orderv2/getAddrInfoByUid', params });

  orderv2_getOrderDetail = params =>
    this.seeGet({ url: 'api/orderv2/getOrderDetail', params });

  orderv2_modifyOrderInfo = params =>
    this.seePost({ url: 'api/orderv2/modifyOrderInfo', params });

  orderv2_checkOrderItemSku = params =>
    this.seePost({ url: 'api/orderv2/checkOrderItemSku', params });

  order_getOrderDetail = params =>
    this.seeGet({ url: 'api/order/getOrderDetail', params });

  orderv2_getShowType = params =>
    this.seePost({ url: 'api/orderv2/getShowType', params });

  orderv2_finishTax = params =>
    this.seePost({ url: 'api/orderv2/finishTax', params });

  orderv2_contactUser = params =>
    this.seePost({ url: 'api/orderv2/contactUser', params });

  orderv2_processRefundMsg = params =>
    this.seePost({ url: 'api/orderv2/processRefundMsg', params });

  orderv2_getOrderCount = () =>
    this.seeGet({ url: 'api/orderv2/getOrderCount' });

  orderv2_inBatchOperation = params =>
    this.seePost({ url: 'api/orderv2/inBatchOperation', params });

  orderv2_searchOrder = params =>
    this.seeGet({ url: 'api/orderv2/searchOrder', params });

  orderv2_searchOrderByArea = params =>
    this.seeGet({ url: 'api/orderv2/searchOrderByArea', params });

  orderv2_getKOLOrderList = params =>
    this.seeGet({ url: 'api/orderv2/getKOLOrderList', params });

  orderv2_getDistributionOrder = params =>
    this.seeGet({ url: 'api/orderv2/getDistributionOrder', params });

  orderv2_getOrderCountLogistics = () =>
    this.seeGet({ url: 'api/orderv2/getOrderCountLogistics' });

  orderv2_searchOrderByLogistics = params =>
    this.seeGet({ url: 'api/orderv2/searchOrderByLogistics', params });

  orderv2_getOrderList = params =>
    this.seeGet({ url: 'api/orderv2/getOrderList', params });

  orderv2_searchSellerOrder = params =>
    this.seePost({ url: 'api/orderv2/searchSellerOrder', params });

  orderv2_setMarkStar = params =>
    this.seeGet({ url: 'api/orderv2/setMarkStar', params });

  da_portrait_user_init = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/user/init`,
      params,
    });

  da_portrait_user_favor = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/user/favor`,
      params,
    });

  da_portrait_detail_hot = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/detail/hot`,
      params,
    });

  da_portrait_detail_top = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/detail/top`,
      params,
    });

  da_portrait_detail_content = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/detail/content`,
      params,
    });

  da_portrait_detail_base = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/detail/base`,
      params,
      cache: true,
    });

  da_portrait_list_status = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/list/status`,
      params,
    });

  da_portrait_list_search = params =>
    this.seePost({
      url: `${this.da_url_prefix}nlp/portrait/list/search`,
      params,
    });

  wanted_hideTheme = params =>
    this.seeGet({ url: 'api/wanted/hideTheme', params });

  wanted_resumeTheme = params =>
    this.seePost({ url: 'api/wanted/resumeTheme', params });

  rate_getOrderRateList = params =>
    this.seeGet({ url: 'api/rate/getOrderRateList', params });

  rate_getBrandRateList = params =>
    this.seeGet({ url: 'api/rate/getBrandRateList', params });

  weranking_get_items = params =>
    this.$http.get(`${this.python_url_prefix}weranking/get_items`, { params });

  weranking_get_item_detail = params =>
    this.$http.get(`${this.python_url_prefix}weranking/get_item_detail`, {
      params,
    });

  weranking_account_article = params =>
    this.$http.get(`${this.python_url_prefix}weranking/account/article`, {
      params,
    });

  weyuqing_get_tags = params =>
    this.seeGet({ url: 'api/data_api/wechatMonitorTags', params });

  weyuqing_get_articles = params =>
    this.seePost({ url: 'api/data_api/wechatMonitorArticles', params });

  auth_getCountryCode = params =>
    this.seeGet({ url: 'api/auth/getCountryCode', params });
  // 已添加验证
  auth_validateSms = params =>
    this.seePost({
      url: 'api/auth/validateSms',
      params: this.createSeeApiSign(params),
    });
  // 已添加验证
  auth_sendSmsCode = params =>
    this.seePost({
      url: 'api/auth/sendSmsV2Code',
      params: this.createSeeApiSign(params),
    });

  login_setUser = params => {
    const {
      block_with_dd,
      seller_name,
      seller_privilege,
      kol_id,
      seller_email,
    } = params;
    document.cookie = `block_with_dd=${block_with_dd}`;
    document.cookie = `seller_name=${seller_name}`;
    document.cookie = `seller_privilege=${seller_privilege}`;
    document.cookie = `seller_email=${seller_email}`;
    localStorage.setItem('seller_email', seller_email);
    localStorage.setItem('seller_name', seller_name);
    localStorage.setItem('seller_privilege', seller_privilege);
    localStorage.setItem('block_with_dd', block_with_dd);
    localStorage.setItem('kol_id', kol_id);
  };

  // 已添加验证
  auth_login = params =>
    this.seePost({
      url: 'api/auth/login',
      params: this.createSeeApiSign(params),
      isHandleFail: false,
    });

  auth_isGoogleAuthenticated = params =>
    this.seePost({ url: 'api/auth/isGoogleAuthenticated', params });

  orderv2_processSelledOrder = params =>
    this.seePost({ url: 'api/orderv2/processSelledOrder', params });

  orderv2_comfirmRefund = params =>
    this.seePost({ url: 'api/orderv2/comfirmRefund', params });

  orderv2_getRefundAuditOrderList = params =>
    this.seeGet({ url: 'api/orderv2/getRefundAuditOrderList', params });

  orderv2_getRefundAmount = params =>
    this.seeGet({ url: 'api/orderv2/getRefundAmount', params });

  orderv2_getServiceCodeList = params =>
    this.seePost({ url: 'api/orderv2/getServiceCodeList', params });
  // 已添加验证
  auth_registerKOL = params =>
    this.seePost({
      url: 'api/auth/registerKOL',
      params: this.createSeeApiSign(params),
    });

  auth_registerPGC = params =>
    this.seePost({ url: 'api/auth/registerPGC', params });
  // 已添加验证
  auth_registerSeller = params =>
    this.seePost({
      url: 'api/auth/registerSellerNew',
      params: this.createSeeApiSign(params),
    });
  // 已添加验证
  auth_verifySellerEmail = params =>
    this.$http.post(
      'api/auth/verifySellerEmail',
      this.$httpParamSerializerJQLike(this.createSeeApiSign(params)),
    );

  item_getStandardBrandList = params =>
    this.seeGet({ url: 'api/item/getStandardBrandList', params });

  item_getStandardBrandListv2 = params =>
    this.seeGet({ url: 'api/item/getStandardBrandListv2', params });

  da_sentiment_item_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/sentiment/item/select',
      params,
    });

  da_sentiment_brand_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/sentiment/brand/select',
      params,
    });

  da_sentiment_collection_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/sentiment/collection/select',
      params,
    });

  da_sentiment_collection_item_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/sentiment/collection/item/select',
      params,
    });

  da_sentiment_data_collection_one_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/bi/mon/order/select',
      params,
    });

  da_sentiment_data_collection_two_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/bi/mon/rebuy/rate/select',
      params,
    });

  da_sentiment_data_collection_three_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/bi/mon/rebuy/num/select',
      params,
    });

  da_sentiment_data_collection_four_select = params =>
    this.seeGet({
      url: this.da_url_prefix + 'service/busi/bi/mon/rebuy/gmv/select',
      params,
    });

  createToken = params => this.getCreateToken(params);
  createSeeApiSign = params => this.getSeeApiSign(params);
  urlSignGet = url => url;
  urlSignCheck = url => this.do_urlSignCheck(url);
  checkShopStatus = params => this.doCheckShopStatus(params);

  da_kol_rank_ListInfoKol = params =>
    this.seePost({
      url: this.da_url_prefix + 'nlp/portrait/words/business ',
      params,
    });
  da_kol_rank_ListBrandAndClass = params =>
    this.seePost({
      url: this.da_url_prefix + 'nlp/portrait/words/search',
      params,
    });
  da_kol_rank_DetailBrandAndClass = params =>
    this.seePost({
      url: this.da_url_prefix + 'nlp/portrait/words/word_detail',
      params,
    });

  // 已添加验证 kol权限下所有接口已添加
  kol_mgr_checkUserPri: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/checkUserPri',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolGetWithSeller: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolGetWithSeller',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolGetListWithSeller: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolGetListWithSeller',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_itemDelete: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/itemDelete',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_itemHide: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/itemHide',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_itemSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/itemSet',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolItemSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolItemSet',
      params: this.createSeeApiSign(params),
    });
  kol_mgr_modifyProfitRate: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/modifyProfitRate',
      params: this.createSeeApiSign(params),
    });
  kol_mgr_itemInfo: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/itemInfo',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_itemList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/itemList',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleDailyDetail: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleDailyDetail',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleSet',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleAdd',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleGet',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleList',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleListAll: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleListAll',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_configSellerList: () => ng.IPromise<any> = () =>
    this.seePost({
      url: 'api/kol_mgr/configSellerList',
      params: this.createSeeApiSign({ v: 1 }),
    });

  kol_mgr_configCategory: () => ng.IPromise<any> = () =>
    this.seePost({
      url: 'api/kol_mgr/configCategory',
      params: this.createSeeApiSign({ v: 1 }),
    });

  kol_mgr_trendAll: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/trendAll',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolSet',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolGet',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolInfoBase: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolInfoBase',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolStatus: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolStatus',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleStatus: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleStatus',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolAdd',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_getKolIdWithWeixin: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/getKolIdWithWeixin',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_keyListSearch: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/searchKolInfo',
      params,
    });

  kol_mgr_keyList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/getKeyList',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_kolList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/kolList',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleDefaultMall: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleDefaultMall',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_getKeyListMallArticle: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/getKeyListMallArticle',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleVirtualOrderList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleVirtualOrderList',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleVirtualOrderAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleVirtualOrderAdd',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleVirtualOrderSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleVirtualOrderSet',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_articleVirtualOrderDel: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/articleVirtualOrderDel',
      params,
    });

  // 运营状态选项
  kol_mgr_getKolOperateStatus: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/kol_mgr/getKolOperateStatus',
      cache: true,
    });

  kol_act_bannerList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/bannerList',
      params,
    });

  kol_act_bannerAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/bannerAdd',
      params,
    });

  kol_act_bannerGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/bannerGet',
      params,
    });

  kol_act_bannerSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/bannerSet',
      params,
    });

  kol_act_bannerDelete: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/bannerDelete',
      params,
    });

  CommonData_getConfigLocation: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/CommonData/getConfigLocation',
      cache: true,
    });

  CommonData_getConfigArea: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/CommonData/getConfiArea',
      cache: true,
    });

  storage_logCancel: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/logCancel',
      params,
    });

  storage_bindSkuAllot: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/bindSkuAllot',
      params,
    });

  storage_getAllotByBackendId: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/getAllotByBackendId',
      params,
    });

  storage_logAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/logAdd',
      params,
    });

  storage_allotCancel: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/allotCancel',
      params,
    });

  storage_logList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/storage/logList',
      params,
    });

  storage_changeLog: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/storage/changeLog',
      params,
    });

  storage_sellerSetPRI: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/sellerSetPRI',
      params,
    });

  storage_sellerList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/storage/sellerList',
      params,
    });

  storage_allotAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/allotAdd',
      params,
    });

  storage_allotLog: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/storage/allotLog',
      params,
    });

  storage_storeList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/storage/storeList',
      params,
    });

  storage_storeAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/storeAdd',
      params,
    });

  storage_storeCancel: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/storeCancel',
      params,
    });

  storage_storeLog: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/storage/storeLog',
      params,
    });

  storage_spuDel: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/spuDel',
      params,
    });

  storage_spuSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/spuSet',
      params,
    });

  storage_spuGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/spuGet',
      params,
    });

  storage_spuAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/storage/spuAdd',
      params,
    });

  storage_spuList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/storage/spuList',
      params,
    });

  storage_configGet: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/storage/configGet',
    });

  couponmanager_newApplyWithSeller: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/couponmanager/newApplyWithSeller',
      params,
    });

  couponmanager_getApplyListWithSeller: () => ng.IPromise<any> = () =>
    this.seeGet({ url: 'api/couponmanager/getApplyListWithSeller' });

  updateFavourCount = params => {
    return this.data_api_getFavourCount({}).then(res => {
      this.g_favor_count = res.data.count;
      return res;
    });
  };

  data_api_materialDelItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialDelItem',
      params,
    });

  data_api_getFavourCount: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/getFavourCount',
      params,
    });

  data_api_materialHideItems: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialHideItems',
      params,
    });

  data_api_materialFavorItemList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialFavorItemList',
      params,
    });

  data_api_materialFavorItemAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialFavorItemAdd',
      params,
    });

  data_api_materialSupplyPrice: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialSupplyPrice',
      params,
    });

  data_api_materialAddItems: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialAddItems',
      params,
    });

  data_api_materialNotes: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialNotes',
      params,
    });

  data_api_materialRecommend: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialRecommend',
      params,
    });

  data_api_materialTop: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialTop',
      params,
    });

  data_api_materialSync: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/data_api/materialSync',
      params,
    });

  data_api_materialSelectItem: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialSelectItemV2',
      params,
    });

  data_api_materialGoodsStatus: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialGoodsStatus',
      params,
    });

  data_api_materialBrandList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialBrandList',
      params,
    });

  data_api_materialBrandAdd: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialBrandAdd',
      params,
    });

  data_api_materialBrandGet: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialBrandGet',
      params,
    });

  data_api_materialBrandSet: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialBrandSet',
      params,
    });

  data_api_materialBrandSetNotes: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialBrandSetNotes',
      params,
    });

  data_api_materialBrandDelete: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/materialBrandDelete',
      params,
    });

  data_api_fashionView: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/fashionView',
      params,
    });

  data_api_fashionFavor: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/fashionFavor',
      params,
    });

  data_api_wechatKolContent: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/wechatKolContent',
      params,
    });

  data_api_wechatArticle: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/data_api/wechatArticle',
      params,
    });

  search_control_scoreUpdate: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/search_control/scoreUpdate',
      params,
    });

  financial_getBillDetail: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/financial/getBillDetail',
      params,
    });

  financial_submitSearchOrder: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/financial/submitSearchOrder',
      params,
    });

  financial_finishPay: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/financial/finishPay',
      params,
    });

  financial_finishPayInBatch: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/financial/finishPayInBatch',
      params,
    });

  financial_getNeedPayList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/financial/getNeedPayList',
      params,
    });

  financial_submitSearchBill: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/financial/submitSearchBill',
      params,
    });

  pgc_settle_getPgcWithdrawList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/pgc_settle/getPgcWithdrawList',
      params,
    });

  financial_getAlreadyPayList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/financial/getAlreadyPayList',
      params,
    });

  datacenter_getItemStatData: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/datacenter/getItemStatData',
      params,
    });

  datacenter_getTrendStatData: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/datacenter/getTrendStatData',
      params,
    });

  datacenter_getMonthTrendStatData: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/datacenter/getMonthTrendStatData',
      params,
    });

  datacenter_getTotalStatData: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/datacenter/getTotalStatData',
      params,
    });

  item_getPgcItem: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/item/getPgcItem',
    });

  orderv2_getSelledOrderCountByType: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/orderv2/getSelledOrderCountByType',
    });

  orderv2_getSelledOrderByType: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/orderv2/getSelledOrderByType',
      params,
    });

  // 已添加验证
  item_deleteItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/deleteItem',
      params: this.createSeeApiSign(params),
    });

  kol_mgr_addWarehouseItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_mgr/addWarehouseItem',
      params: this.createSeeApiSign(params),
    });

  auth_logout: () => ng.IPromise<any> = () =>
    this.seePost({
      url: 'api/auth/logout',
    });

  user_updateIMTips: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/user/updateIMTips',
      params,
    });

  user_updateUserPriceTag: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/user/updateUserPriceTag',
      params,
    });

  circle_saveCircle: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/circle/saveCircle',
      params,
    });

  circle_delCircleThemeRelation: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/circle/delCircleThemeRelation',
      params,
    });

  circle_delCollection: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/circle/delCollection',
      params,
    });

  event_getMyEventTheme: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/event/getMyEventTheme',
      params,
    });

  user_processAccountStatus: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/user/processAccountStatus',
      params,
    });

  user_getAccountDetail: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/user/getAccountDetail',
      params,
    });

  user_saveAccountDetail: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/user/saveAccountDetail',
      params,
    });

  user_getC2cList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/user/getC2cList',
      params,
    });

  orderv2_getOperateOrderCount: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/orderv2/getOperateOrderCount',
    });

  user_getAccountList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/user/getAccountList',
      params,
    });

  user_updateSellerData: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/user/updateSellerData',
      params,
    });

  user_updateKolData: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/user/updateKolData',
      params,
    });

  seller_modifyUserTag: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/seller/modifyUserTag',
      params,
    });

  user_modifySellerRole: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/user/modifySellerRole',
      params,
    });

  seller_updateIsSkipMainBody: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/seller/updateIsSkipMainBody',
      params,
    });

  seller_updateBlockYuqing: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/seller/updateBlockYuqing',
      params,
    });

  seller_updateBlockWeiqushi: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/seller/updateBlockWeiqushi',
      params,
    });

  seller_updateBlockFashion: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/seller/updateBlockFashion',
      params,
    });

  seller_updateBlockKolHome: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/seller/updateBlockKolHome',
      params,
    });

  seller_updateBlockHotItem: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/seller/updateBlockHotItem',
      params,
    });

  seller_updateSellerNameForKol: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/seller/updateSellerNameForKol',
      params,
    });

  user_createAccount: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/user/createAccount',
      params,
    });
  user_getXdpList: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/user/getXdpList',
    });

  // 已添加验证
  item_readyToSell: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/readyToSell',
      params: this.createSeeApiSign(params),
    });
  batch_readyToSell: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/batchReadyToSell',
      params: this.createSeeApiSign(params),
    });

  product_mgr_getProduct: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/product_mgr/getProduct',
      params,
    });

  product_mgr_getClassAttr: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/product_mgr/getClassAttr',
      params,
    });

  product_mgr_getPriceAdjustDetail: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/product_mgr/getPriceAdjustDetail',
      params,
    });

  product_mgr_checkChildSku: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/product_mgr/checkChildSku',
      params,
    });

  product_mgr_syncChildSku: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/product_mgr/syncChildSku',
      params,
    });

  circle_getCircleBySellerId: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/circle/getCircleBySellerId',
    });

  item_class2Tree: (params?: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/item/class2Tree',
      params,
    });

  item_class2List: (params?: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/item/class2List',
      params,
    });

  third_api_getPlatformList: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/third_api/getPlatformList',
    });

  thired_api_addItemWithPython: (params?: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/third_api/addItemWithPython',
      params,
    });

  thired_api_getConfigAdd: (params?: any) => ng.IPromise<any> = () =>
    this.seePost({
      url: 'api/third_api/getConfigAdd',
    });

  crawler_getPlatform: (params?: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: this.python_url_prefix + 'getPlatform',
      params,
    });

  crawler_getCatalog: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: this.python_url_prefix + 'pgc_catalog',
    });

  crawler_getMaterialList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: this.python_url_prefix + 'pgc_crawler',
      params,
    });

  crawler_getHotList: (params: any, type: string) => ng.IPromise<any> = (
    params,
    type,
  ) =>
    this.seeGet({
      url:
        this.python_url_prefix +
        'pgc_rank/' +
        (type === 'today' ? 'daily' : type),
      params,
    });

  crawler_getFavoriteList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: this.python_url_prefix + 'pgc_crawler/favorite/get',
      params,
    });

  crawler_addToFavoriteList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: this.python_url_prefix + 'pgc_crawler/favorite/add',
      params,
    });

  crawler_removeFavoriteItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: this.python_url_prefix + 'pgc_crawler/favorite/remove',
      params,
    });

  crawler_add_new_required: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: this.python_url_prefix + 'pgc_crawler/add_new_required',
      params,
    });

  crawler_get_new_required: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: this.python_url_prefix + 'pgc_crawler/add_new_required',
      params,
    });

  crawler_itemHide: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: this.python_url_prefix + 'pgc_crawler/itemHide',
      params,
    });

  item_getItemTopRank: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/itemTopRank',
      params,
    });

  item_itemAddList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/itemAddList',
      params,
    });

  // 已添加验证
  item_itemHide: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/itemHide',
      params: this.createSeeApiSign(params),
    });

  seller_getSellerDetail: (cache?: boolean) => ng.IPromise<any> = (
    cache = true,
  ) =>
    this.seeGet({
      url: 'api/seller/getSellerDetail',
      cache,
    });

  seller_getSellerDetailv2: (cache?: boolean) => ng.IPromise<any> = (
    cache = true,
  ) =>
    this.seeGet({
      url: 'api/seller/getSellerDetailv2',
      cache,
    });

  third_api_addItemBySpuIds: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/third_api/addItemBySpuIds',
      params,
    });

  /* express_getList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/express/getList',
      params,
    }); */

  express_getList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/express/getExpressList',
      params,
    });

  express_updateTop: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/express/updateTop',
      params,
    });

  express_getItem: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/express/getItem',
      params,
    });

  express_updateItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/express/updateItem',
      params,
    });

  // 已添加验证
  express_deleteItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/express/deleteItem',
      params: this.createSeeApiSign(params),
    });

  express_newItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/express/newItem',
      params,
    });

  express_getExTypeList = () =>
    this.seePost({
      url: 'api/express/getExTypeList',
    });

  express_getGoodsExpress: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/express/getGoodsExpress',
      params,
      cache: true,
    });

  express_getShipFee: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/express/getShipFee',
      params,
    });

  express_checkGoodsExpress: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/express/checkGoodsExpress',
      params,
    });

  order_getTransportList: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/order/getTransportList',
      cache: true,
    });

  item_platformItemList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/item/platformItemList',
      params,
    });

  wanted_uploadImgByUrl: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/wanted/uploadImgByUrl',
      params,
    });

  item_matchEditItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/matchEditItem',
      params,
    });

  wanted_getItemDetail: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/wanted/getItemDetail',
      params,
    });

  item_getClassInfo: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/item/getClassInfo',
      params,
    });

  item_getItemSelectOption: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/item/getItemSelectOption',
    });

  express_getExpressSelectOption: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: 'api/express/getExpressSelectOption',
    });

  kol_getKolOrderFilter: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/kol/getKolOrderFilter',
      params,
      cache: true,
    });

  kol_getKolOrderList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/kol/getKolOrderList',
      params,
    });

  kol_exportKolOrderList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/kol/exportKolOrderList',
      params,
    });

  // 已添加验证，合作下的操作，已全部添加验证
  collection_itemGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/itemGet',
      params: this.createSeeApiSign(params),
    });

  collection_copyItems: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/item/copyItemv2',
      params: this.createSeeApiSign(params),
    });

  collection_collectionSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/collectionSet',
      params: this.createSeeApiSign(params),
    });

  collection_collectionGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/collectionGet',
      params: this.createSeeApiSign(params),
    });

  collection_seckillSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/seckillSet',
      params: this.createSeeApiSign(params),
    });

  collection_seckillGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/seckillGet',
      params: this.createSeeApiSign(params),
    });

  collection_recommendItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/recommendItem',
      params: this.createSeeApiSign(params),
    });

  collection_rankItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/rankItem',
      params: this.createSeeApiSign(params),
    });

  collection_hideItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/hideItem',
      params: this.createSeeApiSign(params),
    });

  collection_deleteItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/deleteItem',
      params: this.createSeeApiSign(params),
    });

  collection_syncShopItem: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/syncShopItem',
      params: this.createSeeApiSign(params),
    });

  collection_getItemList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/collection/getItemList',
      params: this.createSeeApiSign(params),
    });

  security_urlSignLog: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/urlSignLog',
      params,
    });

  security_apiList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/apiList',
      params,
    });

  security_apiSet: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/apiSet',
      params,
    });

  security_configSet: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/configSet',
      params,
    });

  security_configAdd: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/configAdd',
      params,
    });

  security_ctrlList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/ctrlList',
      params,
    });

  security_ctrlSet: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/ctrlSet',
      params,
    });

  security_logList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/logList',
      params,
    });

  security_configList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/configList',
      params,
    });

  security_warnList: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/warnList',
      params,
    });

  security_resetIsIngore: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/security/resetIsIngore',
      params,
    });

  mall_mallClassGetListWithArticle: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallClassGetListWithArticle',
      params,
    });

  mall_mallClassSetRank: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallClassSetRank',
      params,
    });

  mall_mallClassChoice: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallClassChoice',
      params,
    });

  mall_mallClassList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallClassList',
      params,
    });

  mall_mallClassAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallClassAdd',
      params,
    });

  mall_mallClassGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallClassGet',
      params,
    });

  mall_mallClassSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallClassSet',
      params,
    });

  mall_mallRelateSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/mallRelateSet',
      params,
    });

  mall_mallClassGetKey: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_class/getKey',
      params,
    });

  mall_template_list: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/templateList',
      params,
    });

  mall_template_add: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/templateAdd',
      params,
    });

  mall_template_set: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/templateSet',
      params,
    });

  mall_template_get: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/templateGet',
      params,
    });

  mall_template_delete: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/templateDelete',
      params,
    });

  mall_template_getChoiceKol: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/getChoiceKol',
      params,
    });
  mall_template_getChoiceMall: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/getChoiceMall',
      params,
    });
  mall_template_getChoiceItemList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/getChoiceItemList',
      params,
    });
  mall_list_all: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/mall_template/mallList',
      params,
    });
  mall_list_detail: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/mall_template/templateItemList',
      params,
    });
  mall_template_templateConfirmSync: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/templateConfirmSync',
      params,
    });
  mall_template_addItemToArticle: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/addItemToArticle',
      params,
    });
  mall_template_itemSyncRecommend: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/itemSyncRecommend',
      params,
    });
  mall_template_itemSyncHide: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/itemSyncHide',
      params,
    });
  mall_template_itemSyncDelete: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/itemSyncDelete',
      params,
    });
  mall_template_itemSyncRank: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/itemSyncRank',
      params,
    });
  mall_template_getFilterTemplateList: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/getFilterTemplateList',
      params,
    });
  mall_template_templateItemIsAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/mall_template/templateItemIsAdd',
      params,
    });
  mall_set_notice: (params: any) => ng.IPromise<any> = params => {
    const obj = {
      notice: JSON.stringify(params.notice),
    };
    return this.seePost({
      url: 'api/event/mallNoticeSet',
      params: obj,
    });
  };

  kol_act_list: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/actList',
      params,
    });

  kol_act_delect: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/actDel',
      params,
    });

  kol_act_offline: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/actOffLine',
      params,
    });

  kol_act_actSeckillItemGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/actSeckillItemGet',
      params,
    });

  kol_act_actSeckillAdd: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/actSeckillAdd',
      params,
    });

  kol_act_actSeckillGet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/actSeckillGet',
      params,
    });

  kol_act_actSeckillSet: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/kol_act/actSeckillSet',
      params,
    });

  mall_get_notice = () => this.seeGet({ url: 'api/event/mallNoticeGet' });
  modal_modify_mall_list = params =>
    this.seePost({ url: 'api/mall_template/mallSet', params });

  api_1688_cloudprod_list: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/cloudprod/list',
      params,
    });

  api_1688_cloudprod_switchstatus: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/cloudprod/switchstatus',
      params,
    });

  api_1688_cloudprod_mother_link: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/cloudprod/mother/link',
      params,
    });

  api_1688_cloudprod_mother_unlink: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/cloudprod/mother/unlink',
      params,
    });

  api_1688_cloudprod_adjustprice: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/cloudprod/adjustprice',
      params,
    });

  api_1688_cloudprod_listKw: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/cloudprod/listKw',
      params,
    });

  api_fms_accountProfile: () => ng.IPromise<any> = () =>
    this.seePost({
      url: 'api/ng/fms/accountProfile',
    });

  api_fms_bill_export: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/bill/export',
    });

  api_fms_bill_list: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/bill/list',
      params,
    });

  api_fms_bill_listAll: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/bill/listAll',
      params,
    });

  api_fms_finance_bill_audit: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/finance/bill/audit',
      params,
    });

  api_fms_finance_bill_edit: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/finance/bill/edit',
    });

  api_fms_finance_withdrawal_count: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/finance/withdrawal/count',
      params,
    });

  api_fms_finance_withdrawal_list: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/finance/withdrawal/list',
      params,
    });

  api_fms_withdrawal_apply_add: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/fms/withdrawals/application/add',
      params,
    });

  api_fms_withdrawal_apply_query: () => ng.IPromise<any> = () =>
    this.seePost({
      url: 'api/ng/fms/withdrawals/application/query',
    });

  api_fms_withdrawal_survey_query: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: '/api/ng/fms/withdrawals/survey/query',
    });

  api_fms_withdrawal_review: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: '/api/ng/fms/withdrawals/review',
      params,
    });
  api_fms_billGenerate_accountFix: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: '/api/ng/fms/billGenerate/account-fix',
      params,
      isHandleFail: false,
    });

  api_common_shortmessage: () => ng.IPromise<any> = () =>
    this.seeGet({
      url: '/api/ng/common/verificationcode/shortmessage',
    });

  wms_stock_changeList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/wms/stock/changeList',
      params,
    });

  wms_stock_detail: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/wms/stock/detail',
      params,
    });

  wms_outboundOrder_create: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/ng/wms/push/exWarehouseOrder/create',
      params,
    });

  wms_outboundOrder_batchCreate: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/wms/push/exWarehouseOrder/batchCreate',
      params,
    });

  wms_outboundOrder_batchCreate_progress: (
    params: any,
  ) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/ng/wms/push/exWarehouseOrder/batchCreate/progress',
      params,
    });

  wms_outboundOrder_list: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/wms/exWarehouseOrder/list',
      params,
    });

  wms_outboundOrder_detail: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/ng/wms/exWarehouseOrder/detail',
      params,
    });

  xiaoe_e_get_distribution_list: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaoe/e_get_distribution_list',
      params,
    });

  xiaoe_e_get_distribution_url: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaoe/e_get_distribution_url',
      params,
    });

  xiaoe_e_get_list_dis: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaoe/e_get_list_dis',
      params,
    });

  xiaoe_e_get_distribution_result: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaoe/e_get_distribution_result',
      params,
    });

  xiaoe_e_get_del_info: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaoe/e_get_del_info',
      params,
    });

  xiaoe_e_get_set_margin_scale: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaoe/e_get_set_margin_scale',
      params,
    });

  weixin_getTplTypeOptions: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/weixin/getTemplateTypeList',
      params,
    });

  weixin_getList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/getList',
      params,
    });

  weixin_updateInfo: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/updateInfo',
      params,
    });

  weixin_updateJsonConfig: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/updateJsonConfig',
      params,
    });

  weixin_updateServiceConfig: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/updateServiceConfig',
      params,
    });

  weixin_setDomain: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/setDomain',
      params,
    });

  weixin_codePost: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/codePost',
      params,
    });

  weixin_codeSubmit: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/codeSubmit',
      params,
    });

  weixin_codeSubmitView: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/codeSubmitView',
      params,
    });

  weixin_codeReleate: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/codeReleate',
      params,
    });

  weixin_resestAudit: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/resestAudit',
      params,
    });

  weixin_codeReleateBatch: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/weixin/xiaochengxu/release',
      params,
    });

  // 当前的微信小程序模板版本信息
  weixin_templateInfo: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/ng/weixin/xiaochengxu/templateInfo',
      params,
    });

  // 单个店铺代码回滚
  weixin_codeRollbackBatch: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/weixin/xiaochengxu/revert',
      params,
    });
  weixin_BatchProgress: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/weixin/xiaochengxu/progress',
      params,
    });

  weixin_codeSubmitViewBatch: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/codeSubmitViewBatch',
      params,
    });

  weixin_getTemplateInfo: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/getTemplateInfo',
      params,
    });

  weixin_getTemplateList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/getTemplateList',
      params,
    });

  weixin_addTemplateInfo: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/addTemplateInfo',
      params,
    });

  weixin_setTemplateInfo: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/setTemplateInfo',
      params,
    });

  weixin_bindTester: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/bindTester',
      params,
    });

  weixin_unBindTester: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/unBindTester',
      params,
    });

  weixin_getBindList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/getBindList',
      params,
    });

  weixin_deleteTester: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/weixin/deleteTester',
      params,
    });

  weixin_getOneStepList: (params?: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: 'api/weixin/getOneStepList',
      params,
    });

  weixin_codePostBatch: (params?: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/weixin/xiaochengxu/postcode',
      params,
    });

  weixin_codeSubmitBatch: (params?: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/weixin/xiaochengxu/submitaudit',
      params,
    });

  weixin_taskStatus: (params?: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/weixin/xiaochengxu/status',
      params,
    });

  shop_getApplyCheckConfig: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/getApplyCheckConfig',
      params,
    });

  shop_newApply: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/newApply',
      params,
    });
  shop_confirmApply: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/confirmApply',
      params,
    });
  shop_delApply: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/delApply',
      params,
    });
  shop_reApply: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/reApply',
      params,
    });
  shop_getPayInfo: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/getPayInfo',
      params,
    });
  shop_editPayInfo: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/editPayInfo',
      params,
    });
  shop_getList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/getList',
      params,
    });
  shop_getInfoById: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/getInfo',
      params,
    });
  shop_getApplyList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/getApplyList',
      params,
    });
  shop_doApply: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/doApply',
      params,
    });
  shop_getUrlWeinxinAuth: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/getUrlWeinxinAuth',
      params,
    });
  shop_checkCurrentStatus: (
    params: any,
    isHanldeAuthRedirect?: boolean,
  ) => ng.IPromise<any> = (params, isHanldeAuthRedirect = true) =>
    this.seeGet({
      url: 'api/xiaodianpu/checkCurrentStatus',
      params,
      cache: true,
      isHanldeAuthRedirect,
    });
  shop_getXdpShopUrlForBackend: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: 'api/xiaodianpu/getXdpShopUrlForBackend',
      params,
      cache: true,
    });

  batchModifyItemInfo: (
    options: {
      data: any;
      action_type: string;
    },
  ) => ng.IPromise<any> = options => {
    return this.$http({
      method: 'POST',
      url: '/api/rule/batchModifyItemInfo',
      data: this.$httpParamSerializerJQLike(options.data),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'arraybuffer',
    }).then(this.batchSuccess, this.batchFail);
  };

  /***************************************************/
  /******************** 小电铺概况 *********************/
  /***************************************************/
  shop_getHeader = () => this.seeGet({ url: 'api/xiaodianpu/getHeader' });
  shop_getNewData = () => this.seeGet({ url: 'api/xiaodianpu/getNewData' });
  shop_getProfit = () => this.seeGet({ url: 'api/xiaodianpu/getProfit' });
  shop_getLastUpdated = () =>
    this.seeGet({ url: 'api/xiaodianpu/getLastUpdated' });
  shop_getTradeDistribution = () =>
    this.seeGet({ url: 'api/xiaodianpu/getTradeDistribution' });
  shop_getXiaoDianPuUser = (params?: any) =>
    this.seeGet({ url: 'api/xiaodianpu/getXiaoDianPuUser', params });
  shop_getXiaoDianPuData = () =>
    this.seeGet({ url: 'api/xiaodianpu/getXiaoDianPuData' });
  shop_getSupplyItemData = () =>
    this.seeGet({ url: 'api/xiaodianpu/getSupplyItemData' });
  shop_getTendencyData = () =>
    this.seeGet({ url: '/api/xiaodianpu/getTendencyData' });
  shop_getRecentArticle = () =>
    this.seeGet({ url: 'api/xiaodianpu/getRecentArticle' });

  shop_getXdpBanner = (params?: any) =>
    this.seeGet({ url: '/api/xiaodianpu/getXdpBanner', params });
  shop_addAndUpdateXdpBanner = params =>
    this.seePost({
      url: '/api/xiaodianpu/addAndUpdateXdpBanner',
      params,
    });
  shop_getArticleList = params =>
    this.seePost({
      url: '/api/xiaodianpu/getArticleList',
      params,
    });
  shop_getXdpInfo = (params?: any) =>
    this.seeGet({ url: '/api/xiaodianpu/getXdpInfo', params });

  shop_operate_addActBanner = (params: any) =>
    this.seePost({ url: '/api/xiaodianpu/addActBanner', params });
  shop_operate_updateActBanner = (params: any) =>
    this.seePost({ url: '/api/xiaodianpu/updateActBanner', params });
  shop_operate_addAndUpdateActBanner = (params: any) =>
    this.seePost({ url: '/api/xiaodianpu/addAndUpdateActBanner', params });
  shop_operate_getActBanner = params =>
    this.seePost({ url: '/api/xiaodianpu/getActBanner', params });
  shop_operate_delActBanner = params =>
    this.seePost({ url: '/api/xiaodianpu/delActBanner', params });
  shop_operate_sortActBanner = params =>
    this.seePost({ url: '/api/xiaodianpu/sortActBanner', params });

  ////////////////////////////////
  /// 商品分组
  ////////////////////////////////
  // 内部-添加所有商品到「手动分组」
  goods_group_addAllCommodityToGroup = params =>
    this.seePost({
      url: '/api/ng/cgs/commodity/add-all-commodity-in-category',
      params,
    });
  // 分组列表
  goods_group_allCommodityGroups = params =>
    this.seePost({ url: '/api/ng/cgs/getAllCommodityGroups', params });
  // 往分组添加商品
  goods_group_addCommodityToGroup = params =>
    this.seePost({ url: '/api/ng/cgs/addCommodityInCategory', params });
  // 移除分组内的商品
  goods_group_delCommodityInGroup = params =>
    this.seePost({ url: '/api/ng/cgs/removeCommodityInCategory', params });
  // 调整分组内商品顺序
  goods_group_sortCommodityInGroup = params =>
    this.seePost({ url: '/api/ng/cgs/sortCommodity', params });

  // 当前KOL拥有的品牌列表
  goods_group_brandList = (params?: any) =>
    this.seeGet({ url: '/api/ng/cgs/commodity/brand/list', params });
  // 当前KOL拥有的品类列表
  goods_group_categoryList = (params?: any) =>
    this.seeGet({ url: '/api/ng/cgs/commodity/category/list', params });
  // 添加分组商品时的商品列表&搜索
  goods_group_commoditySearch = (params?: any) =>
    this.seeGet({ url: '/api/ng/cgs/commodity/search', params });
  // 某分组的商品列表
  goods_group_commodityListInGroup = (params?: any) =>
    this.seeGet({ url: '/api/ng/cgs/group/commodity/list', params });

  // 创建分组
  goods_group_addGroup = (json: any) =>
    this.seePost({ url: '/api/ng/cgs/category/add', json });
  // 条件范围内是否存在商品
  goods_group_existGoodsForCond = (params: any) =>
    this.seeGet({ url: '/api/ng/cgs/category/commodity', params });
  // 删除分组
  goods_group_delGroup = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/category/delete', params });
  // 更新分组名称
  goods_group_updateGroup = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/category/update', params });
  // 分组是否在前端配置
  goods_group_isGroupUsed = (params: any) =>
    this.seeGet({ url: '/api/ng/cgs/category/used', params });

  ////// 配置分组
  // 分组列表
  goods_group_config_listGroup4Add = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/mall/category/list4add', params });
  goods_group_config_addGroup = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/mall/category/add', params });
  goods_group_config_delGroup = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/mall/category/del', params });
  goods_group_config_listGroup = (params?: any) =>
    this.seePost({ url: '/api/ng/cgs/mall/category/list', params });
  goods_group_conifg_sortGroup = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/mall/category/sort', params });
  goods_group_conifg_groupDetail = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/mall/category/info', params });
  // 修改默认名字
  goods_group_conifg_updateName = (params: any) =>
    this.seePost({ url: '/api/ng/cgs/category/config', params });
  // 获取默认名字
  goods_group_conifg_getName = (params?: any) =>
    this.seeGet({ url: '/api/ng/cgs/category/config/name', params });

  //////////////////////////////////////////////////////////////////
  // 商品主题库
  ///////////////////////////////////////////////////////////////
  // 添加主题
  goods_theme_addGoodsTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/addCommodityTopic', ...obj });
  // 添加主题到仓库
  goods_theme_goOffGoodsTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/addTopicToStore', ...obj });
  // 编辑主题
  goods_theme_updateGoodsTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/editCommodityTopic', ...obj });
  // 获取主题列表
  goods_theme_listGoodsTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/getCommodityTopicList', ...obj });
  // 删除主题
  goods_theme_delGoodsTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/removeCommodityTopic', ...obj });
  // 排序主题
  goods_theme_sortGoodsTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/sortCommodityTopic', ...obj });
  // 控制主题是否显示
  goods_theme_toggleGoodsTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/switchCommodityTopicStatus', ...obj });

  // 添加商品
  goods_theme_appendGoods = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/item/add', ...obj });
  // 获取文章列表
  goods_theme_getArticleList = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/item/articleList', ...obj });
  // 删除商品
  goods_theme_removeGoods = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/item/delete', ...obj });
  // 获取热门单品库商品
  goods_theme_getHotGoods = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/item/hotItem', ...obj });
  // 获取主题内所有商品
  goods_theme_getGoodsInTheme = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/item/list', ...obj });
  // 编辑商品种草文案
  goods_theme_updateAdCopy = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/item/update', ...obj });
  // 主题信息
  goods_theme_getThemeInfo = (obj: any) =>
    this.seePost({ url: '/api/ng/cts/item/detail', ...obj });

  // 发布文章
  goods_theme_createArticle = (obj: any) =>
    this.seePost({ url: '/api/kol_mgr/articleAdd', ...obj });
  // 获取kol文章列表
  goods_theme_getKolArticleList = (obj: any) =>
    this.seePost({ url: '/api/kol_mgr/articleList', ...obj });
  // 将主题添加到文章
  goods_theme_appendThemeToArticle = (obj: any) =>
    this.seePost({ url: '/api/kol_mgr/addTopicToArticle', ...obj });
  // 将主题添加到小店铺/仓库
  goods_theme_appendThemeToOff = (obj: any) =>
    this.seePost({ url: '/api/kol_mgr/addTopicToXdp', ...obj });
  // 将商品添加到仓库/小店铺
  goods_theme_addGoodsItemToXDPOrOff = (obj: any) =>
    this.seePost({ url: '/api/kol_mgr/addDistributionItem', ...obj });
  // 商品添加到文章
  goods_theme_addItemToArticle = (obj: any) =>
    this.seePost({ url: 'api/kol_mgr/addItemToArticle', ...obj });

  // 内容电商-文章商品-小程序二维码等信息
  articel_content_itemLink = (obj: any) =>
    this.seeGet({ url: '/api/ng/cts/article/content/itemLink', ...obj });
  /**
   * cds 供销管理
   */
  // 申请商品分销
  cds_applyCommodityDistribution = (params: any) =>
    this.seePost({ url: '/api/ng/cds/applyCommodityDistribution', params });
  // 审核分销申请
  cds_auditDistributionApply = (params: any) =>
    this.seePost({ url: '/api/ng/cds/agreeDistributionApply', params });
  // 编辑商品分销申请（调价）
  cds_editCommodityDistributionApply = (params: any) =>
    this.seePost({ url: '/api/ng/cds/editCommodityDistributionApply', params });
  // 退出分销
  cds_exitDistribution = (params: any) =>
    this.seePost({ url: '/api/ng/cds/exitDistribution', params });
  // 分销（调价）商品申请列表
  cds_getDistributionApplyList = (params: any) =>
    this.seePost({ url: '/api/ng/cds/getDistributionApplyList', params });
  // 供销概况
  cds_supplyProfile = (params: any) =>
    this.seePost({ url: '/api/ng/cds/supplyProfile', params });
  cds_commodityDistributeDetail = (params: any) =>
    this.seePost({ url: '/api/ng/cds/commodityDistributeDetail', params });
  cds_refuseDistributionApply = (params: any) =>
    this.seePost({ url: '/api/ng/cds/refuseDistributionApply', params });

  // 充值
  recharge_redirect = (params: any) =>
    this.seeGet({
      url: '/api/ng/recharge/recharge',
      params,
      isHandleFail: false,
    });
  recharge_list = (params: any) =>
    this.seeGet({ url: '/api/ng/recharge/list', params });
  recharge_listAll = (params: any) =>
    this.seeGet({ url: '/api/ng/recharge/listAll', params });
  recharge_count = (params: any) =>
    this.seeGet({ url: '/api/ng/recharge/count', params });
  recharge_alipay_return = (params: any) =>
    this.seeGet({ url: '/api/ng/recharge/alipay/return', params });

  reRecharge_redirect = (params: any) =>
    this.seeGet({
      url: '/api/ng/recharge/reRecharge',
      params,
      isHandleFail: false,
    });
  seedata_recharge_userinfo = () =>
    this.seeGet({ url: '/api/ng/seedata/recharge/userInfo' });
  seedata_recharge_redirect = (params: any) =>
    this.seeGet({
      url: '/api/ng/seedata/recharge/recharge',
      params,
      isHandleFail: false,
    });
  seedata_recharge_alipay_return = (params: any) =>
    this.seeGet({ url: '/api/ng/seedata/recharge/alipay/return', params });
  // seedata_free_90_days = (json: any) =>
  //   this.seePost({ url: '/api/ng/seedata/free90Days', json });
  seedata_free_90_days = () =>
    this.seePost({ url: '/api/ng/seedata/free90Days' });
  seedata_authorized_vip = (params: any) =>
    this.seeGet({ url: '/api/ng/seedata/authorizedVIP', params });

  ////////////////////////////////////////
  // 商品链接
  ///////////////////////////////////////
  // 拼团商品
  pathAQrUrl_getGroupon = (params: any) =>
    this.seeGet({ url: '/api/ng/pathAQrUrl/getGroupon', params });
  // kol管理，单品
  pathAQrUrl_getCollectionItem = (params: any) =>
    this.seeGet({ url: '/api/ng/pathAQrUrl/getCollectionItem', params });
  // kol管理- 合集 / 商城
  pathAQrUrl_getKolCollection = (params: any) =>
    this.seeGet({ url: '/api/ng/pathAQrUrl/getKolCollection', params });
  // 秒杀商品
  pathAQrUrl_getSeckill = (params: any) =>
    this.seeGet({ url: '/api/ng/pathAQrUrl/getSeckill', params });

  // 有赞商品导入
  youzan_product_check = (params: any) =>
    this.seePost({ url: '/api/ng/youzan/product/check', params });
  youzan_product_localList = (params: any) =>
    this.seePost({ url: '/api/ng/youzan/product/localList', params });
  youzan_product_onlineList = (params: any) =>
    this.seePost({ url: '/api/ng/youzan/product/onlineList', params });
  youzan_authorization_list = (params?: any) =>
    this.seeGet({ url: '/api/ng/youzan/authorization/list', params });
  youzan_product_progress = (params?: any) =>
    this.seePost({ url: '/api/ng/youzan/product/process', params });
  youzan_product_add = (params?: any) =>
    this.seePost({ url: '/api/ng/youzan/product/add', params });
  youzan_product_getProduct = (params?: any) =>
    this.seePost({ url: '/api/ng/youzan/product/getProduct', params });
  youzan_product_updateClass = (params?: any) =>
    this.seePost({ url: '/api/ng/youzan/product/updateClass', params });
  youzan_product_addAll = (params?: any) =>
    this.seePost({ url: '/api/ng/youzan/product/addAll', params });
  youzan_product_updateProductAttr = (params: any) =>
    this.seePost({ url: '/api/ng/youzan/product/updateProductAttr', params });
  youzan_product_delete = (params: any) =>
    this.seePost({ url: '/api/ng/youzan/product/delete', params });
  youzan_product_classList = (params: any) =>
    this.seeGet({ url: '/api/ng/youzan/product/classList', params });

  // 福袋
  luckybag_getConfig = () => this.seeGet({ url: '/api/ng/luckybag/getConfig' });
  luckybag_config = (params: any) =>
    this.seePost({ url: '/api/ng/luckybag/config', params });
  // 抽奖
  luckydraw_list = (params: any) =>
    this.seeGet({ url: '/api/ng/luckydraw/list', params });
  luckydraw_detail = (params: any) =>
    this.seeGet({ url: '/api/ng/luckydraw/detail', params });
  luckydraw_add = (params: any) =>
    this.seePost({ url: '/api/ng/luckydraw/add', params });
  luckydraw_discard = (json: any) =>
    this.seePost({ url: '/api/ng/luckydraw/discard', json });

  xiaodianpu_searchXdp = (params: any) =>
    this.seeGet({ url: '/api/ng/xiaodianpu/searchXdp', params });

  get_queen_qrcode = (params: any) =>
    this.seeGet({ url: '/api/ng/weixin/get-qrcode-with-params', params });

  private batchSuccess: (res: any) => any = res => {
    if (
      res.headers()['content-type'].indexOf('application/vnd.ms-excel') === -1
    ) {
      let data = this.Utf8ArrayToStr(new Uint8Array(res.data));
      data = JSON.parse(data);
      if (data.result === 101) {
        this.$window.location.href = '/auth.html';
        this.Notification.dataError(data.msg);
        return this.$q.reject(data.msg);
      }
      this.Notification.dataError(data.msg);
      return this.$q.reject(data.msg);
    }
    return res.data;
  };

  private batchFail: (res: any) => any = res => {
    if (res.status === 504) {
      this.Notification.dataError('请检查网络连接');
      return this.$q.reject('请检查网络连接');
    }
    this.Notification.serverError();
    return this.$q.reject();
  };

  private redirectToLogin: () => void = () => {
    const seller_from = ReportService.getReferSellerFrom();
    this.$window.location.href = `/auth.html#!/entry${
      seller_from ? `?seller_from=${seller_from}` : ''
    }`;
  };

  private success: (response: any) => any = response => {
    if (response.data.result === 1) {
      return response.data;
    }
    return this.$q.reject(response);
  };

  private fail: (
    isHandleFail: boolean,
    isHanldeAuthRedirect: boolean,
  ) => (reason: any) => void = (
    isHandleFail,
    isHanldeAuthRedirect,
  ) => response => {
    const errortext = codeMessage[response.status] || response.statusText;

    if (response.status >= 200 && response.status < 300) {
      if (
        Object.hasOwnProperty.call(response.data, 'result') &&
        response.data.result === 101
      ) {
        if (isHanldeAuthRedirect) {
          this.redirectToLogin();
        }
      } else {
        if (isHandleFail) {
          this.nzNotification.error(
            // `请求错误 ${response.config.url}`,
            '提示',
            get(response, 'data.msg', JSON.stringify(response.data)),
          );
        }
      }
      return this.$q.reject(response.data);
    }

    this.nzNotification.error(
      // `请求错误 ${response.status}: ${response.config.url}`,
      '提示',
      errortext,
    );

    if (response.status === 401 && isHanldeAuthRedirect) {
      this.redirectToLogin();
    }

    const error = new Error(errortext);
    error.name = response.status;
    error['response'] = response;
    return this.$q.reject(error);
  };

  private seeGet: (
    options: {
      url: string;
      params?: any;
      cache?: boolean;
      isHandleFail?: boolean;
      isHanldeAuthRedirect?: boolean;
    },
  ) => ng.IPromise<any> = ({
    url,
    params,
    cache = false,
    isHandleFail = true,
    isHanldeAuthRedirect = true,
  }) =>
    this.$http
      .get(url, { params, cache })
      .then(this.success)
      .catch(this.fail(isHandleFail, isHanldeAuthRedirect));

  private seePost: (
    options: {
      url: string;
      params?: any;
      json?: any;
      cache?: boolean;
      isHandleFail?: boolean;
      isHanldeAuthRedirect?: boolean;
      noSpinner?: boolean;
    },
  ) => ng.IPromise<any> = ({
    json,
    url,
    params,
    cache = false,
    isHandleFail = true,
    noSpinner = false,
    isHanldeAuthRedirect = true,
  }) => {
    const headers = {};
    /*
      为了不影响原来逻辑，表单参数增加 json 配置，
      此时会把该对象转为 JSON 字符串然后用作请求正文
       */
    let requestParams;
    if (json) {
      requestParams = JSON.stringify(json);
      headers['Content-Type'] = 'application/json';
    } else {
      requestParams = this.$httpParamSerializerJQLike(params);
    }
    const config = { cache, headers, _noSpinner: noSpinner };
    return this.$http
      .post(url, requestParams, config)
      .then(this.success)
      .catch(this.fail(isHandleFail, isHanldeAuthRedirect));
  };

  // 判断跳转状态
  private doCheckShopStatus: (params: any) => any = params => {
    const is_new_brand = this.$cookies.get('seller_privilege') === '30' ? 1 : 0;
    if (is_new_brand === 1) {
      return this.shop_checkCurrentStatus({}).then(res => {
        const data = res.data;
        let show_type = 0;
        if (Number(data.xdp_id) === 0) {
          // 没有
          show_type = 1;
        } else if (
          Number(data.xdp_id) > 0 &&
          Number(data.manager_status) === 10
        ) {
          // 审核中
          show_type = 2;
        } else if (
          Number(data.xdp_id) > 0 &&
          Number(data.manager_status) === 20
        ) {
          // 审核失败
          show_type = 4;
        } else if (params.status === 'check_update') {
          // 显示升级
          if (Number(data.type) <= 2) {
            show_type = 3;
          }
        }
        $('.lead-info,.lead-cover').css({ opacity: '0.5', 'z-index': '1000' });
        $('.lead-info').css({ opacity: '1' });
        if (show_type > 0) {
          const url =
            '/shop/guide?xdp_data=' +
            JSON.stringify(data) +
            '&show_type=' +
            show_type +
            '&force_active_tab=' +
            encodeURI(params.url);
          this.$location.url(url);
          $('.lead-info,.lead-cover').css({ opacity: '0', 'z-index': '-1' });
          return false;
        }
        return true;
      });
    }
    return this.$q.resolve(true);
  };

  // 生成token，根据params的key值排序，然后md5
  private getCreateToken: (params: any) => any = params => {
    // 获取key列表
    let list_key = [];
    forEach(params, (value, key) => {
      if (key !== 'token') {
        list_key.push(key);
      }
    });
    list_key = list_key.sort();

    // 字符串相连
    let token: string = 'see' + moment().format('YYYYMMDD');
    forEach(list_key, (value: any) => {
      token += params[value];
    });
    return md5(token);
  };

  /**
   * 生成see_api_sign验证码，按参数排序，然后md5参数值
   * 如果后台修改成post后，只需要在seePost接口全量接入
   * 所以任何接口不能用 see_api_sign 和 see_api_time参数，否则会被覆盖
   */
  private getSeeApiSign: (params: any) => any = (params = []) => {
    params.see_api_time = moment().format('YYYYMMDDHHMMSS');
    let list_key = [];
    forEach(params, (value, key) => {
      if (typeof value !== 'undefined' && String(key) !== 'see_api_sign') {
        list_key.push(key);
      }
    });
    list_key = list_key.sort();

    // 先写死
    let token: string = 'SeeTest001#';
    forEach(list_key, (value: any) => {
      token += params[value];
    });
    params.see_api_sign = md5(token);
    return params;
  };

  // 生成url验证
  private do_urlSignGet: (url: any) => any = url => {
    if (url.indexOf('/SEETOKEN') >= 0) {
      return '';
    }
    const realUrl = this.getUrlPath(url);
    const token: string = 'SeeTest001#';
    // 先直接固定token，后续会量开放时，加上当前登录ID，防止链接直接被复制，可以从前端完全避免权限问题
    const sign = md5(token + realUrl);
    return '/SEETOKEN' + sign;
  };

  // 验证url
  private do_urlSignCheck: (url: any) => any = url => {
    const realUrl = this.getUrlPath(url);
    const arr = realUrl.split('/');
    const sign = arr[1];
    let new_url = '';
    for (let i = 2; i < arr.length; i += 1) {
      new_url += '/' + arr[i];
    }
    const token: string = 'SeeTest001#';
    const check_sign = 'SEETOKEN' + md5(token + new_url);
    if (check_sign !== sign) {
      return false;
    }
    return true;
  };

  private getUrlPath(url: string) {
    const arr = url.split('?');
    return arr[0];
  }

  // uint8Array 转 中文 不出现乱码
  private Utf8ArrayToStr: (array: any) => any = array => {
    let out;
    let i;
    let len;
    let c;
    let char2;
    let char3;

    out = '';
    len = array.length;
    i = 0;
    while (i < len) {
      c = array[i];
      i += 1;
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12:
        case 13:
          // 110x xxxx
          // 10xx xxxx
          char2 = array[i];
          i += 1;
          out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i];
          i += 1;
          char3 = array[i];
          i += 1;
          out += String.fromCharCode(
            ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0),
          );
          break;
      }
    }
    return out;
  };

  // 批量复制相关接口
  ng_batchCopy_add: (json: any) => ng.IPromise<any> = json =>
    this.seePost({
      url: '/api/ng/batchCopy/add',
      json,
    });

  ng_batchCopy_listTask: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/batchCopy/listTask',
      params,
    });
  // 日志列表
  ng_batchCopy_listBatch: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/batchCopy/listBatch',
      params,
    });
  ng_batchCopy_reAdd: (batchId: string) => ng.IPromise<any> = batchId =>
    this.seePost({
      url: `/api/ng/batchCopy/reAdd?batchId=${batchId}`,
    });
  ng_batchCopy_setSeckillTime: (json: any) => ng.IPromise<any> = json =>
    this.seePost({
      url: '/api/ng/seckill/activity/setSeckillTime',
      json,
    });

  // 生成秒杀活动小程序码
  ng_seckill_activity_setWxacodeUrl: (json: any) => ng.IPromise<any> = json =>
    this.seePost({
      url: '/api/ng/seckill/activity/setWxacodeUrl',
      json,
    });

  // 获取收藏夹所有商品id
  data_api_getCollectionItem: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/data_api/getCollectionItem',
      params,
    });

  // 添加用户反馈意见
  addFeedback: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: '/api/ng/feedback/add',
      params,
    });

  // 获取用户反馈意见列表
  getFeedbackList: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: '/api/ng/feedback/query',
      params,
    });

  // 导出反馈列表
  exportFeedback: (params: any) => ng.IPromise<any> = params =>
    this.seeGet({
      url: '/api/ng/feedback/user-feedback-export',
      params,
    });

  addDataUrls: (params: any) => ng.IPromise<any> = params =>
    this.seePost({
      url: '/api/ng/data/addUrl',
      params,
    });
}
