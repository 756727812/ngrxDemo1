import { IDataService } from '../../services/data-service/data-service.interface';

export const addColumn: ng.IComponentOptions = {
  template: require('./add-column.template.html'),
  controller: addColumnController,
};

addColumnController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'Notification'];
export function addColumnController($scope, $location, $routeParams, dataService: IDataService, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};
  $scope.uploadImg = function (data) {
    if (data.result == 1) {
      $scope.formData.banner_imgurl = data.data;
    } else {
      Notification.dataError(data.msg);
    }
  };
  $scope.updateEventSet = function () {
    dataService.backend_event_updateEventSet($scope.formData).then(res => {
      Notification.success('修改栏目成功');
      $location.path('/event/column-manage');
    });
  };

  $scope.queryData = function () {
    dataService.backend_event_getEventSetData({
      id: $routeParams.id,
    }).then(res => $scope.formData = res.data);
  };
  $scope.cancel = function () {
    history.go(-1);
  };
  $scope.submitForm = function ($valid) {
    if (!$valid) {
      Notification.warn('请检查信息是否完整');
      return false;
    }
    if ($routeParams.action == 'edite') {
      $scope.updateEventSet();
      return;
    }
    dataService.backend_event_addEventSet($scope.formData).then(res => {
      Notification.success('添加栏目成功');
      $location.path('/event/column-manage');
    });
  };

  if ($routeParams.action == 'edite') {
    $scope.queryData();
  }
}
