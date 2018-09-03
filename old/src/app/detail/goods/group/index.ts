import './goods-group.less'

import * as angular from 'angular'

import { goodsGroupList } from './goods-group-list.component'
import { goodsGroupModalAddManualGroup } from './modal-add-manual-group.component'
import { goodsGroupModalAddAutoGroup } from './modal-add-auto-group.component'
import { goodsGroupModalAddGoods } from './modal-add-goods.component'
import { goodsGroupView } from './goods-group-view.component'
import { goodsGroupSearchGoodsForm } from './search-goods-form.component'
import { goodsGroupGroupInfoTips } from './group-info-tips.component'

export default
  angular
    .module('seego.goods.group', [])
    .component('goodsGroupList', goodsGroupList)
    .component('goodsGroupModalAddManualGroup', goodsGroupModalAddManualGroup)
    .component('goodsGroupModalAddAutoGroup', goodsGroupModalAddAutoGroup)
    .component('goodsGroupModalAddGoods', goodsGroupModalAddGoods)
    .component('goodsGroupView', goodsGroupView)
    .component('goodsGroupSearchGoodsForm', goodsGroupSearchGoodsForm)
    .component('goodsGroupGroupInfoTips', goodsGroupGroupInfoTips)
    .name
