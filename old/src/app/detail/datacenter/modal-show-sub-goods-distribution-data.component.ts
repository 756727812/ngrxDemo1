import * as moment from 'moment';
import { forEach } from 'lodash';
import * as md5 from 'md5';

import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export class ModalShowSubGoodsDistributionDataController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    '$uibModal',
    'seeModal',
  ];

  close: Function;
  dismiss: Function;
  resolve: any;
  order_id: number;
  items: {
    page: number;
    count: number;
    list: any[];
  };

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onInit() {
    this.order_id = 0;
    this.items = {
      page: 1,
      count: 0,
      list: [],
    };
    this.getSubItem();
  }

  ok: () => any = () => this.close();
  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  getSubItem: (page_id?: number, order_id?: number) => ng.IPromise<any> = (
    page_id = 1,
    order_id = 0,
  ) =>
    this.dataService
      .da_sentiment_item_sub_select({
        ...this.resolve,
        page_id,
        order_id,
        page_size: 50,
        token: md5(`see${moment().format('YYYYMMDD')}${this.resolve.item_id}`),
      })
      .then(res => {
        this.items.list = res.data.list;
        this.items.count = res.data.count;
        this.order_id = order_id;
        return this.items.list;
      });
}

export const modalShowSubGoodsDistributionData: ng.IComponentOptions = {
  template: require('./modal-show-sub-goods-distribution-data.template.html'),
  controller: ModalShowSubGoodsDistributionDataController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
