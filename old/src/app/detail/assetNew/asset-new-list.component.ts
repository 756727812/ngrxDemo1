import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

export class assetNewListController {
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
  rechargeForm: any;
  dateTime: any;
  withdrawalData: any;
  total_items: number;
  page_type: string = '0';
  rechargeList: any = [];
  rechargeCount: number;
  rechargeTotal: number;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private $window: ng.IWindowService,
    private $httpParamSerializer: ng.IHttpParamSerializer,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {
    this.dateTime = {
      startDate: $routeParams.startDate
        ? moment(+$routeParams.startDate)
        : null,
      endDate: $routeParams.endDate ? moment(+$routeParams.endDate) : null,
    };
    this.page_type = this.$location.hash() || '0';
    this.searchForm = Object.assign({}, $routeParams);
    this.searchForm.status =
      this.searchForm.status > 0 ? this.searchForm.status : '0';
  }

  $onInit() {
    this.dataService.checkShopStatus({
      url: this.$location.path(),
      status: '',
    });

    let promises: ng.IPromise<any>[];
    if (+this.page_type === 1) {
      promises = [this.withdrawalQuery(), this.getAssetList()];
    } else {
      promises = [this.getRechargeList(), this.getRechargeCount()];
    }

    this.$q.all(promises);
  }

  getAssetList() {
    const params = this.searchForm;
    params['startTime'] = this.dateTime.startDate
      ? this.dateTime.startDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    params['endTime'] = this.dateTime.endDate
      ? this.dateTime.endDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    return this.dataService
      .api_fms_finance_withdrawal_list(params)
      .then(res => {
        this.list = res.data.list;
        this.total_items = res.data.count;
      })
      .catch(err => err);
  }

  getRechargeCount() {
    return this.dataService.recharge_count().then(res => {
      this.rechargeTotal = res.data / 100;
    });
  }

  rechargeById(rechargeId) {
    this.$window.open(
      '/assetNew/recharge?' + this.$httpParamSerializer({ rechargeId }),
      '_blank',
    );
  }

  selectTab() {
    this.$location.search(_.assign({}, { page: 1 }));
  }

  submitSearch: () => any = () => {
    Object.keys(this.searchForm).forEach(k => {
      if (!this.searchForm[k]) delete this.searchForm[k];
    });
    this.$location.search({
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

  resetSearch: () => any = () => {
    this.$location.search({});
  };

  withdrawalQuery: () => ng.IPromise<any> = () => {
    return this.dataService.api_fms_withdrawal_survey_query().then(res => {
      this.withdrawalData = res.data;
    });
  };

  getRechargeList() {
    const params = this.$routeParams;
    params['startTime'] = this.dateTime.startDate
      ? this.dateTime.startDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    params['endTime'] = this.dateTime.endDate
      ? this.dateTime.endDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    return this.dataService.recharge_list(params).then(res => {
      this.rechargeList = res.data.list;
      this.total_items = res.data.count;
    });
  }

  exportRecharge() {
    if (!this.dateTime.startDate || !this.dateTime.endDate) {
      this.seeModal.confirm(
        '提醒',
        '请选择提现时间',
        () => angular.element('.recharge-time').focus(),
        () => angular.element('.recharge-time').focus(),
        '确定',
        '',
      );
    } else {
      const params = {
        ...this.searchForm,
      };
      params['startTime'] = this.dateTime.startDate
        ? this.dateTime.startDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      params['endTime'] = this.dateTime.endDate
        ? this.dateTime.endDate.format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      this.$window.open(
        `/api/ng/recharge/export?${this.$httpParamSerializer(params)}`,
      );
    }
  }

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
        ...this.searchForm,
        startTime: this.dateTime.startDate
          ? Date.parse(this.dateTime.startDate)
          : undefined,
        endTime: this.dateTime.endDate
          ? Date.parse(this.dateTime.endDate)
          : undefined,
      };
      this.$window.open(
        `/api/ng/fms/finance/withdrawal/export?${this.$httpParamSerializer(
          params,
        )}`,
      );
    }
  }
}

export const assetNewList: ng.IComponentOptions = {
  template: require('./asset-new-list.template.html'),
  controller: assetNewListController,
};
