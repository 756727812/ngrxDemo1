import * as angular from 'angular'

import { mallTempList } from './mall-temp-list.component'
import { modalCreateTemplateController } from './modal-create-template.controller'
import { modalDivideTemplateController } from './modal-divide-template.controller'
import { modalDivideTemplateSettingController } from './modal-divide-template-setting.controller'
import { mallTempDetail } from './mall-temp-detail.component'
import { mallList } from './mall-list.component'
import { mallListSetController } from './modal-mall-list-set.controller'
import { mallSelectGoodsController } from './modal-mall-select-goods.controller'
import { mallSelectGoodsNewBrandController } from './modal-mall-select-goods-new-brand.controller'
import { mallService } from './mall.service'
import { modalConfirmItemListController } from './modal-confirm-item-list.controller'
import { modalKolItemSetController } from './modal-kol-item-set.controller'
import { modalKolSkuSetController } from './modal-kol-sku-set.controller'
import { modalSuccessSyncCouponController } from './modal-success-sync.controller'

import './index.less'

export default
  angular
    .module('seego.mall', [])
    .component('mallTempList', mallTempList)
    .controller('modalCreateTemplateController', modalCreateTemplateController)
    .controller('modalDivideTemplateController', modalDivideTemplateController)
    .controller('modalDivideTemplateSettingController', modalDivideTemplateSettingController)
    .component('mallTempDetail', mallTempDetail)
    .component('mallList', mallList)
    .controller('mallListSetController', mallListSetController)
    .controller('modalConfirmItemListController', modalConfirmItemListController)
    .controller('modalKolSkuSetController', modalKolSkuSetController)
    .controller('modalKolItemSetController', modalKolItemSetController)
    .controller('mallSelectGoodsController', mallSelectGoodsController)
    .controller('mallSelectGoodsNewBrandController', mallSelectGoodsNewBrandController)
    .controller('modalSuccessSyncCouponController', modalSuccessSyncCouponController)
    .service('mallService', mallService)
    .name
