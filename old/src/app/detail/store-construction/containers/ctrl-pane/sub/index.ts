import { CtrlWidgetColImgComponent } from './col-img/col-img.component';
import { CtrlWidgetCommonDoubleColGoodsComponent } from './common-double-col-goods/common-double-col-goods.component';
import { CtrlWidgetBasicInfoComponent } from './basic-info/basic-info.component';
import { CtrlWidgetCouponComponent } from './coupon/coupon.component';
import { CtrlWidgetExploreColGoodsComponent } from './explore-col-goods/explore-col-goods.component';
import { CtrlWidgetCarouselComponent } from './carousel/carousel.component';
import { CtrlWidgetGroupAndSeckillComponent } from 'app/detail/store-construction/containers/ctrl-pane/sub/group-and-seckill/group-and-seckill.component';
import { CtrlWidgetMagicCubeComponent } from './magic-cube/magic-cube.component';
import { CtrlWidgetSalesPromotionComponent } from './sales-promotion/sales-promotion.component';
import { CtrlWidgetVideoInfoComponent } from './video-info/video-info.component';

export const subWidgets = [
  CtrlWidgetBasicInfoComponent,
  CtrlWidgetCouponComponent,
  CtrlWidgetExploreColGoodsComponent,
  CtrlWidgetCarouselComponent,
  CtrlWidgetCommonDoubleColGoodsComponent,
  CtrlWidgetGroupAndSeckillComponent,
  CtrlWidgetColImgComponent,
  CtrlWidgetMagicCubeComponent,
  CtrlWidgetSalesPromotionComponent,
  CtrlWidgetVideoInfoComponent,
];

export * from './basic-info/basic-info.component';
export * from './coupon/coupon.component';
export * from './explore-col-goods/explore-col-goods.component';
export * from './carousel/carousel.component';
export * from './common-double-col-goods/common-double-col-goods.component';
export * from './group-and-seckill/group-and-seckill.component';
export * from './col-img/col-img.component';
export * from './magic-cube/magic-cube.component';
export * from './sales-promotion/sales-promotion.component';
export * from './video-info/video-info.component';

export const components = subWidgets;
export const dynamicCtrlWidgetComponents = subWidgets;
