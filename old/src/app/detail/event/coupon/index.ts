import * as angular from 'angular'
import { EventCouponListV2 } from './event-coupon-list-v2.component'
import { EventCouponActionV2 } from './event-coupon-action-v2.component'
import { couponStatus } from './coupon-status.filter'

import './coupon.less';

export default
  angular
    .module('seego.event.coupon', [])
    .component('eventCouponListV2', EventCouponListV2)
    .component('eventCouponActionV2', EventCouponActionV2)
    .filter('couponStatus', couponStatus)
    .name
