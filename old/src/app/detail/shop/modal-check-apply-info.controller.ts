import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';

export class modalCheckApplyInfoController {
  errors: any[];
  rejectReason: any = '';
  trackBackendId: any;
  action: number;
  list_user: any[];
  list_pay: any[];
  list_debt: any[];

  static $inject: string[] = [
    '$scope',
    '$q',
    'id',
    'status',
    'data_check',
    'Notification',
    '$uibModalInstance',
    'dataService',
    'followUp',
  ];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private id: any,
    private status: any,
    private data_check: any,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private dataService: IDataService,
    private followUp: any,
  ) {
    this.action = this.status;

    this.list_user = this.data_check.list_user;
    this.list_pay = this.data_check.list_pay;
    this.list_debt = this.data_check.list_debt;
    this.trackBackendId = this.getDefaultUserId(this.list_user, followUp);
  }

  // 如果有默认的跟进人(xuhang@seeapp.com), 取用户ID
  getDefaultUserId(list_user, followUp) {
    if (followUp && Array.isArray(list_user)) {
      const seller = list_user.find(item => {
        return item.seller_email === followUp;
      });
      return seller;
    }
    return { id: '0', title: '' };
  }

  ok: () => void = () => {
    this.errors = [];
    if (this.errors.length > 0) {
      return;
    }
    const param = {
      trackBackendId: this.trackBackendId.id,
      xdpId: this.id,
      action: this.status,
    };
    this.action === 2 && (param['rejectReason'] = this.rejectReason);
    this.dataService.xiaodianpu_auth(param).then(res => {
      if (this.status === 1) {
        this.Notification.success('认证通过');
      } else {
        this.Notification.success('已拒绝');
      }
      this.$uibModalInstance.close({});
    });
  };

  cancel: () => void = () => this.$uibModalInstance.close();
}
