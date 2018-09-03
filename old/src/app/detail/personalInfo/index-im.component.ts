import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';

indexImController.$inject = ['$scope', 'dataService', 'Notification'];
export function indexImController($scope, dataService: IDataService, Notification: INotificationService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let init = function () {
    dataService.chat_getNotice().then(res => $scope.formData.notice = res.data.chat_notice);
  };
  init();
  $scope.formData = {};
  $scope.$watch('formData.notice', function (newVal, oldVal) {
    let limit = 300;
    if (newVal && newVal != oldVal) {
      $scope.count = limit - newVal.length;
      if (newVal.length >= limit) {
        $scope.count = 0;
        $scope.formData.notice = newVal.substr(0, limit);
      }
    } else {
      $scope.count = limit;
    }
  });
  $scope.setNotice = function () {
    let desc = $.trim($scope.formData.notice);
    if (desc.length == 0) { Notification.warn('公告内容不能为空'); return false; }
    dataService.chat_setNotice($scope.formData).then(res => {
      Notification.success();
      $scope.formData.notice = desc;
    });
  };
}

export const indexIm: ng.IComponentOptions = {
  template: require('./index-im.template.html'),
  controller: indexImController,
};
