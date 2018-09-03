
import * as angular from 'angular'
import {goodsImportList} from './list/list.component'

export default angular
  .module('seego.goods.import', [])
.component('goodsImportList', goodsImportList)
  .name;
