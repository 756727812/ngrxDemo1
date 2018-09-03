import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

orderDetailController.$inject = [
  '$scope', '$cookies', '$routeParams', '$timeout', 'Notification', '$uibModal', 'dataService',
];
function orderDetailController(
  $scope,
  $cookies: ng.cookies.ICookiesService,
  $routeParams: ng.route.IRouteParamsService,
  $timeout: ng.ITimeoutService,
  Notification: see.INotificationService,
  $uibModal: ng.ui.bootstrap.IModalService,
  dataService: see.IDataService,
) {

  $scope.infoChangedFlag = false;
  $scope.out_stock_status = 0;  // 囤货商品，并且是出库中的状态， 囤货前端未处理内容
  $scope.in_warehouse = 0;
  let isAddressModified = false;

  $scope.is_c2c = $cookies.get('seller_privilege') === '1' ? 1 : 0;

  angular.extend($scope, {
    order_id: $routeParams.orderId,

    uploadFront(res) {
      if (res.result === 1) {
        $scope.base_info.idcard_front_imgurl = '//image.seecsee.com' + res.data;
      }
    },
    uploadBack(res) {
      if (res.result === 1) {
        $scope.base_info.idcard_back_imgurl = '//image.seecsee.com' + res.data;
      }
    },
    modifyOrderInfo() {
      const params = {
        order_id: $routeParams.orderId,
        idcard_no: $scope.base_info.idcard_no,
        idcard_front_imgurl: $scope.base_info.idcard_front_imgurl,
        idcard_back_imgurl: $scope.base_info.idcard_back_imgurl,
        name: $scope.base_info.name,
        mobile: $scope.base_info.mobile,
        base_addr: $scope.base_info.base_addr,
        detail_addr: $scope.base_info.detail_addr,
      };
      dataService.orderv2_modifyOrderInfo(params).then(res => {
        if ($scope.base_info.status_str === '已发货') {
          Notification.warn('注意：该订单状态为已发货，修改联系信息后仍需手动预报！');
        }
        Notification.success('修改信息成功!');
        Notification.info('修改用户收货地址可能会造成发货商家运费损失，请谨慎操作！');
        $timeout(() => {
          $scope.$apply(init());
        });
      });
    },
    // 修改收货地址modal
    modifyAddr() {
      if ($scope.is_c2c === 1 && $scope.in_warehouse === 1) {
        Notification.warn('无囤货订单操作权限');
        return;
      }
      if ($scope.out_stock_status === 1) {
        Notification.warn('出库中的订单，不可修改地址');
        return;
      }
      const addrObj = {
        p: $scope.base_info.base_addr.split('-|-')[0],
        c: $scope.base_info.base_addr.split('-|-')[1],
        a: $scope.base_info.base_addr.split('-|-')[2],
        d: $scope.base_info.detail_addr,
      };
      const modalInstance = $uibModal.open({
        animation: true,
        template: require('./modal-modify-addr.template.html'),
        controller: 'modalModifyAddrController',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          tmp() {
            return addrObj;
          },
        },
      });
      modalInstance.result.then(_params => {
        if (_params) {
          isAddressModified = true;
          Notification.info('修改了收货地址信息，请点击保存！');
        }
        $scope.base_info.base_addr = (function (p, c, a) {
          let realP = p;
          if (c) {
            realP += '-|-' + c;
            if (a) realP += '-|-' + a;
          }
          return realP;
        }(_params.p, _params.c, _params.a));
        $scope.base_info.addr = _params.p + _params.c + _params.a + _params.d + '';
        $scope.base_info.detail_addr = _params.d;
      });
    },
    // 从买家收货地址中选择身份证信息
    modifyIDCardInfoFromAddr() {
      const modalInstance = $uibModal.open({
        animation: true,
        template: require('./modal-modify-id-card-info-from-addr.template.html'),
        controller: 'modalModifyIDCardInfoFromAddrController',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          order_id() {
            return $routeParams.orderId;
          },
        },
      });
      modalInstance.result.then(_params => {
        if (_params) {
          if (
            $scope.base_info.idcard_front_imgurl === _params.idcard_front_imgurl
            && $scope.base_info.idcard_back_imgurl === _params.idcard_back_imgurl
          ) {
            Notification.warn('选择了与原来相同的身份证信息！');
          } else {
            Notification.info('修改了身份证信息，请点击保存！');
            $scope.base_info.idcard_front_imgurl = _params.idcard_front_imgurl;
            $scope.base_info.idcard_back_imgurl = _params.idcard_back_imgurl;
          }

        }
      });
    },
  });

  const init = function () {
    $scope.active = +$routeParams.infoType;
    $scope.only = 1;

    dataService.orderv2_getOrderDetail({
      mid_order_id: $routeParams.orderId,
    }).then(res => {
      $scope.infoChangedFlag = false;
      $scope.base_info = res.data.base_info;
      $scope.in_warehouse = Number($scope.base_info.in_warehouse);
      if (Number($scope.base_info.in_warehouse === 1)
        && Number($scope.base_info.outside_warehouse) === 1
        && Number($scope.base_info.ex_warehouse_status) === 2) {
        $scope.out_stock_status = 1;
      }
      $scope.order_list = res.data.order_list;
      $scope.logistic_info = res.data.logistic_info;
      $scope.logistics_list = res.data.logistic_info.logistics_list;
      $scope.logistics_list_vertical = _.values(res.data.logistic_info.logistics_list.vertical);
      for (let i = 0; i < $scope.logistics_list_vertical.length; i += 1) {
        if ($scope.logistics_list_vertical[i].node_type) {
          $scope.logistics_list_vertical[i].isFirstBigNode = true;
          break;
        }
      }
      _.forEach($scope.logistic_info.transport_info, ti => {
        if (ti.transport_url.indexOf('http') !== ti.transport_url.lastIndexOf('http')) {
          const ts = ti.transport_url.substr(7);
          ti.transport_url = ts;
        }
      });
      _.forEach($scope.logistics_list_vertical, ti => {
        if (
          ti.transport_url
          && (ti.transport_url.indexOf('http') !== ti.transport_url.lastIndexOf('http'))
        ) {
          const ts = ti.transport_url.substr(7);
          ti.transport_url = ts;
        }
      });
      _.forEach($scope.logistic_info.list, item => {
        item.time = moment.unix(item.time)['_d'];
      });

      $scope.$watch('base_info.idcard_front_imgurl', (newValue, oldValue) => {
        $scope.infoChangedFlag = newValue !== oldValue;
      });

      $scope.$watch('base_info.idcard_back_imgurl', (newValue, oldValue) => {
        $scope.infoChangedFlag = newValue !== oldValue;
      });
      $scope.$watch('base_info.addr', (newValue, oldValue) => {
        $scope.infoChangedFlag = newValue !== oldValue;
      });
    });
  };

  init();
}

export const orderDetail = {
  template: require('./order-detail.template.html'),
  controller: orderDetailController,
};

