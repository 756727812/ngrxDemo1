import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

export class applyWithdrawalsController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];
  withdrawalsData: any;
  formData: any;
  amountPlaceholder: string;
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {

  }

  $onInit() {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
    this.dataService.api_fms_withdrawal_apply_query().then(res => {
      this.withdrawalsData = res.data;
      this.amountPlaceholder = res.data.availableAmount > 0 ? `最多可输入${this.withdrawalsData.availableAmount}` : '您的余额不足，不可提现';
      if (!res.data.account) {
        return this.seeModal.confirm('提醒', '请联系SEE管理员设置提现方式与账户', () => this.$location.path('/assetNew/info'), () => this.$location.path('/assetNew/info'), '确定', '');
      }
      if (res.data.availableAmount <= 0) {
        return this.seeModal.confirm('提醒', '抱歉，您的余额不足，不可提现', () => this.$location.path('/assetNew/info'), () => this.$location.path('/assetNew/info'), '确定', '');
      }
    }).catch(err => {
    });
  }

  sendSmsCode: () => ng.IPromise<any> = () => {
    return this.dataService.api_common_shortmessage().then(res => {
      console.log(res);
    });
  }

  submitForm: () => ng.IPromise<any> = () => {
    const params = this.formData;
    params['withdrawalId'] = this.withdrawalsData.withdrawalId;
    console.log(params);
    return this.dataService.api_fms_withdrawal_apply_add(params).then(res => {
      this.seeModal.confirm('提醒', '您的提现申请已提交，我们将于2天内进行审核', () => {
        this.$location.path('/assetNew/list');
      },                    () => {
        this.$location.path('/assetNew/info');
      },                    '确定', '');
    });
  }

  warning: () => any = () => {
    this.seeModal.confirm('提醒', '请联系SEE管理员设置提现方式与账户');
  }
}


export const applyWithdrawals: ng.IComponentOptions = {
  template: require('./apply-withdrawals.template.html'),
  controller: applyWithdrawalsController,
};
