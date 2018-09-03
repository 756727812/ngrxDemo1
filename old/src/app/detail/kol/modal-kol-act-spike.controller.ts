import { IDataService } from '../../services/data-service/data-service.interface'
import { INotificationService } from '../../services/notification/notification.interface'
import * as angular from 'angular'
import * as moment from 'moment';

export class kolActSpikeController {
  list_cur: Array<any>
  list_item: Array<any>
  list_page: Array<any>
  list_choice: Array<any>
  str_choice: string
  cur_page: number
  total_items: number
  seckill_info: any
  pre_item_id: any
  goods_msg: any
  start_time: any
  end_time: any
  herald_time: any
  edit: any
  params_obj: any
  static $inject = ['$uibModalInstance', '$routeParams', 'dataService', 'params', 'Notification']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private dataService: IDataService,
    private params: any,
    private Notification: INotificationService,
  ) {
    // 初始化
    console.log(params);
    this.params_obj = params;
    this.start_time = moment().add(3, "days");
    this.end_time = moment().add(30, "days");
    this.herald_time = moment().add(2, "days");

    this.start_time = new Date(Math.floor(+this.start_time / 1000) * 1000)
    this.end_time = new Date(Math.floor(+this.end_time / 1000) * 1000)
    this.herald_time = new Date(Math.floor(+this.herald_time / 1000) * 1000)


    this.seckill_info = {
      act_name: '',
      herald_time: '',
      start_time: '',
      end_time: '',
      item_id: '',
      stock: '',
      price: ''
    }
    this.edit = false;
    if (params.sort == 'spike') {
      this.edit = true
      this.getMessage();
    }
  }

  isGoods() {
    if (!this.seckill_info.item_id) {
      this.goods_msg = '';
      this.pre_item_id = '';
    }
    if (this.seckill_info.item_id && this.seckill_info.item_id != this.pre_item_id) {
      this.pre_item_id = this.seckill_info.item_id;
      this.dataService.kol_act_actSeckillItemGet({
        kol_id: this.params.kol_id,
        act_id: this.params.act_id,
        item_id: this.seckill_info.item_id
      }).then(res => {
        if (res.data.msg) {
          this.goods_msg = '';
          this.seckill_info.item_id = '';
          this.Notification.warn(res.data.msg);
          console.log(this.goods_msg);
        } else {
          this.goods_msg = res.data.item_info;
          console.log(this.goods_msg);
        }
      })
    }
  }

  heraldRange() {
    console.log(Date.parse(this.start_time));
    console.log(Date.parse(this.herald_time));
    if (Date.parse(this.start_time) >= Date.parse(this.herald_time)) {
      return true;
    } else {
      return false;
    }
  }

  getMessage() {
    this.dataService.kol_act_actSeckillGet({
      act_id: this.params.act_id,
    }).then(res => {
      this.start_time = new Date(res.data.seckill_info.start_time * 1000);
      this.end_time = new Date(res.data.seckill_info.end_time * 1000);
      this.herald_time = new Date(res.data.seckill_info.herald_time * 1000);
      this.seckill_info = res.data.seckill_info
      console.log(this.seckill_info);
      this.isGoods();
    })
  }

  ok() {
    this.seckill_info.start_time = Date.parse(this.start_time) / 1000;
    this.seckill_info.end_time = Date.parse(this.end_time) / 1000;
    this.seckill_info.herald_time = Date.parse(this.herald_time) / 1000;
    if (Date.parse(this.start_time) > Date.parse(this.end_time)) {
      this.Notification.warn('抱歉！结束时间不可早于开始时间！');
      return false;
    }
    if (Date.parse(this.start_time) < Date.parse(this.herald_time)) {
      this.Notification.warn('抱歉！预告时间不可晚于开始时间！');
      return false;
    }
    this.$uibModalInstance.close({ seckill_info: this.seckill_info, edit: this.edit });
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

}


