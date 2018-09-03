import { IDataService } from '../../services/data-service/data-service.interface';

modalShowC2CInfoController.$inject = ['$scope', 'dataService', '$uibModalInstance', 'data'];
export function modalShowC2CInfoController($scope, dataService: IDataService, $uibModalInstance, data) {

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  dataService.backend_event_getBackendUserInfo({ backend_id: data.backend_id }).then(res => $scope.backend = res.data);
}
