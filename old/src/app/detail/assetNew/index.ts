import * as angular from 'angular';

import { assetNewInfo } from './asset-new-info.component';
import { assetNewList } from './asset-new-list.component';
import { assetNewRecorded } from './asset-new-recorded.component';
import { assetNewRecord } from './asset-new-record.component';
import { assetNewRecording } from './asset-new-recording.component';
import { applyWithdrawals } from './apply-withdrawals.component';
import { shopInfoIndicatorBlock } from '../shop/shop-info/indicator-block.component';
import { shopInfoAvatarBlock } from '../shop/shop-info/avatar-block.component';
import { modalRecharge } from './modal-recharge.component';
import { modalRechargeResult } from './modal-recharge-result.component';
import { rechargeRedirect } from './recharge-redirect.component';
import { rechargeResult } from './recharge-result.component';


export default angular
  .module('seego.assetNew', [])
  .component('assetNewInfo', assetNewInfo)
  .component('assetNewList', assetNewList)
  .component('assetNewRecorded', assetNewRecorded)
  .component('assetNewRecord', assetNewRecord)
  .component('assetNewRecording', assetNewRecording)
  .component('applyWithdrawals', applyWithdrawals)
  .component('shopInfoAvatarBlock', shopInfoAvatarBlock)
  .component('shopInfoIndicatorBlock', shopInfoIndicatorBlock)
  .component('modalRecharge', modalRecharge)
  .component('rechargeRedirect', rechargeRedirect)
  .component('rechargeResult', rechargeResult)
  .component('modalRechargeResult', modalRechargeResult).name;
