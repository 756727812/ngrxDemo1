import './index.less';

import * as angular from 'angular';
import { shopOperate } from './shop-operate.component';
import { shopOperateExplosiveGoods } from './shop-operate-explosive-goods.component';
import { modalShopAddExplosiveGoods } from './modal-shop-add-explosive-goods.component';
import { shopOperateShopBanner } from './shop-banner/shop-banner.component';
import { shopOperateImgUploader } from './img-uploader.component';
import { modalShopOperateHrefPicker } from './href-picker.component';
import { shopOperateActivityBanner } from './activity-banner.component';
import { shopOperateBannerForm } from './banner-form.component';
import { shopOperateGroupConfig } from './group/group-config.component';
import { modalShopOperateGroupList } from './group/modal-group-list.component';
import { ModalShopOperateAddCoupon } from './coupon/modal-shop-operate-add-coupon.component';
import { ShopOperateCoupon } from './coupon/shop-operate-coupon.component';
import { ShopOperateGroupBuy } from './groupbuy/shop-operate-groupbuy.component';
import { ModalShopOperateAddGroupBuy } from './groupbuy/modal-shop-operate-add-groupbuy.component';
import { ShopOperateSeckill } from './seckill/shop-operate-seckill.component';
import {
  ModalShopOperateSetPublishTime,
} from './seckill/modal-shop-operate-set-publish-time.component';
import { ModalShopOperateAddSeckill } from './seckill/modal-shop-operate-add-seckill.component';
import { ShopOperateVideo } from './shop-operate-video.component';
import { shopOperateInterlink } from './shop-operate-interlink.component';
export default angular
  .module('seego.shop.operate', [])
  .component('shopOperate', shopOperate)
  .component('shopOperateExplosiveGoods', shopOperateExplosiveGoods)
  .component('modalShopAddExplosiveGoods', modalShopAddExplosiveGoods)
  .component('shopOperateShopBanner', shopOperateShopBanner)
  .component('shopOperateImgUploader', shopOperateImgUploader)
  .component('modalShopOperateHrefPicker', modalShopOperateHrefPicker)
  .component('shopOperateActivityBanner', shopOperateActivityBanner)
  .component('shopOperateBannerForm', shopOperateBannerForm)
  .component('shopOperateGroupConfig', shopOperateGroupConfig)
  .component('modalShopOperateGroupList', modalShopOperateGroupList)
  .component('shopOperateCoupon', ShopOperateCoupon)
  .component('modalShopOperateAddCoupon', ModalShopOperateAddCoupon)
  .component('shopOperateGroupBuy', ShopOperateGroupBuy)
  .component('modalShopOperateAddGroupBuy', ModalShopOperateAddGroupBuy)
  .component('shopOperateSeckill', ShopOperateSeckill)
  .component('modalShopOperateSetPublishTime', ModalShopOperateSetPublishTime)
  .component('modalShopOperateAddSeckill', ModalShopOperateAddSeckill)
  .component('shopOperateVideo', ShopOperateVideo)
  .component('shopOperateInterlink', shopOperateInterlink)
  .name;
