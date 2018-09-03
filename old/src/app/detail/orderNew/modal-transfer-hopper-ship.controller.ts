/**
 * 已发货订单tab下点击转运仓发货操作
 */
modalTransferHopperShipController.$inject = ['$scope', '$uibModalInstance', 'action', 'f_action', 'mid_order_id', 'dataService'];
export function modalTransferHopperShipController($scope, $uibModalInstance, action, f_action, mid_order_id, dataService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.action = action;
  $scope.sendGood1 = {};
  $scope.expressMethod = '1';
  $scope.transportList = $scope.$parent.transportList;
  $scope.errMes = null;
  $scope.inlandExpress = {};

  activate();

  function activate() {
    getTransportList();
    getOrderExpress();
  }

  function getTransportList() {
    dataService.order_getTransportList()
      .then(data => $scope.transportList = data.data.filter(item => item.transport_type == 2 || item.transport_type == 3))
  }

  function getOrderExpress() {
    dataService.express_getItem({
      order_id: mid_order_id,
    }).then(function(res) {
      $scope.logistic = res.data;
    })
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.ok = function() {
    $scope.errMsg = null;
    if (!$scope.sendGood1.transport_code) {
      $scope.errMes = '请选择物流公司!';
      return -1
    }
    if ($scope.sendGood1.transport_code == 'other') {
      if (!$scope.sendGood1.transport_name) {
        $scope.errMes = '请填写物流公司名称!';
        return -1
      }
      if (!$scope.sendGood1.transport_url) {
        $scope.errMes = '请填写物流公司追踪网址!';
        return -1
      }
    }
    if (!$scope.sendGood1.transport_no) {
      $scope.errMes = '请填写物流单号!';
      return -1
    }

    var param = {
      order_id: mid_order_id,
      show_type: 2,
      action: '',
      transport_name: $scope.sendGood1.transport_name || '',
      transport_code: $scope.sendGood1.transport_code || '',
      transport_url: $scope.sendGood1.transport_url || '',
      transport_no: $scope.sendGood1.transport_no,
      logistics_conf_id: undefined
    };
    switch (action) {
      case 'official_to_storage_unseego':
        param.action = $scope.expressMethod == '1' ? 'official_to_storage_unseego_direct' : 'official_to_storage_unseego_together';
        param.logistics_conf_id = $scope.expressMethod == '1' ? '11' : '12';
        break;
      case 'direct_mail_unseego':
        param.action = 'direct_mail_unseego_storage';
        param.logistics_conf_id = f_action == 'offline_buy' ? '17' : '5';
        break;
      case 'together_mail_official':
        param.action = 'native_ship';
        param.logistics_conf_id = '7';
        break;
      case 'together_mail_offline':
        param.action = 'native_ship';
        param.logistics_conf_id = '19';
        break;
      default:
        return
    }
    $uibModalInstance.close(param);
  }
}

// export const modalTransferHopperShip = {
//   modalTransferHopperShipController: modalTransferHopperShipController
// }
