import * as angular from 'angular'

import { financialAlreadyPay } from './financial-alreadypay.component'
import { financialNeedPay } from './financial-needpay.component'
import { financialPendingRefund } from './financial-pending-refund.component'
import { financialDetail } from './financial-detail.component'
import { modalReviewTheRefundController } from './modal-review-the-refund.controller'

export default
  angular
    .module('seego.financial', [])
    .component('financialAlreadyPay', financialAlreadyPay)
    .component('financialNeedPay', financialNeedPay)
    .component('financialPendingRefund', financialPendingRefund)
    .component('financialDetail', financialDetail)
    .controller('modalReviewTheRefundController', modalReviewTheRefundController)
    .name
