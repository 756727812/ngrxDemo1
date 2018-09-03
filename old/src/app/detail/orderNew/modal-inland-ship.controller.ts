/**
 * 待发货订单tab下点击国内发货操作
 */

modalInlandShipController.$inject = ['$scope', '$q', '$uibModalInstance', 'mid_order_id', 'logistics_type', 'dataService'];
export function modalInlandShipController($scope, $q, $uibModalInstance, mid_order_id, logistics_type, dataService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.logistics_type = logistics_type;
  $scope.transportList = $scope.$parent.transportList;
  $scope.errMes = null;
  $scope.inlandExpress = {};

  activate();

  function activate() {
    var promises = [getTransportList(), getOrderExpress()]
    $q.all(promises)
  }

  function getTransportList() {
    return dataService.order_getTransportList()
      .then(data => $scope.transportList = data.data.filter(item => item.transport_type == 1 || item.transport_type == 3))
  }


  function getOrderExpress() {
    dataService.express_getItem({
      order_id: mid_order_id,
    }).then(function(res) {
      $scope.logistic = res.data;
    })
  }

  $scope.ok = function() {
    if (!$scope.inlandExpress.name) {
      $scope.errMes = '请选择物流公司!';
      return -1
    }
    if ($scope.inlandExpress.name == 'other') {
      if (!$scope.inlandExpress.other) {
        $scope.errMes = '请填写物流公司名称!';
        return -1
      }
      if (!$scope.inlandExpress.url) {
        $scope.errMes = '请填写物流追踪网址!';
        return -1
      }
    }
    if (!$scope.inlandExpress.code) {
      $scope.errMes = '请填写物流单号!';
      return -1
    }

    var param = {
      action: '',
      show_type: 2,
      transport_code: $scope.inlandExpress.name || '',
      transport_name: $scope.inlandExpress.other || '',
      transport_url: $scope.inlandExpress.url || '',
      transport_no: $scope.inlandExpress.code
    };
    $uibModalInstance.close(param);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalInlandShip = {
//   modalInlandShipController: modalInlandShipController
// }
