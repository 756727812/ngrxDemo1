import * as angular from 'angular'
import * as moment from 'moment';

modalKolMallAddBannerController.$inject = ['$scope', '$q', '$location', '$routeParams', '$uibModalInstance', 'dataService', 'Notification', 'article_id'];
export function modalKolMallAddBannerController($scope, $q, $location, $routeParams, $uibModalInstance, dataService, Notification, article_id) {

  $scope.form_data = {
  }
  $scope.date_range = {
    start_time: moment().add(1, "days"),
    end_time: moment().add(30, "days"),
  }

  $scope.date_range.start_time = new Date(Math.floor(+$scope.date_range.start_time / 1000) * 1000)
  $scope.date_range.end_time = new Date(Math.floor(+$scope.date_range.end_time / 1000) * 1000)

  $scope.ok = function() {
    if (!this.form_data.banner_imgurl) {
      Notification.error('请上传Banner图片');
      return;
    }
    if ($scope.date_range.start_time > $scope.date_range.end_time) {
      Notification.error('开始时间需早于结束时间');
      return;
    }
    const start_time = Math.floor(+$scope.date_range.start_time / 1000);
    const end_time = Math.floor(+$scope.date_range.end_time / 1000)
    const params = Object.assign($scope.form_data, {
      article_id,
      start_time,//$scope.date_range.startDate.unix(),
      end_time,//$scope.date_range.endDate.unix()
    });
    $uibModalInstance.close(params);
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel')
  }

  $scope.upload = function(res, size) {
    if (res.result === 1) {
      this.form_data.banner_imgurl = res.data;
    } else this.Notification.dataError(res.msg);
  }
}
