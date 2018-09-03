import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;
import { IDataService } from '../../services/data-service/data-service.interface';

goodsService.$inject = ['$uibModal', 'Notification', 'dataService'];
export function goodsService(
  $uibModal: ng.ui.bootstrap.IModalService,
  Notification: see.INotificationService,
  dataService: see.IDataService,
) {

  const service = {
    getClass,
    attrEditAndAddModal,
    openPictureCenterModal,
    getProduct,
    setSameSkuValue,
    formatProduct,
  };
  let attrList:any = {};
  return service;

  /**
   * 打开图片中心
   * @param type {number} 1: 商品主图 2: 尺码图 3: 编辑器
   */
  function openPictureCenterModal(type: number, item_main_img_list?: string[], size_table_imgurl?: string): ng.IPromise<string[]> {
    return $uibModal.open({
      size: 'lg',
      backdrop: 'static',
      component: 'modalPictureCenter',
      resolve: {
        type: () => type,
        alreadyHasList: () => {
          if (type === 1) {
            return item_main_img_list;
          } else if (type === 2) {
            return !!size_table_imgurl ? [size_table_imgurl] : [];
          } else {
            return [];
          }
        },
      },
    }).result;
  }

  function getClass(cb) {
    return dataService.item_class2Tree().then(function (res) {
      const classes = [
        {
          id: '0',
          title: '全部',
        },
      ];
      Object.keys(res.data).forEach(function (k) {
        classes.push({
          id: res.data[k].class_id,
          title: res.data[k].class_name,
        });
      });
      if (cb) cb(classes);
      return classes;
    });
  }

  function attrEditAndAddModal(type, attr, class_id, class_name, msg, cb) {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-add-attr-to-class.html'),
      controller: 'modalAddAttrToClassController',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        class_name () {
          return class_name;
        },
        attr () {
          return attr;
        },
        type: () => type,
      },
    });

    modalInstance.result.then(function (params) {
      let _params = {};
      if (type === 'add') {
        _params = angular.extend({
          class_id,
          attr_id: attr.attr_id,
        },                       params);
        dataService.category_addAttrToClass2(_params).then(res => {
          cb && cb(res.data);
          Notification.success(msg);
        });
      } else if (type === 'edit') {
        _params = {
          rel_id: attr.rel_id,
          rel_json: JSON.stringify(params),
        };
        dataService.category_updateAttrRel(_params).then(res => {
          cb && cb(res.data);
          Notification.success(msg);
        });
      }

    },                        function () {
    });
  }

  // 获取完整商品及sku_list
  function getProduct(item_id, class_id) {
    return getClassAttr(class_id).then(() => {
      return dataService.product_mgr_getProduct({
        class_id,
        item_id,
      });
    }).then(function (res: any) {
      const item = res.data;
      item.sku_list = formatRespSkuList(item.sku_list);
      item.sku_attr_list = attrList;
      return item;
    });
  }

  function formatProduct(item) {
    item.sku_list = formatRespSkuList(item.sku_list);
    item.sku_attr_list = attrList;
    return item;
  }


  function formatRespSkuList(sku_list, in_promotion= false) {
    const r = [];
    _.forEach(sku_list, function (v1, k1) {
      const sku = {
        sku_id: v1.sku_id,
        sku_ori_price: v1.sku_ori_price,
        sku_mark: v1.sku_mark,
        sku_price: v1.sku_price,
        sku_stock: +v1.sku_stock,
        display_value: [],
        attr_value_list: [],
        attr_value_map: {},
        supply_price: !_.isUndefined(v1.supply_price) ? v1.supply_price && +v1.supply_price : null,
        cost_price: !_.isUndefined(v1.cost_price) ? v1.cost_price && +v1.cost_price : null,
        // promotion_price: !(vm.is_edit && vm.is_c2c) && in_promotion === '1' ? +v1.promotion_price : undefined,
        stock_sum: v1.stock_sum,
        cloud_sku_id:'0',
        cloud_info:{ id:'',stock:'',unit:'',label:'' },
        suggested_retail_price_from: v1.suggested_retail_price_from,
        suggested_retail_price_to: v1.suggested_retail_price_to,
      };
      _.forEach(v1.sku_attr, function (v2, k2) {
        const isCustom = v2.value_id === '0';
        const t = {
          attr_value_id: isCustom ? -1 : v2.value_id,
          attr_value: '',
          attr_id: v2.attr_id,
          attr_type: v2.attr_type,
          sku_imgurl: v2.sku_imgurl,
          custom_way_id: +v2.custom_way_id,
          custom_group_id: +v2.custom_group_id,
          attr_value_text: '',
        };

        if (v2.attr_type === '5') {
          const attr_value = getGroup('sell', 'groups', v2.attr_id, v2.value_id).attr_value;
          t.attr_value_text = isCustom ? v2.text : attr_value;
        } else if (v2.attr_type === '6') {
          const attr_value = getGroup('sell', 'ways', v2.attr_id, v2.value_id).attr_value;
          t.attr_value_text = isCustom ? v2.text : attr_value;
        } else if (v2.attr_type === '2') {
          if (isCustom) {
            t.attr_value_text = v2.text;
          } else {
            const attr_value2 = attrList.sell.filter(function (item) { return item.attr_id === v2.attr_id; })[0].option_values[v2.value_id].attr_value;
            t.attr_value_text = attr_value2;
          }
        }
        sku.attr_value_list.push(t);
      });
      sku.attr_value_map = _.keyBy(sku.attr_value_list, 'attr_id');
      r.push(sku);
    });
    return r;
  }

  /**
   * 接口返回数据中attrtype === 5 || 6 获取group_id
   * @param { type: string } 'common' || 'sell'
   * @param { attr_type: string } 'groups' || 'ways'
   * @param { attr_id: string } 属性ID
   * @param { attr_value_id: string } 属性值ID
   */
  function getGroup(type, attr_type, attr_id, attr_value_id) {
    const attr = attrList[type].filter(function (item) { return item.attr_id == attr_id; }),
      r = {
        group_id: '0',
        group_name: '',
        attr_value: '',
      };
    if (attr.length === 0) return;
    _.forEach(attr[0][attr_type], function (v1, k1) {
      _.forEach(v1.values, function (v2, k2) {
        if (k2 === attr_value_id) {
          Object.assign(r, {
            group_id: k1,
            group_name: v1.group_name || v1.display_name,
            attr_value: v2.attr_value,
          });
        }
      });
    });
    return r;
  }

  function getClassAttr(class_id) {
    attrList = {};
    const formatAttr = function (arr, type, formKey) {
      _.forEach(arr[type], function (v1, k1) {
        if (v1.attr_type === '5') {
          attrList[type][k1].attrType5Arr = [];
          _.forEach(v1.groups, function (v2, k2) {
            _.forEach(v2.values, function (v3, k3) {
              attrList[type][k1].attrType5Arr.push({
                group_id: k2,
                group_name: v2.group_name,
                attr_value: v3.attr_value,
                attr_value_id: k3,
              });
            });
          });
        }
      });
    };

    return dataService.product_mgr_getClassAttr({
      class_id,
    }).then(function (res) {
      if (res.result === 1 && res.data) {
        attrList = res.data;
        formatAttr(res.data, 'sell', 'sku_attr');
        formatAttr(res.data, 'common', 'spu_attr');
        return res.data;
      } else if (res.result === 1 && !res.data) {
        Notification.warn('抱歉，该品类已被删除，请重新创建！');
      } else Notification.dataError(res);
    });
  }

  function setSameSkuValue(sku_list, key, value) {
    _.forEach(sku_list, function (v, k) {
      v[key] = value;
    });
  }
}
