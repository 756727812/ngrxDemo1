import { IDataService } from '../../services/data-service/data-service.interface';
import * as moment from 'moment';
import * as md5 from 'md5';;

export class datacenterDataCollectionController {
  private item_list_1: Array<any>;
  item_list_2: Array<any>;
  item_list_3: Array<any>;
  item_list_4: Array<any>;
  total_items_1: number;
  total_items_2: number;
  total_items_3: number;
  total_items_4: number;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', '$uibModal'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $uibModal: any,
  ) { }

  $onInit() {
    const promises = [this.da_sentiment_data_collection_one_select(), this.da_sentiment_data_collection_two_select(), this.da_sentiment_data_collection_three_select(), this.da_sentiment_data_collection_four_select()];
    this.$q.all(promises);
  }

  // 请求表格一获取数据
  private da_sentiment_data_collection_one_select: () => ng.IPromise<any> = () =>
    this.dataService.da_sentiment_data_collection_one_select({
      token: md5('see' + moment().format('YYYYMMDD')),
    }).then(res => {
      this.item_list_1 = res.data.list;
      this.total_items_1 = res.data.count;
      return this.item_list_1;
    })

  // 请求表格二数据
  private da_sentiment_data_collection_two_select: () => ng.IPromise<any> = () =>
    this.dataService.da_sentiment_data_collection_two_select({
      token: md5('see' + moment().format('YYYYMMDD')),
    }).then(res => {
      this.item_list_2 = res.data.list;
      this.total_items_2 = res.data.count;
      return this.item_list_2;
    })

  // 请求表格三数据
  private da_sentiment_data_collection_three_select: () => ng.IPromise<any> = () =>
    this.dataService.da_sentiment_data_collection_three_select({
      token: md5('see' + moment().format('YYYYMMDD')),
    }).then(res => {
      this.item_list_3 = res.data.list;
      this.total_items_3 = res.data.count;
      return this.item_list_3;
    })

  // 请求表格四的数据
  private da_sentiment_data_collection_four_select: () => ng.IPromise<any> = () =>
    this.dataService.da_sentiment_data_collection_four_select({
      token: md5('see' + moment().format('YYYYMMDD')),
    }).then(res => {
      this.item_list_4 = res.data.list;
      this.total_items_4 = res.data.count;
      return this.item_list_4;
    })
}

export const datacenterDataCollection: ng.IComponentOptions = {
  template: require('./datacenter-data-collection.template.html'),
  controller: datacenterDataCollectionController,
};
