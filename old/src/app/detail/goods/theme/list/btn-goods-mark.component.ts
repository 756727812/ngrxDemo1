import * as angular from 'angular';

import {
  STORAGE_KEY_NEW_FAVOR_ITEMS,
  STORAGE_KEY_SHOW_FAVOR_BADGE,
} from '../goods-list/btn-favor.component';

import './btn-goods-mark.less';

export class Controller {
  static $inject: string[] = ['$location'];

  constructor(private $location: ng.ILocationService) {}

  getFavorNum() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_NEW_FAVOR_ITEMS) || '[]')
      .length;
  }

  shouldShowFavorBadge() {
    const storageValShowFavorBadge = localStorage.getItem(
      STORAGE_KEY_SHOW_FAVOR_BADGE,
    );
    const showFavor =
      storageValShowFavorBadge === 'true' || !storageValShowFavorBadge;
    const favorNum = this.getFavorNum();
    return showFavor && favorNum;
  }

  redirectSelectedGoods() {
    localStorage.setItem(STORAGE_KEY_SHOW_FAVOR_BADGE, 'false');
    localStorage.removeItem(STORAGE_KEY_NEW_FAVOR_ITEMS);
    this.$location.path('/fashion/selected-goods');
  }
}

export const goodsThemeListBtnGoodsMark: ng.IComponentOptions = {
  template: require('./btn-goods-mark.template.html'),
  controller: Controller,
  bindings: {},
};
