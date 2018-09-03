import { IDataService } from '../../services/data-service/data-service.interface';
import * as moment from 'moment';
import * as md5 from 'md5';;
import * as _ from 'lodash';;

export class datacenterBrandsController {
  private page: string;
  order_id: string;

  search_form: {
    date_picker: {
      startDate: any,
      endDate: any,
    },
    location_id: string,
  };
  item_list: Array<any>;
  total_items: number;
  config_location: Array<any>;
  brand_list: Array<any>;
  class_list: Array<any>;
  selected_class: Array<any> = [];

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', '$uibModal'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $uibModal: any,
  ) {
    this.page = this.$routeParams['page'] || '1';
    this.order_id = this.$routeParams['order_id'] || '0';

    this.search_form = {
      date_picker: {
        startDate: this.$routeParams['start_date'] ? moment(this.$routeParams['start_date'] * 1000) : null,
        endDate: this.$routeParams['end_date'] ? moment(this.$routeParams['end_date'] * 1000) : null,
      },
      location_id: this.$routeParams['location_id'],
    };
  }

  $onInit() {
    const promises = [this.getConfigLocation(), this.da_sentiment_brand_select()];
    this.$q.all(promises);
  }

  submitArticleSearch: () => void = () => {
    this.$location.search(_.assign({}, this.$location.search(), {
      start_date: this.search_form.date_picker.startDate && this.search_form.date_picker.startDate.unix(),
      end_date: this.search_form.date_picker.endDate && this.search_form.date_picker.endDate.unix(),
      location_id: this.search_form.location_id,
      page: 1,
    }));
  }

  changeOrder: (order_id: number) => void = order_id => this.$location.search(_.assign(this.$location.search(), {
    page: 1,
    order_id,
  }))


  private da_sentiment_brand_select: (order_id?: number) => ng.IPromise<any> = (order_id = +this.order_id) =>
    this.dataService.da_sentiment_brand_select({
      min_day_id: this.search_form.date_picker.startDate ? this.search_form.date_picker.startDate.format('YYYY-MM-DD') : undefined,
      max_day_id: this.search_form.date_picker.endDate ? this.search_form.date_picker.endDate.format('YYYY-MM-DD') : undefined,
      location_id: this.search_form.location_id,
      order_id,
      page: this.page,
      page_size: 20,
      token: md5('see' + moment().format('YYYYMMDD') + (this.search_form.location_id || -1)),
    }).then(res => {
      this.item_list = res.data.list;
      this.total_items = res.data.count;
      return this.item_list;
    })

  private getConfigLocation: () => ng.IPromise<any> = () =>
    this.dataService.CommonData_getConfigLocation().then(res => {
      this.config_location = res.data;
      return this.config_location;
    })

}

export const datacenterBrands: ng.IComponentOptions = {
  template: require('./datacenter-brands.template.html'),
  controller: datacenterBrandsController,
};

