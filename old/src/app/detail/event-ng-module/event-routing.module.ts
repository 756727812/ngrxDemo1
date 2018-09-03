import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  EventAssignComponent,
  EventFormComponent,
  OrderCouponListComponent,
  OrderCouponCreateComponent,
  ActivityClusterComponent,
  CollageComponent,
  MarketingSeckillComponent,
  MarketingFullSubtractionComponent,
} from './containers';

// BI 是我写过最糟糕的代码，原谅我 --zhenyong

export const routes: Routes = [
  {
    path: 'assign',
    component: EventAssignComponent,
  },
  {
    path: 'form',
    component: EventFormComponent,
  },
  {
    path: 'coupon', // 下单返券入口列表
    component: OrderCouponListComponent,
  },
  {
    path: 'coupon/add', // 创建下单返券
    component: OrderCouponCreateComponent,
  },
  {
    path: 'activityCluster', // 营销活动聚合
    component: ActivityClusterComponent,
    children: [{
        path: '',
        pathMatch: 'full',
        redirectTo: 'collage'
      },
      {
          path: 'collage',
          component: CollageComponent,
          data: { index: 0 }
      },
      {
          path: 'seckill',
          component: MarketingSeckillComponent,
          data: { index: 1 }
      },
      {
          path: 'full-off',
          component: MarketingFullSubtractionComponent,
          data: { index: 2 }
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule {}
