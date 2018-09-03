import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
const version = +new Date();


export interface IMallService {
  initKolItem: (list_kol_mall: any, list_item: any) => ng.IPromise<any>;
  updatePriceMinAndMax: (list_kol_mall: any, list_item: any) => ng.IPromise<any>;
  listSet: (mall_id: number, title: string, mall_online: number, mall_sync: number, cb: any) => ng.IPromise<any>;
  selectGoods: (template_id: number, mall_id: number, collection_id: number, block_item: number) => ng.IPromise<any>;
  popSet: (template_id: number, mall_id: number, item_id: number) => ng.IPromise<any>;
}

export class mallService implements IMallService {
  is_kol: number;
  is_new_brand: number;
  static $inject: string[] = ['$uibModal', '$cookies', 'Notification', 'seeModal', 'dataService'];
  constructor(
    private $uibModal: any,
    private $cookies: any,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
  ) {
    this.is_kol = (this.$cookies.get('seller_privilege') === '24' || this.$cookies.get('seller_privilege') === '30') ? 1 : 0;
    this.is_new_brand = (this.$cookies.get('seller_privilege') === '30') ? 1 : 0;
  }

  initKolItem: (list_kol_mall?: any, list_item?: any) => ng.IPromise<any> = (list_kol_mall, list_item) => {
    return _.forEach(list_kol_mall, function (v) {
      _.forEach(v.list_item, function (item) {
        item.is_all_set_0 = 'black';
        item.is_all_set_1 = 'black';
        item.is_all_set_2 = 'black';
        item.is_all_set_3 = 'black';

      });
    });
  }

  //更新商品价格范围
  updatePriceMinAndMax: (list_kol_mall?: any, list_item?: any) => ng.IPromise<any> = (list_kol_mall, list_item) => {
    //kol的商品价格范围
    _.forEach(list_kol_mall, function (v) {
      _.forEach(v.list_item, function (item) {
        item.price_min = 2147483647;
        item.price_max = 0;
        item.price_kol_min = 2147483647;
        item.price_kol_max = 0;
        _.forEach(item.sku_list, function (sku) {
          item.price_max = parseFloat(sku.sku_price) > item.price_max ? parseFloat(sku.sku_price) : item.price_max;
          item.price_kol_max = parseFloat(sku.cost_price) > item.price_kol_max ? parseFloat(sku.cost_price) : item.price_kol_max;
          item.price_min = parseFloat(sku.sku_price) < item.price_min ? parseFloat(sku.sku_price) : item.price_min;
          item.price_kol_min = parseFloat(sku.cost_price) < item.price_kol_min ? parseFloat(sku.cost_price) : item.price_kol_min;
        });
        item.price_min = item.price_min == 2147483647 ? 0 : item.price_min;
        item.price_kol_min = item.price_kol_min == 2147483647 ? 0 : item.price_kol_min;
      });
    });

    //模板商品价格范围
    return _.forEach(list_item, function (cur_item) {
      cur_item.not_share_parent_stock = 0;
      cur_item.price_min = 2147483647;
      cur_item.price_max = 0;
      cur_item.price_kol_min = 2147483647;
      cur_item.price_kol_max = 0;

      if (list_kol_mall.length == 0) {
        _.forEach(cur_item.sku_list, function (sku) {
          cur_item.price_max = parseFloat(sku.sku_price) > cur_item.price_max ? parseFloat(sku.sku_price) : cur_item.price_max;
          cur_item.price_kol_max = parseFloat(sku.cost_price) > cur_item.price_kol_max ? parseFloat(sku.cost_price) : cur_item.price_kol_max;
          cur_item.price_min = parseFloat(sku.sku_price) < cur_item.price_min ? parseFloat(sku.sku_price) : cur_item.price_min;
          cur_item.price_kol_min = parseFloat(sku.cost_price) < cur_item.price_kol_min ? parseFloat(sku.cost_price) : cur_item.price_kol_min;
        });
        cur_item.price_min = cur_item.price_min == 2147483647 ? 0 : cur_item.price_min;
        cur_item.price_kol_min = cur_item.price_kol_min == 2147483647 ? 0 : cur_item.price_kol_min;
      }

      _.forEach(list_kol_mall, function (kol) {
        _.forEach(kol.list_item, function (kol_item) {
          if (Number(kol_item.parent_item_id) == Number(cur_item.item_id)) {
            kol_item.not_share_parent_stock = 0;
            cur_item.price_max = parseFloat(kol_item.price_max) > cur_item.price_max ? parseFloat(kol_item.price_max) : cur_item.price_max;
            cur_item.price_kol_max = parseFloat(kol_item.price_kol_max) > cur_item.price_kol_max ? parseFloat(kol_item.price_kol_max) : cur_item.price_kol_max;
            cur_item.price_min = parseFloat(kol_item.price_min) < cur_item.price_min ? parseFloat(kol_item.price_min) : cur_item.price_min;
            cur_item.price_kol_min = parseFloat(kol_item.price_kol_min) < cur_item.price_kol_min ? parseFloat(kol_item.price_kol_min) : cur_item.price_kol_min;
            //锁定库存数
            _.forEach(kol_item.sku_list, function (sku) {
              if (Number(sku.lock_quantitative_inventory) == 1) {
                kol_item.not_share_parent_stock++;
              }
            });

            if (kol_item.not_share_parent_stock > 0) {
              cur_item.not_share_parent_stock++;
            }

          }
        });
      });
      cur_item.price_min = cur_item.price_min == 2147483647 ? 0 : cur_item.price_min;
      cur_item.price_kol_min = cur_item.price_kol_min == 2147483647 ? 0 : cur_item.price_kol_min;
    });

  }

