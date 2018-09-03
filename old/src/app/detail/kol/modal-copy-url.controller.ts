import { IDataService } from '../../services/data-service/data-service.interface'
import { INotificationService } from '../../services/notification/notification.interface'
import * as angular from 'angular'

export class modalCopyUrlController {

  static $inject = ['$window', 'Notification', '$uibModalInstance', '$routeParams', 'list_url', 'title']
  constructor(
    private $window: any,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private $routeParams: any,
    private list_url: any,
    private title: string,
  ) {


  }

  copySuccess() {
    this.Notification.success('复制链接成功，请按Ctrl+V进行粘贴');
  }

  ok() {
    this.$uibModalInstance.close({});
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }


}


