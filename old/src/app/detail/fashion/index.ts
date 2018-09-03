import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';

import { fashionFavorite } from './fashion-favorite.component';
import { fashionGoodsRankingList } from './fashion-goods-ranking-list.component';
import { fashionHotGoods } from './fashion-hot-goods.component';
import { fashionHotGoodsV2 } from './fashion-hot-goods-v2.component';
import { fashionHotlist } from './fashion-hotlist.component';
import { fashionMaterial } from './fashion-material.component';
import { fashionSelectedGoods } from './fashion-selected-goods.component';
import { fashionService } from './fashion.service';
import { modalApplyCustomLibController } from './modal-apply-custom-lib.controller';
import { modalApplyNewLibController } from './modal-apply-new-lib.controller';
import { modalBrandAddListController } from './modal-brand-add-list.controller';
import { modalEditSupplyPriceController } from './modal-edit-supply-price.controller';
import { modalItemAddListController } from './modal-item-add-list.controller';
import { modalMaterialDetailController } from './modal-material-detail.controller';
import { FashionHotGoodsNg5 } from './fashion-hot-goods-ng5.component';
import { FashionHotGoodsNg5Favor } from './fashion-hot-goods-ng5-favor.component';

import './fashion.less';

export default angular
  .module('seego.fashion', [])
  .service('fashionService', fashionService)
  .component('fashionFavorite', fashionFavorite)
  .component('fashionGoodsRankingList', fashionGoodsRankingList)
  .component('fashionHotGoods', fashionHotGoods)
  .component('fashionHotGoodsV2', fashionHotGoodsV2)
  .component('fashionHotlist', fashionHotlist)
  .component('fashionMaterial', fashionMaterial)
  .component('fashionSelectedGoods', fashionSelectedGoods)
  .controller('modalApplyCustomLibController', modalApplyCustomLibController)
  .controller('modalApplyNewLibController', modalApplyNewLibController)
  .controller('modalBrandAddListController', modalBrandAddListController)
  .controller('modalEditSupplyPriceController', modalEditSupplyPriceController)
  .controller('modalItemAddListController', modalItemAddListController)
  .controller('modalMaterialDetailController', modalMaterialDetailController)
  .directive(
    'fashionHotGoodsNg5',
    downgradeComponent({ component: FashionHotGoodsNg5 }),
  )
  .directive(
    'fashionHotGoodsNg5Favor',
    downgradeComponent({ component: FashionHotGoodsNg5Favor }),
  ).name;
