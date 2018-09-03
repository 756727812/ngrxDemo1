import * as angular from 'angular'

import { assetSettlePgc } from './asset-settle-pgc.component'
import { assetSettle } from './asset-settle.component'
import { assetWithdrawDetail } from './asset-withdraw-detail.component'
import { assetWithdrawGoodsDetail } from './asset-withdraw-goods-detail.component'
import { assetWithdrawTopicDetail } from './asset-withdraw-topic-detail.component'

export default
  angular
    .module('seego.asset', [])
    .component('assetSettlePgc', assetSettlePgc)
    .component('assetSettle', assetSettle)
    .component('assetWithdrawDetail', assetWithdrawDetail)
    .component('assetWithdrawGoodsDetail', assetWithdrawGoodsDetail)
    .component('assetWithdrawTopicDetail', assetWithdrawTopicDetail)
    .name
