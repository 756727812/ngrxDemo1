import * as angular from 'angular';
import { EventGroupAction } from './event-group-action.component';
import { EventGroupList } from './event-group-list.component';
import { KolDetailBase } from './kol-detail-base.component';
import { ModalEventGroupAddGoods } from './modal-event-group-add-goods.component';
import { groupStatus } from './group-status.filter';
import { groupValidPeriod } from './group-valid-period.filter';
import { groupBuyType } from './group-buy-type.filter';

import './group.less';

export default
  angular
    .module('seego.event.group', [])
    .filter('groupStatus', groupStatus)
    .filter('groupValidPeriod', groupValidPeriod)
    .filter('groupBuyType', groupBuyType)
    .component('eventGroupList', EventGroupList)
    .component('eventGroupAction', EventGroupAction)
    .component('kolDetailBase', KolDetailBase)
    .component('modalEventGroupAddGoods', ModalEventGroupAddGoods)
    .name;
