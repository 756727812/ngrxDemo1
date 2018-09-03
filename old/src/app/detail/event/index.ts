import * as angular from 'angular';
import { downgradeComponent } from '@angular/upgrade/static';
import seegoEventCoupon from './coupon';
import seegoEventGroup from './group';
import { activeGoodsList } from './active-goods-list.component';
import { activeList } from './active-list.component';
import { addActive } from './add-active.component';
import { addColumn } from './add-column.component';
import { applyNewCoupon } from './apply-new-coupon.component';
import { columnManage } from './column-manage.component';
import { couponList } from './coupon-list.component';
import { editEventAnswer } from './edit-event-answer.component';
import { eventAddGoods } from './event-add-goods.component';
import { eventDaren } from './event-daren.component';
import { eventIndex } from './event-index.component';
import { eventIndexAnswer } from './event-index-answer.component';
import { eventTempAnswer } from './event-temp-answer.component';
import { manageEventGoods } from './manage-event-goods.component';
import { modalEventShowController } from './modal-event-show.controller';
import { modalMoveEventController } from './modal-move-event.controller';
import { modalRejectApplyCouponController } from './modal-reject-apply-coupon.controller';
import { modalSendCouponToUserController } from './modal-send-coupon-to-user.controller';
import { modalShowC2CInfoController } from './modal-show-c2c-info.controller';
import { myEvent } from './my-event.component';
import { seegoPartnerBill } from './seego-partner-bill.component';
import { seegoPartnerList } from './seego-partner-list.component';
import { LotteryGroupSetting } from './lottery-group-setting.component';
import { EventSeckillList } from './seckill/event-seckill-list.component';
import { EventSeckillListV2 } from './seckill/event-seckill-list-v2.component';
import { EventSeckillListNg5 } from './seckill/event-seckill-list-ng5.component';
import { BatchAssignLogsComponent } from '../event-ng-module/components/batch-assign-logs/batch-assign-logs.component';
import { EventSeckillAction } from './seckill/event-seckill-action.component';
import { seckillStatus } from './seckill/seckill-status.filter';
import { LuckyBagSettings } from './luckybag/lucky-bag-settings.component';
import { dailyWelfareList } from './dailywelfare/daily-welfare-list.component';
import { dailyWelfareAction } from './dailywelfare/daily-welfare-action.component';
import { SeeImgUploadComponentNg1 } from '@shared/components/img-upload-ng1-copy/img-upload.component';
import { SeeTreeSelectComponentNg1 } from '@shared/components/tree-select-ng1-copy/tree-select.component';
import { SeeTreeSelectCategoryComponentNg1 } from '@shared/components/tree-select-category-ng1-copy/tree-select-category.component';
import { BrandSelectorComponentNg1 } from '@shared/components/brand-selector-ng1-copy/brand-selector.component';
import { SeeSelectGoodsNg1 } from '@shared/components/select-goods-ng1-copy/select-goods.component';

export default angular
  .module('seego.event', [seegoEventCoupon, seegoEventGroup])
  .filter('seckillStatus', seckillStatus)
  .component('activeGoodsList', activeGoodsList)
  .component('activeList', activeList)
  .component('addActive', addActive)
  .component('addColumn', addColumn)
  .component('applyNewCoupon', applyNewCoupon)
  .component('columnManage', columnManage)
  .component('couponList', couponList)
  .component('editEventAnswer', editEventAnswer)
  .component('eventAddGoods', eventAddGoods)
  .component('eventDaren', eventDaren)
  .component('eventIndex', eventIndex)
  .component('eventIndexAnswer', eventIndexAnswer)
  .component('eventTempAnswer', eventTempAnswer)
  .component('manageEventGoods', manageEventGoods)
  .component('myEvent', myEvent)
  .component('seegoPartnerBill', seegoPartnerBill)
  .component('seegoPartnerList', seegoPartnerList)
  .component('lotteryGroupSetting', LotteryGroupSetting)
  .component('eventSeckillList', EventSeckillList)
  .component('eventSeckillListV2', EventSeckillListV2)
  .component('eventSeckillAction', EventSeckillAction)
  .controller('modalEventShowController', modalEventShowController)
  .controller('modalMoveEventController', modalMoveEventController)
  .controller(
    'modalRejectApplyCouponController',
    modalRejectApplyCouponController,
  )
  .controller(
    'modalSendCouponToUserController',
    modalSendCouponToUserController,
  )
  .controller('modalShowC2CInfoController', modalShowC2CInfoController)
  .directive(
    'luckyBagSettings',
    downgradeComponent({ component: LuckyBagSettings }),
  )
  .directive(
    'eventSeckillListNg5',
    downgradeComponent({ component: EventSeckillListNg5 }),
  )
  .directive(
    'batchAssignLogs',
    downgradeComponent({ component: BatchAssignLogsComponent }),
  )
  .directive(
    'ng1SeeImgUpload',
    downgradeComponent({ component: SeeImgUploadComponentNg1 }),
  )
  .directive(
    'ng1SeeTreeSelect',
    downgradeComponent({ component: SeeTreeSelectComponentNg1 }),
  )
  .directive(
    'ng1SeeTreeSelectCategory',
    downgradeComponent({ component: SeeTreeSelectCategoryComponentNg1 }),
  )
  .directive(
    'ng1AppBrandSelector',
    downgradeComponent({ component: BrandSelectorComponentNg1 }),
  )
  .directive(
    'ng1SeeSelectGoods',
    downgradeComponent({ component: SeeSelectGoodsNg1 }),
  )
  .directive(
    'dailyWelfareList',
    downgradeComponent({ component: dailyWelfareList }),
  )
  .directive(
    'dailyWelfareAction',
    downgradeComponent({ component: dailyWelfareAction }),
  ).name;
