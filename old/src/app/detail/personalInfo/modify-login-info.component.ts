import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

modifyLoginInfoController.$inject = ['$scope', 'dataService', 'Notification'];
export function modifyLoginInfoController($scope, dataService: IDataService, Notification: INotificationService) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  dataService.seller_getSellerDetailv2(false).then(res => {
    $scope.login_info = res.data.login_info;
  });

  $scope.submitFrom = function (loginInfoForm) {
    //提交表单
    delete $scope.login_info.wx_account;
    dataService.seller_modifySellerInfo($scope.login_info).then(res => Notification.success());
  };
}

export const modifyLoginInfo: ng.IComponentOptions = {
  template: require('./modify-login-info.template.html'),
  controller: modifyLoginInfoController,
};
