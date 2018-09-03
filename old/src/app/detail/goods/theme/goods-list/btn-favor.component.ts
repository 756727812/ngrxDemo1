import * as angular from 'angular';
import { pull } from 'lodash';

import './btn-favor.less';

export const STORAGE_KEY_SHOW_FAVOR_BADGE =
  'fashion/hot-goods:shouldShowFavorBadge';
export const STORAGE_KEY_NEW_FAVOR_ITEMS = 'fashion/hot-goods:newFavorItems';

export class Controller {
  static $inject: string[] = [
    '$location',
    'fashionService',
    'dataService',
    'reportService',
  ];

  itemId: string;
  active: any; // 0 或 1
  onChange: Function;

  constructor(
    private $location: ng.ILocationService,
    private fashionService: any,
    private dataService: see.IDataService,
    private reportService: see.IReportService,
  ) {}

  onClick() {
    // TODO 目前只在热门单品库，如果在多处就要区分上报
    this.reportService.reportByKey('PAGE_HOT_COMMODITY.BTN_FAVOR', {
      ext1: this.itemId,
    });
    this.fashionService
      .materialFavorItemAdd(this.itemId, this.active)
      .then(() => {
        // 热门单品库用 0 和 1
        const result = +!this.active;
        this.onChange({ itemId: this.itemId, value: +!this.active });
        // this.dataService.updateFavourCount({}).then(({ data }) => {
        localStorage.setItem(STORAGE_KEY_SHOW_FAVOR_BADGE, 'true');
        const newFavorItems = JSON.parse(
          localStorage.getItem(STORAGE_KEY_NEW_FAVOR_ITEMS) || '[]',
        );
        if (result) {
          pull(newFavorItems, this.itemId);
          newFavorItems.push(this.itemId);
        } else {
          pull(newFavorItems, this.itemId);
        }
        localStorage.setItem(
          STORAGE_KEY_NEW_FAVOR_ITEMS,
          JSON.stringify(newFavorItems),
        );
      });
  }
}

export const goodsThemeGoodsListBtnFavor: ng.IComponentOptions = {
  template: require('./btn-favor.template.html'),
  controller: Controller,
  bindings: {
    onChange: '&',
    source: '@',
    active: '=',
    itemId: '<',
  },
};
