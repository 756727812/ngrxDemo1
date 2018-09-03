import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../services/assert-service/assert.service.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';

import { RULE_VAL, T_ORDER_TYPE } from './const';

export class Controller {

  item: any;
  static $inject: string[] = ['assertService', '$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$element'];
  private groupDataList: Array<any>;

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
  ) {
  }

  RULE_VAL = RULE_VAL;

  $onInit() {
  }

  isRuleMatch(targetRule) {
    return this.item.policyType === targetRule;
  }

  fmtPrice() {
    return `${this.item.priceFrom} - ${this.item.priceTo}`;
  }

  fmtCategoryList() {
    const { selectedCategoryList } = this.item;
    return selectedCategoryList
      ? selectedCategoryList.map(obj => obj.categoryName).join('、')
      : '';
  }

  fmtBrandList() {
    const { selectedBrandList } = this.item;
    return selectedBrandList
      ? selectedBrandList.map(obj => obj.brandName).join('、')
      : '';
  }

  fmtRangeDate() {
    const { itemCreateTimeFrom, itemCreateTimeTo } = this.item;
    return `${this.formatDate(itemCreateTimeFrom)} - ${this.formatDate(itemCreateTimeTo)}`;
  }

  fmtOrderType() {
    return _.result(T_ORDER_TYPE, this.item.orderType);
  }

  formatDate(ms) {
    return ms ? moment(ms).format('YYYY/MM/DD') : '';
  }
}
export const goodsGroupGroupInfoTips: ng.IComponentOptions = {
  template: require('./group-info-tips.template.html'),
  controller: Controller,
  bindings: {
    item: '<',
  },
};

