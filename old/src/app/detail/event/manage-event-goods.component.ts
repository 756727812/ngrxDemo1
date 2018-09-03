import { IDataService } from '../../services/data-service/data-service.interface';

export const manageEventGoods: ng.IComponentOptions = {
  template: require('./manage-event-goods.template.html'),
  controller: manageEventGoodsController,
};

manageEventGoodsController.$inject = ['$scope', '$location', '$routeParams', 'dataService', '$uibModal', 'Notification'];
export function manageEventGoodsController($scope, $location, $routeParams, dataService: IDataService, $uibModal, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let version = +new Date();
  $scope.cond = {
    event_id: $routeParams.id,
    status: $routeParams.status,
  };
  Object.assign($scope.cond, $routeParams);
  $scope.cond.p = $routeParams.page || 1,
    $scope.event = null;
  $scope.set_id = $routeParams.set_id;

  $scope.getEventItemStatus = function () {
    dataService.backend_event_getEventItemStatus({
      event_id: $scope.cond.event_id,
    }).then(res => $scope.status = res.data);
  };

  $scope.getEventData = function () {
    dataService.backend_event_getEventData({
      id: $routeParams.id,
    }).then(function (res) {
      $scope.event_data = res.data;
    });
  };
  //查询活动商品
  $scope.queryEventItems = function (cond) {
    cond = cond || $scope.cond;
    if (cond.status === 'all') delete cond.status;
    dataService.backend_event_getEventItemList(cond).then(res => {
      $scope.items = res.data.items;
      $scope.total_items = res.data.count;
    });
  };
  //查询栏目下的活动
  $scope.queryEvents = function () {
    dataService.backend_event_getEventSetEventList({
      set_id: $routeParams.set_id,
      p: '*',
    }).then(res => {
      $scope.events = res.data.events;
      $.each($scope.events, function (i, value) {
        if (value.id == $scope.cond.event_id) {
          $scope.event = value;
        }
      });
    });
  };

  $scope.getChecked = function () {
    return $.map($('input[name=item_check]:checked'), function (value, key) {
      return $(value).data('id');
    });
  };
  $scope.acceptEventItem = function (items) {
    if (!checkEventStatus()) {
      Notification.warn('活动已过期');
      return false;
    }
    if (items.length > 0) {
      dataService.backend_event_acceptEventItem({
        event_id: $scope.cond.event_id,
        item_id_array: JSON.stringify(items),
      }).then(res => {
        Notification.success('处理成功');
        $scope.queryEventItems();
      });
    }
  };
  $scope.rejectEventItem = function (items) {
    if (!checkEventStatus()) {
      Notification.warn('活动已过期');
    }
    if (items.length > 0) {
      dataService.backend_event_rejectEventItem({
        event_id: $scope.cond.event_id,
        item_id_array: JSON.stringify(items),
      }).then(res => {
        Notification.success('处理成功');
        $scope.queryEventItems();
      });
    }
  };

  $scope.move = function (ids) {
    if (!checkEventStatus()) {
      Notification.warn('活动已过期');
    }
    if (ids.length > 0) {
      let moveModalInstance = $uibModal.open({
        template: require('./modal-move-event.html'),
        controller: 'modalMoveEventController',
        size: 'lg',
        resolve: {
          data: () => {
            return {
              ids,
              event_id: $scope.cond.event_id,
            };
          },
        },
      });
      moveModalInstance.result.then(function () {
        $scope.queryEventItems();
      });
    }
  };

  $scope.openDetail = function (backend_id) {
    let modalInstance = $uibModal.open({
      template: require('./modal-show-c2c-info.html'),
      controller: 'modalShowC2CInfoController',
      resolve: {
        data: {
          backend_id,
        },
      },
      size: 'lg',
    });

  };

  $scope.submitSearch = function () {
    $scope.cond.p = 1;
    //$scope.queryEventItems($scope.cond);
    $location.search($scope.cond);
  };
  $scope.changeState = function (status) {
    // $scope.cond.status = status == 'all' ? null : status;
    // $scope.queryEventItems($scope.cond);
    $location.search(Object.assign($location.search(), { status }));
  };
  /**
   * 查询优惠券适用的品牌和品类
   * @param callback {function} - 优惠券唯一标识
   */
  function getBrandAndClass(callback) {
    dataService.couponmanager_getBrandAndClass().then(res => {
      $scope.brandList = res.data.brand;
      $scope.classList = res.data.class.concat(res.data.firstclass);
      callback && callback();
    });
  }

  function checkEventStatus() {
    if ($scope.event_data.status[4] || $scope.event_data.status[2]) {
      return false;
    }
    return true;
  }

  $scope.selectAct = function (event) {
    $scope.event = event;
    $scope.cond.event_id = event.id;
    $scope.queryEventItems($scope.cond);
    $scope.getEventItemStatus();
    $location.search({ id: event.id, set_id: $routeParams.set_id });
  };

  let init = function () {
    $scope.getEventItemStatus();
    $scope.getEventData();
    getBrandAndClass(function () {
      $scope.queryEventItems($scope.cond);
    });
    $scope.queryEvents();
  };
  init();
}
