/**
 * 创建圈子
 */
import * as angular from 'angular';

export const createCircle = {
  controller: createCircleController,
  template: require('./create-circle.template.html')
}

createCircleController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'Notification'];
function createCircleController($scope, $location, $routeParams, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};
  const seller_privilege = (document.cookie.match('(^|; )seller_privilege=([^;]*)') || 0)[2]
  $scope.userPrivilege = seller_privilege;
  if ($routeParams.pgc == 1) {
    dataService.seller_getNotCirOwnerMajia().then(res => {
      $scope.users = res.data;
      $scope.formData.u_id = $scope.users[0].u_id;
      $scope.formData.class_id = 11;
    });
  } else {
    dataService.seller_getSellerMajia().then(res => {
      $scope.users = res.data;
      $scope.formData.u_id = $scope.users[0].u_id;
    });
    $scope.formData.class_id = 9;
  }

  $scope.createCircle = function(createCircleForm) {
    if (!$scope.formData.name) {
      createCircleForm.name.$touched = createCircleForm.name.$invalid = true;
      return -1;
    }

    if (!$scope.formData.banner) {
      $scope.bannerErr = true;
      return -1
    }
    if (!$scope.formData.logo) {
      $scope.logoErr = true;
      return -1
    }
    if (!$scope.formData.description) {
      createCircleForm.description.$touched = createCircleForm.description.$invalid = true;
      return -1;
    }
    if (seller_privilege == '8') {
      if (!$scope.formData.wx) {
        createCircleForm.wx.$touched = createCircleForm.wx.$invalid = true;
        return -1;
      }
      if (!$scope.formData.wb) {
        createCircleForm.wb.$touched = createCircleForm.wb.$invalid = true;
        return -1;
      }
      if (!$scope.formData.web) {
        createCircleForm.web.$touched = createCircleForm.web.$invalid = true;
        return -1;
      }
    }

    $scope.formData.isofficial = 0;

    $scope.formData.minbanner = "";
    if (!$scope.formData.banner || !$scope.formData.logo) {
      Notification.warn("请先上传Banner和Logo");
      $location.url('/wanted/myCircle/createCircle');
      return -1;
    }
    dataService.circle_addCircle($scope.formData).then(res => {
      const cir_id = res.data['cir_id'];
      const params = {
        u_id: $scope.formData.u_id
      };
      if ($routeParams.pgc == 1)
        params['ispgc'] = 1;
      dataService.user_setUserDaren(params)

      dataService.circle_setOwner({
        cir_id,
        owner_id: $scope.formData.u_id
      }).then(res => $location.url('/wanted/pgcCircle/'))
    });
    return -1;
  };

  $scope.uploadBanner = function(data) {
    if (data.result == 1) {
      $scope.formData.banner = data.data;
      $scope.bannerErr = false;
    }
  };
  $scope.uploadLogo = function(data) {
    if (data.result == 1) {
      $scope.formData.logo = data.data;
      $scope.logoErr = false;
    }
  };
}
