/**
 * 待发货订单tab下点击官网发货操作
 */
import * as angular from 'angular';
import * as _ from 'lodash';

modalOfficialShipController.$inject = ['$scope', '$uibModalInstance', 'mid_order_id', 'item_location', 'ship_method', 'logistics_type', 'dataService'];
export function modalOfficialShipController($scope, $uibModalInstance, mid_order_id, item_location, ship_method, logistics_type, dataService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.logistics_type = logistics_type;
  $scope.errMes = null;
  $scope.isOnlyOne = '1';
  $scope.expressMethod = 1;
  $scope.express1 = {};
  $scope.express2 = { isSeegoExpress: '1' };
  $scope.express21 = { isOnlyOne: '1' };
  $scope.express22 = {};
  $scope.express21.name = item_location === 0 || item_location === 101 ? '' : item_location + '';
  $scope.infoMsg = getItemLocation(ship_method, item_location);
  $scope.getServiceData = getServiceData

  activate();

  function activate() {
    getTransportList();
    getShowType();
    getOrderExpress();
    getServiceData($scope.express21.name)
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
    dataService.express_getItem({
      order_id: mid_order_id,
    }).then(function(res) {
      $scope.logistic = res.data;
    })
  }

  function getTransportList() {
    dataService.order_getTransportList()
      .then(data => $scope.transportList = data.data.filter(item => item.transport_type == 2 || item.transport_type == 3))
  }

  function getShowType() {
    dataService.orderv2_getShowType({ order_id: mid_order_id }).then(res => {
      const data = angular.fromJson(res);
      $scope.showType = data.data.show_type;
      $scope.tab2 = true;
      $scope.tab1 = false;
      $scope.express2.isSeegoExpress = $scope.showType == 1 ? '1' : '2';
    })
  }

  function getServiceData(item_location) {
    const i = ~_.indexOf(['1', '5', '7', '102'], item_location)
    return i && dataService.orderv2_getServiceCodeList({ item_location }).then(res => {
      $scope.service_data = res.data
      return $scope.service_data
    })
  }


  $scope.setExpressMethod = function(type) {
    $scope.expressMethod = type;
    $scope.errMes = null;
    $scope.tab1 = type == 1;
    $scope.tab2 = type == 2;
  }

  $scope.ok = function() {
    const param = {
      order_id: mid_order_id,
      logistics_conf_id: undefined,
      show_type: undefined,
      action: undefined,
      transport_code: undefined,
      transport_no: undefined,
      forecast_logistics_time: undefined,
      transport_name: undefined,
      transport_url: undefined,
      transport_code_1: undefined,
      item_location: undefined,
      order_id_list: undefined,
      service_code: undefined
    };
    if ($scope.expressMethod == 1) {
      // 官网发往买手
      if (!$scope.express1.name) {
        $scope.errMes = '请选择物流公司!';
        return -1
      }
      if ($scope.express1.name == 'other') {
        if (!$scope.express1.other) {
          $scope.errMes = '请填写物流公司名称!';
          return -1
        }
        if (!$scope.express1.url) {
          $scope.errMes = '请填写物流追踪网址!';
          return -1
        }
      }
      if (!$scope.express1.code) {
        $scope.errMes = '请填写物流单号！'
        return -1
      }
      param.logistics_conf_id = "2";
      param.show_type = 2;
      param.action = 'official_to_buyer';
      param.transport_code = $scope.express1.name || '';
      param.transport_no = $scope.express1.code;
      param.forecast_logistics_time = $scope.express1.days || '';
      param.transport_name = $scope.express1.other || '';
      param.transport_url = $scope.express1.url || '';
    } else {
      // 官网发往转运仓（直发用户）
      if ($scope.express2.isSeegoExpress == '1') {   // seego物流
        if (!$scope.express21.code) {
          $scope.errMes = '请填写物流单号!';
          return -1
        }
        if (!$scope.express21.name) {
          $scope.errMes = '请选择收货仓库!';
          return -1
        }
        if (!$scope.express21.service_code) {
          $scope.errMes = '请选择物流路线！'
          return -1
        }
        if (!$scope.express21.express) {
          $scope.errMes = '请选择物流公司!';
          return -1
        }
        if ($scope.express21.express === 'other') {
          if (!$scope.express21.other) {
            $scope.errMes = '请填写添加的物流公司名称！'
            return -1
          }
          if (!$scope.express21.url) {
            $scope.errMes = '请填写物流追踪网址！'
            return -1
          }
        }
        param.logistics_conf_id = logistics_type === 1 ? '35' : "9";
        param.action = logistics_type === 1 ? '' : 'official_to_storage_seego';
        param.show_type = 1;
        param.transport_code = '1hcang';
        param.transport_code_1 = $scope.express21.express;
        param.transport_name = $scope.express21.other || '';
        param.item_location = $scope.express21.name;
        param.service_code = $scope.express21.service_code
        param.transport_no = $scope.express21.code;
        param.transport_url = $scope.express21.url
        param.forecast_logistics_time = $scope.express21.days || '';
        param.order_id_list = $scope.express21.isOnlyOne == 1 ? mid_order_id : $scope.express21.otherOrders ? mid_order_id + '\n' + $scope.express21.otherOrders : mid_order_id;
      } else {
        // 非seego物流
        if (!$scope.express22.name) {
          $scope.errMes = '请选择物流公司!';
          return -1
        }
        if ($scope.express22.name == 'other') {
          if (!$scope.express22.other) {
            $scope.errMes = '请填写物流公司名称!';
            return -1
          }
          if (!$scope.express22.url) {
            $scope.errMes = '请填写物流追踪网址!';
            return -1
          }
        }
        if (logistics_type === 1) {
          if (!$scope.express22.code) {
            $scope.errMes = '请填写物流单号！';
            return -1
          }
        }
        param.logistics_conf_id = logistics_type === 1 ? '36' : "10";
        param.action = logistics_type === 1 ? '' : 'official_to_storage_unseego';
        param.show_type = 2;
        param.transport_code = $scope.express22.name;
        param.transport_no = $scope.express22.code;
        param.forecast_logistics_time = $scope.express22.days || '';
        param.transport_name = $scope.express22.other || '';
        param.transport_url = $scope.express22.url || '';
      }
    }
    $uibModalInstance.close(param);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalOfficialShip = {
//   modalOfficialShipController: modalOfficialShipController
// }
