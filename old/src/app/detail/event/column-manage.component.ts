import { IDataService } from '../../services/data-service/data-service.interface';

export const columnManage: ng.IComponentOptions = {
  template: require('./column-manage.template.html'),
  controller: columnManageController,
};

columnManageController.$inject = ['$scope', '$routeParams', 'dataService', '$uibModal', 'Notification'];
export function columnManageController($scope, $routeParams, dataService: IDataService, $uibModal, Notification) {

  $scope.formData = { p: $routeParams.page || 1 };

  $scope.deleteEventSet = function (set_id) {
    if (set_id && confirm('确定删除?')) {
      dataService.backend_event_deleteEventSet({
        id: set_id,
      }).then(res => {
        Notification.success('删除成功');
        return $scope.querySetList();
      });
    }
  };
  $scope.openDetail = function (msg) {
    let modalInstance = $uibModal.open({
      animation: true,
      template: '<div class="modal-header">' +
      '<h3 class="modal-title">查看详情</h3>' +
      '</div>' +
      '<div class="modal-body">' +
      msg +
      '</div></div>',
      size: 'lg',
    });
  };
  $scope.querySetList = function () {
    dataService.backend_event_getEventSetList($scope.formData).then(res => {
      $scope.actives = res.data.event_sets;
      $scope.total_items = res.data.count;
    });
  };
  $scope.querySetList();
}
