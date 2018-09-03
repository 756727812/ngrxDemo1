import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

indexCircleController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification'];
export function indexCircleController($scope, $routeParams, dataService: IDataService, Notification: INotificationService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};

  $scope.editCircle = function () {
    dataService.circle_saveCircle($scope.formData).then(res => Notification.success('修改成功！'));
  };
  $scope.uploadBanner = function (data) {
    if (data.result == 1) {
      $scope.formData.cir_banner = data.data;
      $scope.formData.banner = data.data;
    } else {
      Notification.dataError(data.msg);
    }
  };
  $scope.uploadLogo = function (data) {
    if (data.result == 1) {
      $scope.formData.cir_logo = data.data;
      $scope.formData.logo = data.data;
    } else {
      Notification.dataError(data.msg);
    }
  };

  function getCircleBySelleId(getCircleDetailCb) {
    dataService.circle_getCircleBySellerId().then(res => {
      if (res.data) {
        $scope.circle = res.data[0];
        getCircleDetailCb(res.data[0].cir_id);
      } else $scope.isNew = true;
    });
  }

  function getCircleDetail(cir_id) {
    dataService.wanted_getCircleDetail({ cir_id }).then(res => {
      $scope.formData = res.data;
      $scope.cir_name = res.data.cir_name;
    });
  }
  getCircleBySelleId(getCircleDetail);
}

export const indexCircle: ng.IComponentOptions = {
  template: require('./index-circle.template.html'),
  controller: indexCircleController,
};

