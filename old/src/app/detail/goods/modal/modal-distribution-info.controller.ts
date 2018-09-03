import * as angular from 'angular';
import * as _ from 'lodash';
import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import {
  DISTRIBUTE_MODAL_TYPE,
  DISTRIBUTE_APPLY_STATUS,
} from '../distribute/list/list.component';
import './modal.less';
import { debug } from 'util';

export class modalDistributionInfoController {
  itemId: number;
  classId;
  product: any = {};
  sameTrigger: any = {};
  skuErrors: any = {};
  skuErrorsCount: number = 0;
  oldSkuList = [];
  is_admin: boolean;
  noChange: boolean = false;

  // 成本价二次确认
  clickedOk: boolean = false;
  supplyPriceAlertFlag: number = 0;
  inWarehouse;
  isValidSupplyPrice: boolean = true; // 验证: 当供货价大于等于售价时，新增二次确认弹框
  checkOptions = [
    {
      label: '平台化',
      value: 1,
    },
    {
      label: '小便宜',
      value: 2,
    },
  ];
  checkedArr = [false, false];
  is_setProject: boolean = false;
  projectFlag: any = '';

  static $inject = [
    '$scope',
    '$q',
    '$window',
    'Notification',
    '$uibModalInstance',
    '$routeParams',
    '$cookies',
    'seeModal',
    'dataService',
    'goodsService',
    'item',
    'modalType',
  ];
  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $window: any,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private $routeParams: any,
    private $cookies: ng.cookies.ICookiesService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private goodsService: any,
    private item: any,
    public modalType: number,
  ) {
    this.is_admin =
      $cookies.get('seller_privilege') === '7' ||
      $cookies.get('seller_privilege') === '10';
    this.getProductDetail();
  }

  getProductDetail() {
    this.classId = this.item.classId ? this.item.classId : this.item.class_id;
    this.itemId = this.item.itemId ? this.item.itemId : this.item.item_id;

    // 原商品信息
    const getProductPromise = this.goodsService
      .getProduct(this.itemId, this.classId)
      .then(product => {
        this.product = product;
        this.inWarehouse = product.item_info.in_warehouse;
        // 设置默认商品标签
        if (this.is_admin) {
          this.projectFlag = this.product.item_info.project_flag;
          this.checkedArr = this.product.item_info.project_flag
            ? [[false, false], [true, false], [false, true], [true, true]][
                this.product.item_info.project_flag
              ]
            : [false, false];
        }
        _.forEach(this.product.sku_list, v => {
          [
            v.supply_price,
            v.cost_price,
            v.suggestedRetailPriceFrom,
            v.suggestedRetailPriceTo,
          ] = [
            v.cost_price,
            v.supply_price,
            v.suggested_retail_price_from,
            v.suggested_retail_price_to,
          ]; // hack. php接口的cost_price和supply_price含义反了
          v.profit_rate = +(
            ((v.supply_price - v.cost_price) / v.cost_price) *
            100
          ).toFixed(2);
        });
      });

    // 获取供货申请信息
    if (this.modalType !== DISTRIBUTE_MODAL_TYPE.APPLY) {
      getProductPromise.then(() => {
        this.dataService
          .cds_commodityDistributeDetail({ applyId: this.item.id })
          .then(res => {
            const distributeSkuDetailMap = _.keyBy(
              res.data.productskuList,
              'skuId',
            );
            // 填充申请供销的信息
            _.forEach(this.product.sku_list, v => {
              // 临时fix，以后优化
              const _cost_price = v.cost_price;
              if (this.modalType !== DISTRIBUTE_MODAL_TYPE.ADJUST_PRICE) {
                v.cost_price = distributeSkuDetailMap[v.sku_id]['costPrice'];
              }
              v.suggestedRetailPriceFrom = v.suggested_retail_price_from;
              v.suggestedRetailPriceTo = v.suggested_retail_price_to;

              if (this.modalType === DISTRIBUTE_MODAL_TYPE.AUDIT) {
                v.supply_price = +(
                  ((res.data.profitRate + 100) / 100) *
                  v.cost_price
                ).toFixed(2);
                v.profit_rate = res.data.profitRate;
                v.suggestedRetailPriceFrom =
                  distributeSkuDetailMap[v.sku_id]['suggestedRetailPriceFrom'];
                v.suggestedRetailPriceTo =
                  distributeSkuDetailMap[v.sku_id]['suggestedRetailPriceTo'];
              } else if (
                this.modalType === DISTRIBUTE_MODAL_TYPE.AUDIT_ADJUST_PRICE
              ) {
                // 调价审核-获取调价前的信息
                if (distributeSkuDetailMap[v.sku_id]['beforeDetail']) {
                  v.beforeDetail =
                    distributeSkuDetailMap[v.sku_id]['beforeDetail'];
                  v.beforeDetail.profit_rate = +(
                    ((v.beforeDetail.supplyPrice - v.beforeDetail.costPrice) /
                      v.beforeDetail.costPrice) *
                    100
                  ).toFixed(2);
                  v.profit_rate = v.beforeDetail.profit_rate;
                } else {
                  v.profit_rate = res.data.profitRate;
                }
                v.supply_price = +(
                  (v.cost_price * (v.profit_rate + 100)) /
                  100
                ).toFixed(2);
                v.suggestedRetailPriceFrom =
                  distributeSkuDetailMap[v.sku_id]['suggestedRetailPriceFrom'];
                v.suggestedRetailPriceTo =
                  distributeSkuDetailMap[v.sku_id]['suggestedRetailPriceTo'];
              }
            });
            this.oldSkuList = _.cloneDeep(this.product.sku_list);
          });
      });
    }
  }

  setSame(type) {
    this.goodsService.setSameSkuValue(
      this.product.sku_list,
      type,
      this.sameTrigger[type],
    );
  }

  recalculateSupplyPrice(sku) {
    sku.supply_price = +((1 + sku.profit_rate / 100) * sku.cost_price).toFixed(
      2,
    );
  }

  recalculateSupplyRate(sku) {
    sku.profit_rate = +(
      ((sku.supply_price - sku.cost_price) / sku.cost_price) *
      100
    ).toFixed(2);
  }

  recalculateSupplyPriceAll() {
    _.forEach(this.product.sku_list, sku => {
      sku.supply_price = +(
        (1 + sku.profit_rate / 100) *
        sku.cost_price
      ).toFixed(2);
    });
  }

  handleSkuError() {
    this.noChange = false;
    this.skuErrors = {};
    this.skuErrorsCount = 0;
    this.supplyPriceAlertFlag = 0;
    this.isValidSupplyPrice = true;
    this.product.sku_list
      // https://www.tapd.cn/20089011/bugtrace/bugs/view?bug_id=1120089011001004651
      .filter(
        sku =>
          !(
            +this.inWarehouse === 1 &&
            +this.modalType === 3 &&
            +sku.sku_stock === 0
          ),
      )
      .forEach(v => {
        const error = {
          cost_price: [],
          suggestedRetailPriceFrom: [],
          suggestedRetailPriceTo: [],
          supply_price: [],
        };

        if (v.cost_price > v.sku_price) {
          this.supplyPriceAlertFlag = this.supplyPriceAlertFlag | 1;
        }
        if (v.supply_price >= v.sku_price) {
          console.log('invalid ....');
          this.isValidSupplyPrice = false; // 价格不对, 需要确认是否修改
        }
        // if (v.supply_price >= v.sku_price) {
        //   this.isValidSupplyPrice = false;
        // } else {
        //   this.isValidSupplyPrice = true;
        // }
        // if (v.suggestedRetailPriceFrom > v.sku_price) {
        //   error["suggestedRetailPriceFrom"].push("最低建议零售价须小于等于小电铺售价");
        //   this.skuErrorsCount++;
        // }
        if (
          v.suggestedRetailPriceFrom / v.cost_price < 1.15 &&
          !this.is_admin
        ) {
          error['suggestedRetailPriceFrom'].push(
            '最低建议零售价须比成本价高15%以上',
          );
          this.skuErrorsCount = this.skuErrorsCount + 1;
        }
        if (v.supply_price === 0) {
          error['supply_price'].push('供货价不允许为0');
          this.skuErrorsCount = this.skuErrorsCount + 1;
        }
        // if (v.suggestedRetailPriceTo > v.sku_ori_price) {
        //   error["suggestedRetailPriceTo"].push("最高建议零售价须小于等于市场价");
        //   this.skuErrorsCount++;
        // }
        if (v.suggestedRetailPriceTo < v.suggestedRetailPriceFrom) {
          error['suggestedRetailPriceTo'].push(
            '最高建议零售价须大于等于最低建议零售价',
          );
          this.skuErrorsCount = this.skuErrorsCount + 1;
        }

        if (v.supply_price >= v.suggestedRetailPriceFrom && this.is_admin) {
          error['supply_price'].push('供货价不能高于最低建议零售价');
          this.skuErrorsCount = this.skuErrorsCount + 1;
        }

        if (
          this.modalType === DISTRIBUTE_MODAL_TYPE.AUDIT ||
          this.modalType === DISTRIBUTE_MODAL_TYPE.AUDIT_ADJUST_PRICE ||
          this.modalType === DISTRIBUTE_MODAL_TYPE.ADJUST_PRICE
        ) {
          if (v.supply_price < v.cost_price) {
            this.supplyPriceAlertFlag = this.supplyPriceAlertFlag | 2;
            // error["supply_price"].push("供货价不能低于成本价");
            // this.skuErrorsCount++;
          }
        }
        this.skuErrors[v.sku_id] = error;
      });
  }
  setAttrValue(key, value) {
    this.checkedArr[key] = value;
    this.is_setProject = this.checkedArr.includes(true) ? false : true;
    if (this.checkedArr.includes(true)) {
      const newArr = [];
      this.checkedArr.forEach((item, index) => {
        if (item) {
          newArr.push(index);
        }
      });
      this.projectFlag = newArr.length === 1 ? newArr[0] + 1 : 3; // 全选3，单选平台1，小便宜2
    }
  }
  ok() {
    // this.clickedOk = true;
    if (
      this.is_admin &&
      (!this.checkedArr.length || !this.checkedArr.includes(true))
    ) {
      this.is_setProject = true;
      return false;
    }
    this.handleSkuError();
    if (this.skuErrorsCount > 0) {
      return false;
    }
    const params = {
      itemId: this.itemId,
      productDistributionSkuList: '',
      projectFlag: this.projectFlag,
    };
    const productDistributionSkuList = [];

    this.$q(resolve => {
      // 弹框tip判断
      // 审核通过的有子商品的商品调价
      if (
        this.product.item_info.child_item_num > 0 &&
        +this.item.applyStatus === 2 &&
        this.modalType === DISTRIBUTE_MODAL_TYPE.ADJUST_PRICE
      ) {
        resolve(
          this.seeModal.confirmP(
            '提示',
            '已有分销商正在售卖该商品，调价后可能会影响线上售卖，确认要调整价格吗？',
            '确认',
            '取消',
          ),
        );
      } else {
        resolve();
      }
    })
      .then(() => {
        if (this.is_admin && !this.isValidSupplyPrice) {
          const msg =
            '该商品的 “供货价” 没有低于日常售价，可能会导致亏损，确认当前操作么？';
          return this.seeModal
            .confirmP('提示', msg, '确定', '取消')
            .then(() => this.$q.resolve());
        }
        return this.$q.resolve();
      })
      .then(() => {
        if (this.supplyPriceAlertFlag & 2 || this.supplyPriceAlertFlag & 1) {
          const msg = this.is_admin
            ? '该商品“供货价”或“日常售价”比“成本价”低，会导致亏本售卖，确认当前操作吗？'
            : '该商品“日常售价”比“成本价”低，会导致亏本售卖，确认当前操作吗？';
          return this.seeModal
            .confirmP('提示', msg, '确定', '取消')
            .then(() => this.$q.resolve());
        }
        return this.$q.resolve();
      })
      .then(() => {
        switch (this.modalType) {
          case DISTRIBUTE_MODAL_TYPE.APPLY: // 确认申请
            _.forEach(this.product.sku_list, v => {
              const data = {
                skuId: v.sku_id,
                costPrice: v.cost_price,
                suggestedRetailPriceFrom: v.suggestedRetailPriceFrom,
                suggestedRetailPriceTo: v.suggestedRetailPriceTo,
              };
              if (this.is_admin) {
                data['supplyPrice'] = v.supply_price;
              }
              productDistributionSkuList.push(data);
            });
            break;
          case DISTRIBUTE_MODAL_TYPE.ADJUST_PRICE: // 调价(申请)
            if (
              !this.is_admin &&
              angular.equals(this.oldSkuList, this.product.sku_list)
            ) {
              this.noChange = true;
              return this.$q.reject();
              // return this.seeModal
              //   .confirmP("提醒", "没有修改任何价格，操作将不生效", "确认", "取消")
              //   .then(() => this.$q.reject());
            }
            params['applyId'] = this.item.id;
            _.forEach(this.product.sku_list, v => {
              const data = {
                skuId: v.sku_id,
                costPrice: v.cost_price,
                suggestedRetailPriceFrom: v.suggestedRetailPriceFrom,
                suggestedRetailPriceTo: v.suggestedRetailPriceTo,
              };
              if (this.is_admin) {
                data['supplyPrice'] = v.supply_price;
              }
              productDistributionSkuList.push(data);
            });
            break;
          case DISTRIBUTE_MODAL_TYPE.AUDIT: // 通过审核
            params['applyId'] = this.item.id;
            _.forEach(this.product.sku_list, v => {
              productDistributionSkuList.push({
                skuId: v.sku_id,
                costPrice: v.cost_price,
                suggestedRetailPriceFrom: v.suggestedRetailPriceFrom,
                suggestedRetailPriceTo: v.suggestedRetailPriceTo,
                supplyPrice: v.supply_price,
              });
            });
          case DISTRIBUTE_MODAL_TYPE.AUDIT_ADJUST_PRICE: // 通过调价审核
            params['applyId'] = this.item.id;
            _.forEach(this.product.sku_list, v => {
              productDistributionSkuList.push({
                skuId: v.sku_id,
                costPrice: v.cost_price,
                suggestedRetailPriceFrom: v.suggestedRetailPriceFrom,
                suggestedRetailPriceTo: v.suggestedRetailPriceTo,
                supplyPrice: v.supply_price,
              });
            });
        }
        params.productDistributionSkuList = JSON.stringify(
          productDistributionSkuList,
        );
        return this.$q.resolve(params);
      })
      .then(params => this.$uibModalInstance.close(params))
      .catch(() => {
        // if (close) {
        //   this.$uibModalInstance.dismiss("cancel")
        // }
      });
  }

  reject() {
    this.seeModal
      .needReasonP('供货商品审核')
      .then(params => {
        return this.dataService.cds_refuseDistributionApply({
          applyId: this.item.id,
          itemId: this.item.itemId,
          refuseInfo: params.reason,
        });
      })
      .then(res => {
        this.Notification.success('拒绝审核成功');
        this.$uibModalInstance.dismiss('reject');
      });
  }

  cancel(force = false) {
    if (force) {
      this.$uibModalInstance.dismiss('cancel');
    } else {
      this.seeModal.confirmP('提示', '确认关闭？', '确定', '取消').then(() => {
        this.$uibModalInstance.dismiss('cancel');
      });
    }
  }
}
