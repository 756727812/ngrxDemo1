import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

export class financialNewRechargeController {
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
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
    this.dateTime = {
      startDate: $routeParams.startDate
        ? moment(+$routeParams.startDate)
        : null,
      endDate: $routeParams.endDate ? moment(+$routeParams.endDate) : null,
    };
    this.searchForm = Object.assign({ status: '0', payBy: '1' }, $routeParams);
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

    this.dataService
      .recharge_listAll(params)
      .then(res => {
        this.list = res.data.list;
        this.total_items = res.data.count;
      })
      .catch(err => {});
    /* this.dataService.api_fms_finance_withdrawal_count(params).then(res => {
      this.countData = res.data;
    }); */
  }

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

  batchExport: () => any = () => {
    if (!this.dateTime.startDate || !this.dateTime.endDate) {
      this.seeModal.confirm(
        '提醒',
        '请选择提现时间',
        () => {
          console.log(angular.element('.recharge-time'));
          angular.element('.recharge-time').focus();
        },
        () => angular.element('.recharge-time').focus(),
        '确定',
        '',
      );
    } else {
      const params = this.searchForm;
      params['startTime'] = this.dateTime.startDate
        ? this.dateTime.startDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      params['endTime'] = this.dateTime.endDate
        ? this.dateTime.endDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      this.$window.open(
        `/api/ng/recharge/backend/export?${this.$httpParamSerializer(params)}`,
      );
    }
  };
}

export const financialNewRecharge: ng.IComponentOptions = {
  template: require('./financial-new-recharge.template.html'),
  controller: financialNewRechargeController,
};
