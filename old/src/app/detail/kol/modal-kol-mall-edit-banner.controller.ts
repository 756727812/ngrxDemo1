import * as angular from 'angular'
import * as moment from 'moment';

modalKolMallEditBannerController.$inject = ['$scope', '$q', '$location', '$routeParams', '$uibModalInstance', 'dataService', 'Notification', 'banner_id', 'article_id'];
export function modalKolMallEditBannerController($scope, $q, $location, $routeParams, $uibModalInstance, dataService, Notification, banner_id, article_id) {

  $scope.form_data = {
  }

  $scope.ok = function() {
    if (!this.form_data.banner_imgurl) {
      Notification.error('请上传Banner图片');
      return;
    }
    if ($scope.date_range.start_time > $scope.date_range.end_time) {
      Notification.error('开始时间需早于结束时间');
      return;
    }
    const params = Object.assign($scope.form_data, {
      banner_id,
      article_id,
      start_time: Math.floor(+$scope.date_range.start_time / 1000),//$scope.date_range.startDate.unix(),
      end_time: Math.floor(+$scope.date_range.end_time / 1000),//$scope.date_range.endDate.unix()
    });
    $uibModalInstance.close(params);
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel')
  }

  $scope.upload = function(res, size) {
    console.log(res);
    if (res.result === 1) {
      this.form_data.banner_imgurl = res.data;
    } else this.Notification.dataError(res.msg);
  }
  const init = function() {
    dataService.kol_act_bannerGet({ banner_id }).then(res => {
      const banner_info = res.data.banner_info;
      $scope.form_data.banner_title = banner_info.banner_title;
      $scope.form_data.banner_imgurl = banner_info.banner_imgurl;
      $scope.form_data.banner_url = banner_info.banner_url;
      $scope.form_data.xcx_url = banner_info.xcx_url;
      $scope.form_data.pos = banner_info.pos;
      $scope.date_range = {
        start_time: new Date(banner_info.start_time * 1000),//moment.unix(banner_info.start_time),
        end_time: new Date(banner_info.end_time * 1000),//moment.unix(banner_info.end_time)
      };
      $scope.is_limit = banner_info.status_type == 2;
    })
  }
  init()
}
