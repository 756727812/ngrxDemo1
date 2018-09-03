import * as angular from 'angular';
import { goodsThemeAppendGoodsArticleList } from './append-goods/article-list.component';
import { goodsThemeAppendGoodsHot } from './append-goods/hot.component';
import { goodsThemeAppendGoods } from './append-goods/index.component';
import { goodsThemeArticlePicker } from './article-picker/article-picker.component';
import { goodsThemeForm } from './form/form.component';
import { goodsThemeGoodsListBtnFavor } from './goods-list/btn-favor.component';
import { goodsThemeGoodsListEditForm } from './goods-list/edit-form.component';
import { goodsThemeGoodsList } from './goods-list/goods-list.component';
import { goodsThemeGoodsListSellPointPop } from './goods-list/sell-point-pop.component';
import { goodsThemeGoodsListSellPoint } from './goods-list/sell-point.component';
import { goodsThemeGoodsListSellWay } from './goods-list/sell-way.component';
import { goodsThemeListBtnGoodsMark } from './list/btn-goods-mark.component';
import { goodsThemeList } from './list/list.component';
import { goodsThemeMsg } from './msg/msg.component';
import { goodsThemeThemePicker } from './theme-picker/theme-picker.component';

export default angular
  .module('seego.goods.theme', [])
  .component(
    'goodsThemeAppendGoodsArticleList',
    goodsThemeAppendGoodsArticleList,
  )
  .component('goodsThemeAppendGoodsHot', goodsThemeAppendGoodsHot)
  .component('goodsThemeAppendGoods', goodsThemeAppendGoods)
  .component('goodsThemeArticlePicker', goodsThemeArticlePicker)
  .component('goodsThemeForm', goodsThemeForm)
  .component('goodsThemeGoodsListBtnFavor', goodsThemeGoodsListBtnFavor)
  .component('goodsThemeGoodsListEditForm', goodsThemeGoodsListEditForm)
  .component('goodsThemeGoodsList', goodsThemeGoodsList)
  .component('goodsThemeGoodsListSellPointPop', goodsThemeGoodsListSellPointPop)
  .component('goodsThemeGoodsListSellPoint', goodsThemeGoodsListSellPoint)
  .component('goodsThemeGoodsListSellWay', goodsThemeGoodsListSellWay)
  .component('goodsThemeListBtnGoodsMark', goodsThemeListBtnGoodsMark)
  .component('goodsThemeList', goodsThemeList)
  .component('goodsThemeMsg', goodsThemeMsg)
  .component('goodsThemeThemePicker', goodsThemeThemePicker).name;
