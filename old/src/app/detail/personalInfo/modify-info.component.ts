import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeUploadService } from '../../services/see-upload/see-upload.interface';

modifyInfoController.$inject = ['$scope', '$location', 'dataService', '$routeParams', 'Notification', 'seeUpload'];
export function modifyInfoController($scope, $location, dataService: IDataService, $routeParams, Notification: INotificationService, seeUpload: ISeeUploadService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let init = function () {
    dataService.seller_getSellerDetail(false).then(res => {
      $scope.formData = {
        seller_id: $routeParams.id,
        seller_addr: res.data.seller_info.seller_addr,
        seller_idcard_front_imgurl: res.data.seller_info.seller_idcard_front_imgurl,
        seller_idcard_back_imgurl: res.data.seller_info.seller_idcard_back_imgurl,
        seller_country: res.data.seller_info.country_data ? res.data.seller_info.country_data.location_id : '',
        seller_type: res.data.seller_info.seller_type,
      };
      if (res.data.seller_info.seller_company_imgurl) {
        $scope.companyUrl = res.data.seller_info.seller_company_imgurl;
      } else {
        $scope.companyUrl = [];
      }

      $scope.$watch('formData.seller_idcard_front_imgurl', function () {
        if ($scope.formData.seller_idcard_front_imgurl) {
          let url = $scope.formData.seller_idcard_front_imgurl;
          if (url && url.search(/http:|https:/) !== 0) {
            $scope.seller_idcard_front_imgurl_show = '//image.seecsee.com' + url;
          } else {
            $scope.seller_idcard_front_imgurl_show = url;
          }
        }

      },            true);

      $scope.$watch('formData.seller_idcard_back_imgurl', function () {
        if ($scope.formData.seller_idcard_back_imgurl) {
          let url = $scope.formData.seller_idcard_back_imgurl;
          if (url && url.search(/http:|https:/) !== 0) {
            $scope.seller_idcard_back_imgurl_show = '//image.seecsee.com' + url;
          } else {
            $scope.seller_idcard_back_imgurl_show = url;
          }
        }
      },            true);
    });

    dataService.CommonData_getConfigLocation().then(res => $scope.countryList = res.data);
  };
  init();

  $scope.uploadFrontImg = function (data) {
    if (data.result == 1) {
      $scope.formData.seller_idcard_front_imgurl = data.data;
    } else Notification.dataError(data.msg);
  };

  $scope.uploadBackImg = function (data) {
    if (data.result == 1) {
      $scope.formData.seller_idcard_back_imgurl = data.data;
    } else Notification.dataError(data.msg);
  };

  $scope.uploadBusinessImgs = function (files) {
    seeUpload.uploadImages(files).then(function (res) {
      Array.prototype.push.apply($scope.companyUrl, res.data);
    });
  };

  $scope.deleteImg = function (index) {
    $scope.companyUrl.splice(index, 1);
    if ($scope.companyUrl.length == 0) {
      $scope.companyUrl = [];
    }
  };

  // 数据接口对接还没完成
  $scope.submitForm = function (userForm) {
    if ($scope.companyUrl) {
      $scope.formData.seller_company_imgurl = $scope.companyUrl.join(',');
    } else {
      $scope.formData.seller_company_imgurl = '';
    }

    if (!$scope.formData.seller_country) {
      userForm.seller_country.$touched = userForm.seller_country.$invalid = true;
      return -1;
    }
    if (!$scope.formData.seller_addr) {
      userForm.seller_addr.$touched = userForm.seller_addr.$invalid = true;
      return -1;
    }

    //提交表单
    dataService.user_updateSellerData($scope.formData).then(res => {
      Notification.success();
      $location.path('/personalInfo/account');
    });
  };
}

export const modifyInfo: ng.IComponentOptions = {
  template: require('./modify-info.template.html'),
  controller: modifyInfoController,
};
