import { IDataService } from '../../services/data-service/data-service.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as _ from 'lodash';
import * as angular from 'angular'

export class modalKolSkuSetController {
  sku_list: Array<any>
  sameTriger: any
  static $inject = ['$uibModalInstance', '$routeParams', 'is_set_one_item', 'cur_kol', 'cur_item', 'list_item', 'list_kol_mall', 'seeModal', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private is_set_one_item: any,
    private cur_kol: any,//当前选中的kol
    private cur_item: any,//当前选中的商品
    private list_item: any,//商品列表
    private list_kol_mall: any,//kol列表
    private seeModal: ISeeModalService,
    private dataService: IDataService
  ) {
    //sku信息列表为
    this.sku_list = this.cur_kol.choice_item.sku_list;
    this.sameTriger = {}
  }

  changeProduct: () => any = () => {
    const self = this;
    _.forEach(this.list_kol_mall, function(v) {
      if (Number(self.cur_kol.kol_info.kol_id) == Number(v.kol_info.kol_id)) {
        _.forEach(v.list_item, function(item) {
          if (Number(item.parent_item_id) == Number(self.cur_item.item_id)) {
            v.choice_item = item;
            return true;
          }
        })
      }
    })
    this.sku_list = this.cur_kol.choice_item.sku_list;
  }

  changeKol: () => any = () => {
    const self = this;
    _.forEach(self.cur_kol.list_item, function(item) {
      if (Number(item.parent_item_id) == Number(self.cur_item.item_id)) {
        self.cur_kol.choice_item = item;
        return true;
      }
    })
    this.sku_list = this.cur_kol.choice_item.sku_list;
  }

  setSame: (type: string) => void = type =>
    _.forEach(this.sku_list, (v, k) => v[type] = this.sameTriger[type])

  onTimeSet: (new_date: any, old_date) => any = (new_date, old_date) =>
    this.sameTriger.release_time && _.forEach(this.sku_list, sku => sku.release_time = new_date)

  ok() {
    this.$uibModalInstance.close({});
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }


}


