import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

export class assetNewRecordController {
  searchForm: any;
  page: string;
  total_items: number;
  list: any[];
  datePicker: any;
  popover: string;
  type: string;
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
    this.page = $routeParams['page'] || '1';
    this.datePicker = {
      startDate: $routeParams.startDate
        ? moment(+$routeParams.startDate)
        : null,
      endDate: $routeParams.endDate ? moment(+$routeParams.endDate) : null,
    };
    this.searchForm = $routeParams;
    this.popover = 'mingxiPopover.html';
    this.type = 'recorded';
  }

  resetSearch: () => any = () => {
    this.$location.search({});
  };

  $onInit() {
    if (!this.$location.hash()) {
      this.$location.hash('0');
    }
    this.searchForm.recordStatus = this.$location.hash();
    this.searchForm.recordType = this.searchForm.recordType || '0';
    this.dataService.checkShopStatus({
      url: this.$location.path(),
      status: '',
    });
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
    const params = this.searchForm;
    params['createTimeFrom'] = this.datePicker.startDate
      ? this.datePicker.startDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    params['createTimeTo'] = this.datePicker.endDate
      ? this.datePicker.endDate.format('YYYY-MM-DD HH:mm:ss')
      : undefined;
    this.dataService
      .api_fms_bill_list(params)
      .then(res => {
        this.list = res.data.list;
        this.total_items = res.data.count;
      })
      .catch(err => {});
  }

  submitSearch: () => any = () => {
    this.$location.hash(this.searchForm.recordStatus);
    Object.keys(this.searchForm).forEach(k => {
      if (!this.searchForm[k]) delete this.searchForm[k];
    });
    this.$location.search({
      ...this.searchForm,
      startDate: this.datePicker.startDate
        ? Date.parse(this.datePicker.startDate)
        : undefined,
      endDate: this.datePicker.endDate
        ? Date.parse(this.datePicker.endDate)
        : undefined,
      page: 1,
    });
  };

  exportRecord() {
    if (!this.datePicker.startDate || !this.datePicker.endDate) {
      this.seeModal.confirm(
        '提醒',
        '请选择入账单创建时间',
        () => angular.element('.create-time').focus(),
        () => angular.element('.create-time').focus(),
        '确定',
        '',
      );
    } else {
      const params = {
        ...this.searchForm,
        createTimeFrom: this.datePicker.startDate
          ? Date.parse(this.datePicker.startDate)
          : undefined,
        createTimeTo: this.datePicker.endDate
          ? Date.parse(this.datePicker.endDate)
          : undefined,
      };
      this.$window.open(
        '/api/ng/fms/bill/export?' + this.$httpParamSerializer(params),
      );
      console.log(params);
    }
  }
}

export const assetNewRecord: ng.IComponentOptions = {
  template: require('./asset-new-record-list.template.html'),
  controller: assetNewRecordController,
};
