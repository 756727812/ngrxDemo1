import { IDataService } from '../../services/data-service/data-service.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as _ from 'lodash';
import * as angular from 'angular'

export class modalKolItemSetController {
  num_clash: Number
  cur_item: any
  list_item: Array<any>
  list_kol_mall: Array<any>
  static $inject = ['$uibModalInstance', '$routeParams', 'from_params', 'is_set_one_item', 'mall_id', 'from_cur_item', 'from_list_item', 'from_list_kol_mall', 'seeModal', '$uibModal', 'dataService', 'mallService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private from_params: any,
    private is_set_one_item: any,
    private mall_id: any,
    private from_cur_item: any,
    private from_list_item: any,
    private from_list_kol_mall: any,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private dataService: IDataService,
    private mallService: any
  ) {
    this.num_clash = 0;
    this.cur_item = false;
    if (this.from_cur_item != false) {
      this.cur_item = angular.copy(this.from_cur_item);
    }
    this.list_item = angular.copy(this.from_list_item);
    this.list_kol_mall = angular.copy(this.from_list_kol_mall);

    if (this.cur_item != false) {
      this.num_clash = Number(this.cur_item.num_clash);
      //不添加这个重新设置，默认选不中，奇怪
      const self = this;
      _.forEach(this.list_item, function(item) {
        if (Number(item.item_id) == Number(self.cur_item.item_id)) {
          self.cur_item = item;
          return true;
        }
      })

      this.changeProduct();
    }
    this.mallService.updatePriceMinAndMax(this.list_kol_mall, this.list_item);
  }


  changeSubTime(choice_item = false) {
    const self = this;
    if (choice_item === false) {
      _.forEach(this.list_kol_mall, function(v) {
        _.forEach(v.list_item, function(item) {
          if (String(item['is_all_set_3']) === "red") {

          } else if (Number(item.parent_item_id) == Number(self.cur_item.item_id)) {
            item.online_time = self.cur_item.online_time;
          }
        })
      })
      return;
    }
    choice_item['is_all_set_3'] = "red";
  }

  setItemName(data, choice_item) {
    choice_item.item_name = data;
    choice_item.is_all_set_0 = "red";

    if (this.from_params.type_mall_set_item == 1) {
      this.cur_item.item_name = data;
    }
  }

  setItemPrice(data, choice_item) {
    data = parseFloat(data);
    choice_item.price_min = parseFloat(data);
    choice_item.price_max = parseFloat(data);
    choice_item.is_all_set_1 = "red";
    _.forEach(choice_item.sku_list, function(sku_info) {
      sku_info.sku_price = choice_item.price_min;
    })
  }

  setItemKolPrice(data, choice_item) {
    data = parseFloat(data);
    choice_item.price_kol_min = parseFloat(data);
    choice_item.price_kol_max = parseFloat(data);
    choice_item.is_all_set_2 = "red";
    _.forEach(choice_item.sku_list, function(sku_info) {
      sku_info.cost_price = choice_item.price_kol_min;
    })
  }

  setItemInfo(item, type, tmp_set, update_status = true) {
    if (Number(item.set_disabled) == 1) {
      return;
    }
    if (String(item['is_all_set_' + type]) === "red") {
      return;
    }
    if (type == 0) {
      item.item_name = tmp_set;
      if (update_status) item.is_all_set_0 = "red";

      if (this.from_params.type_mall_set_item == 1) {
        this.cur_item.item_name = tmp_set;
      }
    } else if (type == 1) {
      tmp_set = parseFloat(tmp_set);
      item.price_min = tmp_set;
      item.price_max = tmp_set;
      if (update_status) item.is_all_set_1 = "red";
      _.forEach(item.sku_list, function(sku_info) {
        sku_info.sku_price = item.price_min;
      })
    } else if (type == 2) {
      tmp_set = parseFloat(tmp_set);
      item.price_kol_min = tmp_set;
      item.price_kol_max = tmp_set;
      if (update_status) item.is_all_set_2 = "red";
      _.forEach(item.sku_list, function(sku_info) {
        sku_info.cost_price = item.price_kol_min;
      })
    }
  }
  //批量改名
  setAllInfo(tmp_set, type) {
    let tips = '';
    if (type == 0) {
      tips = '确认将商品名批量修改为 ' + tmp_set + '，商品名标红的不影响';
    } else if (type == 1) {
      tmp_set = parseFloat(tmp_set)
      tips = '确认将售价批量修改为 ￥' + tmp_set + '，售价标红的不影响';
    } else if (type == 2) {
      tmp_set = parseFloat(tmp_set)
      tips = '确认将KOL供货价批量修改为 ￥' + tmp_set + '，供货价名标红的不影响';
    }

    this.seeModal.confirm('确认提示', tips, () => {
      const self = this;
      _.forEach(this.list_kol_mall, function(v) {
        _.forEach(v.list_item, function(item) {
          if (Number(item.parent_item_id) == Number(self.cur_item.item_id)) {
            self.setItemInfo(item, type, tmp_set, false)
            return true;
          }
        })
      })
    })
  }

