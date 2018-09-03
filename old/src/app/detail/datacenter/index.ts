import * as angular from 'angular'

import { datacenterBrands } from './datacenter-brands.component'
import { datacenterCollection } from './datacenter-collection.component'
import { datacenterDataCollection } from './datacenter-data-collection.component'
import { datacenterDetail } from './datacenter-detail.component'
import { datacenterOrder } from './datacenter-order.component'
import { datacenterOrderDetail } from './datacenter-order-detail.component'
import { datacenterGoods } from './datacenter-goods.component'
import { datacenterPgcGoods } from './datacenter-pgc-goods.component'
import { modalSelectClassController } from './modal-select-class.controller'
import { modalShowSubGoodsDistributionData } from './modal-show-sub-goods-distribution-data.component'
import { GmvCompositionTips } from './gmv-composition-tips/gmv-composition-tips.component'

export default
  angular
    .module('seego.datacenter', [])
    .component('datacenterBrands', datacenterBrands)
    .component('datacenterCollection', datacenterCollection)
    .component('datacenterDataCollection', datacenterDataCollection)
    .component('datacenterDetail', datacenterDetail)
    .component('datacenterOrder', datacenterOrder)
    .component('datacenterOrderDetail', datacenterOrderDetail)
    .component('datacenterGoods', datacenterGoods)
    .component('datacenterPgcGoods', datacenterPgcGoods)
    .component('modalShowSubGoodsDistributionData', modalShowSubGoodsDistributionData)
    .component('gmvCompositionTips', GmvCompositionTips)
    .controller('modalSelectClassController', modalSelectClassController)
    .name
