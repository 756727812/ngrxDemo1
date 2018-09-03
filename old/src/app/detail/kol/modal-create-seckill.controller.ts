import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalCreateSeckillController {
  form_data: any
  seckill_info: any
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'id', 'title', 'name', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    //private show_edit: string,
    private id: string,
    private title: string,
    private name: string,
    private dataService: IDataService
  ) {
    id && this.getSeckillById()
    //show_edit = $routeParams['show_edit'] || '0' 
  }

  changeItem() {
    if (this.form_data.seckill_item_ids === '' || this.form_data.seckill_item_ids == 0) {
      this.form_data.item_name = '';
      return;
    }

    this.dataService.collection_itemGet({
      item_id: this.form_data.seckill_item_ids
    }).then(res => {
      var item_info = res.data.item_info
      this.form_data.item_name = item_info.item_name;
      this.form_data.item_imgurl = item_info.item_imgurl;
      this.form_data.item_price = item_info.item_price;
    })

  }

  ok() {

    this.form_data.begin_time = Math.floor(+this.form_data.begin_time / 1000)
    this.seckill_info.seckill_item_ids = this.form_data.seckill_item_ids;
    this.seckill_info.info.stock = this.form_data.stock;
    this.seckill_info.info.begin_time = this.form_data.begin_time;
    this.$uibModalInstance.close(this.seckill_info);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

  private getSeckillById() {
    this.dataService.collection_seckillGet({
      id: this.id
    }).then(res => {
      this.seckill_info = res.data.seckill_info
      this.form_data = {
        begin_time: new Date(this.seckill_info.info.begin_time * 1000),
        stock: this.seckill_info.info.stock || 0,
        seckill_item_ids: this.seckill_info.seckill_item_ids,
        item_imgurl: this.seckill_info.item.item_imgurl,
        item_price: this.seckill_info.item.item_price,
        item_name: this.seckill_info.item.item_name,
      }
    })
  }
}

