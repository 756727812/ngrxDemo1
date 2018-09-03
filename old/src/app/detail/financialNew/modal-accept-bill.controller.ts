import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';

export class modalAcceptBillController {
  comment: any = '';

  static $inject: string[] = ['$scope', '$q', 'id', 'Notification', '$uibModalInstance', 'dataService'];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private id: any,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private dataService: IDataService,
  ) {

  }

  ok: () => void = () => {
    const param = {
      billIdList: [this.id],
      comment:this.comment,
    };
    this.dataService.api_fms_finance_bill_audit(param).then(res => {
      this.Notification.success('审核成功');
      this.$uibModalInstance.close();
    });
  }

  cancel: () => void = () => this.$uibModalInstance.close();

}

