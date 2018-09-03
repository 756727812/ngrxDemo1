import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';

import * as _ from 'lodash';;

import { RULE_VAL } from './const';

const RULE_OPTIONS = [
  { id: RULE_VAL.CATEGORY, name: '品类' },
  { id: RULE_VAL.BRAND, name: '品牌' },
  { id: RULE_VAL.PRICE, name: '商品售价' },
  { id: RULE_VAL.DATE, name: '商品创建时间' },
];
import { ORDER_TYPE_VAL, ORDER_OPTIONS } from './const';

export class Controller {

  brandOptions: Array<{ val: number, text: string }>;
  categoryOptions: Array<{ val: number, text: string }>; // 品类列表
  orderTypeOptions: Array<{ val: number, text: string }>;
  formData: any;
  form: ng.IFormController;
  rangeDate: any;
  ruleOptions: Array<{ name: string, id: number }>;
  close: Function;
  dismiss: Function;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal'];

  RULE_VAL = RULE_VAL;
  resolve: {
    kolId?: string,
  };

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
  ) {
    this.brandOptions = [];
  }

  $onInit() {
    this.rangeDate = { startDate: null, endDate: null };
    this.formData = {
      orderType: ORDER_TYPE_VAL.NEW_FIRST,
      rule: null, //默认就不要选中
    };
    this.orderTypeOptions = ORDER_OPTIONS;

    this.ruleOptions = RULE_OPTIONS;

    // TODO 根据分组规则懒加载
    this.fetchBrandOptions();
    this.fetchCategoryOptions();
  }

  getKolId() {
    return this.resolve.kolId;
  }

  fetchCategoryOptions() {
    return this.dataService.goods_group_categoryList({
      kolId: this.getKolId(),
    })//
      .then(({ data }) => {
        this.categoryOptions = data.map(
          ({ categoryName: text, categoryId: val }) => ({ text, val }));
      });

  }

  fetchBrandOptions() {
    return this.dataService.goods_group_brandList({
      kolId: this.getKolId(),
    }).then(({ data }) => {
      this.brandOptions = data.map(item => ({
        text: item.brandName,
        val: item.brandId,
      }));
    });
  }

  submit() {
    const doSubmit = () => {
      const params = this.getSubmitParams();
      this.dataService.goods_group_addGroup({
        kolId: this.getKolId(),
        ...params,
      }).then(() => {
        this.Notification.success('保存成功');
        this.close({ $value: { success: true } });
      });
    };
    if (!this.hasError()) {
      const {
        rule: { id: ruleId },
      } = this.formData;
      if (ruleId === RULE_VAL.PRICE || ruleId === RULE_VAL.DATE) {
        this.postConfirmRangeCond().then(isSoOnSubmit => {
          isSoOnSubmit && doSubmit();
        });
      } else {
        doSubmit();
      }
    }
  }

  cancelDialog() {
    const doit = () => this.dismiss();
    if (this.form.$dirty) {
      this.seeModal.confirm(
        '确认提示',
        '确认退出当前分组创建',
        () => doit(),
      );
    } else {
      doit();
    }
  }

  postConfirmRangeCond() {
    const params = { kolId: this.getKolId() };
    const ruleId = this.getCurRuleId();
    let confirmMsg;
    if (ruleId === RULE_VAL.DATE) {
      const { startTime, endTime } = this.getRangeTimeParams();
      Object.assign(params, { startTime, endTime });
      confirmMsg = '该时间区间内不包含当前小电铺内任何商品，确认创建该商品分组';
    } else if (ruleId === RULE_VAL.PRICE) {
      const { priceFrom, priceTo } = this.formData;
      Object.assign(params, { priceFrom, priceTo });
      confirmMsg = '该售价区间内不包含当前小电铺内任何商品，确认创建该商品分组';
    } else {
      if (process.env.NODE_ENV === 'development') {
        throw new Error('此分组规则不该查找范围条件是否存在商品');
      }
    }
    return this.dataService.goods_group_existGoodsForCond(params)//
      .then(({ data }) => {
        // 如果不存在就要提醒
        if (!data) {
          return new Promise(resolve => {
            this.seeModal.confirm(
              '确认提示',
              confirmMsg,
              () => resolve(true),
              () => resolve(false),
            );
          });
        } else {
          return Promise.resolve(true);
        }
      });
  }

  getCurRuleId() {
    return this.formData.rule.id;
  }

  getSubmitParams() {
    /*
     groupType 2：手动，1：自动
     keyIdList 品牌Id或者品类Id数组 Array[integer]
     categoryName	分组名称 string
     priceFrom 价格区间，起始区间 integer
     priceTo 价格区间，结束区间 integer
     orderType 自动分组时有效，1=按新品排序，2=按销量排序，3=按浏览量排序 integer
     policyType 自动分组的类型。1：按品类，2：品牌，3：价格区间，4：创建时间 integer
     startTime 商品创建时间，开始区间 date-time
     endTime 商品创建区间，结束区间 date-time
     */
    const serializeOptionVal = (val) =>
      (val || '').split(',').map(v => parseInt(v, 10));

    const {
      rule: { id: ruleId },
      categoryVal, brandVal, orderType,
      categoryName, priceFrom, priceTo,
    } = this.formData;
    const { startDate, endDate } = this.rangeDate;
    const ret: any = {
      groupType: 1,
      policyType: ruleId,
      categoryName,
      orderType,
    };
    switch (ruleId) {
      case RULE_VAL.CATEGORY:
        ret.keyIdList = serializeOptionVal(categoryVal);
        break;
      case RULE_VAL.BRAND:
        ret.keyIdList = serializeOptionVal(brandVal);
        break;
      case RULE_VAL.PRICE:
        Object.assign(ret, { priceFrom, priceTo });
        break;
      case RULE_VAL.DATE:
        Object.assign(ret, {
          startTime: startDate.startOf('day').format(),
          endTime: endDate.endOf('day').format(),
        });
        break;
      default:
        if (process.env.NODE_ENV === 'development') {
          throw new Error('分组规则不合法');
        }
        break;
    }
    return ret;
  }

  getRangeTimeParams() {
    const { startDate, endDate } = this.rangeDate;
    return {
      startTime: startDate.startOf('day').format(),
      endTime: endDate.endOf('day').format(),
    };
  }

  hasError() {
    return !_.isEmpty(this.form.$error);
  }

}
export const goodsGroupModalAddAutoGroup: ng.IComponentOptions = {
  template: require('./modal-add-auto-group.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
