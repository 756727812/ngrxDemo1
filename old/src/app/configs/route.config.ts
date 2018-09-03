export interface MyIRoute extends ng.route.IRoute {
  reportKey?: string | Function;
  reportExt3?: string;
}
export interface MyIRouteProvider extends ng.route.IRouteProvider {
  when(path: string, route: MyIRoute): MyIRouteProvider;
}

routeConfig.$inject = ['$routeProvider'];
export function routeConfig($routeProvider: MyIRouteProvider): void {
  const seller_privilege: string = (document.cookie.match(
    '(^|; )seller_privilege=([^;]*)',
  ) || 0)[2];
  const seller_name: string = (document.cookie.match(
    '(^|; )seller_name=([^;]*)',
  ) || 0)[2];

  $routeProvider
    .when('/', {
      redirectTo: handleRouter(seller_privilege, seller_name),
    })

    .when('/wms/out-stock-list', {
      template: '<out-stock-list></out-stock-list>',
    })
    .when('/wms/out-stock-detail/:orderId', {
      template: '<out-stock-detail></out-stock-detail>',
    })
    .when('/wms/stock-detail', {
      template: '<stock-detail></stock-detail>',
    })
    .when('/xiaochengxu/list', {
      template: '<xcx-code></xcx-code>',
    })
    .when('/open/xiaoe', {
      template: '<xiaoe-tech></xiaoe-tech>',
    })
    .when('/error/errorSign', {
      template: '<error-sign></error-sign>',
    })
    .when('/order', {
      redirectTo: '/order/all',
    })
    .when('/order/order-in-batch', {
      reportKey: 'PAGE_OM_ORDER_BATCH_OP',
      template: '<order-in-batch></order-in-batch>',
    })
    .when('/order/all', {
      reportKey: 'PAGE_OM_ALL_ORDER',
      template: '<order-list type="0"></order-list>',
    })
    .when('/order/need-pay', {
      template: '<order-list type="1"></order-list>',
    })
    .when('/order/needdispatch', {
      template: '<order-list type="9"></order-list>',
    })
    .when('/order/stock', {
      template: '<order-list type="2"></order-list>',
    })
    .when('/order/needfinish', {
      template: '<order-list type="10"></order-list>',
    })
    .when('/order/finished', {
      template: '<order-list type="5"></order-list>',
    })
    .when('/order/close', {
      template: '<order-list type="6"></order-list>',
    })
    .when('/order/after-sale', {
      template: '<order-list type="7"></order-list>',
    })
    .when('/order/starred', {
      template: '<order-list type="11"></order-list>',
    })
    .when('/order/timeout', {
      template: '<order-list type="12"></order-list>',
    })
    .when('/order/mine', {
      reportKey: 'PAGE_OM_MY_DIST',
      template: '<order-mine></order-mine>',
    })
    .when('/order/detail/:orderId', {
      redirectTo: '/order/detail/:orderId/0',
    })
    .when('/order/detail/:orderId/:infoType', {
      template: '<order-detail></order-detail>',
    })

    .when('/security', {
      redirectTo: 'security/log',
    })
    .when('/security/config', {
      template: '<security-config></security-config>',
    })
    .when('/security/warn', {
      template: '<security-warn></security-warn>',
    })
    .when('/security/ctrl', {
      template: '<security-ctrl></security-ctrl>',
    })
    .when('/security/api', {
      template: '<security-api></security-api>',
    })
    .when('/security/log', {
      template: '<security-log></security-log>',
    })

    .when('/tools', {
      redirectTo: '/tools/qrc',
    })
    .when('/tools/qrc', {
      template: '<qrc-create></qrc-create>',
    })
    .when('/tools/data-crawling', {
      template: '<craw></craw>',
    })
    .when('/tools/virtual-order', {
      template: '<virtual-order></virtual-order>',
    })

    .when('/goods', {
      redirectTo: '/goods/posted',
    })
    .when('/goods/groups', {
      reportKey: 'PAGE_CM_COMMODITY_GROUP',
      template: '<goods-group-list></goods-group-list>',
    })
    .when('/goods/groups/:groupId', {
      template: '<goods-group-view></goods-group-view>',
    })
    .when('/goods/category', {
      template: '<goods-category-list></goods-category-list>',
    })
    .when('/goods/announcementList', {
      template: '<goods-announcement-list></goods-announcement-list>',
    })
    .when('/goods/bulletin', {
      template: '<goods-bulletin-list></goods-bulletin-list>',
    })
    .when('/goods/bulletin/add', {
      template: '<goods-bulletin-action type="add"></goods-bulletin-action>',
    })
    .when('/goods/bulletin/:id', {
      template: '<goods-bulletin-action type="edit"></goods-bulletin-action>',
    })
    .when('/goods/list1688', {
      template: '<goods-1688-list></goods-1688-list>',
    })
    .when('/goods/category/:id', {
      template: '<goods-category-edit></goods-category-edit>',
    })
    .when('/goods/category-add-attr/:id', {
      template: '<goods-category-add-attr></goods-category-add-attr>',
    })
    .when('/goods/attribute', {
      template: '<goods-attribute-list></goods-attribute-list>',
    })
    .when('/goods/attribute/new', {
      template: '<goods-attribute-action></goods-attribute-action>',
    })
    .when('/goods/attribute/edit/:id', {
      template: '<goods-attribute-action></goods-attribute-action>',
    })
    .when('/goods/brand', {
      template: '<goods-brand-list></goods-brand-list>',
    })
    .when('/goods/brand/edit/:id/:name', {
      template: '<goods-brand-edit></goods-brand-edit>',
    })
    .when('/goods/brand/check/:id/:name', {
      template: '<goods-brand-check></goods-brand-check>',
    })
    .when('/goods/logistics', {
      reportKey: 'PAGE_CM_FREIGHT_TPL',
      template: '<goods-logistics-list></goods-logistics-list>',
    })
    .when('/goods/logistics/:logistics_type/:id?', {
      template: '<goods-logistic-action></goods-logistic-action>',
    })
    .when('/goods/priceAdjust', {
      template: '<price-adjust></price-adjust>',
    })
    .when('/goods/myPriceAdjustApply', {
      reportKey: 'PAGE_CM_ADJUST_PRICE',
      template: '<my-price-adjust></my-price-adjust>',
    })
    .when('/goods/lockItemList', {
      template: '<lock-item-list></lock-item-list>',
    })
    .when('/goods/publish', {
      template: '<goods-class-type></goods-class-type>',
    })
    .when('/goods/publish/:classId', {
      template: '<goods-basic-info></goods-basic-info>',
    })
    .when('/goods/WaitPost/:goodId', {
      template: '<goods-class-type></goods-class-type>',
    })
    .when('/goods/WaitPost/:classId/:goodId', {
      template: '<goods-basic-info></goods-basic-info>',
    })
    .when('/goods/posted/:classId/:goodId', {
      template: '<goods-basic-info></goods-basic-info>',
    })
    .when('/goods/Off/:classId/:goodId', {
      template: '<goods-basic-info></goods-basic-info>',
    })
    .when('/goods/posted', {
      template: '<goods-posted></goods-posted>',
    })
    .when('/goods/WaitPost', {
      template: '<goods-wait-post></goods-wait-post>',
    })
    .when('/goods/Off', {
      template: '<goods-off></goods-off>',
    })
    .when('/goods/distribution', {
      template: '<cooperation-kol-info-list></cooperation-kol-info-list>',
    })
    .when('/goods/thirdparty', {
      template: '<goods-thirdparty></goods-thirdparty>',
    })
    .when('/goods/hidden', {
      template: '<goods-hidden></goods-hidden>',
    })
    .when('/goods/collection', {
      template: '<goods-my-collection></goods-my-collection>',
    })
    .when('/goods/search', {
      template: '<goods-search></goods-search>',
    })
    .when('/goods/fusion', {
      template: '<goods-fusion></goods-fusion>',
    })
    .when('/goods/goods-in-batch', {
      template: '<goods-in-batch-list></goods-in-batch-list>',
    })
    .when('/goods/goods-in-batch-new', {
      template: '<goods-in-batch-new></goods-in-batch-new>',
    })
    .when('/goods/Post', {
      redirectTo: '/goods/publish',
    })
    .when('/goods/Post/:classid', {
      redirectTo: '/goods/publish',
    })
    .when('/goods/Post/edit/:type/:goodId', {
      template: '<goods-post-class-deprecated></goods-post-class-deprecated>',
    })
    .when('/goods/Post/:classid/:type/:goodId', {
      template:
        '<goods-post-basic-info-deprecated></goods-post-basic-info-deprecated>',
    })
    .when('/goods/generate-sub-goods', {
      template: '<goods-gen-sub-goods type="new"></goods-gen-sub-goods>',
    })
    .when('/goods/generate-sub-goods/:id', {
      template: '<goods-gen-sub-goods type="edit"></goods-gen-sub-goods>',
    })
    .when('/goods/posted', {
      template: '<goods-list insale="1"></goods-list>',
    })
    .when('/goods/Off', {
      template: '<goods-list insale="0"></goods-list>',
    })
    .when('/goods/all', {
      reportKey: 'PAGE_CM_ALL_COMMODITY',
      template: '<goods-all></goods-all>',
    })
    .when('/goods/shopping-notes', {
      template: '<goods-shopping-notes-list></goods-shopping-notes-list>',
    })
    .when('/goods/shopping-notes/add', {
      template:
        '<goods-shopping-notes-action type="add"></goods-shopping-notes-action>',
    })
    .when('/goods/shopping-notes/:id', {
      template:
        '<goods-shopping-notes-action type="edit"></goods-shopping-notes-action>',
    })
    .when('/wanted/publish-article', {
      template: '<publish-article></publish-article>',
    })
    .when('/wanted/myCircle', {
      template: '<my-circle-list></my-circle-list>',
    })
    .when('/wanted/myCircle/circleInfo', {
      template: '<circle-info></circle-info>',
    })
    .when('/wanted/myCircle/relateCircle', {
      template: '<relate-circle></relate-circle>',
    })
    .when('/wanted/myCircle/createCollection', {
      template: '<create-collection></create-collection>',
    })
    .when('/wanted/myCircle/editCollection', {
      template: '<edit-collection></edit-collection>',
    })
    .when('/wanted/myCircle/collectionItemList', {
      template: '<collection-item-list></collection-item-list>',
    })
    .when('/wanted/myCircle/editCollectionItem', {
      template: '<edit-collection-item></edit-collection-item>',
    })
    .when('/wanted/myCircle/addGoodsTags', {
      template: '<add-goods-tags></add-goods-tags>',
    })
    .when('/wanted/pgcCircle', {
      template: '<pgc-circle></pgc-circle>',
    })
    .when('/wanted/myCircle/createCircle', {
      template: '<create-circle></create-circle>',
    })
    .when('/wanted/themeList', {
      template: '<theme-list type="1"></theme-list>',
    })
    .when('/wanted/myThemeList', {
      template: '<theme-list type="2"></theme-list>',
    })
    .when('/wanted/theme/edit/:id', {
      template: '<publish-article type="edit"></publish-article>',
    })
    .when('/wanted/themeList/theme-answer/:t_id', {
      template: '<theme-answer></theme-answer>',
    })
    .when('/wanted/themeList/addAnswer', {
      template: '<add-answer></add-answer>',
    })
    .when('/wanted/themeClassified', {
      template: '<theme-classified></theme-classified>',
    })
    .when('/wanted/pgc-content-answer', {
      template: '<pgc-content-answer></pgc-content-answer>',
    })
    .when('/wanted/replyList', {
      template: '<reply-list></reply-list>',
    })
    .when('/wanted/themeList/addReply', {
      template: '<add-reply></add-reply>',
    })
    .when('/wanted/replyList/comment', {
      template: '<comment-detail></comment-detail>',
    })
    .when('/wanted/themeList/selectGoods', {
      template: '<select-goods></select-goods>',
    })
    .when('/wanted/pgc-part', {
      template: '<pgc-part></pgc-part>',
    })
    .when('/wanted/topicList/createTopic', {
      template: '<create-topic></create-topic>',
    })
    .when('/wanted/topicList/editTopic/:topic_id/:cir_id', {
      template: '<edit-topic></edit-topic>',
    })
    .when('/wanted/topicList/editTopicPublished/:topic_id/:cir_id', {
      template: '<edit-topic-published></edit-topic-published>',
    })
    .when('/event', {
      redirectTo: '/event/index-event',
    })
    .when('/event/index-event', {
      template: '<event-index></event-index>',
    })
    .when('/event/index-event-answer', {
      template: '<event-index-answer></event-index-answer>',
    })
    .when('/event/event-temp-answer', {
      template: '<event-temp-answer></event-temp-answer>',
    })
    .when('/event/daren', {
      template: '<event-daren></event-daren>',
    })
    .when('/event/my-event', {
      template: '<my-event></my-event>',
    })
    .when('/event/couponv1', {
      template: '<coupon-list></coupon-list>',
    })
    .when('/event/couponv1/apply-new-coupon', {
      template: '<apply-new-coupon></apply-new-coupon>',
    })
    .when('/event/active-list', {
      template: '<active-list></active-list>',
    })
    .when('/event/add-active', {
      template: '<add-active></add-active>',
    })
    .when('/event/manage-event-goods', {
      template: '<manage-event-goods></manage-event-goods>',
    })
    .when('/event/add-goods', {
      template: '<event-add-goods></event-add-goods>',
    })
    .when('/event/active-goods', {
      template: '<active-goods-list></active-goods-list>',
    })
    .when('/event/column-manage', {
      template: '<column-manage></column-manage>',
    })
    .when('/event/add-column', {
      template: '<add-column></add-column>',
    })
    .when('/event/edit-event-answer', {
      template: '<edit-event-answer></edit-event-answer>',
    })
    .when('/event/seego-partner-list', {
      template: '<seego-partner-list></seego-partner-list>',
    })
    .when('/event/seego-partner-bill/:id', {
      template: '<seego-partner-bill></seego-partner-bill>',
    })
    .when('/event/couponv2', {
      template: '<event-coupon-list-v2></event-coupon-list-v2>',
    })
    .when('/event/couponv2/add', {
      template: '<event-coupon-action-v2 type="add"></event-coupon-action-v2>',
    })
    .when('/event/couponv2/:id/edit', {
      template: '<event-coupon-action-v2 type="edit"></event-coupon-action-v2>',
    })
    .when('/event/couponv2/:id/view', {
      template: '<event-coupon-action-v2 type="view"></event-coupon-action-v2>',
    })
    .when('/event/group', {
      template: '<event-group-list></event-group-list>',
    })
    .when('/event/luckybag/settings', {
      template: '<lucky-bag-settings></lucky-bag-settings>',
    })
    .when('/event/group/add', {
      template: '<event-group-action type="add"></event-group-action>',
    })
    .when('/event/group/:id/edit', {
      template: '<event-group-action type="edit"></event-group-action>',
    })
    .when('/event/group/:id/view', {
      template: '<event-group-action type="view"></event-group-action>',
    })
    .when('/event/lottery-group-setting', {
      template: '<lottery-group-setting></lottery-group-setting>',
    })
    .when('/event/seckill', {
      template: [7, 10, 25].includes(+seller_privilege) // 内部账号
        ? '<event-seckill-list-v2></event-seckill-list-v2>'
        : '<event-seckill-list></event-seckill-list>',
    })
    .when('/batch', {
      redirectTo: '/batch/assign-logs',
    })
    .when('/batch/assign-logs', {
      template: [7, 10, 25].includes(+seller_privilege) // 内部账号(批量日志)
        ? '<batch-assign-logs></batch-assign-logs>'
        : '<h1>当前用户无权限访问！</h1>',
    })
    .when('/event/seckill/add', {
      template: '<event-seckill-action type="add"></event-seckill-action>',
    })
    .when('/event/seckill/:id/view', {
      template: '<event-seckill-action type="view"></event-seckill-action>',
    })
    .when('/event/dailywelfare', {
      template: '<daily-welfare-list></daily-welfare-list>',
    })
    .when('/event/dailywelfare/:type/:id?', {
      template: '<daily-welfare-action type="welfare"></daily-welfare-action>',
    })
    .when('/datacenter', {
      redirectTo: '/datacenter/order-data',
    })
    .when('/datacenter/order-data', {
      template: '<datacenter-order></datacenter-order>',
    })
    .when('/datacenter/order-detail', {
      template: '<datacenter-order-detail></datacenter-order-detail>',
    })
    .when('/datacenter/goods-data', {
      template: '<datacenter-goods></datacenter-goods>',
    })
    .when('/datacenter/brands-data', {
      template: '<datacenter-brands></datacenter-brands>',
    })
    .when('/datacenter/collection-data', {
      template: '<datacenter-collection></datacenter-collection>',
    })
    .when('/datacenter/collection-data/:id', {
      template: '<datacenter-detail></datacenter-detail>',
    })
    .when('/datacenter/data-collection-data', {
      template: '<datacenter-data-collection></datacenter-data-collection>',
    })
    .when('/asset', {
      redirectTo: '/asset/settle',
    })
    .when('/asset/settle', {
      template: '<asset-settle></asset-settle>',
    })
    .when('/asset/settlePgc', {
      template: '<asset-settle-pgc></asset-settle-pgc>',
    })
    .when('/asset/withdrawDetail/:id?', {
      template: '<asset-withdraw-detail></asset-withdraw-detail>',
    })
    .when('/asset/withdrawDetailGoods/:id?', {
      template: '<asset-withdraw-goods-detail></asset-withdraw-goods-detail>',
    })
    .when('/asset/withdrawDetailTopic/:id?', {
      template: '<asset-withdraw-topic-detail></asset-withdraw-topic-detail>',
    })
    .when('/financial', {
      redirectTo: '/financial/needpay',
    })
    .when('/financial/needpay', {
      template: '<financial-need-pay></financial-need-pay>',
    })
    .when('/financial/needpay/:id', {
      template: '<financial-detail></financial-detail>',
    })
    .when('/financial/alreadypay', {
      template: '<financial-already-pay></financial-already-pay>',
    })
    .when('/financial/alreadypay/:id', {
      template: '<financial-detail></financial-detail>',
    })
    .when('/financial/pending-refund', {
      template: '<financial-pending-refund></financial-pending-refund>',
    })
    .when('/Detail/:orderId', {
      redirectTo: '/orderDetail/:orderId/0',
    })
    .when('/contact', {
      redirectTo: 'contact/daily',
    })
    .when('/contact/daily', {
      template: '<contact-daily></contact-daily>',
    })
    .when('/contact/logistic', {
      reportKey: 'PAGE_LOGISTICS_FAQ',
      template: '<contact-logistic></contact-logistic>',
    })
    .when('/contact/center', {
      template: '<contact-center></contact-center>',
    })
    .when('/contact/shop', {
      template: '<contact-shop></contact-shop>',
    })
    .when('/faq', {
      reportKey: 'PAGE_FAQ',
      template: '<faq></faq>',
    })
    .when('/parttime', {
      redirectTo: '/parttime/userTheme',
    })
    .when('/account', {
      redirectTo: '/account/list',
    })
    .when('/account/list', {
      template: '<account-list></account-list>',
    })
    .when('/account/create', {
      template: '<account-create></account-create>',
    })
    .when('/personalInfo', {
      redirectTo: '/personalInfo/account',
    })
    .when('/personalInfo/account', {
      template: '<index-account></index-account>',
    })
    .when('/personalInfo/msgCenter', {
      template: '<msg-center></msg-center>',
    })
    .when('/personalInfo/circle', {
      template: '<index-circle></index-circle>',
    })
    .when('/personalInfo/flow', {
      template: '<index-flow></index-flow>',
    })
    .when('/personalInfo/im', {
      template: '<index-im></index-im>',
    })
    .when('/personalInfo/account/modifypwd', {
      template: '<modify-pwd></modify-pwd>',
    })
    .when('/personalInfo/account/modifyuser', {
      template: '<modify-user></modify-user>',
    })
    .when('/personalInfo/account/modifyinfo', {
      template: '<modify-info></modify-info>',
    })
    .when('/personalInfo/account/modifyinfo-kol', {
      template: '<modify-kol-info></modify-kol-info>',
    })
    .when('/personalInfo/account/modify-account', {
      template: '<modify-account></modify-account>',
    })
    .when('/personalInfo/account/modifyinfo-login', {
      template: '<modify-login-info></modify-login-info>',
    })
    .when('/wechat/media', {
      template: '<wechat-media></wechat-media>',
    })
    .when('/wechat/media/:uid', {
      template: '<wechat-media-dashboard></wechat-media-dashboard>',
    })
    .when('/wechat/article', {
      template: '<wechat-article></wechat-article>',
    })
    .when('/wechat/article/:uid', {
      template: '<wechat-article-dashboard></wechat-article-dashboard>',
    })
    .when('/wechat/yuqing', {
      template: '<wechat-yuqing></wechat-yuqing>',
    })
    .when('/fashion', {
      redirectTo: '/fashion/material',
    })
    .when('/fashion/material', {
      template: '<fashion-material></fashion-material>',
    })
    .when('/fashion/hotlist', {
      template: '<fashion-hotlist></fashion-hotlist>',
    })
    .when('/fashion/goods-ranking-list', {
      template: '<fashion-goods-ranking-list></fashion-goods-ranking-list>',
    })
    .when('/fashion/hot-goods', {
      template: '<fashion-hot-goods></fashion-hot-goods>',
    })
    .when('/fashion/hot-goods-v2', {
      reportKey: 'PAGE_HOT_COMMODITY',
      template: [24, 30].includes(+seller_privilege)
        ? '<fashion-hot-goods-v2></fashion-hot-goods-v2>'
        : '<fashion-hot-goods-ng5></fashion-hot-goods-ng5>',
    })
    .when('/fashion/hot-goods-v2/favor', {
      template: [24, 30].includes(+seller_privilege)
        ? '<fashion-hot-goods-v2></fashion-hot-goods-v2>'
        : '<fashion-hot-goods-ng5-favor></fashion-hot-goods-ng5-favor>',
    })
    .when('/fashion/selected-goods', {
      template: '<fashion-selected-goods></fashion-selected-goods>',
    })
    .when('/fashion/favorite', {
      template: '<fashion-favorite></fashion-favorite>',
    })
    .when('/tag/test', {
      template: '<tag-test></tag-test>',
    })
    .when('/cooperation/kol-info-list', {
      template: '<cooperation-kol-info-list></cooperation-kol-info-list>',
    })
    .when('/kol/order-all', {
      template: '<order-all></order-all>',
    })
    .when('/kol/kol-rank', {
      template: '<fashion-kol-rank></fashion-kol-rank>',
    })
    .when('/kol/kol-rank/:type/:category/:key', {
      template: '<fashion-kol-rank-detail></fashion-kol-rank-detail>',
    })
    .when('/kol/kol-cooperation-management', {
      template:
        '<fashion-kol-cooperation-management></fashion-kol-cooperation-management>',
    })
    .when('/kol/kol-cooperation-management/:id', {
      template: '<fashion-kol-info-list></fashion-kol-info-list>',
    })
    .when('/kol-item/kol-cooperation-management/:id', {
      template: '<fashion-kol-info-list></fashion-kol-info-list>',
    })
    .when('/kol/kol-cooperation-management/:id/marketing-tools', {
      template: '<kol-marketing-tools></kol-marketing-tools>',
    })
    .when('/kol/kol-cooperation-management/:id/:article_id', {
      template: '<fashion-kol-article-list></fashion-kol-article-list>',
    })
    .when('/kol/kol-mall-banner-list', {
      template: '<kol-mall-banner-list></kol-mall-banner-list>',
    })
    .when('/store/goods-list', {
      template: '<store-goods-list></store-goods-list>',
    })
    .when('/store/goods-list/:id', {
      template: '<store-goods-item></store-goods-item>',
    })
    .when('/store/goods-list/:id/warehousing-info-list', {
      template: '<warehousing-info-list></warehousing-info-list>',
    })
    .when('/store/goods-list/:id/warehousing-info-new', {
      template: '<warehousing-info-new></warehousing-info-new>',
    })
    .when('/store/goods-list/:id/distribution-store-lock-list', {
      template: '<distribution-store-lock-list></distribution-store-lock-list>',
    })
    .when('/store/goods-list/:id/distribution-store-lock-new', {
      template: '<distribution-store-lock-new></distribution-store-lock-new>',
    })
    .when('/store/goods-list/:id/out-store-list', {
      template: '<out-store-list></out-store-list>',
    })
    .when('/store/goods-list/:id/out-store-new', {
      template: '<out-store-new></out-store-new>',
    })
    .when('/store/goods-list/:id/store-overview', {
      template: '<store-overview></store-overview>',
    })
    .when('/store/distribution-list', {
      template: '<store-distribution-list></store-distribution-list>',
    })
    .when('/store/distribution-list/:id/store-lock-records', {
      template: '<store-lock-records></store-lock-records>',
    })
    .when('/store/distribution-list/:id/store-priority', {
      template: '<store-priority></store-priority>',
    })
    .when('/mall', {
      redirectTo: '/mall/temp-list',
    })
    .when('/mall/temp-list', {
      template: '<mall-temp-list></mall-temp-list>',
    })
    .when('/mall/temp-list/:id', {
      template: '<mall-temp-detail></mall-temp-detail>',
    })
    .when('/mall/temp-info', {
      template: '<mall-temp-info></mall-temp-info>',
    })
    .when('/mall/list', {
      template: '<mall-list></mall-list>',
    })
    .when('/shop', {
      redirectTo: '/shop/info',
    })
    .when('/shop/guide', {
      template: '<shop-guide></shop-guide>',
    })
    .when('/shop/info', {
      reportKey: 'PAGE_SHOP_OVERVIEW',
      template: '<shop-info></shop-info>',
    })
    .when('/shop/operate', {
      reportKey: 'PAGE_SHOP_OPERATE',
      template: '<shop-operate></shop-operate>',
    })
    .when('/shop/create', {
      reportKey: 'PAGE_CREATE_SHOP',
      template: '<shop-create></shop-create>',
    })
    .when('/shop/create/:id', {
      template: '<shop-create></shop-create>',
    })
    .when('/shop/manage', {
      template: '<shop-manage></shop-manage>',
    })
    .when('/shop/apply', {
      template: '<shop-apply></shop-apply>',
    })
    .when('/shop/store-construction', {
      template: '<country-list></country-list>',
    })
    .when('/assetNew', {
      redirectTo: '/assetNew/info',
    })
    .when('/assetNew/info', {
      reportKey: 'PAGE_ASSET_OVERVIEW',
      template: '<asset-new-info></asset-new-info>',
    })
    .when('/assetNew/recharge', {
      template: '<recharge-redirect></recharge-redirect>',
    })
    .when('/recharge/result', {
      template: '<recharge-result></recharge-result>',
    })
    .when('/assetNew/record', {
      reportKey: 'PAGE_ASSET_ENTER_ACCOUNT',
      template: '<asset-new-record></asset-new-record>',
    })
    .when('/assetNew/withdrawals', {
      template: '<apply-withdrawals></apply-withdrawals>',
    })
    .when('/assetNew/recording', {
      template: '<asset-new-recording></asset-new-recording>',
    })
    .when('/assetNew/recorded', {
      template: '<asset-new-recorded></asset-new-recorded>',
    })
    .when('/assetNew/list', {
      reportKey: 'PAGE_WITHDRAW_CASH',
      template: '<asset-new-list></asset-new-list>',
    })
    .when('/financialNew/recorded', {
      template: '<financial-new-recorded></financial-new-recorded>',
    })
    .when('/financialNew/withdraw', {
      template: '<financial-new-withdraw></financial-new-withdraw>',
    })
    .when('/financialNew/recharge', {
      template: '<financial-new-recharge></financial-new-recharge>',
    })
    .when('/financialNew/accountFix', {
      template: '<financial-new-account-fix></financial-new-account-fix>',
    })
    .when('/dashboard', {
      redirectTo: '/dashboard/dashboard',
    })
    .when('/dashboard/dashboard', {
      reportKey: 'PAGE_OVERVIEW',
      template: '<dashboard></dashboard>',
    })
    .when('/goods-theme-list', {
      reportKey: 'PAGE_THEME_LIST',
      template: '<goods-theme-list></goods-theme-list>',
    })
    .when('/goods-theme-list/:themeId', {
      reportKey: 'PAGE_THEME_DETAIL',
      reportExt3: ':themeId',
      template: '<goods-theme-goods-list></goods-theme-goods-list>',
    })
    .when('/goods/import/list', {
      template: '<goods-import-list></goods-import-list>',
    })
    .when('/goods/distribute/list', {
      template: '<goods-distribute-list></goods-distribute-list>',
    })
    .when('/seedata/index', {
      template: '<seedata></seedata>',
    })
    .otherwise({ template: '' });
}

export function handleRouter(p: string, seller_name: string) {
  switch (~~p) {
    case 4: // 心愿兼职
      return '/parttime/userTheme';
    case 5: // 财务
      return '/financial/needpay';
    case 1: // c2c
    case 7: // 超管
    case 22: // 数据BI
      return '/datacenter/order-data';
    case 8: // pgc
    case 9: // 内容
    case 21: // 内容兼职
      return '/wanted/myCircle';
    case 20: // 运营
      return '/wanted/themeClassified';
    case 24: // kol
      return '/order/mine'; // fashion/hot-goods'
    case 25: // 流量组
      return '/fashion/goods-ranking-list';
    case 26: // 投资
      if (seller_name === '如涵') {
        return '/goods/list1688';
      }
      return '/datacenter/order-detail';
    case 30: // 新品牌后台
      if (localStorage.getItem('kolId') === '-1') {
        return '/shop/create';
      }
      return '/dashboard/dashboard';
    case 40: // 流量采买
      return '/shop/apply';
    default:
      return '/personalInfo/account';
  }
}
