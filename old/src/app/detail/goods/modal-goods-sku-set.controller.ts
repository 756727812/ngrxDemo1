import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalGoodsSkuSetController {
  private;
  errors: Array<any>;
  static $inject: string[] = ['$scope', '$q', 'type', 'sku', '$uibModalInstance', 'dataService'];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private type: number,
    private sku: any,
    private $uibModalInstance: any,
    private dataService: IDataService,
  ) {
    this.errors = [];
    if (Number(this.type) == Number(this.sku.sku_set_type)) {
      this.sku.tmp_sku_set_sku_stock_delta = this.sku.sku_set_sku_stock_delta;
      if (Number(this.type) == 1) {
        this.sku.tmp_sku_set_supply_price = this.sku.sku_set_supply_price;
      }
    } else {
      this.sku.tmp_sku_set_sku_stock_delta = '';
      this.sku.tmp_sku_set_supply_price = '';
    }
  }

  changeDelta() {
    /*
    if(Number(this.sku.tmp_sku_set_sku_stock_delta) <= 0){
      this.sku.tmp_sku_set_sku_stock_delta = 1;
    }
    
    if(Number(this.sku.tmp_sku_set_supply_price) <= 0){
      this.sku.tmp_sku_set_supply_price = 1;
    }*/
  }
  ok() {
    this.errors.length = 0;
    this.errors = [];
    let tip_delate = false;
    console.log(String(this.sku.tmp_sku_set_sku_stock_delta), String(this.sku.tmp_sku_set_supply_price));
    if (this.type == 1) {
      if (String(this.sku.tmp_sku_set_sku_stock_delta) === 'undefined' || String(this.sku.tmp_sku_set_sku_stock_delta) === '') {
        this.errors.push('件数必须大于0');
        tip_delate = true;
      }
      if (String(this.sku.tmp_sku_set_supply_price) === 'undefined' || String(this.sku.tmp_sku_set_supply_price) === '') {
        this.errors.push('成本价必须大于0');
      }
      if (String(this.sku.tmp_sku_set_supply_price) === '0') {
        this.errors.push('成本价必须大于0');
      }
    } else {
      if (String(this.sku.tmp_sku_set_sku_stock_delta) === 'undefined' || String(this.sku.tmp_sku_set_sku_stock_delta) === '') {
        this.errors.push('件数必须 > 0，并且 <= ' + Number(this.sku.stock_sum.locked_stock + this.sku.stock_sum.free_stock));
        tip_delate = true;
      }

      if (Number(this.sku.tmp_sku_set_sku_stock_delta) > this.sku.stock_sum.locked_stock + this.sku.stock_sum.free_stock) {
        this.errors.push('件数不能大于总库存');
        tip_delate = true;
      }
    }
    if (!tip_delate && Number(this.sku.tmp_sku_set_sku_stock_delta) <= 0) {
      this.errors.push('件数必须大于0');
    }

    if (this.errors.length > 0) {
      return;
    } else {
      this.sku.sku_set_sku_stock_delta = this.sku.tmp_sku_set_sku_stock_delta;
      if (this.type == 1) {
        this.sku.sku_set_supply_price = this.sku.tmp_sku_set_supply_price;
        this.sku.str_change_stock = '+' + this.sku.sku_set_sku_stock_delta + ' ，￥' + this.sku.sku_set_supply_price + '元';//+'件,成本价￥'+this.sku.change_cost_price;
      } else {
        this.sku.str_change_stock = '-' + this.sku.sku_set_sku_stock_delta;//+'件';
      }
      this.sku.sku_set_type = this.type;
      this.$uibModalInstance.close({});
    }
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

}

