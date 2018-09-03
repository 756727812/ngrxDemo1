import * as angular from 'angular';

import { orderInBatch } from './order-in-batch.component';
import { modalOrderInBatchConfirm } from './modal-order-in-batch-confirm.component';
import { orderDetail } from './order-detail.component';
import { orderList } from './order-list.component';
import { orderMine } from './order-mine.component';
import { orderSearchArea } from './order-search-area.component';
import { orderSearchBtnGroup } from './order-search-btn-group.component';
import { orderSearchNormal } from './order-search-normal.component';
import { orderSearchSeller } from './order-search-seller.component';
import { orderTable } from './order-table.component';
import { modalApplyReturnGoodsController } from './modal-apply-return-goods.controller';
import { modalAuditRefundController } from './modal-audit-refund.controller';
import { modalBuyerShipController } from './modal-buyer-ship.controller';
import { modalChangeDispatchPriceController } from './modal-change-dispatch-price.controller';
import { modalCompleteOldOrderController } from './modal-complete-old-order.controller';
import { modalCompleteOrderController } from './modal-complete-order.controller';
import { modalCatactUserController } from './modal-contact-user.controller';
import { modalDispatchOldOrderController } from './modal-dispatch-old-order.controller';
import { modalDispatchOrderController } from './modal-dispatch-order.controller';
import { modalInlandShipController } from './modal-inland-ship.controller';
import { modalModifyAddrController } from './modal-modify-addr.controller';
import {
  modalModifyIDCardInfoFromAddrController,
} from './modal-modify-id-card-info-from-addr.controller';
import { modalModifyPriceController } from './modal-modify-price.controller';
import { modalModifySpecController } from './modal-modify-spec.controller';
import { modalOfficialShipController } from './modal-official-ship.controller';
import { modalOldOrderSendGoodsController } from './modal-old-order-send-goods.controller';
import { ControllerController } from './modal-old-send-goods.controller';
import { modalPayTaxController } from './modal-pay-tax.controller';
import { modalRefundController } from './modal-refund.controller';
import { modalTransferHopperShipController } from './modal-transfer-hopper-ship.controller';
import { orderGrouponStatus } from './order-groupon-status.filter';
import { order } from './order.service';
import { modalGoodsAddReturnLogistic } from './modal-goods-add-return-logistic.component';


export default
  angular
    .module('seego.order', [])
    .component('orderInBatch', orderInBatch)
    .component('modalOrderInBatchConfirm', modalOrderInBatchConfirm)
    .component('orderDetail', orderDetail)
    .component('orderList', orderList)
    .component('orderMine', orderMine)
    .component('orderSearchArea', orderSearchArea)
    .component('orderSearchBtnGroup', orderSearchBtnGroup)
    .component('orderSearchNormal', orderSearchNormal)
    .component('orderSearchSeller', orderSearchSeller)
    .component('orderTable', orderTable)
    .component('modalGoodsAddReturnLogistic', modalGoodsAddReturnLogistic)
    .controller('modalApplyReturnGoodsController', modalApplyReturnGoodsController)
    .controller('modalAuditRefundController', modalAuditRefundController)
    .controller('modalBuyerShipController', modalBuyerShipController)
    .controller('modalChangeDispatchPriceController', modalChangeDispatchPriceController)
    .controller('modalCompleteOldOrderController', modalCompleteOldOrderController)
    .controller('modalCompleteOrderController', modalCompleteOrderController)
    .controller('modalCatactUserController', modalCatactUserController)
    .controller('modalDispatchOldOrderController', modalDispatchOldOrderController)
    .controller('modalDispatchOrderController', modalDispatchOrderController)
    .controller('modalInlandShipController', modalInlandShipController)
    .controller('modalModifyAddrController', modalModifyAddrController)
    .controller('modalModifyIDCardInfoFromAddrController', modalModifyIDCardInfoFromAddrController)
    .controller('modalModifyPriceController', modalModifyPriceController)
    .controller('modalOldOrderSendGoodsController', modalOldOrderSendGoodsController)
    .controller('modalModifySpecController', modalModifySpecController)
    .controller('modalOfficialShipController', modalOfficialShipController)
    .controller('ControllerController', ControllerController)
    .controller('modalPayTaxController', modalPayTaxController)
    .controller('modalRefundController', modalRefundController)
    .controller('modalTransferHopperShipController', modalTransferHopperShipController)
    .factory('orderService', order.orderService)
    .filter('action', order.action)
    .filter('orderGrouponStatus', orderGrouponStatus)
    .name;
