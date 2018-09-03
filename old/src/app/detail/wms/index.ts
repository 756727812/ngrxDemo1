import * as angular from 'angular'

import { outStockDetail } from './out-stock-detail.component'
import { outStockList } from './out-stock-list.component'
import { stockDetail } from './stock-detail.component'

import { ModalPostOrderBatchController } from './modal/modal-post-order-batch.controller';

import { wmsService } from './wms.service'

export default
  angular
    .module('seego.wms', [])
    .component('outStockDetail', outStockDetail)
    .component('outStockList', outStockList)
    .component('stockDetail', stockDetail)
    .controller('ModalPostOrderBatchController', ModalPostOrderBatchController)
    .service('wmsService', wmsService)
    .filter('exStatus', () => str => {
      switch (str) {
        case 1:
          return '新建'
        case 2:
          return '出库中'
        case 3:
          return '出库成功'
        case 4:
          return '出库失败'
        case 5:
          return '已撤销'
        default:
          return '未定义'
      }
    })
    .filter('exType', () => str => {
      switch (str) {
        case 1:
          return '销售出库'
        default:
          return '其他'
      }
    })
    .name