  setSku(kol) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-kol-sku-set.html'),
      controller: 'modalKolSkuSetController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        is_set_one_item: () => this.is_set_one_item,
        cur_kol: () => kol,
        cur_item: () => this.cur_item,
        list_item: () => this.list_item,
        list_kol_mall: () => this.list_kol_mall,
      },
    })

    return modalInstance.result.then(params => {
      this.mallService.updatePriceMinAndMax(this.list_kol_mall, this.list_item);
    })
  }

  batchChoiceStatus(status) {
    const tips = status == 1 ? '确认要批量覆盖KOL的商品信息？(已就绪的不影响）' : '不覆盖时，当前商品信息设置无效，确认不覆盖KOL的商品信息？(已就绪的不影响）';
    this.seeModal.confirm('确认提示', tips, () => {
      this.num_clash = 0;
      const self = this;
      _.forEach(this.list_kol_mall, function(v) {
        if (Number(v.choice_item.parent_item_id) == Number(self.cur_item.item_id)
          && Number(v.choice_item.set_clash_status) > 0
        ) {
          self.choiceStatus(v, status, false)
          return true;
        }
      })
    }, () => {

    })
  }

  choiceStatus(item, status, pop = true) {
    if (pop) {
      const tips = status == 1 ? '确认要覆盖KOL的商品信息？' : '不覆盖时，当前商品信息设置无效，确认不覆盖KOL的商品信息？';
      this.seeModal.confirm('确认提示', tips, () => {
        item.choice_item.set_clash_status = 0;
        if (status == 1) {
          item.choice_item.set_clash_str = '已就绪(覆盖)';
        } else {
          item.choice_item.set_clash_str = '已就绪(不覆盖，修改将忽略)';
          item.choice_item.set_disabled = 1;
        }
      }, () => {
        item.choice_item.set_clash_choice_yes = false;
        item.choice_item.set_clash_choice_no = false;
        item.choice_item.set_clash_choice = false;
      })
    } else {
      item.choice_item.set_clash_status = 0;
      if (status == 1) {
        item.choice_item.set_clash_str = '已就绪(覆盖)';
      } else {
        item.choice_item.set_clash_str = '已就绪(不覆盖，修改将忽略)';
        item.choice_item.set_disabled = 1;
      }
    }
  }

  changeProduct() {
    const self = this;
    _.forEach(this.list_kol_mall, function(v) {
      _.forEach(v.list_item, function(item) {
        if (Number(item.parent_item_id) == Number(self.cur_item.item_id)) {
          v.choice_item = item;
          return true;
        }
      })
    })

  }

  ok() {
    this.seeModal.confirm('确认提示', '确认要保存本次编辑的数据并返回？', () => {
      this.$uibModalInstance.close({
        cur_item: this.cur_item,
        list_item: this.list_item,
        list_kol_mall: this.list_kol_mall
      });
    })
  }

  cancel() {
    this.seeModal.confirm('确认提示', '取消后，本次编辑的数据不保存，确认要返回？', () => {
      this.$uibModalInstance.dismiss('cancel')
    })
  }


}


