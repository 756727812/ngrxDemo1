import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';

import { goodsAttrClass } from './attr-class.filter';
import { goodsAttrType } from './attr-type.filter';
import { goodsService } from './goods.service';
import { goodsModalService } from './goods-modal.service';
import { goodsAttributeAction } from './goods-attribute-action.component';
import { goodsAttributeList } from './goods-attribute-list.component';
import { goodsBasicInfo } from './goods-basic-info.component';
import { goodsBrandCheck } from './goods-brand-check.component';
import { goodsBrandEdit } from './goods-brand-edit.component';
import { goodsBrandList } from './goods-brand-list.component';
import { goodsCategoryAddAttr } from './goods-category-add-attr.component';
import { goodsCategoryEdit } from './goods-category-edit.component';
import { goodsCategoryList } from './goods-category-list.component';
import { goodsClassType } from './goods-class-type.component';
import { goodsFusion } from './goods-fusion.component';
import { goodsHidden } from './goods-hidden.component';
import { goodsInBatchList } from './goods-in-batch-list.component';
import { goodsInBatchNew } from './goods-in-batch-new.component';
import { goodsLogisticAction } from './goods-logistic/goods-logistic-action.component';
import { goodsLogisticsList } from './goods-logistic/goods-logistics-list.component';
import { goodsMyCollection } from './goods-my-collection.component';
import { goodsPostBasicInfoDeprecated } from './goods-post-basic-info-deprecated.component';
import { goodsPostClassDeprecated } from './goods-post-class-deprecated.component';
import { goodsSearch } from './goods-search.component';
import { goodsSearchForm } from './goods-search-form.component';
import { goodsThirdparty } from './goods-thirdparty.component';
import { goodsWaitPost } from './goods-wait-post.component';
import { modalAddAttrToClassController } from './modal-add-attr-to-class.controller';
import { modalImportGoodsController } from './modal-import-goods.controller';
import { modalImportGoodsResultController } from './modal-import-goods-result.controller';
import { modalJumpToCircleController } from './modal-jump-to-circle.controller';
import { modalSelectStoreIdController } from './modal-select-store-id.controller';
import { createNewCatModalCtrl } from './modal-create-new-category.controller';
import { editCatModalCtrl } from './modal-edit-category.controller';
import { exampleModalCtrl } from './modal-example.controller';
import { modalChangeWeightCtrl } from './modal-change-weight.controller';
import { modalChangeWeightNewCtrl } from './modal-change-weight-new.controller';
import { ModalGoodShowUpCtrl } from './modal-goods-show-up.controller';
import { ModalGoodsRuleToggleStatusCtrl } from './modal-goods-rule-toggle-status.controller';
import { ModalGoodsRuleDeleteCtrl } from './modal-goods-rule-delete-controller';
import { ModalGoodsRuleDetailShowCtrl } from './modal-goods-rule-detail-show.controller';
import { ModalGoodsMergeBrandCtrl } from './modal-goods-merge-brand.controller';
import { ModalGoodsMergeCtrl } from './modal-goods-merge.controller';
import { addNewBrandCtrl } from './modal-add-new-brand.controller';
import { ModalGoodsMarkBrandCtrl } from './modal-goods-mark-brand.controller';
import { goodsGenSubGoods } from './goods-gen-sub-goods.component';
import { ADDRESS, SHIPFEECHARGE } from './constants';
import { goodsList } from './goods-list.component';
import { modalPriceAdjustController } from './modal-price-adjust.controller';
import { goods1688List } from './goods-1688-list.component';
import { priceAdjust } from './price-adjust.component';
import { myPriceAdjust } from './my-price-adjust.component';
import { lockItemList } from './lock-item-list.component';
import { goodsAnnouncementList } from './bulletin/goods-announcement-list.component';
import { goodsBulletinAction } from './bulletin/goods-bulletin-action.component';
import { goodsBulletinList } from './bulletin/goods-bulletin-list.component';
import { modalAnnouncementController } from './modal-goods-announcement.controller';
import { createMallClassCtrl } from './modal-create-mall-class.controller';
import { modalgoods1688LinkController } from './modal-goods-1688-link.controller';
import { modalGoodsSkuSetController } from './modal-goods-sku-set.controller';
import { modalgoodsChangeStockController } from './modal-goods-change-stock.controller';
import goodsShopModuleName from './group';
import { goodsAll } from './goods-all.component';
import { goodsSelectColors } from './goods-select-colors.component';
import { ModalPictureCenter } from './modal-picture-center.component';
import { ModalSyncChildSku } from './modal-sync-child-sku.component';
import goodsThemeModuleName from './theme';

import goodsImportModuleName from './import';
import { stepBar } from '../../components/stepBar/stepBar.component';

import { modalDistributionInfoController } from './modal/modal-distribution-info.controller';
import distributeModuleName from './distribute';
import { modalGoodsLogisticAddAreas } from './goods-logistic/modal-goods-logistic-add-areas.component';
import { goodsShoppingNotesList } from './shopping-notes/shopping-notes-list.component';
import { goodsShoppingNotesAction } from './shopping-notes/shopping-notes-action.component';
import { modalGoodsShoppingNotesAddXDP } from './shopping-notes/modal-goods-shopping-notes-add-xdp.component';
import { ModalGoodsSelectSkuMark } from './modal-goods-select-sku-mark.component';

