import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';

export class modalCheckApplyController {
  private debt_group: any;
  cash_deposit: any;
  choice_is_pay: any;
  choice_seller: any;
  errors: any[];

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
    private status: number,
    private data_check: any,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private dataService: IDataService,
    private followUp: any,
  ) {
    this.choice_is_pay = '';

    this.list_user = this.data_check.list_user;
    this.list_pay = this.data_check.list_pay;
    this.list_debt = this.data_check.list_debt;
    console.log('moday followup===', followUp);
    this.choice_seller = this.getDefaultUserId(this.list_user, followUp);
    console.log('moday choice_seller===', this.choice_seller);
  }

  companyList=[{id:'see', label:'深圳碳原子科技有限公司'}];
  proportion = [{label:'20%'},{label:'25%'},{label:'30%'}];
  company=this.companyList[0].id;
  settlement_type = 1;
  isProportion = false;

  changeSettlement_type(){
    this.settlement_type = +this.settlement_type;
    this.isProportion = !this.isProportion;
    console.log(this.settlement_type);
  }
  // 如果有默认的跟进人(xuhang@seeapp.com), 取用户ID
  getDefaultUserId(list_user, followUpMail) {
    if (followUpMail && Array.isArray(list_user)) {
      const seller = list_user.find(item => {
        return item.seller_email === followUpMail;
      });
      return seller;
    }
    return { id: '0', title: '' };
  }

  ok: () => void = () => {
    if (this.status === 20) {
      this.choice_is_pay = 0;
    }

    console.log(
      this.choice_seller,
      this.choice_is_pay,
      this.cash_deposit,
      this.debt_group,
    );
    this.errors = [];
    if (this.errors.length > 0) {
      return;
    }
    const param = {
      debt_group: this.debt_group,
      cash_deposit: this.cash_deposit,
      is_pay: this.choice_is_pay,
      check_backend_id: this.choice_seller.id,
      id: this.id,
      status: this.status,
    };

    this.dataService.shop_doApply(param).then(res => {
      if (this.status === 30) {
        this.Notification.success('通过审核成功');
      } else {
        this.Notification.success('拒绝审核成功');
      }

      this.$uibModalInstance.close({});
    });
  };

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');
}
