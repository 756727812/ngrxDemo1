/**
 * 小订单修改商品规格
 */
import * as _ from 'lodash';
import * as angular from 'angular';

modalModifySpecController.$inject = ['$scope', '$uibModalInstance', 'item_type', 'item_id', 'skus', 'attr_value', 'total_fee', 'sku_id', 'dataService', 'Notification'];
export function modalModifySpecController($scope, $uibModalInstance, item_type, item_id, skus, attr_value, total_fee, sku_id, dataService, Notification) {

  $scope.item_type = +item_type
  $scope.attr_value = attr_value;
  $scope.total_fee = total_fee;
  $scope.newChoice = {};
  let new_sku_id;

  if (+item_type === 1) {
    $scope.skus = getSkuAttrs()
  } else {
    $scope.skus = skus;
  }

  // angular.forEach(skus, function (v, i) {
  //   $scope.newChoice[v.attr_key_id] = ''
  // })

  function getSkuAttrs() {
    const _skus = _.clone(skus), sku_attrs = []
    _.forEach(_skus[0].sku_attr, (v, k) => {
      sku_attrs.push({
        attr_key_id: v.attr_id,
        attr_name: v.attr_name,
        spec: []
      })
    })
    _.forEach(_skus, (v1, k1) => {
      _.forEach(v1.sku_attr, (v2, k2) => {
        const i = _.findIndex(sku_attrs[k2].spec, { value_id: v2.value_id })
        if (i === -1) {
          sku_attrs[k2].spec.push({
            attr_value: v2.attr_value_name,
            value_id: v2.value_id,
          })
        }
      })
    })
    return sku_attrs
  }

  $scope.checkItemSku = function() {
    if (_.keys($scope.newChoice).length === $scope.skus.length) {
      let _params = {
        item_id,
        sku: undefined
      },
        flag = +item_type ? false : true,
        sku = [];
      angular.forEach($scope.newChoice, function(v, i) {
        if (!v) flag = false;
      })
      if (flag) {
        angular.forEach($scope.newChoice, function(v, i) {
          sku.push(i + ':' + v)
        })
        _params.sku = JSON.stringify(sku)
        dataService.orderv2_checkOrderItemSku(_params).then(res => {
          $scope.sku_price = res.data.sku_price;
          new_sku_id = res.data.sku_id;
        })
      } else {
        const o = getNewSkuPrice()
        $scope.sku_price = o['sku_price']
        new_sku_id = o['sku_id']
      }
    }
  }

  function getNewSkuPrice() {
    let r, new_choice = []
    _.forEach($scope.newChoice, (v, k) => {
      new_choice.push({
        attr_id: k,
        value_id: v
      })
    })
    if (new_choice.length === 1) {
      _.forEach(skus, (v, k) => {
        if (v.sku_attr[0].value_id === new_choice[0].value_id) {
          r = {
            sku_id: v.sku_id,
            sku_price: v.sku_price
          }
        }
      })
    } else if (new_choice.length === 2) {
      _.forEach(skus, (v, k) => {
        if (v.sku_attr[0].value_id === new_choice[0].value_id && v.sku_attr[1].value_id === new_choice[1].value_id) {
          r = {
            sku_id: v.sku_id,
            sku_price: v.sku_price
          }
        }
      })
    }
    return r
  }

  $scope.ok = function() {
    if (sku_id == new_sku_id) {
      Notification.warn('新规格请不要与旧规格重复！')
      return -1;
    } else {
      const param = {
        item_id,
        new_sku_id,
        old_sku_id: sku_id
      }
      $uibModalInstance.close(param);
    }

  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }
}

// export const modalModifySpec = {
//   modalModifySpecController: modalModifySpecController
// }