import './goods.less';

export default angular
  .module('seego.goods', [
    goodsShopModuleName,
    goodsThemeModuleName,
    goodsImportModuleName,
    distributeModuleName,
  ])
  .factory('goodsService', goodsService)
  .factory('goodsModalService', goodsModalService)
  .filter('attrClass', goodsAttrClass.attrClass)
  .filter('attrType', goodsAttrType.attrType)
  .value('ADDRESS', ADDRESS)
  .value('SHIPFEECHARGE', SHIPFEECHARGE)
  .component('goodsList', goodsList)
  .component('goodsGenSubGoods', goodsGenSubGoods)
  .component('goodsAttributeAction', goodsAttributeAction)
  .component('goodsAttributeList', goodsAttributeList)
  .component('goodsBasicInfo', goodsBasicInfo)
  .component('goodsBrandCheck', goodsBrandCheck)
  .component('goodsBrandEdit', goodsBrandEdit)
  .component('goodsBrandList', goodsBrandList)
  .component('goodsCategoryAddAttr', goodsCategoryAddAttr)
  .component('goodsCategoryEdit', goodsCategoryEdit)
  .component('goodsCategoryList', goodsCategoryList)
  .component('goodsClassType', goodsClassType)
  .component('goodsFusion', goodsFusion)
  .component('goodsHidden', goodsHidden)
  .component('goodsInBatchList', goodsInBatchList)
  .component('goodsInBatchNew', goodsInBatchNew)
  .component('goodsLogisticAction', goodsLogisticAction)
  .component('goodsLogisticsList', goodsLogisticsList)
  .component('modalGoodsLogisticAddAreas', modalGoodsLogisticAddAreas)
  .component('goodsMyCollection', goodsMyCollection)
  .component('goodsPostBasicInfoDeprecated', goodsPostBasicInfoDeprecated)
  .component('goodsPostClassDeprecated', goodsPostClassDeprecated)
  .component('goodsSearch', goodsSearch)
  .component('goodsSearchForm', goodsSearchForm)
  .component('goodsThirdparty', goodsThirdparty)
  .component('goodsWaitPost', goodsWaitPost)
  .component('priceAdjust', priceAdjust)
  .component('myPriceAdjust', myPriceAdjust)
  .component('lockItemList', lockItemList)
  .component('goodsWaitPost', goodsWaitPost)
  .component('goods1688List', goods1688List)
  .component('goodsAnnouncementList', goodsAnnouncementList)
  .component('goodsBulletinAction', goodsBulletinAction)
  .component('goodsBulletinList', goodsBulletinList)
  .component('goodsAll', goodsAll)
  .component('goodsSelectColors', goodsSelectColors)
  .component('modalPictureCenter', ModalPictureCenter)
  .component('modalSyncChildSku', ModalSyncChildSku)
  .component('stepBarOne', stepBar)
  .component('goodsShoppingNotesList', goodsShoppingNotesList)
  .component('goodsShoppingNotesAction', goodsShoppingNotesAction)
  .component('modalGoodsShoppingNotesAddXDP', modalGoodsShoppingNotesAddXDP)
  .controller('modalAnnouncementController', modalAnnouncementController)
  .controller('modalgoods1688LinkController', modalgoods1688LinkController)
  .controller('modalGoodsSkuSetController', modalGoodsSkuSetController)
  .controller('modalAddAttrToClassController', modalAddAttrToClassController)
  .controller('modalImportGoodsController', modalImportGoodsController)
  .controller(
    'modalImportGoodsResultController',
    modalImportGoodsResultController,
  )
  .controller('modalJumpToCircleController', modalJumpToCircleController)
  .controller('modalSelectStoreIdController', modalSelectStoreIdController)
  .controller('createNewCatModalCtrl', createNewCatModalCtrl)
  .controller('editCatModalCtrl', editCatModalCtrl)
  .controller('exampleModalCtrl', exampleModalCtrl)
  .controller('modalChangeWeightCtrl', modalChangeWeightCtrl)
  .controller('modalChangeWeightNewCtrl', modalChangeWeightNewCtrl)
  .controller('ModalGoodShowUpCtrl', ModalGoodShowUpCtrl)
  .controller('ModalGoodsRuleToggleStatusCtrl', ModalGoodsRuleToggleStatusCtrl)
  .controller('ModalGoodsRuleDeleteCtrl', ModalGoodsRuleDeleteCtrl)
  .controller('ModalGoodsRuleDetailShowCtrl', ModalGoodsRuleDetailShowCtrl)
  .controller('ModalGoodsMergeBrandCtrl', ModalGoodsMergeBrandCtrl)
  .controller('modalPriceAdjustController', modalPriceAdjustController)
  .controller('ModalGoodsMergeCtrl', ModalGoodsMergeCtrl)
  .controller('addNewBrandCtrl', addNewBrandCtrl)
  .controller('ModalGoodsMarkBrandCtrl', ModalGoodsMarkBrandCtrl)
  .controller('createMallClassCtrl', createMallClassCtrl)
  .controller(
    'modalgoodsChangeStockController',
    modalgoodsChangeStockController,
  )
  .controller(
    'modalDistributionInfoController',
    modalDistributionInfoController,
  )
  .directive(
    'modalGoodsSelectSkuMark',
    downgradeComponent({ component: ModalGoodsSelectSkuMark }),
  ).name;