  listSet: (mall_id?: number, title?: string, mall_online?: number, mall_sync?: number, cb?: any) => ng.IPromise<any> = (mall_id, title, mall_online, mall_sync, cb) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-mall-list-set.html'),
      controller: 'mallListSetController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        params () {
          return {
            mall_id,
            title,
            mall_online,
            mall_sync,
          };
        },
      },
    });
    return modalInstance.result.then(params =>
      this.dataService.modal_modify_mall_list({
        mall_info: JSON.stringify(params),
      }).then(res => {
        this.Notification.success('成功修改信息！');
        cb && cb();
      }),
    );
  }

  selectGoods: (template_id?: number, mall_id?: number, collection_id?: number, block_item?: number) => ng.IPromise<any> = (template_id, mall_id, collection_id, block_item) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require(this.is_new_brand == 1 ? './modal-mall-select-goods-new-brand.html' : (this.is_kol == 1 ? './modal-mall-select-goods-kol.html' : './modal-mall-select-goods.html')),
      controller: this.is_new_brand == 1 ? 'mallSelectGoodsNewBrandController' : 'mallSelectGoodsController',
      controllerAs: 'vm',
      size: 'lg',
      windowClass: 'modal-mall-goods-picker',
      backdrop: 'static',
      resolve: {
        template_id: () => template_id,
        mall_id: () => mall_id,
        collection_id: () => collection_id,
        block_item: () => block_item,
        params () {
          return {};
        },
      },
    });
    return modalInstance.result;
  }

  popSet: (template_id?: number, mall_id?: number, item_id?: number) => ng.IPromise<any> = (template_id, mall_id, item_id) => {
    let type_template_item_set = 0;
    let type_mall_set_item = 0;
    if (template_id > 0) {
      type_template_item_set = 1;
    } else {
      type_mall_set_item = 1;
    }
    const from_params = {
      type_distribute: 0,
      type_template_add_item: 0,
      type_template_item_set,
      type_mall_add_item: 0,
      type_mall_set_item,
    };


    const item_ids = [item_id];
    //获取当前要同步的商城信息
    return this.dataService.mall_template_getChoiceMall({
      template_id,
      add_exist_kol: 1,
      mall_id,
    }).then(res => {
      const mall_list = res.data.list_mall;
      //打开商品确认清单
      const cur_input = '';
      const modalInstance = this.$uibModal.open({
        animation: true,
        template: require('./modal-confirm-item-list.html'),
        controller: 'modalConfirmItemListController',
        controllerAs: 'vm',
        backdrop: 'static',
        size: 'lg',
        resolve: {
          from_params: () => from_params,
          is_set_one_item: () => 1,
          template_id: () => template_id,
          mall_id: () => mall_id,
          mall_list: () => mall_list,
          item_ids: () => item_ids,
        },
      });

    });
  }

}


