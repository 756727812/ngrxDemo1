import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';

import { KolMarketingTools } from './kol-marketing-tools.component';
import { fashionKolArticleList } from './fashion-kol-article-list.component';
import { fashionKolCooperationManagement } from './fashion-kol-cooperation-management.component';
import { fashionKolInfoList } from './fashion-kol-info-list.component';
import { fashionKolRank } from './fashion-kol-rank.component';
import { fashionKolRankDetail } from './fashion-kol-rank-detail.component';
import { kolFigureSingleTable } from './kol-figure-single-table.component';
import { kolItemInfo } from './kol-item-info.component';
import { kolMallBannerList } from './kol-mall-banner-list.component';
import { kolMarketingInfo } from './kol-marketing-info.component';
import { modalCreateKOLController } from './modal-create-kol.controller';
import { modalKOLSelectedController } from './modal-kol-selected.controller';
import { modalCreateKOLArticleController } from './modal-create-kol-article.controller';
import { modalEditKOLItemPriceController } from './modal-edit-kol-item-price.controller';
import { modalCreateArticleAddItemsController } from './modal-create-article-add-item.controller';
import { modalCreateArticleChoiceItemsController } from './modal-create-article-choice-item.controller';
import { modalCreateCollectionCouponController } from './modal-create-collection-coupon.controller';
import { modalCreateKOLArticleNewController } from './modal-create-kol-article-new.controller';
import { modalCreateCollectionTextController } from './modal-create-collection-text.controller';
import { modalCreateKOLArticleShopController } from './modal-create-kol-article-shop.controller';
import { modalCreateSeckillController } from './modal-create-seckill.controller';
import { kolActSpikeController } from './modal-kol-act-spike.controller';
import { modalKolMallAddBannerController } from './modal-kol-mall-add-banner.controller';
import { modalKolMallEditBannerController } from './modal-kol-mall-edit-banner.controller';
import { modalHotItemController } from './modal-hot-item.controller';
import { modalCopyUrlController } from './modal-copy-url.controller';
import {
  modalEditWechatIdController,
  modalEditWechatId,
} from './modal-edit-wechatid.controller';
import { mallClassRankSetController } from './modal-mall-class-rank-set.controller';
import { orderAll } from './order-all.component';
import { kolService } from './kol.service';
import articleGoodsModule from './article-goods';
import articleFormModule from './article-form';
import { ModalArticleAddGroupBuyGoods } from './modal-article-add-group-buy-goods.component';
import { modalLinkKolListController } from './modal-link-kol-listV2.controller'; // 弹窗提示跳转内容电商2.0
import { ModalLinksComponentV2 } from '../kol-v2/components/modal-links-v2/modal-links.component'; // 新弹窗商品链接
import { ModalLinkService } from '../kol-v2/services/modal-link.service'; // 新弹窗商品链接

export default angular
  .module('seego.kol', [articleGoodsModule, articleFormModule])
  .component('kolMarketingTools', KolMarketingTools)
  .component('kolMarketingInfo', kolMarketingInfo)
  .component('modalEditWechatId', modalEditWechatId)
  .component('fashionKolArticleList', fashionKolArticleList)
  .component('fashionKolCooperationManagement', fashionKolCooperationManagement)
  .component('fashionKolInfoList', fashionKolInfoList)
  .component('fashionKolRank', fashionKolRank)
  .component('fashionKolRankDetail', fashionKolRankDetail)
  .component('kolFigureSingleTable', kolFigureSingleTable)
  .component('kolItemInfo', kolItemInfo)
  .component('kolMallBannerList', kolMallBannerList)
  .controller('modalCreateKOLController', modalCreateKOLController)
  .controller('modalKOLSelectedController', modalKOLSelectedController)
  .controller(
    'modalCreateKOLArticleController',
    modalCreateKOLArticleController,
  )
  .controller(
    'modalEditKOLItemPriceController',
    modalEditKOLItemPriceController,
  )
  .controller(
    'modalCreateArticleAddItemsController',
    modalCreateArticleAddItemsController,
  )
  .controller(
    'modalCreateArticleChoiceItemsController',
    modalCreateArticleChoiceItemsController,
  )
  .controller(
    'modalCreateCollectionCouponController',
    modalCreateCollectionCouponController,
  )
  .controller(
    'modalCreateKOLArticleNewController',
    modalCreateKOLArticleNewController,
  )
  .controller(
    'modalCreateCollectionTextController',
    modalCreateCollectionTextController,
  )
  .controller(
    'modalCreateKOLArticleShopController',
    modalCreateKOLArticleShopController,
  )
  .controller('modalCreateSeckillController', modalCreateSeckillController)
  .controller('modalHotItemController', modalHotItemController)
  .controller(
    'modalKolMallAddBannerController',
    modalKolMallAddBannerController,
  )
  .controller(
    'modalKolMallEditBannerController',
    modalKolMallEditBannerController,
  )
  .controller('modalLinkKolListController', modalLinkKolListController)
  .controller('kolActSpikeController', kolActSpikeController)
  .controller('modalCopyUrlController', modalCopyUrlController)
  .controller('modalEditWechatIdController', modalEditWechatIdController)
  .controller('mallClassRankSetController', mallClassRankSetController)
  .component('orderAll', orderAll)
  .service('kolService', kolService)
  .service('modalLinkService', ModalLinkService)
  .directive(
    'modalArticleAddGroupBuyGoods',
    downgradeComponent({ component: ModalArticleAddGroupBuyGoods }),
  )
  // .directive(
  //   'modalLinksComponentV2',
  //   downgradeComponent({ component: ModalLinksComponentV2 }),
  // )
  .name;
