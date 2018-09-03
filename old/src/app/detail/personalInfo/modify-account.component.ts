import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeUploadService } from '../../services/see-upload/see-upload.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

modifyAccountController.$inject = ['$scope', '$location', 'dataService', '$routeParams', 'Notification', 'seeUpload'];
export function modifyAccountController($scope, $location, dataService: IDataService, $routeParams, Notification: INotificationService, seeUpload: ISeeUploadService) {
  // var vm = this;
  $scope.platform_info = [
    {
      id: 2,
      name: '微博',
      placeholder: '微博昵称',
      class: 'fa-weibo',
    },
    {
      id: 3,
      name: '知乎',
      placeholder: '知乎昵称',
      class: 'fa-user',
    },
    {
      id: 4,
      name: '豆瓣',
      placeholder: '用户昵称',
      class: 'fa-user',
    },
    {
      id: 5,
      name: 'Instagram',
      placeholder: '用户名称',
      class: 'fa-instagram',
    },
    {
      id: 6,
      name: 'Facebook',
      placeholder: '用户名称',
      class: 'fa-facebook-official',
    },
    {
      id: 7,
      name: 'Twitter',
      placeholder: '用户名称',
      class: 'fa-twitter',
    },
    {
      id: 8,
      name: 'Pinterest',
      placeholder: '用户名称',
      class: 'fa-pinterest',
    },
  ];
  $scope.fans_range = ['少于5000', '5000~2w', '2w~5w', '5w~10w', '10w~20w', '20w~50w', '50w~75w', '75w~100w', '100w以上'];

  // activate();

  // ////////////////

  // function activate() { }

  const init = function () {
    dataService.seller_getSellerDetailv2(false).then(res => {
      $scope.login_info = res.data.login_info;
      $scope.account_info = res.data.account_info;
      console.log($scope.account_info);
      $scope.xiaodianpu_info = res.data.xiaodianpu_info;
      angular.forEach($scope.platform_info, function (v1, k1) {
        angular.forEach(res.data.account_info.platform_info, function (v2, k2) {
          if (v1.id == v2.platform_type) {
            console.log('equ');
            v1.is_set = true;
            v1.is_checked = true;
            // v1.name = v2.platform_name;
            v1.account_name = v2.account_name;
            v1.account_id = v2.account_id;
            v1.fans_count = v2.fans_count;
          }
        });
      });
    });
  };
  init();

  // 数据接口对接还没完成
  $scope.submitForm = function () {
    const formData = $scope.account_info;
    const extra_platform_info = _.filter($scope.platform_info, 'is_checked').map(o => {
      return {
        platform_type: o['id'],
        account_name: o['account_name'],
        account_id: o['account_id'],
        fans_count: o['fans_count'],
      };
    });
    formData.platform_info = _.concat(formData.platform_info, extra_platform_info);
    console.log(formData);
    // //提交表单
    dataService.authv2_addAndUpdateInfo(formData).then(res => {
      console.log(res);
      Notification.success();
    });
  };
}

export const modifyAccount: ng.IComponentOptions = {
  template: require('./modify-account.template.html'),
  controller: modifyAccountController,
};
