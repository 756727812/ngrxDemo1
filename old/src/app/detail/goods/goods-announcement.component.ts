import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

goodsAnnouncementController.$inject = ['$scope', 'dataService', 'Notification'];
export function goodsAnnouncementController($scope, dataService: IDataService, Notification: INotificationService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  function FormatDate(strTime) {
    let date = new Date(strTime);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  $scope.formData = {
    date_picker: {
      startDate: '',
      endDate: '',
    },
  };
  let init = function () {
    dataService.mall_get_notice().then(res => {
      //        console.log(res);
      $scope.formData.notice = res.data.notice;
      let startDate = $scope.formData.notice.begin_time ? FormatDate($scope.formData.notice.begin_time * 1000) : '';
      let endDate = $scope.formData.notice.end_time ? FormatDate($scope.formData.notice.end_time * 1000) : '';
      console.log(startDate);
      console.log(endDate);
      if (startDate && startDate) {
        $scope.defaultData = startDate + ' - ' + endDate;
      } else {
        $scope.defaultData = '';
      }
      // console.log($scope.formData);
    });
  };
  init();
  $scope.$watch('formData.notice.content', function (newVal, oldVal) {
    let limit = 300;
    if (newVal && newVal != oldVal) {
      $scope.count = limit - newVal.length;
      if (newVal.length >= limit) {
        $scope.count = 0;
        $scope.formData.notice.content = newVal.substr(0, limit);
      }
    } else {
      $scope.count = limit;
    }
  });
  $scope.setNotice = function () {
    $scope.formData.notice.begin_time = $scope.formData.date_picker.startDate ? $scope.formData.date_picker.startDate.unix() : $scope.formData.notice.begin_time;
    $scope.formData.notice.end_time = $scope.formData.date_picker.endDate ? $scope.formData.date_picker.endDate.unix() : $scope.formData.notice.end_time;
    // console.log($scope.formData);
    let desc = $scope.formData.notice.content;
    let title = $scope.formData.notice.title;
    if (desc.length == 0) { Notification.warn('公告内容不能为空'); return false; }
    dataService.mall_set_notice($scope.formData).then(res => {
      Notification.success();
      // console.log($scope.formData);
      // $scope.formData.notice = JSON.parse($scope.formData.notice);
      // $scope.formData.notice.content = desc;
      // $scope.formData.notice.title = title;
    });
  };
}

export const goodsAnnouncement: ng.IComponentOptions = {
  template: require('./goods-announcement.template.html'),
  controller: goodsAnnouncementController,
};
