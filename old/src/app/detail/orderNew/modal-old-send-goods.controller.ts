/**
 * 待发货订单tab下点击发货操作( 兼容线上的发货流程 )
 */

ControllerController.$inject = ['$scope', '$uibModalInstance', 'mid_order_id', 'item_location', 'ship_method', 'dataService'];
export function ControllerController($scope, $uibModalInstance, mid_order_id, item_location, ship_method, dataService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.form_mesg = null;
  $scope.transportList = [];
  $scope.showType = null;
  $scope.sendGood = {
    mid_order_id: mid_order_id
  };
  $scope.sendGood1 = {
    item_location: item_location === 0 ? '' : item_location + '',
    dispactchType: 'singleBox'   // 默认包裹只有一个中订单
  };  // seego物流
  $scope.sendGood2 = {};  // 非seego物流
  $scope.express = {};


  $scope.$watch('showType', function() {
    $scope.form_mesg = null
  });

  function getItemLocation(ship_method, item_location) {
    if (ship_method == '1' || ship_method == '2') {
      return '发布商品时所选物流为非Seego物流'
    } else if (ship_method == '3' || ship_method == '10') {
      var _ = item_location;
      return _ == 1 && '发布商品时所选物流为Seego物流--西部波特兰仓(美国)' ||
        _ == 5 && '发布商品时所选物流为Seego物流--墨尔本仓(澳洲)' ||
        _ == 6 && '发布商品时所选物流为Seego物流--德国仓' ||
        _ == 7 && '发布商品时所选物流为Seego物流--日本仓' ||
        _ == 51 && '发布商品时所选物流为Seego物流--悉尼仓(澳洲)';
    }
  }

  $scope.infoMsg = getItemLocation(ship_method, item_location);

  function renderTransportList() {
    dataService.order_getTransportList().then(data => $scope.transportList = data.data)
  }

  function getShowType() {
    dataService.orderv2_getShowType({ order_id: mid_order_id }).then(data => $scope.showType = data.data.show_type)
  }

  activate()

  function activate() {
    renderTransportList();
    getShowType();
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function() {
    // 验证必填项
    if ($scope.showType == 1) {
      if (!$scope.sendGood1.item_location) {
        $scope.form_mesg = '请选择收货仓库!';
        return
      } else if (!$scope.sendGood1.transport_no) {
        $scope.form_mesg = '请填写物流单号!';
        return
      } else {
        $scope.form_mesg = null
      }
    } else if ($scope.showType == 2) {
      if (!$scope.sendGood2.transport_code) {
        $scope.form_mesg = '请选择物流公司!';
        return
      } else if ($scope.sendGood2.transport_code === 'other') {
        if (!$scope.sendGood2.transport_name) {
          $scope.form_mesg = '请填写添加的物流公司的名称!';
          return
        } else if (!$scope.sendGood2.transport_url) {
          $scope.form_mesg = '请填写添加的物流公司的官网地址!';
          return
        } else if (!$scope.sendGood2.transport_no) {
          $scope.form_mesg = '请填写物流单号!';
          return
        } else {
        }
      } else if (!$scope.sendGood2.transport_no) {
        $scope.form_mesg = '请填写物流单号!';
        return
      } else {
        $scope.form_mesg = null
      }
    } else {
      $scope.form_mesg = '当前页面数据发生错误,请刷新浏览器!'
    }

    if ($scope.showType == 2 && $scope.sendGood2.transport_code && $scope.sendGood2.transport_code != 'other') {
      $scope.sendGood2.transport_name = '';
      $scope.sendGood2.transport_url = ''
    }

    var param = $scope.showType == 1 ? {
      'show_type': '1',   // 选择seego物流
      'item_location': $scope.sendGood1.item_location,            // 选择收获仓库,非seego物流时为0
      'transport_no': $scope.sendGood1.transport_no,             // 物流单号
      'order_id_list': $scope.sendGood1.dispactchType === 'singleBox' ? [$scope.sendGood.mid_order_id] : ($scope.sendGood1.mid_order_id_list ? [$scope.sendGood.mid_order_id].concat($scope.sendGood1.mid_order_id_list.split('\n')) : [$scope.sendGood.mid_order_id]) // 包裹包含的订单(一个或多个)
    } : {
        'show_type': '2',   // 非seego物流
        'transport_code': $scope.sendGood2.transport_code,            // 物流公司编号,seego物流时为'1hcang'
        'transport_no': $scope.sendGood2.transport_no,             // 物流单号
        'transport_url': $scope.sendGood2.transport_url,            // 物流公司url
        'transport_name': $scope.sendGood2.transport_name,           // 物流公司名称
        'order_id_list': $scope.sendGood2.mid_order_id_list ? [$scope.sendGood.mid_order_id].concat($scope.sendGood2.mid_order_id_list.split('\n')) : [$scope.sendGood.mid_order_id] // 包裹包含的订单(一个或多个)
      };
    $uibModalInstance.close(param);
  };
}

// export const Controller = {
//   ControllerController: ControllerController
// }
