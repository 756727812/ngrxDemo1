import * as angular from 'angular';
import { commonBtnOffStore } from './btn-off-store/btn-off-store.component';
import { commonBtnSellGoods } from './btn-sell-goods/btn-sell-goods.component';

export default angular
  .module('seego.common', [])
  .component('commonBtnOffStore', commonBtnOffStore)
  .component('commonBtnSellGoods', commonBtnSellGoods).name;
