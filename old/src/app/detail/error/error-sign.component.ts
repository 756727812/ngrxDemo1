import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class errorSignController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {

    const url = $routeParams['url'] || '';
    if (url !== '') {
      this.dataService.security_urlSignLog({
        url: decodeURIComponent(url),
      }).then(res => {

      });
    }
  }

}


export const errorSign: ng.IComponentOptions = {
  template: require('./error-sign.template.html'),
  controller: errorSignController,
};

