import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';

import { financialNewRecorded } from './financial-new-recorded.component';
import { financialNewWithdraw } from './financial-new-withdraw.component';
import { financialNewRecharge } from './financial-new-recharge.component';
import { modalWithdrawalsRejectController } from './modal-withdrawals-reject.controller';
import { modalAcceptBillController } from './modal-accept-bill.controller';
import { FinancialNewAccountFix } from './components/financial-new-account-fix.component';

import './financial.less';

export default angular
  .module('seego.financialNew', [])
  .component('financialNewRecorded', financialNewRecorded)
  .component('financialNewWithdraw', financialNewWithdraw)
  .component('financialNewRecharge', financialNewRecharge)
  .controller(
    'modalWithdrawalsRejectController',
    modalWithdrawalsRejectController,
  )
  .controller('modalAcceptBillController', modalAcceptBillController)
  .directive(
    'financialNewAccountFix',
    downgradeComponent({ component: FinancialNewAccountFix }),
  )
  .filter('replaceBrackets', () => str =>
    JSON.stringify(str)
      .replace(/\{/g, '')
      .replace(/}/g, ''),
  )
  .filter('taxType', () => str => {
    switch (Number(str)) {
      case 0:
        return '包税';
      case 1:
        return '预付';
      case 2:
        return '补缴';
    }
  })
  .filter('moneyPayer', () => str => {
    switch (Number(str)) {
      case 1:
        return '店铺优惠';
      case 2:
        return '平台优惠';
      default:
        return '';
    }
  })
  .filter('refundType', () => str => {
    switch (Number(str)) {
      case 0:
        return '无退款';
      case 1:
        return '发货前退款';
      case 2:
        return '发货后退款';
    }
  }).name;
