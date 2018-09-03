import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import * as angular from 'angular';

export class modalAddSuccessController {
  static $inject: Array<string> = [
    '$scope',
    '$q',
    'Notification',
    '$uibModalInstance',
    'dataService',
    'payload',
    '$location'
  ];
  result: any = [];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private dataService: IDataService,
    private payload: any,
    private $location: ng.ILocationService
  ) {
    if (payload.result) {
      this.result = payload.result.split('/');
    }
  }

  ok: () => void = () => {
    this.$uibModalInstance.close();
  };

  jumpToFailed: () => void = () => {
    this.$location.search({status: '2'});
    this.$uibModalInstance.dismiss()
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss();
}
