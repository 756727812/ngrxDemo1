import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalHotItemController {
  list_cur: Array<any>
  list_item: Array<any>
  list_page: Array<any>
  list_choice: Array<any>
  str_choice: string
  cur_page: number
  total_items: number
  static $inject = ['$uibModalInstance', '$routeParams', 'cur_input', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private cur_input: string,
    private dataService: IDataService
  ) {
    this.list_cur = [];
    if (this.cur_input !== '') {
      this.list_cur = this.cur_input.split(",");
    }

    this.str_choice = '';
    this.list_choice = [];
    this.cur_page = 1;
    this.getItemList();
  }

  changePage() {
    this.getItemList();
  }

  isInArray(arr: Array<any>, check: string) {
    if (!arr) {
      return false;
    }
    for (var i = 0; i < arr.length; i++) {
      if (Number(arr[i]) == Number(check)) {
        return true;
      }
    }
    return false;
  }

  getItemList() {
    var params = {
      select_flag: 0,
      page: this.cur_page,
      page_size: 20,
      seller_privilege: 7,
      filter_class_id: '[]',
      filter_price_start: 0,
      filter_price_end: 0,
      filter_country_name: '[]',
      keyword: '',
    }

    this.dataService.data_api_materialSelectItem(params).then(res => {
      this.list_item = [];
      var tmp_list = res.data.list_item;
      for (var i = 0; i < tmp_list.length; i++) {
        if (!this.isInArray(this.list_cur, tmp_list[i].item_id)) {
          this.list_item.push(tmp_list[i]);
        }
      }

      this.total_items = Math.ceil(res.data.count_item / 20)
      this.list_page = [];
      for (var i = 1; i <= this.total_items; i++) {
        this.list_page.push(i);
      }
    })

  }

  selectedChanged(good) {
    var item_id = Number(good.item_id);
    if (good.isChecked) {
      this.list_choice.push(item_id)
    } else {
      //从一维数据中移除元素，找不到哪个属性 @_@
      for (var i = 0; i < this.list_choice.length; i++) {
        if (this.list_choice[i] == item_id) {
          this.list_choice.splice(i, 1);
          break;
        }
      }
    }

    this.str_choice = '';
    for (var i = 0; i < this.list_choice.length; i++) {
      if (this.str_choice !== '') {
        this.str_choice += '、';
      }
      this.str_choice += this.list_choice[i];
    }
  }

  ok() {
    this.$uibModalInstance.close({ list_choice: this.list_choice });
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

}


