import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';

export class financialNewWithdrawController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    '$window',
    '$httpParamSerializer',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  list: any[];
  status: string;
  searchForm: any;
  dateTime: any;
  total_items: number;
  markAll: boolean;
  markedAudit: any;
  countData: any;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private $window: ng.IWindowService,
    private $httpParamSerializer: ng.IHttpParamSerializer,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {
    if (!this.$location.hash()) {
      this.$location.hash('0');
    } else {
      let promises: ng.IPromise<any>[];
      promises = [];
      this.$q.all(promises);
      this.dateTime = {
        startDate: $routeParams.startDate
          ? moment(+$routeParams.startDate)
          : null,
        endDate: $routeParams.endDate ? moment(+$routeParams.endDate) : null,
      };
      this.searchForm = $routeParams;
      this.markedAudit = {};

      this.status = this.$location.hash();
    }
  }

  $onInit() {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
    const params = this.searchForm;
    params['startTime'] = this.dateTime.startDate
      ? this.dateTime.startDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    params['endTime'] = this.dateTime.endDate
      ? this.dateTime.endDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    delete params['status'];
    this.$location.hash() !== '0' && (params['status'] = this.$location.hash());
    this.dataService
      .api_fms_finance_withdrawal_list(params)
      .then(res => {
        this.list = res.data.list;
        this.total_items = res.data.count;
      })
      .catch(err => {});
    this.dataService.api_fms_finance_withdrawal_count(params).then(res => {
      this.countData = res.data;
    });
  }

  withdrawalsReview: (number, string) => ng.IPromise<any> = (
    withdrawalsId,
    status,
  ) => {
    const vm = this;
    const params = {
      rowId: withdrawalsId,
      status,
    };
    if (status !== 'refuse') {
      return this.seeModal
        .confirmP('确认提示', '确认要通过审核？')
        .then(() => this.dataService.api_fms_withdrawal_review(params))
        .then(res => {
          this.Notification.success('审核成功');
          this.$onInit();
        });
    } else {
      const modalInstance = this.$uibModal.open({
        animation: true,
        template: require('./modal-withdrawals-reject.template.html'),
        controller: 'modalWithdrawalsRejectController',
        size: 'md',
        backdrop: 'static',
      });

      modalInstance.result.then(function(rejectReason) {
        params['refuseReason'] = rejectReason;
        return vm.dataService.api_fms_withdrawal_review(params).then(res => {
          vm.Notification.success('拒绝成功');
          vm.$onInit();
        });
      });
    }
  };

  resetSearch: () => any = () => {
    this.$location.search({});
  };

  submitSearch: () => any = () => {
    this.$location.hash(this.searchForm.status);
    Object.keys(this.searchForm).forEach(k => {
      if (!this.searchForm[k]) delete this.searchForm[k];
    });
    this.$location.search({
      // ...this.$location.search(),
      ...this.searchForm,
      startDate: this.dateTime.startDate
        ? Date.parse(this.dateTime.startDate)
        : undefined,
      endDate: this.dateTime.endDate
        ? Date.parse(this.dateTime.endDate)
        : undefined,
      page: 1,
    });
  };

  exportWithdrawals() {
    if (!this.dateTime.startDate || !this.dateTime.endDate) {
      this.seeModal.confirm(
        '提醒',
        '请选择提现时间',
        () => angular.element('.apply-time').focus(),
        () => angular.element('.apply-time').focus(),
        '确定',
        '',
      );
    } else {
      const params = {
        // ...this.$location.search(),
        ...this.searchForm,
        startTime: this.dateTime.startDate
          ? this.dateTime.startDate.format()
          : undefined,
        endTime: this.dateTime.endDate
          ? this.dateTime.endDate.format()
          : undefined,
      };
      // this.$window.open('/api/ng/fms/bill/export?' + this.$httpParamSerializer(params));
      console.log(params);
      this.$window.open(
        '/api/ng/fms/finance/withdrawal/export?' +
          this.$httpParamSerializer(params),
      );
    }
  }
}

export const financialNewWithdraw: ng.IComponentOptions = {
  template: require('./financial-new-withdraw.template.html'),
  controller: financialNewWithdrawController,
};
