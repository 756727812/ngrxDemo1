import * as angular from 'angular';
import * as _ from 'lodash';
import * as moment from 'moment';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../services/assert-service/assert.service.interface';

import './search-goods-form.less';

import { CHANNEL_OPTIONS } from './const';

export const SALE_STATUS_OPTIONS = [
  { id: 0, name: '全部' },
  { id: 1, name: '售卖中' },
  { id: 2, name: '已售罄' },
];

export const IS_HIDDEN_OPTIONS = [
  { id: 0, name: '全部' },
  { id: 1, name: '是' },
  { id: 2, name: '否' },
];

export class Controller {
  onInit: Function;
  onSubmit: Function;
  form: ng.IFormController;
  formData: any;
  rangeDate: any;
  static $inject: string[] = [
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];
  // private groupDataList: Array<any>;

  CHANNEL_OPTIONS = CHANNEL_OPTIONS;
  categoryOptions = [{ id: null, name: '全部' }];
  kolId: string;
  saleStatusOptions = SALE_STATUS_OPTIONS;
  isHiddenOptions = IS_HIDDEN_OPTIONS;

  constructor(
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {}

  $onInit() {
    this.formData = {
      keyword: '',
      categoryOpt: this.categoryOptions[0],
      channelOpt: this.CHANNEL_OPTIONS[this.$routeParams.type || 0],
      saleStatusOpt: SALE_STATUS_OPTIONS[this.$routeParams.saleStatus || 0],
      isHiddenOpt: IS_HIDDEN_OPTIONS[this.$routeParams.hiddenFlag || 0],
    };
    this.rangeDate = { startDate: null, endDate: null };
    this.fetchCategoryOptions();
    this.onInit && this.onInit(this);
  }

  fetchCategoryOptions() {
    this.dataService
      .goods_group_categoryList({
        kolId: this.kolId,
      }) //
      .then(({ data }) => {
        this.categoryOptions = [
          ...this.categoryOptions,
          ...data.map(({ categoryId: id, categoryName: name }) => ({
            id,
            name,
          })),
        ];
        const category = this.$routeParams.category;
        if (category) {
          this.categoryOptions.forEach((item, index) => {
            if (item.id === category) {
              this.formData.categoryOpt = item;
            }
          });
        }
      });
  }

  submit() {
    if (!this.hasError()) {
      console.log(this.formData.categoryOpt);
      this.onSubmit && this.onSubmit(this.getFormParams());
    }
  }

  getFormParams() {
    const {
      saleStatusOpt,
      channelOpt,
      categoryOpt,
      keyword,
      priceFrom,
      priceTo,
      isHiddenOpt,
    } = this.formData;
    const { startDate, endDate } = this.rangeDate;
    const ret: any = {};

    const trimedKw = _.trim(keyword);
    if (trimedKw) {
      ret.keyWord = trimedKw;
    }
    if (priceFrom) {
      ret.priceFrom = parseInt(priceFrom, 10);
    }
    if (priceTo) {
      ret.priceTo = parseInt(priceTo, 10);
    }
    if (categoryOpt && categoryOpt.id) {
      ret.category = categoryOpt.id;
    } else {
      ret.category = null;
    }
    if (channelOpt) {
      ret.type = channelOpt.id;
    }
    if (startDate && endDate) {
      ret.startTime = startDate.toDate().getTime();
      ret.endTime = endDate.toDate().getTime();
    }
    if (saleStatusOpt) {
      ret.saleStatus = saleStatusOpt.id;
    }
    if (isHiddenOpt) {
      ret.hiddenFlag = isHiddenOpt.id;
    }
    return ret;
  }

  hasError() {
    return !_.isEmpty(this.form.$error);
  }
}
export const goodsGroupSearchGoodsForm: ng.IComponentOptions = {
  template: require('./search-goods-form.template.html'),
  controller: Controller,
  bindings: {
    onSubmit: '<',
    onInit: '<',
    kolId: '<',
  },
};
