import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';

export class financialNewRecordedController {
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

  listData: any[];
  total_items: number;
  status: string;
  searchForm: any;
  payTime: any;
  payFocus: boolean;
  auditTime: any;
  recordTime: any;
  markAll: boolean;
  markedAudit: any;
  popover: string;
  // searchTimeType: any;

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
    this.payTime = {
      startDate: $routeParams.startPayDate
        ? moment(+$routeParams.startPayDate)
        : null,
      endDate: $routeParams.endPayDate
        ? moment(+$routeParams.endPayDate)
        : null,
    };
    this.auditTime = {
      startDate: $routeParams.startAuditDate
        ? moment(+$routeParams.startAuditDate)
        : null,
      endDate: $routeParams.endAuditDate
        ? moment(+$routeParams.endAuditDate)
        : null,
    };
    this.recordTime = {
      startDate: $routeParams.startRecordDate
        ? moment(+$routeParams.startRecordDate)
        : null,
      endDate: $routeParams.endRecordDate
        ? moment(+$routeParams.endRecordDate)
        : null,
    };
    this.status = this.$location.hash() || '1';
    this.searchForm = $routeParams;
    this.markedAudit = {};
    this.popover = 'mingxiPopover.html';
    // this.searchForm.page = 2
  }

  $onInit() {
    if (!this.$location.hash()) {
      this.$location.hash('0');
    } else {
      this.searchForm.recordStatus = this.$location.hash();
      this.searchForm.recordType = this.searchForm.recordType || '0';
      let promises: ng.IPromise<any>[];
      promises = [];
      this.$q.all(promises);
      const params = this.searchForm;
      params['recordTimeFrom'] = this.recordTime.startDate
        ? this.recordTime.startDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      params['recordTimeTo'] = this.recordTime.endDate
        ? this.recordTime.endDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      params['auditStartTimeFrom'] = this.auditTime.startDate
        ? this.auditTime.startDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      params['auditStartTimeTo'] = this.auditTime.endDate
        ? this.auditTime.endDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      params['payTimeFrom'] = this.payTime.startDate
        ? this.payTime.startDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      params['payTimeTo'] = this.payTime.endDate
        ? this.payTime.endDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;

      this.searchForm.pageSize = 50;
      this.dataService
        .api_fms_bill_listAll(this.searchForm)
        .then(res => {
          this.listData = [
            res.data.allPage,
            res.data.waitingRecordPage,
            res.data.auditingPage,
            res.data.recordedPage,
          ];
          this.total_items = this.listData[+this.status].count;
        })
        .catch(err => {});
    }
  }

  markAllChange = () => {
    this.listData[2].list.forEach(v => {
      this.markedAudit[v.billId] = this.markAll;
    });
  };

  resetSearch: () => any = () => {
    this.$location.search({});
  };

  submitSearch: () => any = () => {
    Object.keys(this.searchForm).forEach(k => {
      delete this.searchForm['startPayDate'];
      delete this.searchForm['endPayDate'];
      delete this.searchForm['startAuditDate'];
      delete this.searchForm['endAuditDate'];
      delete this.searchForm['startRecordDate'];
      delete this.searchForm['endRecordDate'];
      if (!this.searchForm[k]) delete this.searchForm[k];
    });

    this.$location.hash(this.searchForm.recordStatus);
    let searchDate = {};
    if (~~this.searchForm.searchTimeType === 0) {
      searchDate = {
        startPayDate: this.payTime.startDate
          ? Date.parse(this.payTime.startDate)
          : undefined,
        endPayDate: this.payTime.endDate
          ? Date.parse(this.payTime.endDate)
          : undefined,
      };
    } else if (~~this.searchForm.searchTimeType === 1) {
      searchDate = {
        startAuditDate: this.auditTime.startDate
          ? Date.parse(this.auditTime.startDate)
          : undefined,
        endAuditDate: this.auditTime.endDate
          ? Date.parse(this.auditTime.endDate)
          : undefined,
      };
    } else if (~~this.searchForm.searchTimeType === 2) {
      searchDate = {
        startRecordDate: this.recordTime.startDate
          ? Date.parse(this.recordTime.startDate)
          : undefined,
        endRecordDate: this.recordTime.endDate
          ? Date.parse(this.recordTime.endDate)
          : undefined,
      };
    } else {
      searchDate = {};
    }
    const params = {
      // ...this.$location.search(),
      ...this.searchForm,
      ...searchDate,
      page: 1,
    };
    this.$location.search(params);
  };

  exportRecord() {
    if (!this.payTime.startDate || !this.payTime.endDate) {
      this.seeModal.confirm(
        '提醒',
        '请选择支付时间',
        () => angular.element('.pay-time').focus(),
        () => angular.element('.pay-time').focus(),
        '确定',
        '',
      );
    } else {
      const params = {
        // ...this.$location.search(),
        ...this.searchForm,
        payTimeFrom: this.payTime.startDate
          ? this.payTime.startDate.format()
          : undefined,
        payTimeTo: this.payTime.endDate
          ? this.payTime.endDate.format()
          : undefined,
        startAuditTimeFrom: this.auditTime.startDate
          ? this.auditTime.startDate.format()
          : undefined,
        startAuditTimeTo: this.auditTime.endDate
          ? this.auditTime.endDate.format()
          : undefined,
        recordTimeFrom: this.recordTime.startDate
          ? this.recordTime.startDate.format()
          : undefined,
        recordTimeTo: this.recordTime.endDate
          ? this.recordTime.endDate.format()
          : undefined,
      };
      this.$window.open(
        '/api/ng/fms/bill/export?' + this.$httpParamSerializer(params),
      );
      console.log(params);
      // console.log('/api/ng/fms/bill/export?' + this.$httpParamSerializer(params));
    }
  }

  batchAcceptBill: () => any = () => {
    if (this.getMarkedAdjustIds().length > 0) {
      this.seeModal.confirm('确认提示', '确认要批量通过审核？', () => {
        const billIds = this.getMarkedAdjustIds();
        this.dataService
          .api_fms_finance_bill_audit({ billIdList: billIds })
          .then(res => {
            this.Notification.success('批量审核成功');
            this.$onInit();
          });
      });
    } else {
      this.seeModal.confirm(
        '提醒',
        '请选择要通过审核的订单',
        null,
        null,
        '确定',
        '',
      );
    }
  };

  acceptBill: (any) => any = billId => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'md',
      backdrop: 'static',
      template: require('./modal-accept-bill.html'),
      controller: 'modalAcceptBillController',
      controllerAs: 'vm',
      resolve: {
        id: () => billId,
      },
    });

    return modalInstance.result.then(params => {
      this.$onInit();
    });
  };

  getMarkedAdjustIds: () => any = () => {
    const result = [];
    for (const billId in this.markedAudit) {
      if (this.markedAudit[billId]) {
        result.push(billId);
      }
    }
    return result;
  };
}

export const financialNewRecorded: ng.IComponentOptions = {
  template: require('./financial-new-recorded.template.html'),
  controller: financialNewRecordedController,
};
