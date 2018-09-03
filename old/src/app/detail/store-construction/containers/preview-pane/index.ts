import { PreviewSpeedKillListComponent } from './preview-item/preview-speed-kill/preview-speed-kill-list.component';
import { Type } from '@angular/core';

import { DoubleColGoodsListComponent } from './preview-item/double-col-goods-list/double-col-goods-list.component';
import { PreviewGroupBuyListComponent } from './preview-item/preview-group-buy-list/preview-group-buy-list.component';
import { PreviewCouponListComponent } from './preview-item/preview-coupon-list/preview-coupon-list.component';
import { PreviewBasicInfoComponent } from './preview-item/preview-basic-info/preview-basic-info.component';
import { CarouselBannerComponent } from './preview-item/carousel-banner/carousel-banner.component';
import { PreviewItemComponent } from './preview-item/preview-item.component';
import { BigBannerComponent } from './preview-item/big-banner/big-banner.component';
import { SingleColGoodsListComponent } from './preview-item/single-col-goods-list/single-col-goods-list.component';
import { PreviewItemOutletComponent } from './preview-item-outlet/preview-item-outlet.component';
import { PreviewMagicCubeComponent } from './preview-item/preview-magic-cube/preview-magic-cube.component';
import { PreviewSalesPromotionComponent } from './preview-item/preview-sales-promotion/preview-sales-promotion.component';
import { PreviewVideoInfoComponent } from './preview-item';

const arr = [
  PreviewBasicInfoComponent,
  SingleColGoodsListComponent,
  DoubleColGoodsListComponent,
  BigBannerComponent,
  PreviewItemComponent,
  CarouselBannerComponent,
  PreviewCouponListComponent,
  PreviewGroupBuyListComponent,
  PreviewItemOutletComponent,
  PreviewSpeedKillListComponent,
  PreviewMagicCubeComponent,
  PreviewSalesPromotionComponent,
  PreviewVideoInfoComponent,
];

export const dynamicPreviewComponents = arr;

export default arr;
