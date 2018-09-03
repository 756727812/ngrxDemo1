import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';

export class modalApplyInfoController {
  formData: any;

  static $inject: string[] = [
    '$scope',
    '$q',
    'id',
    'data_check',
    'Notification',
    '$uibModalInstance',
    'dataService',
    '$uibModal',
    'followUp',
  ];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private id: any,
    private data_check: any,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private dataService: IDataService,
    private $uibModal: any,
    private followUp: any,
  ) {
    let promises: ng.IPromise<any>[];
    promises = [this.getData()];
    this.$q.all(promises);
  }

  getData() {
    return this.dataService
      .xiaodianpu_getDetailAuthInfo({ xdpId: this.id })
      .then(res => {
        this.formData = res.data;
      });
  }

  ok: (status) => void = status => {
    console.log(status);
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      template: require('./modal-check-apply-info.html'),
      controller: 'modalCheckApplyInfoController',
      controllerAs: 'vm',
      resolve: {
        id: () => this.id,
        status: () => status,
        data_check: () => this.data_check,
        followUp: () => this.followUp,
      },
    });
    this.$uibModalInstance.close({});
    // return modalInstance.result.then(params => {
    //     // return this.getApplyList()
    // })
  };

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');
}
