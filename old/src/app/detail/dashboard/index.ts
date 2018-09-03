import * as angular from 'angular'

import { dashboard } from './dashboard.component'
import { dashboardArrowIcon } from './dashboard-arrow-icon.component'
import { modalShopAccessInfo } from '../shop/shop-info/modal-shop-access-info.component'
import { dashboardLastUpdate } from './dashboard-last-update.component'

export default
  angular
    .module('seego.dashboard', [])
    .component('dashboard', dashboard)
    .component('dashboardArrowIcon', dashboardArrowIcon)
    .component('modalShopAccessInfo_1', modalShopAccessInfo)
    .component('dashboardLastUpdate', dashboardLastUpdate)
    .name
