import { IDataService } from '../../services/data-service/data-service.interface';
import * as moment from 'moment';
import * as md5 from 'md5';;

export class datacenterDetailController {
  private order_id: string;

  search_form: {
    date_picker: {
      startDate: any,
      endDate: any,
    },
    type: string,
    collection_id: string,
  };
  item_list: Array<any>;
  total_items: number;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', '$uibModal'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $uibModal: any,
  ) {
    this.order_id = this.$routeParams['order_id'] || '0';
    this.search_form = {
      date_picker: {
        startDate: this.$routeParams['start_date'] ? moment(this.$routeParams['start_date'] * 1000) : null,
        endDate: this.$routeParams['end_date'] ? moment(this.$routeParams['end_date'] * 1000) : null,
      },
      type: this.$routeParams['type_id'],
      collection_id: this.$routeParams['collection_id'],
    };
  }

  $onInit() {
    const promises = [this.da_sentiment_collection_item_select()];
    this.$q.all(promises);
  }

  private da_sentiment_collection_item_select: (order_id?: number) => ng.IPromise<any> = (order_id = +this.order_id) =>
    this.dataService.da_sentiment_collection_item_select({
      min_day_id: this.search_form.date_picker.startDate ? this.search_form.date_picker.startDate.format('YYYY-MM-DD') : undefined,
      max_day_id: this.search_form.date_picker.endDate ? this.search_form.date_picker.endDate.format('YYYY-MM-DD') : undefined,
      type: this.search_form.type,
      collection_id: this.search_form.collection_id,
      order_id,
      token: md5('see' + moment().format('YYYYMMDD') + (this.search_form.collection_id || -1)),
    }).then(res => {
      this.item_list = res.data.list;
      this.total_items = res.data.count;
      return this.item_list;
    })
}

export const datacenterDetail: ng.IComponentOptions = {
  template: require('./datacenter-detail.template.html'),
  controller: datacenterDetailController,
};

