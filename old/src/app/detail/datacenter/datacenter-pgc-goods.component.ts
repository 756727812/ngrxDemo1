// (function() {
// 'use strict';

//   var version = +new Date();

//   angular
//     .module('seego.datacenter')
//     .component('datacenterPgcGoods', {
//       templateUrl: 'detail/datacenter/datacenter-pgc-goods.template.html?v=' + version,
//       controller: pgcGoodsDataController
//     })

//   pgcGoodsDataController.$inject = ['dataService'];
//   function pgcGoodsDataController(dataService) {
//     var $ctrl = this;

//     $ctrl.$onInit = activate

//     function activate() {
//       return getPgcItem()
//     }

//     function getPgcItem() {
//       return dataService.item_getPgcItem().then(function (res) {
//         $ctrl.itemList = res.data;
//         return $ctrl.itemList
//       })
//     }
//   }
// })();

import { IDataService } from '../../services/data-service/data-service.interface';
export class pgcGoodsDataController {
  itemList: Array<any>;
  static $inject: string[] = ['$q', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
  ) { }
  $onInit() {
    const promises = [this.item_getPgcItem()];
    this.$q.all(promises);
  }

  private item_getPgcItem: () => ng.IPromise<any> = () =>
    this.dataService.item_getPgcItem().then(res => {
      this.itemList = res.data;
      return this.itemList;
    })
}

export const datacenterPgcGoods: ng.IComponentOptions = {
  template: require('./datacenter-pgc-goods.template.html'),
  controller: pgcGoodsDataController,
};
