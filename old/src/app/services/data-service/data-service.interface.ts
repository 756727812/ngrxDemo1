import { Params } from '@angular/router';

/**
 * 定义接口名称
 */
/* 安全计划落地
 * 1、【未上线】所有接口修改为POST；(未上，因怕对测试造成麻烦)
 2、【未上线】所有接口添加固定参数，并且按参数排序，然后md5加密参数值；(未上，因怕对测试造成麻烦)
 3、【已上线】目前未登录情况 auth_login、auth_logout、auth_registerxxx等接口已添加验证
 4、【已上线】其他接口选加；(商品删除\下线\物流删除等接口，后面会标注//已添加验证)）
 */

export interface ICommonResponse {
  result: number;
  msg: string;
  data?: any;
}

export interface IDataService {
  articleGrouponAdd: (
    params: {
      grouponIds: number[];
      articleId: number;
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  articleGrouponList: (
    params: {
      articleId: number;
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  pathAQrUrlArticleGetGroupon: (
    params: {
      itemId: number;
      articleId: number;
      kolId: number;
      platformId: number;
      collectionId: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  switchSelectionCenter: (
    params: {
      id: number;
      topic_item_flag?: number;
      hot_item_flag?: number;
    },
  ) => ng.IPromise<ICommonResponse>;

  xiaodianpu_updateInContact: (params: any) => ng.IPromise<any>;
  xiaodianpu_updateBtnApply: (params: any) => ng.IPromise<any>;
  xiaodianpu_updateBtnSearch: (params: any) => ng.IPromise<any>;
  xiaodianpu_addExplosionItem: (
    params: { item_id: number; kol_id?: number },
  ) => ng.IPromise<any>;
  xiaodianpu_getItemList: (
    params: {
      type: 1 | 2 | 3;
      page: number;
      keyword?: string;
      kol_id?: number;
    },
  ) => ng.IPromise<any>;
  xiaodianpu_updateExplosionITitle: (
    params: {
      article_id: number;
      title: string;
      kol_id?: number;
    },
  ) => ng.IPromise<any>;
  xiaodianpu_delExplosionItem: (
    params: { item_id: number; kol_id?: number },
  ) => ng.IPromise<any>;
  xiaodianpu_sortExplosionItem: (
    params: { id_list: string; kol_id?: number },
  ) => ng.IPromise<any>;
  xiaodianpu_getExplosionItem: (
    params: { kol_id?: number },
  ) => ng.IPromise<any>;
  xiaodianpu_getList: (
    params: { page?: number; page_size?: number },
  ) => ng.IPromise<any>;
  xiaodianpu_getTradeDistribution: () => ng.IPromise<any>;
  xiaodianpu_getLastUpdated: () => ng.IPromise<any>;
  xiaodianpu_getProfit: () => ng.IPromise<any>;
  xiaodianpu_getNewData: () => ng.IPromise<any>;
  xiaodianpu_getHeader: () => ng.IPromise<any>;
  xiaodianpu_reApply: (params: any) => ng.IPromise<any>;
  xiaodianpu_delApply: (params: any) => ng.IPromise<any>;
  xiaodianpu_applyAuth: (params: any) => ng.IPromise<any>;
  xiaodianpu_auth: (params: any) => ng.IPromise<any>;
  xiaodianpu_getAuthResult: (params: any) => ng.IPromise<any>;
  xiaodianpu_getDetailAuthInfo: (params: any) => ng.IPromise<any>;

  auth_resetPasswdStep1: (params: any) => ng.IPromise<any>;
  auth_resetPasswdStep2: (params: any) => ng.IPromise<any>;
  seller_saveWeixinInfo: (params: any) => ng.IPromise<any>;
  authv2_addAndUpdateInfo: (params: any) => ng.IPromise<any>;
  authv2_registerXiaodianpu: (params: any) => ng.IPromise<any>;
  authv2_bindSellerWechat: (params: any) => ng.IPromise<any>;
  authv2_sendSmsCode: (params: any) => ng.IPromise<any>;
  authv2_bindSellerMobile: (params: any) => ng.IPromise<any>;
  authv2_getAccountTypeList: (params: any) => ng.IPromise<any>;
  authv2_getFromWhereList: (params: any) => ng.IPromise<any>;
  getGlobalParams: (params: any) => ng.IPromise<any>;
  da_sentiment_item_sub_select: (params: any) => ng.IPromise<any>;
  user_getAllSeller: (params?: any) => ng.IPromise<any>;
  user_getAllKOL: () => ng.IPromise<any>;
  user_updateWechatId: (params: any) => ng.IPromise<any>;
  user_getC2CUser: () => ng.IPromise<any>;
  item_getItemList: (params: any) => ng.IPromise<any>;
  CommonData_getConfigLocation: () => ng.IPromise<any>;
  CommonData_getConfigArea: () => ng.IPromise<any>;
  crawler_getPlatform: (params?: any) => ng.IPromise<any>;
  crawler_getCatalog: () => ng.IPromise<any>;
  crawler_getMaterialList: (params: any) => ng.IPromise<any>;
  crawler_getHotList: (params: any, type: string) => ng.IPromise<any>;
  crawler_getFavoriteList: (params: any) => ng.IPromise<any>;
  crawler_addToFavoriteList: (params: any) => ng.IPromise<any>;
  crawler_removeFavoriteItem: (params: any) => ng.IPromise<any>;
  crawler_add_new_required: (params: any) => ng.IPromise<any>;
  crawler_get_new_required: (params: any) => ng.IPromise<any>;
  crawler_itemHide: (params: any) => ng.IPromise<any>;
  item_getItemTopRank: (params: any) => ng.IPromise<any>;
  item_itemAddList: (params: any) => ng.IPromise<any>;
  item_itemHide: (params: any) => ng.IPromise<any>;
  item_notice_getList: (params: any) => ng.IPromise<any>;
  item_notice_noticeAdd: (params: any) => ng.IPromise<any>;
  item_notice_noticeSet: (params: any) => ng.IPromise<any>;
  item_notice_noticeOnline: (params: any) => ng.IPromise<any>;
  seller_getSellerDetail: (cache?: boolean) => ng.IPromise<any>;
  seller_getSellerDetailv2: (cache?: boolean) => ng.IPromise<any>;
  third_api_getPlatformList: () => ng.IPromise<any>;
  third_api_addItemBySpuIds: (params: any) => ng.IPromise<any>;
  thired_api_addItemWithPython: (params: any) => ng.IPromise<any>;
  thired_api_getConfigAdd: (params: any) => ng.IPromise<any>;
  express_getList: (params: any) => ng.IPromise<any>;
  express_updateTop: (params: any) => ng.IPromise<any>;
  express_getItem: (params: any) => ng.IPromise<any>;
  express_updateItem: (params: any) => ng.IPromise<any>;
  express_deleteItem: (params: any) => ng.IPromise<any>;
  express_newItem: (params: any) => ng.IPromise<any>;
  express_getExTypeList: () => ng.IPromise<any>;
  express_getGoodsExpress: (params: any) => ng.IPromise<any>;
  express_getShipFee: (params: any) => ng.IPromise<any>;
  express_checkGoodsExpress: (params: any) => ng.IPromise<any>;
  order_getTransportList: () => ng.IPromise<any>;
  item_platformItemList: (params: any) => ng.IPromise<any>;
  wanted_uploadImgByUrl: (params: any) => ng.IPromise<any>;
  item_matchEditItem: (params: any) => ng.IPromise<any>;
  wanted_getItemDetail: (params: any) => ng.IPromise<any>;
  item_getClassInfo: (params: any) => ng.IPromise<any>;
  item_getItemSelectOption: () => ng.IPromise<any>;
  express_getExpressSelectOption: () => ng.IPromise<any>;
  item_class2List: (params?: any) => ng.IPromise<any>;
  item_class2Tree: (params?: any) => ng.IPromise<any>;
  circle_getCircleBySellerId: () => ng.IPromise<any>;
  product_mgr_getClassAttr: (params: any) => ng.IPromise<any>;
  product_mgr_getProduct: (params: any) => ng.IPromise<any>;
  item_readyToSell: (params: any) => ng.IPromise<any>;
  batch_readyToSell: (params: any) => ng.IPromise<any>;
  user_getXdpList: () => ng.IPromise<any>;
  user_createAccount: (params: any) => ng.IPromise<any>;
  user_updateSellerData: (params: any) => ng.IPromise<any>;
  user_updateKolData: (params: any) => ng.IPromise<any>;
  user_getAccountList: (params: any) => ng.IPromise<any>;
  user_getC2cList: (params: any) => ng.IPromise<any>;
  user_updateIMTips: (params: any) => ng.IPromise<any>;
  user_updateUserPriceTag: (params: any) => ng.IPromise<any>;
  seller_modifyUserTag: (params: any) => ng.IPromise<any>;
  user_modifySellerRole: (params: any) => ng.IPromise<any>;
  seller_updateIsSkipMainBody: (params: any) => ng.IPromise<any>;
  seller_updateBlockYuqing: (params: any) => ng.IPromise<any>;
  seller_updateBlockWeiqushi: (params: any) => ng.IPromise<any>;
  seller_updateBlockFashion: (params: any) => ng.IPromise<any>;
  seller_updateSellerNameForKol: (params: any) => ng.IPromise<any>;
  seller_updateBlockKolHome: (params: any) => ng.IPromise<any>;
  seller_updateBlockHotItem: (params: any) => ng.IPromise<any>;
  auth_logout: () => ng.IPromise<any>;
  orderv2_getOperateOrderCount: () => ng.IPromise<any>;
  item_deleteItem: (params: any) => ng.IPromise<any>;
  kol_mgr_addWarehouseItem: (params: any) => ng.IPromise<any>;
  user_getAccountDetail: (params: any) => ng.IPromise<any>;
  user_saveAccountDetail: (params: any) => ng.IPromise<any>;
  user_processAccountStatus: (params: any) => ng.IPromise<any>;
  event_getMyEventTheme: (params: any) => ng.IPromise<any>;
  circle_delCollection: (params: any) => ng.IPromise<any>;
  circle_delCircleThemeRelation: (params: any) => ng.IPromise<any>;
  circle_saveCircle: (params: any) => ng.IPromise<any>;
  orderv2_getSelledOrderByType: (params: any) => ng.IPromise<any>;
  orderv2_getSelledOrderCountByType: () => ng.IPromise<any>;
  datacenter_getItemStatData: (params: any) => ng.IPromise<any>;
  datacenter_getMonthTrendStatData: (params: any) => ng.IPromise<any>;
  datacenter_getTrendStatData: (params: any) => ng.IPromise<any>;
  datacenter_getTotalStatData: (params: any) => ng.IPromise<any>;
  item_getPgcItem: () => ng.IPromise<any>;
  financial_getAlreadyPayList: (params: any) => ng.IPromise<any>;
  pgc_settle_getPgcWithdrawList: (params: any) => ng.IPromise<any>;
  search_control_scoreUpdate: (params: any) => ng.IPromise<any>;
  financial_submitSearchBill: (params: any) => ng.IPromise<any>;
  financial_getNeedPayList: (params: any) => ng.IPromise<any>;
  financial_finishPayInBatch: (params: any) => ng.IPromise<any>;
  financial_finishPay: (params: any) => ng.IPromise<any>;
  financial_submitSearchOrder: (params: any) => ng.IPromise<any>;
  financial_getBillDetail: (params: any) => ng.IPromise<any>;
  updateFavourCount: (params: any) => ng.IPromise<any>;
  data_api_getFavourCount: (params: any) => ng.IPromise<any>;
  data_api_materialDelItem: (params: any) => ng.IPromise<any>;
  data_api_materialSelectItem: (params: any) => ng.IPromise<any>;
  data_api_materialSync: (params: any) => ng.IPromise<any>;
  data_api_materialTop: (params: any) => ng.IPromise<any>;
  data_api_materialNotes: (params: any) => ng.IPromise<any>;
  data_api_materialRecommend: (params: any) => ng.IPromise<any>;
  data_api_materialAddItems: (params: any) => ng.IPromise<any>;
  data_api_materialSupplyPrice: (params: any) => ng.IPromise<any>;
  data_api_materialFavorItemAdd: (params: any) => ng.IPromise<any>;
  data_api_materialFavorItemList: (params: any) => ng.IPromise<any>;
  data_api_materialHideItems: (params: any) => ng.IPromise<any>;
  data_api_materialGoodsStatus: (params: any) => ng.IPromise<any>;
  data_api_materialBrandList: (params: any) => ng.IPromise<any>;
  data_api_materialBrandAdd: (params: any) => ng.IPromise<any>;
  data_api_materialBrandGet: (params: any) => ng.IPromise<any>;
  data_api_materialBrandSet: (params: any) => ng.IPromise<any>;
  data_api_materialBrandSetNotes: (params: any) => ng.IPromise<any>;
  data_api_materialBrandDelete: (params: any) => ng.IPromise<any>;
  data_api_fashionView: (params: any) => ng.IPromise<any>;
  data_api_fashionFavor: (params: any) => ng.IPromise<any>;
  data_api_wechatKolContent: (params: any) => ng.IPromise<any>;
  data_api_wechatArticle: (params: any) => ng.IPromise<any>;
  kol_getKolOrderFilter: (params: any) => ng.IPromise<any>;
  kol_getKolOrderList: (params: any) => ng.IPromise<any>;
  kol_exportKolOrderList: (params: any) => ng.IPromise<any>;
  storage_configGet: () => ng.IPromise<any>;
  storage_spuList: (params: any) => ng.IPromise<any>;
  storage_spuAdd: (params: any) => ng.IPromise<any>;
  storage_spuGet: (params: any) => ng.IPromise<any>;
  storage_spuSet: (params: any) => ng.IPromise<any>;
  storage_spuDel: (params: any) => ng.IPromise<any>;
  storage_storeLog: (params: any) => ng.IPromise<any>;
  storage_storeCancel: (params: any) => ng.IPromise<any>;
  storage_storeAdd: (params: any) => ng.IPromise<any>;
  storage_storeList: (params: any) => ng.IPromise<any>;
  storage_allotLog: (params: any) => ng.IPromise<any>;
  storage_allotAdd: (params: any) => ng.IPromise<any>;
  storage_sellerList: (params: any) => ng.IPromise<any>;
  storage_sellerSetPRI: (params: any) => ng.IPromise<any>;
  storage_changeLog: (params: any) => ng.IPromise<any>;
  storage_logList: (params: any) => ng.IPromise<any>;
  storage_allotCancel: (params: any) => ng.IPromise<any>;
  storage_logAdd: (params: any) => ng.IPromise<any>;
  storage_getAllotByBackendId: (params: any) => ng.IPromise<any>;
  storage_bindSkuAllot: (params: any) => ng.IPromise<any>;
  storage_logCancel: (params: any) => ng.IPromise<any>;
  couponmanager_newApplyWithSeller: (params: any) => ng.IPromise<any>;
  couponmanager_getApplyListWithSeller: () => ng.IPromise<any>;
  kol_mgr_checkUserPri: (params?: any) => ng.IPromise<any>;
  kol_mgr_getKolIdWithWeixin: (params?: any) => ng.IPromise<any>;
  kol_mgr_keyList: (params?: any) => ng.IPromise<any>;
  kol_mgr_keyListSearch: (params: any) => ng.IPromise<any>;
  kol_mgr_kolList: (params: any) => ng.IPromise<any>;
  kol_mgr_kolAdd: (params: any) => ng.IPromise<any>;
  kol_mgr_kolGet: (params: any) => ng.IPromise<any>;
  kol_mgr_kolInfoBase: (params: any) => ng.IPromise<any>;
  kol_mgr_kolStatus: (params: any) => ng.IPromise<any>;
  kol_mgr_articleStatus: (params: any) => ng.IPromise<any>;
  kol_mgr_kolSet: (params: any) => ng.IPromise<any>;
  kol_mgr_trendAll: (params: any) => ng.IPromise<any>;
  kol_mgr_configCategory: () => ng.IPromise<any>;
  /** 获取Kol账号 */
  kol_mgr_configSellerList: () => ng.IPromise<any>;
  kol_mgr_articleList: (params: any) => ng.IPromise<any>;
  kol_mgr_articleListAll: (params: any) => ng.IPromise<any>;
  kol_mgr_articleGet: (params: any) => ng.IPromise<any>;
  kol_mgr_articleAdd: (params: any) => ng.IPromise<any>;
  kol_mgr_articleSet: (params: any) => ng.IPromise<any>;
  kol_mgr_articleDailyDetail: (params: any) => ng.IPromise<any>;
  kol_mgr_itemList: (params: any) => ng.IPromise<any>;
  kol_mgr_itemInfo: (params: any) => ng.IPromise<any>;
  kol_mgr_itemSet: (params: any) => ng.IPromise<any>;
  kol_mgr_kolItemSet: (params: any) => ng.IPromise<any>;
  kol_mgr_modifyProfitRate: (params: any) => ng.IPromise<any>;
  kol_mgr_itemHide: (params: any) => ng.IPromise<any>;
  kol_mgr_itemDelete: (params: any) => ng.IPromise<any>;
  kol_mgr_kolGetWithSeller: (params: any) => ng.IPromise<any>;
  kol_mgr_kolGetListWithSeller: (params: any) => ng.IPromise<any>;
  kol_mgr_articleVirtualOrderList: (params: any) => ng.IPromise<any>;
  kol_mgr_articleVirtualOrderAdd: (params: any) => ng.IPromise<any>;
  kol_mgr_articleVirtualOrderSet: (params: any) => ng.IPromise<any>;
  kol_mgr_articleVirtualOrderDel: (params?: any) => ng.IPromise<any>;
  kol_mgr_getKolOperateStatus: () => ng.IPromise<any>;
  kol_act_bannerList: (params: any) => ng.IPromise<any>;
  kol_act_bannerAdd: (params: any) => ng.IPromise<any>;
  kol_act_bannerGet: (params: any) => ng.IPromise<any>;
  kol_act_bannerSet: (params: any) => ng.IPromise<any>;
  kol_act_bannerDelete: (params: any) => ng.IPromise<any>;
  auth_verifySellerEmail: (params: any) => ng.IPromise<any>;
  auth_registerSeller: (params: any) => ng.IPromise<any>;
  auth_registerPGC: (params: any) => ng.IPromise<any>;
  auth_registerKOL: (params: any) => ng.IPromise<any>;
  da_sentiment_item_select: (params: any) => ng.IPromise<any>;
  da_sentiment_brand_select: (params: any) => ng.IPromise<any>;
  da_sentiment_collection_select: (params: any) => ng.IPromise<any>;
  da_sentiment_collection_item_select: (params: any) => ng.IPromise<any>;
  da_sentiment_data_collection_one_select: (params: any) => ng.IPromise<any>;
  da_sentiment_data_collection_two_select: (params: any) => ng.IPromise<any>;
  da_sentiment_data_collection_three_select: (params: any) => ng.IPromise<any>;
  da_sentiment_data_collection_four_select: (params: any) => ng.IPromise<any>;
  createToken: (params: any) => ng.IPromise<any>;
  createSeeApiSign: (params: any) => ng.IPromise<any>;
  urlSignGet: (url: any) => ng.IPromise<any>;
  urlSignCheck: (url: any) => ng.IPromise<any>;
  da_kol_rank_ListInfoKol: (params: any) => ng.IPromise<any>;
  da_kol_rank_ListBrandAndClass: (params: any) => ng.IPromise<any>;
  da_kol_rank_DetailBrandAndClass: (params: any) => ng.IPromise<any>;
  item_getStandardBrandList: (params?: any) => ng.IPromise<any>;
  item_getStandardBrandListv2: (params?: any) => ng.IPromise<any>;
  auth_isGoogleAuthenticated: (params: any) => ng.IPromise<any>;
  auth_login: (params: any) => ng.IPromise<any>;
  login_setUser: (params: any) => void;
  auth_sendSmsCode: (params: any) => ng.IPromise<any>;
  auth_validateSms: (params: any) => ng.IPromise<any>;
  auth_getCountryCode: (params?: any) => ng.IPromise<any>;
  orderv2_getServiceCodeList: (params?: any) => ng.IPromise<any>;
  orderv2_getRefundAuditOrderList: (params?: any) => ng.IPromise<any>;
  orderv2_getRefundAmount: (params?: any) => ng.IPromise<any>;
  orderv2_comfirmRefund: (params?: any) => ng.IPromise<any>;
  orderv2_processSelledOrder: (params: any) => ng.IPromise<any>;
  weranking_get_items: (params: any) => ng.IPromise<any>;
  weranking_get_item_detail: (params: any) => ng.IPromise<any>;
  weranking_account_article: (params: any) => ng.IPromise<any>;
  weyuqing_get_tags: (params: any) => ng.IPromise<any>;
  rate_getOrderRateList: (params: any) => ng.IPromise<any>;
  rate_getBrandRateList: (params: any) => ng.IPromise<any>;
  wanted_resumeTheme: (params: any) => ng.IPromise<any>;
  wanted_hideTheme: (params: any) => ng.IPromise<any>;
  orderv2_setMarkStar: (params: any) => ng.IPromise<any>;
  orderv2_searchSellerOrder: (params: any) => ng.IPromise<any>;
  orderv2_getOrderList: (params: any) => ng.IPromise<any>;
  orderv2_searchOrderByLogistics: (params: any) => ng.IPromise<any>;
  orderv2_getOrderCountLogistics: () => ng.IPromise<any>;
  orderv2_getKOLOrderList: (params: any) => ng.IPromise<any>;
  orderv2_getDistributionOrder: (params: any) => ng.IPromise<any>;
  orderv2_searchOrderByArea: (params: any) => ng.IPromise<any>;
  orderv2_searchOrder: (params: any) => ng.IPromise<any>;
  da_portrait_list_status: (params: any) => ng.IPromise<any>;
  da_portrait_list_search: (params: any) => ng.IPromise<any>;
  da_portrait_detail_base: (params: any) => ng.IPromise<any>;
  da_portrait_detail_content: (params: any) => ng.IPromise<any>;
  da_portrait_detail_top: (params: any) => ng.IPromise<any>;
  da_portrait_detail_hot: (params: any) => ng.IPromise<any>;
  da_portrait_user_favor: (params: any) => ng.IPromise<any>;
  da_portrait_user_init: (params: any) => ng.IPromise<any>;
  orderv2_inBatchOperation: (params: any) => ng.IPromise<any>;
  orderv2_getOrderCount: () => ng.IPromise<any>;
  orderv2_processRefundMsg: (params: any) => ng.IPromise<any>;
  orderv2_contactUser: (params: any) => ng.IPromise<any>;
  orderv2_finishTax: (params: any) => ng.IPromise<any>;
  /** 发货时获取中订单的showtype,1--seego物流,2--非seego物流 */
  orderv2_getShowType: (params: any) => ng.IPromise<any>;
  order_getOrderDetail: (params: any) => ng.IPromise<any>;
  orderv2_checkOrderItemSku: (params: any) => ng.IPromise<any>;
  orderv2_modifyOrderInfo: (params: any) => ng.IPromise<any>;
  orderv2_getOrderDetail: (params: any) => ng.IPromise<any>;
  orderv2_getAddrInfoByUid: (params: any) => ng.IPromise<any>;
  orderv2_modifyDispatchPrice: (params: any) => ng.IPromise<any>;
  orderv2_getOrderItemSkus: (params: any) => ng.IPromise<any>;
  orderv2_modifyOrderItemSku: (params: any) => ng.IPromise<any>;
  orderv2_modifyMiddleOrderPrice: (params: any) => ng.IPromise<any>;
  orderv2_notifyTax: (params: any) => ng.IPromise<any>;
  orderv2_sendGoodsv2: (params: any) => ng.IPromise<any>;
  orderv2_cancelDispatch: (params: any) => ng.IPromise<any>;
  orderv2_finishBuy: (params: any) => ng.IPromise<any>;
  orderv2_finishBuyv2: (params: any) => ng.IPromise<any>;
  orderv2_dispatchOrderv2: (params: any) => ng.IPromise<any>;
  orderv2_splitMidOrder: (params: any) => ng.IPromise<any>;
  orderv2_batchDispatchOrderEmailConfirm: (params: any) => ng.IPromise<any>;
  orderv2_sendGoods: (params: any) => ng.IPromise<any>;
  asset_getBillStatData: () => ng.IPromise<any>;
  asset_generateWithdrawBill: () => ng.IPromise<any>;
  asset_getWithdrawHistory: (params: any) => ng.IPromise<any>;
  asset_getWithdrawDetailById: (params: any) => ng.IPromise<any>;
  asset_getWithdrawDetail: (params: any) => ng.IPromise<any>;
  asset_withdraw: () => ng.IPromise<any>;
  asset_getUnSettleList: () => ng.IPromise<any>;
  asset_finsihPay: (params: any) => ng.IPromise<any>;
  /** 根据时间搜索提现记录 */
  asset_searchWithdrawList: (params: any) => ng.IPromise<any>;
  /** 在账单详情里面搜索订单接口 */
  asset_searchWithdrawOrder: (params: any) => ng.IPromise<any>;
  /** pgc 获取账单详情 */
  pgc_settle_getBillDetail: (params: any) => ng.IPromise<any>;
  asset_getWithdrawDetailGoods: (params: any) => ng.IPromise<any>;
  /** 自媒体提现 */
  pgc_settle_withdraw: (params: any) => ng.IPromise<any>;
  /** 自媒体账单总计 */
  pgc_settle_getPgcBillSummaryData: () => ng.IPromise<any>;
  /** pgc资产账单 */
  pgc_settle_getWithdrawPgcBillList: (params: any) => ng.IPromise<any>;
  common_getCategory: () => ng.IPromise<any>;
  common_getAllCategory: () => ng.IPromise<any>;
  backend_event_getAllEventList: (params: any) => ng.IPromise<any>;
  backend_event_addEvent: (params: any) => ng.IPromise<any>;
  backend_event_getEventSetList: (params?: any) => ng.IPromise<any>;
  backend_event_addEventSet: (params: any) => ng.IPromise<any>;
  backend_event_getEventSetEventList: (params: any) => ng.IPromise<any>;
  backend_event_getEventItemList: (params: any) => ng.IPromise<any>;
  backend_event_getMyEventItemsStatus: () => ng.IPromise<any>;
  /** 查询商户详情 */
  backend_event_getBackendUserInfo: (params: any) => ng.IPromise<any>;
  backend_event_getEventData: (params: any) => ng.IPromise<any>;
  backend_event_deleteEventSet: (params: any) => ng.IPromise<any>;
  backend_event_getEventItemStatus: (params: any) => ng.IPromise<any>;
  backend_event_getEventSetData: (params: any) => ng.IPromise<any>;
  backend_event_getMyEventItems: (params: any) => ng.IPromise<any>;
  backend_event_updateEventSet: (params: any) => ng.IPromise<any>;
  backend_event_acceptEventItem: (params: any) => ng.IPromise<any>;
  backend_event_rejectEventItem: (params: any) => ng.IPromise<any>;
  backend_event_moveEventItem: (params: any) => ng.IPromise<any>;
  backend_event_signupEventItem: (params: any) => ng.IPromise<any>;
  /** 获取优惠券申请列表 */
  couponmanager_getApplyList: (params: any) => ng.IPromise<any>;
  /** 获取品牌和品类 */
  couponmanager_getBrandAndClass: () => ng.IPromise<any>;
  /** 通过优惠券申请 */
  couponmanager_acceptApply: (params: any) => ng.IPromise<any>;
  /** 拒绝优惠券申请 */
  couponmanager_rejectApply: (params: any) => ng.IPromise<any>;
  /** 新增申请记录 */
  couponmanager_newApply: (params: any) => ng.IPromise<any>;
  /** 重新提交 */
  couponmanager_updateApply: (params: any) => ng.IPromise<any>;
  /** 优惠券批量发送给用户 */
  couponmanager_sendCouponToUser: (params: any) => ng.IPromise<any>;
  couponmanager_search: (params: any) => ng.IPromise<any>;
  /** 查看优惠券使用和领取信息 */
  couponmanager_getCouponListByType: (params: any) => ng.IPromise<any>;
  couponmanager_getApplyInfo: (params: any) => ng.IPromise<any>;
  /** 通过UID手动发放优惠券 */
  couponmanager_sendCouponByUid: (params: any) => ng.IPromise<any>;
  event_getRecommendTheme: (params: any) => ng.IPromise<any>;
  event_getDarenTheme: (params: any) => ng.IPromise<any>;
  seego_partner_getSeegoPartnerSummary: (params: any) => ng.IPromise<any>;
  seego_partner_getWithdraw: (params: any) => ng.IPromise<any>;
  seego_partner_applyWithdraw: (params: any) => ng.IPromise<any>;
  seego_partner_finishWithdraw: (params: any) => ng.IPromise<any>;
  seego_partner_commissionDetail: (params: any) => ng.IPromise<any>;
  search_control_searchItems: (params: any) => ng.IPromise<any>;
  /** 更改商品搜索权重 */
  search_control_changeWeight: (params: any) => ng.IPromise<any>;
  /** 全局隐藏 */
  search_control_setGlobalHidden: (params: any) => ng.IPromise<any>;
  search_control_showOrHideItems: (
    params: any,
    is_hidden: boolean,
  ) => ng.IPromise<any>;
  parttime_getThemeList: (params: any) => ng.IPromise<any>;
  parttime_getThemeCount: () => ng.IPromise<any>;
  parttime_getMessages: (params: any) => ng.IPromise<any>;
  parttime_getNewMsgCount: () => ng.IPromise<any>;
  parttime_updateReplyStatus: (params: any) => ng.IPromise<any>;
  parttime_getMessagesCount: () => ng.IPromise<any>;
  parttime_getDisqualifiedAnswer: (params: any) => ng.IPromise<any>;
  parttime_getParttimerData: () => ng.IPromise<any>;
  parttime_getThemeListv2: (params: any) => ng.IPromise<any>;
  parttime_getRecommendTheme: (params: any) => ng.IPromise<any>;
  wanted_getRecommendThemeList: (params: any) => ng.IPromise<any>;
  wanted_getKOLThemeList: (params: any) => ng.IPromise<any>;
  wanted_getCircleCollection: (params: any) => ng.IPromise<any>;
  wanted_getCollectionInfo: (params: any) => ng.IPromise<any>;
  wanted_getCollection: (params: any) => ng.IPromise<any>;
  wanted_getCollectionItemList: (params: any) => ng.IPromise<any>;
  wanted_searchItem: (params: any) => ng.IPromise<any>;
  wanted_createCollection: (params: any) => ng.IPromise<any>;
  wanted_editCollection: (params: any) => ng.IPromise<any>;
  wanted_updateCollectionItemName: (params: any) => ng.IPromise<any>;
  wanted_updateCollectionItemDesc: (params: any) => ng.IPromise<any>;
  /** 获取大合集单个商品信息 */
  wanted_getCollectionItemData: (params: any) => ng.IPromise<any>;
  /** 删除大合集单个商品 */
  wanted_delCollectionItem: (params: any) => ng.IPromise<any>;
  /** 更新大合集单个商品信息 */
  wanted_updateCollectionItem: (params: any) => ng.IPromise<any>;
  seller_modifyUserInfo: (params: any) => ng.IPromise<any>;
  seller_modifySellerInfo: (params: any) => ng.IPromise<any>;
  seller_createGASecret: () => ng.IPromise<any>;
  seller_isGaSecretOpen: () => ng.IPromise<any>;
  seller_saveGASecret: (params: any) => ng.IPromise<any>;
  /** 获取当前用户权限ID */
  getPrivilege: () => string;
  seller_getSellerMajia: () => ng.IPromise<any>;
  user_setUserDaren: (params: any) => ng.IPromise<any>;
  seller_getNotCirOwnerMajia: () => ng.IPromise<any>;
  seller_getSellerUser: () => ng.IPromise<any>;
  /** 判断是否需要弹出kol编辑提示框 */
  seller_checkPopEditKol: () => ng.IPromise<any>;
  seller_checkPwd: (params: any) => ng.IPromise<any>;
  seller_modifyPwd: (params: any) => ng.IPromise<any>;
  seller_saveRecord: (params: any) => ng.IPromise<any>;
  chat_getNotice: () => ng.IPromise<any>;
  chat_setNotice: (params: any) => ng.IPromise<any>;
  wanted_getCircleDetail: (params: any) => ng.IPromise<any>;
  circle_getCircleSaleCondition: (params: any) => ng.IPromise<any>;
  circle_getPgcCircleList: (params: any) => ng.IPromise<any>;
  circle_getCircleCountByClass: (params: any) => ng.IPromise<any>;
  circle_getThemeBycircle: (params: any) => ng.IPromise<any>;
  circle_getCircleThemeCount: (params: any) => ng.IPromise<any>;
  circle_addCircle: (params: any) => ng.IPromise<any>;
  circle_setOwner: (params: any) => ng.IPromise<any>;
  circle_checkSellerCircle: (params: any) => ng.IPromise<any>;
  circle_getCircleOwner: (params: any) => ng.IPromise<any>;
  /** 所有小合集列表 */
  collection_miniCollectionByCirid: (params: any) => ng.IPromise<any>;
  /** 创建小合集 */
  collection_createMiniCollection: (params: any) => ng.IPromise<any>;
  /** 更新小合集 */
  collection_updateMiniCollection: (params: any) => ng.IPromise<any>;
  /** 设置小合集是否可见 */
  collection_setMiniColPublic: (params: any) => ng.IPromise<any>;
  /** 小合集的商品列表 */
  collection_miniCollectionItem: (params: any) => ng.IPromise<any>;
  /** 添加小合集商品，可以一次添加多个商品 */
  collection_addMiniCollectionItem: (params: any) => ng.IPromise<any>;
  /** 删除小合集中的商品 */
  collection_delMiniCollectionItem: (params: any) => ng.IPromise<any>;
  /** 更新小合集里的商品信息，一次只能修改一个商品 */
  collection_updateMiniCollectionItem: (params: any) => ng.IPromise<any>;
  /** 根据商品ID和小合集ID获取指定商品信息 */
  collection_getMiniCollectionItem: (params: any) => ng.IPromise<any>;
  /** 获取单个小合集 */
  collection_getMiniCollection: (params: any) => ng.IPromise<any>;
  circle_relateBackendCircle: (params: any) => ng.IPromise<any>;
  /** 为内容兼职账号添加PGC圈子 */
  user_relateBackendUserAndCircleOwner: (params: any) => ng.IPromise<any>;
  pgc_settle_getTopicItemList: (params: any) => ng.IPromise<any>;
  pgc_settle_adjustItemSellcount: (params: any) => ng.IPromise<any>;
  pgc_settle_getBillTopicList: (params: any) => ng.IPromise<any>;
  pgc_settle_getHistoryBillList: (params: any) => ng.IPromise<any>;
  pgc_settle_checkCircleBindAccount: (params: any) => ng.IPromise<any>;
  pgc_settle_getBillStatData: (params: any) => ng.IPromise<any>;
  topic_addTopic: (params: any) => ng.IPromise<any>;
  topic_updateTopicDetail: (params: any) => ng.IPromise<any>;
  topic_updateDraftTopicDetail: (params: any) => ng.IPromise<any>;
  topic_get_api_url: () => ng.IPromise<any>;
  topic_getTopicList: (params: any) => ng.IPromise<any>;
  topic_getCatetory: () => ng.IPromise<any>;
  topic_searchTopicList: (params: any) => ng.IPromise<any>;
  topic_delTopic: (params: any) => ng.IPromise<any>;
  topic_updateDraftTopic: (params: any) => ng.IPromise<any>;
  topic_getTopicDetail: (params: any) => ng.IPromise<any>;
  topic_getPgcQuestionList: (params: any) => ng.IPromise<any>;
  topic_getRecommendPgcQuestionList: (params: any) => ng.IPromise<any>;
  topic_getDarenPgcQuestionList: (params: any) => ng.IPromise<any>;
  topic_getMyPgcAnswerList: (params: any) => ng.IPromise<any>;
  topic_answerQuestion: (params: any) => ng.IPromise<any>;
  topic_getPgcAnswerList: (params: any) => ng.IPromise<any>;
  topic_delContent: (params: any) => ng.IPromise<any>;
  topic_deleteAnswer: (params: any) => ng.IPromise<any>;
  topic_delDraftTopic: (params: any) => ng.IPromise<any>;
  topic_getUploadVideoToken: () => ng.IPromise<any>;
  wanted_getUserTheme: (params?: any) => ng.IPromise<any>;
  wanted_getEventTheme: (params: any) => ng.IPromise<any>;
  wanted_getMyEventFinds: (params: any) => ng.IPromise<any>;
  wanted_getMyFinds: (params: any) => ng.IPromise<any>;
  wanted_getPgcTheme: (params: any) => ng.IPromise<any>;
  wanted_getSellerTheme: (params: any) => ng.IPromise<any>;
  wanted_getCircleOwnerTheme: (params: any) => ng.IPromise<any>;
  wanted_getSearchItems: (params: any) => ng.IPromise<any>;
  wanted_getAllCategory: () => ng.IPromise<any>;
  wanted_getSellerFinds: (params: any) => ng.IPromise<any>;
  wanted_getSellerItems: (params: any) => ng.IPromise<any>;
  wanted_getMatchItems: (params: any) => ng.IPromise<any>;
  wanted_getTheme: (params: any) => ng.IPromise<any>;
  wanted_addTheme: (params: any) => ng.IPromise<any>;
  wanted_updateTheme: (params: any) => ng.IPromise<any>;
  wanted_getFind: (params: any) => ng.IPromise<any>;
  wanted_getFindReplies: (params: any) => ng.IPromise<any>;
  wanted_getThemeFinds: (params: any) => ng.IPromise<any>;
  wanted_getThemeDetail: (params: any) => ng.IPromise<any>;
  wanted_getThemeTmpFinds: (params: any) => ng.IPromise<any>;
  wanted_addAnswer: (params: any) => ng.IPromise<any>;
  event_editAnswer: (params: any) => ng.IPromise<any>;
  wanted_addReply: (params: any) => ng.IPromise<any>;
  wanted_checkIfJZCanAnswer: (params: any) => ng.IPromise<any>;
  wanted_addSearchItem: (params: any) => ng.IPromise<any>;
  wanted_getThemeItem: (params: any) => ng.IPromise<any>;
  /** 获取心愿分类 */
  wanted_getUserThemeLayer: (params: any) => ng.IPromise<any>;
  /** 获取用户心愿v2 */
  wanted_getUserThemev2: (params?: any) => ng.IPromise<any>;
  /** 获取用户心愿分类计数 */
  wanted_getUserThemeLayerCount: () => ng.IPromise<any>;
  /** 获取首发心愿 */
  wanted_getUserFirstTheme: (params: any) => ng.IPromise<any>;
  /** 发布心愿搜索品牌和地点 */
  item_getBrandAndLocation: () => ng.IPromise<any>;
  /** 根据商品ID查询对应的详细信息 */
  item_getItemInfoArray: (params: any) => ng.IPromise<any>;
  /** 发布心愿 */
  wanted_addThemev2: (params: any) => ng.IPromise<any>;
  /** 获取kol账号列表 */
  wanted_getKolUidList: () => ng.IPromise<any>;
  /** 获取我发布过的心愿 */
  wanted_getBackendOperateTheme: (params: any) => ng.IPromise<any>;
  /** 添加心愿商品 */
  wanted_addThemeItem: (params: any) => ng.IPromise<any>;
  item_classList: () => ng.IPromise<any>;
  item_getClassAttr: (params: any) => ng.IPromise<any>;
  item_getColor: () => ng.IPromise<any>;
  item_getSizeProperty: (params: any) => ng.IPromise<any>;
  item_upload: (params: any) => ng.IPromise<any>;
  item_getSize: (params: any) => ng.IPromise<any>;
  item_addItem: (params: any) => ng.IPromise<any>;
  item_getItem: (params: any) => ng.IPromise<any>;
  item_itemList: (params: any) => ng.IPromise<any>;
  item_matchItemListv2: (params: any) => ng.IPromise<any>;
  item_itemListOff: (params: any) => ng.IPromise<any>;
  item_outOfStock: (params: any) => ng.IPromise<any>;
  item_itemListNeedEdit: (params: any) => ng.IPromise<any>;
  item_searchItemList: (params: any) => ng.IPromise<any>;
  item_getBrandList: () => ng.IPromise<any>;
  item_getCountyList: (params: any) => ng.IPromise<any>;
  item_getAreaList: (params: any) => ng.IPromise<any>;
  item_addBrand: (params: any) => ng.IPromise<any>;
  order_getUserData: () => ng.IPromise<any>;
  python_api_changeToPrepareItemWithURL: (url: string) => ng.IPromise<any>;
  python_api_changeBrandName: (params: any) => ng.IPromise<any>;
  brand_getBrandList: (params: any) => ng.IPromise<any>;
  brand_getBrandDetail: (params: any) => ng.IPromise<any>;
  brand_getSimilarBrandList: (params: any) => ng.IPromise<any>;
  brand_mergeItemBrand: (params: any) => ng.IPromise<any>;
  brand_updateBrand: (params: any) => ng.IPromise<any>;
  brand_getRate: (params: any) => ng.IPromise<any>;
  brand_setRate: (params: any) => ng.IPromise<any>;
  item_updateItem: (params: any) => ng.IPromise<any>;
  item_itemListHidden: (params: any) => ng.IPromise<any>;
  item_setHidden: (params: any) => ng.IPromise<any>;
  item_getCurrencyRate: () => ng.IPromise<any>;
  item_copyItem: (params: any) => ng.IPromise<any>;
  rule_getRuleList: (params: any) => ng.IPromise<any>;
  rule_getRuleItemCount: (params: any) => ng.IPromise<any>;
  rule_addRule: (params: any) => ng.IPromise<any>;
  rule_toggleRuleStatus: (params: any) => ng.IPromise<any>;
  rule_deleteRule: (params: any) => ng.IPromise<any>;
  item_createClass2: (params: any) => ng.IPromise<any>;
  item_updateClass2: (params: any) => ng.IPromise<any>;
  item_getClass2ById: (params: any) => ng.IPromise<any>;
  item_getLockItemList: (params: any) => ng.IPromise<any>;
  price_adjust_approveApply: (params: any) => ng.IPromise<any>;
  price_adjust_rejectApply: (params: any) => ng.IPromise<any>;
  price_adjust_priceAdjustList: (params: any) => ng.IPromise<any>;
  price_adjust_myPriceAdjustList: (params: any) => ng.IPromise<any>;
  attrib_create: (params: any) => ng.IPromise<any>;
  attrib_checkExist: (params: any) => ng.IPromise<any>;
  attrib_getList: (params: any) => ng.IPromise<any>;
  attrib_disable: (params: any) => ng.IPromise<any>;
  attrib_get: (params: any) => ng.IPromise<any>;
  attrib_manage: (params: any) => ng.IPromise<any>;
  attrib_update: (params: any) => ng.IPromise<any>;
  attrib_find: (params: any) => ng.IPromise<any>;
  category_getClass2Detail: (params: any) => ng.IPromise<any>;
  category_addAttrToClass2: (params: any) => ng.IPromise<any>;
  category_deleteAttrFromClass2: (params: any) => ng.IPromise<any>;
  category_updateAttrOrder: (params: any) => ng.IPromise<any>;
  category_updateAttrRel: (params: any) => ng.IPromise<any>;
  category_getAllLeafCategoryAndAttr: () => ng.IPromise<any>;
  product_mgr_addProduct: (params: any) => ng.IPromise<any>;
  product_mgr_deleteSku: (params: any) => ng.IPromise<any>;
  product_mgr_changeProductClass: (params: any) => ng.IPromise<any>;
  product_mgr_editProduct: (params: any) => ng.IPromise<any>;
  product_mgr_getPriceAdjustDetail: (params: any) => ng.IPromise<any>;
  collection_copyItems: (params: any) => ng.IPromise<any>;
  collection_collectionSet: (params: any) => ng.IPromise<any>;
  collection_collectionGet: (params: any) => ng.IPromise<any>;
  collection_seckillGet: (params: any) => ng.IPromise<any>;
  collection_seckillSet: (params: any) => ng.IPromise<any>;
  collection_recommendItem: (params: any) => ng.IPromise<any>;
  collection_rankItem: (params: any) => ng.IPromise<any>;
  collection_hideItem: (params: any) => ng.IPromise<any>;
  collection_deleteItem: (params: any) => ng.IPromise<any>;
  collection_itemGet: (params: any) => ng.IPromise<any>;
  collection_getItemList: (params: any) => ng.IPromise<any>;
  collection_syncShopItem: (params: any) => ng.IPromise<any>;
  security_urlSignLog: (params: any) => ng.IPromise<any>;
  security_apiList: (params: any) => ng.IPromise<any>;
  security_apiSet: (params: any) => ng.IPromise<any>;
  security_configSet: (params: any) => ng.IPromise<any>;
  security_configAdd: (params: any) => ng.IPromise<any>;
  security_logList: (params: any) => ng.IPromise<any>;
  security_ctrlList: (params: any) => ng.IPromise<any>;
  security_ctrlSet: (params: any) => ng.IPromise<any>;
  security_configList: (params: any) => ng.IPromise<any>;
  security_warnList: (params: any) => ng.IPromise<any>;
  security_resetIsIngore: (params: any) => ng.IPromise<any>;
  mall_mallClassGetListWithArticle: (params: any) => ng.IPromise<any>;
  mall_mallClassSetRank: (params: any) => ng.IPromise<any>;
  mall_mallClassChoice: (params: any) => ng.IPromise<any>;
  mall_mallClassList: (params: any) => ng.IPromise<any>;
  mall_mallClassAdd: (params: any) => ng.IPromise<any>;
  mall_mallClassGet: (params: any) => ng.IPromise<any>;
  mall_mallClassSet: (params: any) => ng.IPromise<any>;
  mall_mallRelateSet: (params: any) => ng.IPromise<any>;
  mall_mallClassGetKey: (params: any) => ng.IPromise<any>;
  mall_template_list: (params: any) => ng.IPromise<any>;
  mall_template_add: (params: any) => ng.IPromise<any>;
  mall_template_set: (params: any) => ng.IPromise<any>;
  mall_template_get: (params: any) => ng.IPromise<any>;
  mall_template_delete: (params: any) => ng.IPromise<any>;
  mall_template_getChoiceKol: (params: any) => ng.IPromise<any>;
  mall_template_getChoiceMall: (params: any) => ng.IPromise<any>;
  mall_template_getChoiceItemList: (params: any) => ng.IPromise<any>;
  mall_list_all: (params: any) => ng.IPromise<any>;
  modal_modify_mall_list: (params: any) => ng.IPromise<any>;
  mall_list_detail: (params: any) => ng.IPromise<any>;
  mall_template_templateConfirmSync: (params: any) => ng.IPromise<any>;
  mall_template_addItemToArticle: (params: any) => ng.IPromise<any>;
  mall_template_itemSyncRecommend: (params: any) => ng.IPromise<any>;
  mall_template_itemSyncHide: (params: any) => ng.IPromise<any>;
  mall_template_itemSyncDelete: (params: any) => ng.IPromise<any>;
  mall_template_itemSyncRank: (params: any) => ng.IPromise<any>;
  mall_template_getFilterTemplateList: (params: any) => ng.IPromise<any>;
  mall_template_templateItemIsAdd: (params: any) => ng.IPromise<any>;
  product_mgr_getParentProduct: (params: any) => ng.IPromise<any>;
  product_mgr_addChildProduct: (params: any) => ng.IPromise<any>;
  product_mgr_editChildProduct: (params: any) => ng.IPromise<any>;
  product_mgr_getChildProduct: (params: any) => ng.IPromise<any>;
  product_mgr_checkChildSku: (params: any) => ng.IPromise<any>;
  product_mgr_syncChildSku: (params: any) => ng.IPromise<any>;
  mall_set_notice: (params: any) => ng.IPromise<any>;
  kol_act_list: (params: any) => ng.IPromise<any>;
  kol_act_delect: (params: any) => ng.IPromise<any>;
  kol_act_offline: (params: any) => ng.IPromise<any>;
  kol_act_actSeckillItemGet: (params: any) => ng.IPromise<any>;
  kol_act_actSeckillAdd: (params: any) => ng.IPromise<any>;
  kol_act_actSeckillGet: (params: any) => ng.IPromise<any>;
  kol_act_actSeckillSet: (params: any) => ng.IPromise<any>;
  kol_mgr_articleDefaultMall: (params: any) => ng.IPromise<any>;
  kol_mgr_getKeyListMallArticle: (params: any) => ng.IPromise<any>;
  mall_get_notice: () => ng.IPromise<any>;

  api_1688_cloudprod_list: (params: any) => ng.IPromise<any>;
  api_1688_cloudprod_switchstatus: (params: any) => ng.IPromise<any>;
  api_1688_cloudprod_mother_link: (params: any) => ng.IPromise<any>;
  api_1688_cloudprod_mother_unlink: (params: any) => ng.IPromise<any>;
  api_1688_cloudprod_adjustprice: (params: any) => ng.IPromise<any>;
  api_1688_cloudprod_listKw: (params: any) => ng.IPromise<any>;

  wms_stock_changeList: (params: any) => ng.IPromise<any>;
  wms_stock_detail: (params: any) => ng.IPromise<any>;
  wms_outboundOrder_create: (params: any) => ng.IPromise<any>;
  wms_outboundOrder_batchCreate: (params: any) => ng.IPromise<any>;
  wms_outboundOrder_batchCreate_progress: (params: any) => ng.IPromise<any>;
  wms_outboundOrder_list: (params: any) => ng.IPromise<any>;
  wms_outboundOrder_detail: (params: any) => ng.IPromise<any>;

  xiaoe_e_get_distribution_list: (params: any) => ng.IPromise<any>;
  xiaoe_e_get_distribution_url: (params: any) => ng.IPromise<any>;
  xiaoe_e_get_list_dis: (params: any) => ng.IPromise<any>;
  xiaoe_e_get_distribution_result: (params: any) => ng.IPromise<any>;
  xiaoe_e_get_del_info: (params: any) => ng.IPromise<any>;
  xiaoe_e_get_set_margin_scale: (params: any) => ng.IPromise<any>;

  weixin_getTplTypeOptions: (params: any) => ng.IPromise<any>;
  weixin_getList: (params: any) => ng.IPromise<any>;
  weixin_updateInfo: (params: any) => ng.IPromise<any>;
  weixin_updateJsonConfig: (params: any) => ng.IPromise<any>;
  weixin_updateServiceConfig: (params: any) => ng.IPromise<any>;
  weixin_setDomain: (params: any) => ng.IPromise<any>;
  weixin_codePost: (params: any) => ng.IPromise<any>;
  weixin_codeSubmit: (params: any) => ng.IPromise<any>;
  weixin_codeSubmitView: (params: any) => ng.IPromise<any>;
  weixin_codeReleate: (params: any) => ng.IPromise<any>;
  weixin_resestAudit: (params: any) => ng.IPromise<any>;
  weixin_codeReleateBatch: (params: any) => ng.IPromise<any>;
  weixin_codeSubmitViewBatch: (params: any) => ng.IPromise<any>;
  weixin_codeRollbackBatch: (params: any) => ng.IPromise<any>;
  weixin_templateInfo: (params: any) => ng.IPromise<any>;
  weixin_BatchProgress: (params: any) => ng.IPromise<any>;
  weixin_getTemplateInfo: (params: any) => ng.IPromise<any>;
  weixin_setTemplateInfo: (params: any) => ng.IPromise<any>;
  weixin_getTemplateList: (params: any) => ng.IPromise<any>;
  weixin_addTemplateInfo: (params: any) => ng.IPromise<any>;
  weixin_bindTester: (params: any) => ng.IPromise<any>;
  weixin_unBindTester: (params: any) => ng.IPromise<any>;
  weixin_getBindList: (params: any) => ng.IPromise<any>;
  weixin_deleteTester: (params: any) => ng.IPromise<any>;
  weixin_getOneStepList: (params?: any) => ng.IPromise<any>;
  weixin_codeSubmitBatch: (params?: any) => ng.IPromise<any>;
  weixin_codePostBatch: (params?: any) => ng.IPromise<any>;
  weixin_taskStatus: (params?: any) => ng.IPromise<any>;

  shop_getApplyCheckConfig: (params: any) => ng.IPromise<any>;

  shop_newApply: (params: any) => ng.IPromise<any>;
  shop_confirmApply: (params: any) => ng.IPromise<any>;
  shop_delApply: (params: any) => ng.IPromise<any>;
  shop_reApply: (params: any) => ng.IPromise<any>;
  shop_getPayInfo: (params: any) => ng.IPromise<any>;
  shop_editPayInfo: (params: any) => ng.IPromise<any>;
  shop_getList: (params: any) => ng.IPromise<any>;
  shop_getInfoById: (params: any) => ng.IPromise<any>;
  shop_getApplyList: (params: any) => ng.IPromise<any>;
  shop_doApply: (params: any) => ng.IPromise<any>;
  shop_getUrlWeinxinAuth: (params: any) => ng.IPromise<any>;

  api_fms_accountProfile: () => ng.IPromise<any>;
  api_fms_bill_export: (params: any) => ng.IPromise<any>;
  api_fms_bill_list: (params: any) => ng.IPromise<any>;
  api_fms_bill_listAll: (params: any) => ng.IPromise<any>;
  api_fms_finance_bill_edit: (params: any) => ng.IPromise<any>;
  api_fms_finance_bill_audit: (params: any) => ng.IPromise<any>;
  api_fms_finance_withdrawal_count: (params: any) => ng.IPromise<any>;
  api_fms_finance_withdrawal_list: (params: any) => ng.IPromise<any>;
  api_fms_withdrawal_apply_add: (params: any) => ng.IPromise<any>;
  api_fms_withdrawal_apply_query: () => ng.IPromise<any>;
  api_fms_withdrawal_survey_query: () => ng.IPromise<any>;
  api_fms_withdrawal_review: (params: any) => ng.IPromise<any>;
  api_fms_billGenerate_accountFix: (params: any) => ng.IPromise<any>;

  api_common_shortmessage: () => ng.IPromise<any>;

  shop_getHeader: (params?: any) => ng.IPromise<any>;
  shop_getNewData: (params?: any) => ng.IPromise<any>;
  shop_getProfit: (params?: any) => ng.IPromise<any>;
  shop_getLastUpdated: (params?: any) => ng.IPromise<any>;
  shop_getTradeDistribution: (params?: any) => ng.IPromise<any>;
  shop_getXiaoDianPuUser: (params?: any) => ng.IPromise<any>;
  shop_getXiaoDianPuData: (params?: any) => ng.IPromise<any>;
  shop_getSupplyItemData: (params?: any) => ng.IPromise<any>;
  shop_getTendencyData: (params?: any) => ng.IPromise<any>;
  shop_getRecentArticle: (params?: any) => ng.IPromise<any>;
  shop_getXdpShopUrlForBackend: (params?: any) => ng.IPromise<any>;
  shop_addAndUpdateXdpBanner: (params: any) => ng.IPromise<any>;
  shop_getArticleList: (params: any) => ng.IPromise<any>;
  shop_getXdpBanner: (params?: any) => ng.IPromise<any>;
  shop_getXdpInfo: (params?: any) => ng.IPromise<any>;

  shop_operate_addActBanner: (params: any) => ng.IPromise<any>;
  shop_operate_updateActBanner: (params: any) => ng.IPromise<any>;
  shop_operate_addAndUpdateActBanner: (params: any) => ng.IPromise<any>;
  shop_operate_getActBanner: (params?: any) => ng.IPromise<any>;
  shop_operate_delActBanner: (params: any) => ng.IPromise<any>;
  shop_operate_sortActBanner: (params: any) => ng.IPromise<any>;

  youzan_product_check: (params: any) => ng.IPromise<any>;
  youzan_product_localList: (params: any) => ng.IPromise<any>;
  youzan_product_onlineList: (params: any) => ng.IPromise<any>;
  youzan_authorization_list: (params?: any) => ng.IPromise<any>;
  youzan_product_progress: (params: any) => ng.IPromise<any>;
  youzan_product_add: (params: any) => ng.IPromise<any>;
  youzan_product_getProduct: (params: any) => ng.IPromise<any>;
  youzan_product_updateClass: (params: any) => ng.IPromise<any>;
  youzan_product_addAll: (params: any) => ng.IPromise<any>;
  youzan_product_updateProductAttr: (params: any) => ng.IPromise<any>;
  youzan_product_delete: (params: any) => ng.IPromise<any>;
  youzan_product_classList: (params: any) => ng.IPromise<any>;

  xiaodianpu_searchXdp: (params: any) => ng.IPromise<any>;
  get_queen_qrcode: (params: any) => ng.IPromise<any>;

  /**
   * 返回当前新品牌用户的状态信息
   */
  shop_checkCurrentStatus: (
    params?: any,
    isHanldeAuthRedirect?: boolean,
  ) => ng.IPromise<{
    result: number;
    msg: string;
    data: {
      backend_id: string;
      xdp_id?: number; // 小电铺ID，创建后才会有
      kol_id: number; // 对应的KOL_id
      article_id: number; // 小电铺商城ID
      collection_id: number; // 小电铺合集ID
      authorizer_appid: number | string;
      // 状态：10=审核中，20=审核失败，30=审核成功或待授权，40=待授权，50=待补齐信息，  60=微信审核中， 70=微信已过审， 80=上线中
      manager_status: number;
      type: number; // 1=基础版，2=进阶版， 3=专业版
      main_body: number; // 1=品牌，2=SEE
      str_manager_status: string; // 状态描述，和manager_status上面的描述一致
    };
  }>;
  checkShopStatus: (
    params: any,
  ) => ng.IPromise<{
    result: number;
    msg: string;
    data: {
      xdp_id?: number; // 小电铺ID，创建后才会有
      kol_id: number; // 对应的KOL_id
      article_id: number; // 小电铺商城ID
      collection_id: number; // 小电铺合集ID
      authorizer_appid: number | string;
      // 状态：10=审核中，20=审核失败，30=审核成功或待授权，40=待授权，50=待补齐信息，  60=微信审核中， 70=微信已过审， 80=上线中
      manager_status: number;
      type: number; // 1=基础版，2=进阶版， 3=专业版
      main_body: number; // 1=品牌，2=SEE
      str_manager_status: string; // 状态描述，和manager_status上面的描述一致
    };
  }>;

  /**
   * 分销商品列表
   * @param params
   * {
   *   page 当前页
   *   page_size 每页数，默认20
   *   filter_class_id 如[1,2,3]，即json_encode当前的选中品类。获取可筛选的品类列表或者检索品类
   *   filter_info 检索的信息，为数组的json_encode字符串
   * }
   */
  item_getDistributionItemList: (
    params: {
      page: number;
      page_size?: number;
      filter_class_id?: string;
      filter_info?: string;
    },
  ) => ng.IPromise<ICommonResponse>;

  user_getNewBrandUserList: (
    params: {
      pageSize: number;
      keyword: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  kol_mgr_addDistributionItem: (
    params: {
      item_ids: string;
    },
  ) => ng.IPromise<ICommonResponse>;

  // 商品分组
  goods_group_addAllCommodityToGroup: (params?: any) => ng.IPromise<any>;
  goods_group_allCommodityGroups: (params?: any) => ng.IPromise<any>;
  goods_group_addCommodityToGroup: (params: any) => ng.IPromise<any>;
  goods_group_delCommodityInGroup: (params: any) => ng.IPromise<any>;
  goods_group_sortCommodityInGroup: (params: any) => ng.IPromise<any>;
  goods_group_brandList: (params?: any) => ng.IPromise<any>;
  goods_group_categoryList: (params?: any) => ng.IPromise<any>;
  goods_group_commoditySearch: (params: any) => ng.IPromise<any>;
  goods_group_commodityListInGroup: (params: any) => ng.IPromise<any>;
  goods_group_addGroup: (params: any) => ng.IPromise<any>;
  goods_group_existGoodsForCond: (params: any) => ng.IPromise<any>;
  goods_group_delGroup: (params: any) => ng.IPromise<any>;
  goods_group_updateGroup: (params: any) => ng.IPromise<any>;
  goods_group_isGroupUsed: (params: any) => ng.IPromise<any>;
  goods_group_config_listGroup4Add: (params: any) => ng.IPromise<any>;
  goods_group_config_addGroup: (params: any) => ng.IPromise<any>;
  goods_group_config_delGroup: (params: any) => ng.IPromise<any>;
  goods_group_config_listGroup: (params?: any) => ng.IPromise<any>;
  goods_group_conifg_sortGroup: (params: any) => ng.IPromise<any>;
  goods_group_conifg_updateName: (params: any) => ng.IPromise<any>;
  goods_group_conifg_getName: (params?: any) => ng.IPromise<any>;
  goods_group_conifg_groupDetail: (params?: any) => ng.IPromise<any>;

  /**
   * 小电铺优惠券配置
   */
  couponv3_xiaodianpu_add: (
    params: {
      couponId: number;
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_xiaodianpu_configCouponV3List: (
    params?: {
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_xiaodianpu_delete: (
    params: {
      couponId: number;
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_xiaodianpu_list: (
    params: {
      page: number;
      pageSize: number;
      name?: string;
      status?: number;
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_xiaodianpu_update: (
    params: {
      couponId: number;
      type: number;
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_xiaodianpu_used: (
    params?: {
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_xiaodianpu_usedCount: (
    params?: {
      kolId?: number;
    },
  ) => ng.IPromise<ICommonResponse>;

  /**
   * 新优惠券管理
   */
  couponv3_add: (
    params: {
      name: string;
      xiaodianpuId?: number;
      moneyPayer?: number;
      couponPrice: number;
      limitMoney: number;
      avaliableTimeStart: string;
      avaliableTimeEnd: string;
      allCount: number;
      limitPer: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_detail: (
    params: {
      id: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_list: (
    params: {
      currentPageNo: number;
      pageSize: number;
      name?: string;
      status?: number;
      type?: number;
      couponPrice?: number;
      avaliableTimeStart?: string;
      avaliableTimeEnd?: string;
      moneyPayer?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_review: (
    params: {
      id: number;
      action: string;
      refuseReason?: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_update: (
    params: {
      id: number;
      name?: string;
      allCount?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_xdp_list: (
    params: {
      keyword: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_end: (
    params: {
      id: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  couponv3_del: (
    params: {
      id: number;
    },
  ) => ng.IPromise<ICommonResponse>;

  /**
   * 图片中心
   */
  pictureCenter_add: (
    params: { files: string },
  ) => ng.IPromise<ICommonResponse>;
  pictureCenter_del: (params: { id: number }) => ng.IPromise<ICommonResponse>;
  pictureCenter_list: (
    params: {
      currentPageNo: number;
      pageSize: number;
    },
  ) => ng.IPromise<ICommonResponse>;

  // 商品主题库
  goods_theme_addGoodsTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_goOffGoodsTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_updateGoodsTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_listGoodsTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_delGoodsTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_sortGoodsTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_toggleGoodsTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_appendGoods: (options?: any) => ng.IPromise<any>;
  goods_theme_getArticleList: (options?: any) => ng.IPromise<any>;
  goods_theme_removeGoods: (options?: any) => ng.IPromise<any>;
  goods_theme_getHotGoods: (options?: any) => ng.IPromise<any>;
  goods_theme_getGoodsInTheme: (options?: any) => ng.IPromise<any>;
  goods_theme_updateAdCopy: (options?: any) => ng.IPromise<any>;
  goods_theme_createArticle: (options?: any) => ng.IPromise<any>;
  goods_theme_getKolArticleList: (options?: any) => ng.IPromise<any>;
  goods_theme_appendThemeToArticle: (options?: any) => ng.IPromise<any>;
  goods_theme_appendThemeToOff: (options?: any) => ng.IPromise<any>;
  goods_theme_addGoodsItemToXDPOrOff: (options?: any) => ng.IPromise<any>;
  goods_theme_getThemeInfo: (options?: any) => ng.IPromise<any>;
  goods_theme_addItemToArticle: (options?: any) => ng.IPromise<any>;

  // 内容电商-文章商品-小程序二维码等信息
  articel_content_itemLink: (options?: any) => ng.IPromise<any>;

  // 拼团操作与列表
  groupon_activity_add: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_activity_detail: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_activity_list: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_activity_products: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_activity_update: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_activity_sku: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_activityLottery: () => ng.IPromise<ICommonResponse>;
  groupon_activityLotteryConfig: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_activityForceClose: (
    params: { activityId },
  ) => ng.IPromise<ICommonResponse>;
  grouponActivityAllList: (
    params: {
      activityName?: string;
      startTime?: string;
      endTime?: string;
      status?: number;
      type?: number;
      page?: number;
      pageSize?: number;
    },
  ) => ng.IPromise<see.ICommonResponse<any>>;

  // 拼团配置
  groupon_config_addedList: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_config_allList: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_config_sort: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_config_switchStatus: (params: any) => ng.IPromise<ICommonResponse>;
  groupon_configSetReleaseTime: (params: any) => ng.IPromise<ICommonResponse>;

  // 小电铺装修
  xiaodianpu_configLastShopUrl: (
    params: {
      kolId?: number;
      mock?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  xiaodianpu_configShopUrl: (
    params: {
      kolId?: number;
      bannerImgUrl: string;
      xiaochengxuPath: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  xiaodianpu_configLastVideo: (
    params: {
      kolId?: number;
      mock?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  xiaodianpu_configVideo: (
    params: {
      kolId?: number;
      videoOriUrl: string;
      videoImgUrl: string;
    },
  ) => ng.IPromise<ICommonResponse>;

  // 秒杀
  seckill_activityActivities: (
    params: {
      kolId: number;
      activityName?: string;
      productName?: string;
      status?: number[];
      page: number;
      pageSize?: number;
      toBanner?: number;
      allowCopy?: number;
      searchKey?: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  seckill_activityDetail: (
    params: {
      activityId: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  seckill_activityAdd: (params: any) => ng.IPromise<ICommonResponse>;
  seckill_activityDown: (params: number) => ng.IPromise<ICommonResponse>;
  seckill_activityProducts: (
    params: {
      kolId: number;
      page?: number;
      pageSize?: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  seckill_activitySetRelease: (
    params: {
      id: number;
      releaseTime: string | Date;
    },
  ) => ng.IPromise<ICommonResponse>;
  seckill_activitySkus: (
    params: { itemId: number },
  ) => ng.IPromise<ICommonResponse>;
  seckill_activityToBanner: (
    params: { id: number; toBanner: 1 | 2 },
  ) => ng.IPromise<ICommonResponse>;
  seckill_configSort: (params: any) => ng.IPromise<ICommonResponse>;
  seckill_configSetReleaseTime: (params: any) => ng.IPromise<ICommonResponse>;

  // 供销管理
  cds_applyCommodityDistribution: (options?: any) => ng.IPromise<any>;
  cds_auditDistributionApply: (options?: any) => ng.IPromise<any>;
  cds_editCommodityDistributionApply: (options?: any) => ng.IPromise<any>;
  cds_exitDistribution: (options?: any) => ng.IPromise<any>;
  cds_getDistributionApplyList: (options?: any) => ng.IPromise<any>;
  cds_supplyProfile: (options?: any) => ng.IPromise<any>;
  cds_commodityDistributeDetail: (options?: any) => ng.IPromise<any>;
  cds_refuseDistributionApply: (options?: any) => ng.IPromise<any>;

  recharge_redirect: (options?: any) => ng.IPromise<any>;
  recharge_list: (options?: any) => ng.IPromise<any>;
  recharge_listAll: (options?: any) => ng.IPromise<any>;
  recharge_count: (options?: any) => ng.IPromise<any>;
  recharge_alipay_return: (options?: any) => ng.IPromise<any>;
  reRecharge_redirect: (options?: any) => ng.IPromise<any>;
  seedata_recharge_userinfo: () => ng.IPromise<any>;
  seedata_recharge_redirect: (options?: any) => ng.IPromise<any>;
  seedata_recharge_alipay_return: (options?: any) => ng.IPromise<any>;
  seedata_free_90_days: (options?: any) => ng.IPromise<any>;
  seedata_authorized_vip: (options?: any) => ng.IPromise<any>;

  ////////////////////////////////////////
  // 商品链接
  ///////////////////////////////////////
  pathAQrUrl_getGroupon: (params: any) => ng.IPromise<any>;
  pathAQrUrl_getCollectionItem: (params: any) => ng.IPromise<any>;
  pathAQrUrl_getKolCollection: (params: any) => ng.IPromise<any>;
  pathAQrUrl_getSeckill: (params: any) => ng.IPromise<any>;

  // 运费模板
  express_getProvinseList: () => ng.IPromise<ICommonResponse>;

  // 福袋
  luckybag_getConfig: () => ng.IPromise<ICommonResponse>;
  luckybag_config: (params: any) => ng.IPromise<any>;
  // 抽奖
  luckydraw_add: (params: any) => ng.IPromise<ICommonResponse>;
  luckydraw_discard: (params: any) => ng.IPromise<ICommonResponse>;
  luckydraw_list: (params: any) => ng.IPromise<ICommonResponse>;
  luckydraw_detail: (params: any) => ng.IPromise<ICommonResponse>;
  // 购物须知
  notice_shopping_add: (
    params: {
      xdpIdList: number[];
      name: string;
      noticeImgUrl: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  notice_shopping_edit: (
    params: {
      id: number;
      xdpIdList: number[];
      name: string;
      noticeImgUrl: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  notice_shopping_list: (
    params: {
      mock?: number;
      page: number;
      pageSize: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  notice_shopping_switch_status: (
    params: {
      shoppingNoticeId: number;
      status: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  notice_shopping_detail: (
    params: { shoppingNoticeId: number },
  ) => ng.IPromise<ICommonResponse>;
  kol_mgr_getXiaoDianPuList: (
    params: {
      type?: number;
      notice_id?: number | string;
    },
  ) => ng.IPromise<ICommonResponse>;

  // 商详公告
  productNotice_add: (
    params: {
      name: string;
      content: string;
      location: number;
      startTime: string;
      endTime: string;
      xdpIds: number[];
    },
  ) => ng.IPromise<ICommonResponse>;
  productNotice_get: (
    params: {
      noticeId: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  productNotice_list: (
    params: {
      page: number;
      pageSize: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  productNotice_update: (
    params: {
      id: number;
      name: string;
      content: string;
      location: number;
      startTime: string;
      endTime: string;
      xdpIds: number[];
    },
  ) => ng.IPromise<ICommonResponse>;
  productNotice_updateStatus: (
    params: {
      id: number;
      status: number;
    },
  ) => ng.IPromise<ICommonResponse>;

  // 运费模板
  express_getExpressDesc: (
    params: {
      expressId: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  express_getGoodExpress: (
    params: {
      currency: string;
      item_id: number;
      sell_id: number;
      item_real_weight: number;
      max_sku_price: number;
      ship_country: number;
    },
  ) => ng.IPromise<ICommonResponse>;

  // 退货售后处理
  returngoods_addOrUpdateLogistics: (
    params: {
      littleOrderId: number;
      transportCode: string;
      transportNo: string;
    },
  ) => ng.IPromise<ICommonResponse>;
  returngoods_getLogistics: (
    params: {
      littleOrderId: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  returngoods_received: (
    params: {
      littleOrderId: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  returngoods_unreceived: (
    params: {
      littleOrderId: number;
    },
  ) => ng.IPromise<ICommonResponse>;
  returngoods_existsLogistics: (
    littleOrderIds: string[],
  ) => ng.IPromise<ICommonResponse>;

  // 营销工具
  xiaodianpu_promotionActivityProfile: (
    params: {
      kolId: number;
    },
  ) => ng.IPromise<ICommonResponse>;

  // 批量复制相关接口
  ng_batchCopy_add: (params: any) => ng.IPromise<any>;
  ng_batchCopy_listTask: (params: any) => ng.IPromise<any>;
  ng_batchCopy_listBatch: (params: any) => ng.IPromise<any>;
  ng_batchCopy_reAdd: (params: any) => ng.IPromise<any>;
  ng_batchCopy_setSeckillTime: (params: any) => ng.IPromise<any>;

  // 生成秒杀活动小程序码
  ng_seckill_activity_setWxacodeUrl: (params: any) => ng.IPromise<any>;

  // 获取收藏夹所有商品id
  data_api_getCollectionItem: (params: any) => ng.IPromise<any>;

  addFeedback: (params: any) => ng.IPromise<ICommonResponse>;
  getFeedbackList: (params: any) => ng.IPromise<ICommonResponse>;
  exportFeedback: (params: any) => ng.IPromise<ICommonResponse>;
  addDataUrls: (params: any) => ng.IPromise<ICommonResponse>;
}
