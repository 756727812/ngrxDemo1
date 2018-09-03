import './index.less';
import { EventAssignComponent } from './assign/assign.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventFormComponent } from './event-form/event-form.component';
import { EventLogsComponent } from './event-logs/event-logs.component';
import { OrderCouponListComponent } from './order-coupon/order-coupon-list.component';
import { OrderCouponCreateComponent } from './order-coupon/order-coupon-create.component';
import { ActivityClusterComponent } from './activity-cluster/activity-cluster.component';
import { CollageComponent } from './activity-cluster/collage/collage.component';
import { MarketingSeckillComponent } from './activity-cluster/collage/collage.component.seckill';
import { MarketingFullSubtractionComponent } from './activity-cluster/collage/collage.component.full-subtraction';

export const containers: any[] = [
  EventAssignComponent,
  EventListComponent,
  EventFormComponent,
  EventLogsComponent,
  OrderCouponListComponent,
  OrderCouponCreateComponent,
  ActivityClusterComponent,
  CollageComponent,
  MarketingSeckillComponent,
  MarketingFullSubtractionComponent,
];

export * from './assign/assign.component';
export * from './event-list/event-list.component';
export * from './event-form/event-form.component';
export * from './event-logs/event-logs.component';
export * from './order-coupon/order-coupon-list.component';
export * from './order-coupon/order-coupon-create.component';
export * from './activity-cluster/activity-cluster.component';
export * from './activity-cluster/collage/collage.component';
export * from './activity-cluster/collage/collage.component.seckill';
export * from './activity-cluster/collage/collage.component.full-subtraction';
