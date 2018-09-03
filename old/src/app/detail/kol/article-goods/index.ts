import * as angular from 'angular';
import { kolArticleGoodsGoodsLinks } from './goods-links.component';
import { kolArticleGoodsLinkInfo } from './link-info/link-info.component';
import { kolArticleGoodsLinkInfoQrTabPane } from './link-info/qr-tab-pane.component';
import { kolArticleGoodsLinkInfoTabPane } from './link-info/tab-pane.component';
import { kolArticleGoodsLinkInfoTabs } from './link-info/tabs.component';
import { kolArticleGoodsSteps } from './steps.component';

export default angular
  .module('seego.kol.article-goods', [])
  .component('kolArticleGoodsGoodsLinks', kolArticleGoodsGoodsLinks)
  .component('kolArticleGoodsLinkInfo', kolArticleGoodsLinkInfo)
  .component(
    'kolArticleGoodsLinkInfoQrTabPane',
    kolArticleGoodsLinkInfoQrTabPane,
  )
  .component('kolArticleGoodsLinkInfoTabPane', kolArticleGoodsLinkInfoTabPane)
  .component('kolArticleGoodsLinkInfoTabs', kolArticleGoodsLinkInfoTabs)
  .component('kolArticleGoodsSteps', kolArticleGoodsSteps).name;
