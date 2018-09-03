import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;

export class assetNewRecordingController {
  searchForm: any;
  page: string;
  total_items: number;
  list: Array<any>;
  datePicker: any;
  popover: string;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {
    this.page = $routeParams['page'] || '1';
    this.datePicker = {
      startDate: $routeParams.startDate ? moment(+$routeParams.startDate) : null,
      endDate: $routeParams.endDate ? moment(+$routeParams.endDate) : null,
    };
    console.log(this.datePicker);
    this.searchForm = $routeParams;
    this.popover = 'mingxiPopover.html';
  }

  resetSearch: () => any = () => {
    this.$location.search({});
  }

  $onInit() {
    this.dataService.checkShopStatus({ url: this.$location.path(), status: '' });
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
    const params = this.searchForm;
    params['createTimeFrom'] = this.datePicker.startDate ? this.datePicker.startDate.format() : undefined;
    params['createTimeTo'] = this.datePicker.endDate ? this.datePicker.endDate.format() : undefined;
    params['recordStatus'] = 1;
    console.log(params);
    this.dataService.api_fms_bill_list(params).then(res => {
      this.list = res.data.list;
      this.total_items = res.data.count;
    }).catch(err => {
    });
  }
  submitSearch: () => any = () => {
    Object.keys(this.searchForm).forEach((k) => {
      if (!this.searchForm[k])
        delete this.searchForm[k];
    });
    this.$location.search({
      // ...this.$location.search(),
      ...this.searchForm,
      startDate: this.datePicker.startDate ? Date.parse(this.datePicker.startDate) : undefined,
      endDate: this.datePicker.endDate ? Date.parse(this.datePicker.endDate) : undefined,
      page: 1,
    });
  }

}


export const assetNewRecording: ng.IComponentOptions = {
  template: require('./asset-new-record-list.template.html'),
  controller: assetNewRecordingController,
};

