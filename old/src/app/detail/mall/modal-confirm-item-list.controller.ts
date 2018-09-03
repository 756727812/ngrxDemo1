import { IDataService } from '../../services/data-service/data-service.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as _ from 'lodash';
import * as angular from 'angular'

export class modalConfirmItemListController {
  num_set_kol: number
  num_set_item: number
  num_clash: number
  template_info: any
  is_clash: number
  list_item: Array<any>
  list_kol_mall: Array<any>
  is_kol: number
  class_type_cursor: string
  add_item_info: {
    total: any,
    success: any,
    fail: any,
    is_ok: boolean
  }

  static $inject = ['$uibModalInstance', '$cookies', '$routeParams', 'from_params', 'is_set_one_item', 'template_id', 'mall_id', 'mall_list', 'item_ids', 'seeModal', '$uibModal', 'dataService', 'mallService']
  constructor(
    private $uibModalInstance: any,
    private $cookies: any,
    private $routeParams: any,
    private from_params: any,
    private is_set_one_item: any,
    private template_id: number,
    private mall_id: number,
    private mall_list: any,
    private item_ids: any,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private dataService: IDataService,
    private mallService: any
  ) {
    this.is_kol = (this.$cookies.get('seller_privilege') === '24' || this.$cookies.get('seller_privilege') === '30') ? 1 : 0;
    this.class_type_cursor = 'pointer';
    if (this.is_kol) {
      this.class_type_cursor = 'normal';
    }

    this.is_clash = 0;
    this.num_set_item = this.num_set_kol = this.num_clash = 0;
    this.add_item_info = {
      total: 0,
      success: 0,
      fail: 0,
      is_ok: true
    }
    this.getChoiceItemList();

    this.getTemplateInfo();
  }

  getTemplateInfo() {
    this.dataService.mall_template_get({ template_id: this.template_id }).then(res => {
      this.template_info = res.data.template_info
    })
  }

  getChoiceItemList() {
    const params = {
      is_set_one_item: this.is_set_one_item,
      item_ids: JSON.stringify(this.item_ids),
      template_id: this.template_id,
      mall_id: this.mall_id,
      mall_list: JSON.stringify(this.mall_list)
    }

    this.dataService.mall_template_getChoiceItemList(params).then(res => {
      this.list_item = res.data.item_list;
      this.num_set_item = this.list_item.length;
      this.list_kol_mall = res.data.kol_mall_list;
      this.num_set_kol = this.list_kol_mall.length;

      _.forEach(this.list_kol_mall, function (v) {
        _.forEach(v.list_item, function (t) {
          t.ori_online_time_stmp = t.online_time;
          t.online_time = new Date(t.online_time * 1000)
          _.forEach(t.sku_list, function (s) {
            s.release_time = new Date(s.release_time * 1000)
          })
          t.ori_online_time = new Date(t.ori_online_time * 1000)
        })
      })
      _.forEach(this.list_item, function (t) {
        t.ori_online_time_stmp = t.online_time;
        t.online_time = new Date(t.online_time * 1000)
        t.ori_online_time = new Date(t.ori_online_time * 1000)
      })
      this.mallService.initKolItem(this.list_kol_mall, this.list_item);
      this.mallService.updatePriceMinAndMax(this.list_kol_mall, this.list_item);
      this.updateNumClash();
    }).catch(res => {
      this.$uibModalInstance.close({});
    })

  }

  checkResetClash() {
    if (this.is_set_one_item == 1 || this.mall_id > 0) {
      this.num_clash = 0;
      this.is_clash = 0;
    }
  }
  updateNumClash() {
    this.is_clash = 0;
    const self = this;
    let num_clash = 0;
    _.forEach(this.list_item, function (item) {
      num_clash += self.setNumClashByItem(item);
    })
    if (num_clash > 0) {
      this.is_clash = 1;
    }
    this.checkResetClash();

    return '';
  }

  setNumClashByItem(tmp_item) {
    tmp_item.num_clash = 0;
    tmp_item.num_time = 0;
    _.forEach(this.list_kol_mall, function (kol) {
      _.forEach(kol.list_item, function (item) {
        if (Number(tmp_item.item_id) == Number(item.parent_item_id)
          && Number(item.set_clash_status) != 0) {
          tmp_item.num_clash++;
        }
        if (Number(tmp_item.item_id) == Number(item.parent_item_id)
          && Number(item.ori_online_time) != Number(item.online_time)) {
          tmp_item.num_time++;
        }
      })
    })
    return tmp_item.num_clash;
  }

