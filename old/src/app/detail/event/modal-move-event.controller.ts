import { IDataService } from '../../services/data-service/data-service.interface';

modalMoveEventController.$inject = ['$scope', '$routeParams', 'dataService', '$uibModalInstance', 'data', 'Notification'];
export function modalMoveEventController($scope, $routeParams, dataService: IDataService, $uibModalInstance, data, Notification) {

  $scope.ok = function () {
    if (!$scope.event_id) {
      Notification.warn('请选择活动');
      return;
    }
    let param = {
      event_id: data.event_id,
      to_event_id: $scope.event_id,
      item_id_array: JSON.stringify(data.ids),
    };
    dataService.backend_event_moveEventItem(param).then(res => {
      Notification.info(res.data);
      $uibModalInstance.close();
    });
  };
  //查询栏目下的活动
  $scope.queryEvents = function () {
    dataService.backend_event_getEventSetEventList({
      set_id: $routeParams.set_id,
    }).then(res => {
      $scope.events = res.data.events;
      $.each($scope.events, function (i, value) {
        if (value.set_id == $scope.set_id) {
          $scope.event = value;
        }
      });
    });
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
  $scope.queryEvents();
}
