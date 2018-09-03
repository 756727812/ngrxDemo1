import * as angular from 'angular'

import { distributionStoreLockList } from './distribution-store-lock-list.component'
import { distributionStoreLockNew } from './distribution-store-lock-new.component'
import { outStoreList } from './out-store-list.component'
import { outStoreNew } from './out-store-new.component'
import { storeDistributionList } from './store-distribution-list.component'
import { storeGoodsItem } from './store-goods-item.component'
import { storeGoodsList } from './store-goods-list.component'
import { storeItem } from './store-item.component'
import { storeLockRecords } from './store-lock-records.component'
import { storeOverview } from './store-overview.component'
import { storePriority } from './store-priority.component'
import { warehousingInfoList } from './warehousing-info-list.component'
import { warehousingInfoNew } from './warehousing-info-new.component'
import { storeService } from './store.service'

export default
  angular
    .module('seego.store', [])
    .component('distributionStoreLockList', distributionStoreLockList)
    .component('distributionStoreLockNew', distributionStoreLockNew)
    .component('outStoreList', outStoreList)
    .component('outStoreNew', outStoreNew)
    .component('storeDistributionList', storeDistributionList)
    .component('storeGoodsItem', storeGoodsItem)
    .component('storeGoodsList', storeGoodsList)
    .component('storeItem', storeItem)
    .component('storeLockRecords', storeLockRecords)
    .component('storeOverview', storeOverview)
    .component('storePriority', storePriority)
    .component('warehousingInfoList', warehousingInfoList)
    .component('warehousingInfoNew', warehousingInfoNew)
    .service('storeService', storeService)
    .name