  //获取冲突数
  getNumClash() {
    const self = this;
    this.num_clash = 0;
    _.forEach(self.list_item, function (item) {
      if (item.num_clash > 0) {
        self.num_clash++;
      }
    })
    this.checkResetClash();
    return this.num_clash
  }

  popSet(item_info) {
    if (this.is_kol) {
      return;
    }
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-kol-item-set.html'),
      controller: 'modalKolItemSetController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        from_params: () => this.from_params,
        is_set_one_item: () => this.is_set_one_item,
        mall_id: () => this.mall_id,
        from_cur_item: () => item_info,
        from_list_item: () => this.list_item,
        from_list_kol_mall: () => this.list_kol_mall,
      },
    })

    return modalInstance.result.then(params => {
      this.list_item = params.list_item;
      this.list_kol_mall = params.list_kol_mall

      this.mallService.updatePriceMinAndMax(this.list_kol_mall, this.list_item);

      this.updateNumClash();

    })
  }

  ok() {
    this.updateNumClash();
    if (this.is_clash > 0) {
      return;
    }
    this.seeModal.confirm('确认提示', '设置已完成，确认本次更新吗？', () => {
      //去掉部分属性，减少数据上传
      _.forEach(this.list_kol_mall, function (kol_mall) {
        kol_mall.choice_item = [];
        //格式化时间为时间戳
        _.forEach(kol_mall.list_item, function (kol_item) {
          kol_item.tmp_online_time = kol_item.online_time;
          kol_item.online_time = Date.parse(kol_item.online_time) / 1000;
          _.forEach(kol_item.sku_list, function (sku_info) {
            sku_info.tmp_release_time = sku_info.release_time;
            sku_info.release_time = Date.parse(sku_info.release_time) / 1000;
          })
        })
      })
      this.dataService.mall_template_templateConfirmSync({
        template_id: this.template_id,
        mall_id: this.mall_id,
        item_list: JSON.stringify(this.list_item),
        kol_mall_list: JSON.stringify(this.list_kol_mall)
      }).then(res => {
        const item_total = this.list_item.length
        let fail_item_list = []
        let fail_item_id = [] && res.data.fail_item_list
        if (fail_item_id && fail_item_id.length) {
          _.forEach(fail_item_id, (val) => {
            _.forEach(this.list_item, (item) => {
              if (item.item_id == val) {
                fail_item_list.push(item)
              }
            })
          })
          this.list_item = fail_item_list
          this.add_item_info = {
            total: item_total,
            success: item_total - fail_item_id.length,
            fail: fail_item_id.length,
            is_ok: false
          }
        }
        else {
          this.add_item_info.is_ok = true
          const modalInstance = this.$uibModal.open({
            animation: true,
            template: require('./modal-success-sync.html'),
            controller: 'modalSuccessSyncCouponController',
            controllerAs: 'vm',
            backdrop: 'static',
            size: 'sm',
            resolve: {
              from_params: () => this.from_params,
              num_kol: () => this.list_kol_mall.length,
              num_item: () => this.list_item.length,
            },
          })
          return modalInstance.result.then(params => {
            this.$uibModalInstance.close({});
          })
        }
      }).catch( //失败时回滚
        res => {
          _.forEach(this.list_kol_mall, function (kol_mall) {
            kol_mall.choice_item = [];
            //格式化时间为时间戳
            _.forEach(kol_mall.list_item, function (kol_item) {
              kol_item.online_time = new Date(kol_item.online_time * 1000)
              _.forEach(kol_item.sku_list, function (sku_info) {
                sku_info.release_time = new Date(sku_info.release_time * 1000)
              })
            })
          })
        }
      )

    })
  }

  cancel() {
    this.seeModal.confirm('确认提示', '确认要退出？', () => {
      this.$uibModalInstance.dismiss('cancel')
    })
  }


  goBack() {
    this.seeModal.confirm('确认提示', '确认要退出？', () => {
      this.$uibModalInstance.dismiss('cancel')
    })
  }


}


