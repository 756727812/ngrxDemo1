import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

modifyPwdController.$inject = ['$scope', 'dataService', 'Notification'];
export function modifyPwdController($scope, dataService: IDataService, Notification: INotificationService) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};
  let pwdFlag = true;
  let pwdFlag1 = true;
  //检查原密码
  $scope.checkpwd = function () {
    console.log($scope.formData.pwd);
    dataService.seller_checkPwd($scope.formData).then(res => {
      $scope.pwdtext = '';
      pwdFlag = true;
    },                                                err => {
      $scope.pwdtext = '密码错误';
      pwdFlag = false;
    });
  };
  //检查原密码
  $scope.checknewpwd = function () {
    if ($scope.formData.new_pwd != $scope.formData.new1_pwd) {
      $scope.confirmtext = '两次密码不一致';
      pwdFlag1 = false;
    } else {
      $scope.confirmtext = '';
      pwdFlag1 = true;
    }
  };
  //检查原密码
  $scope.submitFrom = function (pwdForm) {
    if (pwdFlag === false) {
      Notification.warn('密码错误');
      return false;
    }
    if (pwdFlag1 === false) {
      Notification.warn('两次密码不一致');
      return false;
    }
    //提交表单
    dataService.seller_modifyPwd($scope.formData).then(res => Notification.success());
  };
}

export const modifyPwd: ng.IComponentOptions = {
  template: require('./modify-pwd.template.html'),
  controller: modifyPwdController,
};
