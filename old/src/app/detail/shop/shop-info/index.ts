import './index.less'

import * as angular from 'angular'

import { shopInfo } from './shop-info.component'
import { shopInfoAvatarBlock } from './avatar-block.component'
import { modalShopAccessInfo } from './modal-shop-access-info.component'
import { shopInfoPowerBlock } from './power-block.component'
import { shopInfoDataBlock } from './data-block.component'
import { shopInfoContentBlock } from './content-block.component'
import { shopInfoFlowChartBlock } from './flow-chart-block.component'
import { shopInfoIndicatorBlock } from './indicator-block.component'

export default
  angular
    .module('seego.shop.info', [])
    .component('shopInfo', shopInfo)
    .component('shopInfoAvtarBlock', shopInfoAvatarBlock)
    .component('modalShopAccessInfo', modalShopAccessInfo)
    .component('shopInfoPowerBlock', shopInfoPowerBlock)
    .component('shopInfoDataBlock', shopInfoDataBlock)
    .component('shopInfoContentBlock', shopInfoContentBlock)
    .component('shopInfoFlowChartBlock', shopInfoFlowChartBlock)
    .component('shopInfoIndicatorBlock', shopInfoIndicatorBlock)
    .name
