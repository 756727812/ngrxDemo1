import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

modifyUserController.$inject = ['$scope', '$location', 'dataService', '$cookies', 'Notification'];
export function modifyUserController($scope, $location, dataService: IDataService, $cookies, Notification: INotificationService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};
  $scope.isC2C = $cookies.get('seller_privilege') === '1' || $cookies.get('seller_privilege') === '30';
  $scope.isPgc = $cookies.get('seller_privilege') === '8';
  let isC2C;
  let init = function () {
    dataService.seller_getSellerDetail(false).then(res => {
      $scope.formData = {
        u_tag: res.data.daren_info.u_tag,
        ud_desc: res.data.daren_info.ud_desc,
        seller_class: res.data.seller_info.seller_class,
        seller_brand: res.data.seller_info.seller_brand,
      };
      $scope.formData.seller_ship_country = res.data.seller_info.ship_country_data ? res.data.seller_info.ship_country_data.location_id : '';
    });
    dataService.CommonData_getConfigLocation().then(res => $scope.countryList = res.data);
    isC2C = $cookies.get('seller_privilege') == 1 || $cookies.get('seller_privilege') == 30;
  };
  init();
  //修改标签
  $scope.submitForm = function (userForm) {

    if (!$scope.formData.u_tag) {
      userForm.u_tag.$touched = userForm.u_tag.$invalid = true;
      return -1;
    }
    if (!$scope.formData.ud_desc) {
      userForm.ud_desc.$touched = userForm.ud_desc.$invalid = true;
      return -1;
    }
    if (isC2C) {
      if (!$scope.formData.seller_class) {
        userForm.seller_class.$touched = userForm.seller_class.$invalid = true;
        return -1;
      }
      if (!$scope.formData.seller_brand) {
        userForm.seller_brand.$touched = userForm.seller_brand.$invalid = true;
        return -1;
      }
      if (!$scope.formData.seller_ship_country) {
        userForm.seller_ship_country.$touched = userForm.seller_ship_country.$invalid = true;
        return -1;
      }
      if ($scope.formData.u_tag == '其他') {
        if (!$scope.formData.custom_tag) {
          userForm.custom_tag.$touched = userForm.custom_tag.$invalid = true;
          return -1;
        }
      }
    }

    if ($scope.formData.u_tag == '其他') {
      $scope.formData.u_tag = $scope.formData.custom_tag;
      delete $scope.formData.custom_tag;
    }

    //提交表单
    dataService.seller_modifyUserTag($scope.formData).then(res => {
      Notification.success('修改描述成功！');
      $location.path('/personalInfo/account');
    });
  };
}

export const modifyUser: ng.IComponentOptions = {
  template: require('./modify-user.template.html'),
  controller: modifyUserController,
};
