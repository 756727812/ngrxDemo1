/**
* 待发货订单tab下点击买手发货操作(模态框)
*/
import * as _ from 'lodash';
import * as angular from 'angular';

modalBuyerShipController.$inject = ['$scope', '$q', '$uibModalInstance', 'mid_order_id', 'item_location', 'ship_method', 'action', 'logistics_type', 'logistics_conf_id', 'dataService'];
export function modalBuyerShipController($scope, $q, $uibModalInstance, mid_order_id, item_location, ship_method, action, logistics_type, logistics_conf_id, dataService) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.logistics_type = logistics_type;
  $scope.errMsg = null;
  $scope.sendGood0 = {
    item_location: item_location === 0 || item_location === 101 ? '' : item_location + '',
    dispactchType0: '1' // 包裹只有一个订单/多个订单
  };  // 直邮seego
  $scope.sendGood1 = {};  // 直邮非seego
  $scope.sendGood2 = {};  // 拼邮
  $scope.express = {};
  $scope.tab1 = true;
  $scope.tab2 = false;
  $scope.getServiceData = getServiceData;

  activate();

  function activate() {
    const promises = [getTransportList(), getOrderExpress(), getServiceData($scope.sendGood0.item_location)];
    return $q.all(promises).then(function() {
      getShowType()
    })
  }

  function getShowType() {
    return dataService.orderv2_getShowType({ order_id: mid_order_id }).then(data => {
      $scope.showType = data.data.show_type;
      if ($scope.showType == 1) {
        $scope.express.method = "1"    // seego
      } else if ($scope.showType == 2) {
        $scope.express.method = "2"    // not seego
      }
    })
  }

  function getTransportList() {
    return dataService.order_getTransportList()
      .then(data => $scope.transportList = data.data.filter(item => item.transport_type == 2 || item.transport_type == 3))
  }

  function getItemLocation(ship_method, item_location) {
    if (ship_method == '1' || ship_method == '2') {
      return '发布商品时所选物流为非Seego物流'
    } else if (ship_method == '3' || ship_method == '10') {
      const _ = item_location;
      return _ == 1 && '发布商品时所选物流为Seego物流--西部波特兰仓(美国)' ||
        _ == 5 && '发布商品时所选物流为Seego物流--墨尔本仓(澳洲)' ||
        _ == 6 && '发布商品时所选物流为Seego物流--德国仓' ||
        _ == 7 && '发布商品时所选物流为Seego物流--日本仓' ||
        _ == 51 && '发布商品时所选物流为Seego物流--悉尼仓(澳洲)';
    }
  }

  function getOrderExpress() {
    return dataService.express_getItem({
      order_id: mid_order_id,
    }).then(res => {
      $scope.logistic = res.data
      return $scope.logistic
    })
  }

  function getServiceData(item_location) {
    const i = _.indexOf(['1', '5', '7', '102'], item_location)
    return i > -1 && dataService.orderv2_getServiceCodeList({ item_location }).then(res => {
      $scope.service_data = res.data
      return $scope.service_data
    })
  }

  $scope.infoMsg = getItemLocation(ship_method, item_location);

  $scope.select = function(arg) {
    $scope.errMsg = null;
    $scope.tab1 = arg == 1;
    $scope.tab2 = arg == 2;
  };

  // 请选择物流方式
  $scope.$watch('express.method', function() {
    $scope.errMsg = null;
  })

  $scope.ok = function() {
    $scope.errMsg = null;
    const param = {
      action: undefined,
      order_id: mid_order_id,
      logistics_conf_id: undefined,
      show_type: undefined,
      transport_code: undefined,
      item_location: undefined,
      transport_no: undefined,
      order_id_list: undefined,
      transport_code_1: undefined,
      transport_name: undefined,
      transport_url: undefined,
      service_code: undefined
    };
    if ($scope.tab1 === true) { // 直邮（直发用户)
      if ($scope.express.method == 1) {    // seego物流
        if (!$scope.sendGood0.item_location) {
          $scope.errMsg = '请选择收货仓库!'
          return
        }
        if (!$scope.sendGood0.service_code) {
          $scope.errMsg = '请选择物流路线！'
          return
        }
        if (logistics_type === 1) {
          if (!$scope.sendGood0.transport_code_1) {
            $scope.errMsg = '请选择物流公司!'
            return
          }
          if ($scope.sendGood0.transport_code_1 == 'other') {
            if (!$scope.sendGood0.transport_name) {
              $scope.errMsg = '请填写物流公司名称';
              return;
            }
            if (!$scope.sendGood0.transport_url) {
              $scope.errMsg = '请填写物流追踪网址！';
              return -1
            }
          }
        }
        if (!$scope.sendGood0.transport_no) {
          $scope.errMsg = '请输入物流单号!'
          return
        }
        if (logistics_type === 0) {
          if (logistics_conf_id == '14') {
            param.logistics_conf_id = '15'
          } else if (logistics_conf_id == '2') {
            param.logistics_conf_id = '3'
          }
        } else if (logistics_type === 1) {
          if (logistics_conf_id == '14')
            param.logistics_conf_id = '40'
          else if (logistics_conf_id == '2')
            param.logistics_conf_id = '37'
        }
        param.action = logistics_type === 1 ? '' : 'direct_mail_seego';
        param.show_type = 1;
        param.transport_code = '1hcang';
        param.item_location = $scope.sendGood0.item_location;
        param.service_code = $scope.sendGood0.service_code
        param.transport_no = $scope.sendGood0.transport_no;
        param.order_id_list = $scope.sendGood0.dispactchType0 == '1' ? mid_order_id : $scope.sendGood0.addOrderId ? mid_order_id + '\n' + $scope.sendGood0.addOrderId : mid_order_id;
        param.transport_code_1 = $scope.sendGood0.transport_code_1;
        param.transport_name = $scope.sendGood0.transport_name;
        param.transport_url = $scope.sendGood0.transport_url || '';
      } else {
        // 非seego物流
        if (!$scope.sendGood1.transport_code) {
          $scope.errMsg = '请选择物流公司';
          return;
        }
        if ($scope.sendGood1.transport_code == 'other') {
          if (!$scope.sendGood1.transport_name) {
            $scope.errMsg = '请填写物流公司名称';
            return;
          }
          if (!$scope.sendGood1.transport_url) {
            $scope.errMsg = '请填写物流追踪网址!';
            return -1
          }
        }
        if (!$scope.sendGood1.transport_no) {
          $scope.errMsg = '请输入物流单号';
          return;
        }
        if (logistics_type === 0) {
          if (logistics_conf_id == '14') {
            param.logistics_conf_id = '16'
          } else if (logistics_conf_id == '2') {
            param.logistics_conf_id = '4'
          }
        } else if (logistics_type === 1) {
          if (logistics_conf_id == '14')
            param.logistics_conf_id = '41'
          else if (logistics_conf_id == '2')
            param.logistics_conf_id = '38'
        }
        param.action = logistics_type === 1 ? '' : 'direct_mail_unseego';
        param.show_type = 2;
        param.transport_code = $scope.sendGood1.transport_code;
        if ($scope.sendGood1.transport_code !== 'other') {
          angular.forEach($scope.transportList, function(transportListItem) {
            $scope.sendGood1.transport_code === transportListItem.transport_code ?
              $scope.sendGood1.transport_name = transportListItem.transport_name : '';
          });
        }

        param.transport_name = $scope.sendGood1.transport_name;
        param.transport_url = $scope.sendGood1.transport_url || '';
        param.transport_no = $scope.sendGood1.transport_no;
      }
    } else {
      // 拼邮
      param.action = 'together_mail_official';
      if (!$scope.sendGood2.transport_code) {
        $scope.errMsg = '请选择物流公司';
        return;
      }
      if ($scope.sendGood2.transport_code == 'other') {
        if (!$scope.sendGood2.transport_name) {
          $scope.errMsg = '请填写物流公司名称';
          return;
        }
        if (!$scope.sendGood2.transport_url) {
          $scope.errMsg = '请填写物流追踪网址!';
          return -1;
        }
      }
      if (!$scope.sendGood2.transport_no) {
        $scope.errMsg = '请输入物流单号';
        return;
      }
      if (logistics_type === 0) {
        if (logistics_conf_id == '14') {
          param.logistics_conf_id = '18'
        } else if (logistics_conf_id == '2') {
          param.logistics_conf_id = '6'
        }
      } else if (logistics_type === 1) {
        if (logistics_conf_id == '2') {
          param.logistics_conf_id = '43'
        } else if (logistics_conf_id == '14') {
          param.logistics_conf_id = '44'
        }
      }

      param.show_type = 2;
      param.transport_code = $scope.sendGood2.transport_code || '';
      param.transport_name = $scope.sendGood2.transport_name || '';
      param.transport_url = $scope.sendGood2.transport_url || '';
      param.transport_no = $scope.sendGood2.transport_no;
    }
    $uibModalInstance.close(param);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalBuyerShip = {
//   modalBuyerShipController: modalBuyerShipController
// }
