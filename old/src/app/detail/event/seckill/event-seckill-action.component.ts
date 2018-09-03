import { minBy, omit, isNil } from 'lodash';
import * as moment from 'moment';

const titleMap = {
  add: '创建',
  view: '查看',
};

type IItemData = {
  activityId?: number;
  kolId: number;
  activityName: string;
  activityLabel: string;
  // startTime: Date;
  // endTime: Date;
  productId: number;
  status?: number;
  isPurchase: boolean; // 是否限购
  saleCountLimit: number; // 限购数
  dateRange: Date[];
};

type ISku = {
  skuId: number;
  costPrice: number; // 成本价
  supplyPrice: number; // 日常供货价
  skuPrice: number; // 日常售价
  promotionSupplyPrice: number; // 促销供货价
  price: number; // 秒杀价
  totalStock: number; // 秒杀库存
  stock: number; // 原库存
  checked: boolean;
  status: number; // 秒杀商品状态
  skuSpec: { [key: string]: string }; // SKU 规格
};

type IProduct = {
  id: number;
  itemImgurl: string;
  sku: ISku[];
  itemName: string;
  distribution: boolean; // 是否是分销商品（子商品）
};

export class EventSeckillActionController implements ng.IComponentController {
  static $inject: string[] = [
    '$q',
    '$location',
    '$routeParams',
    '$uibModal',
    'dataService',
    'Notification',
    '$window',
    '$cookies',
    'seeModal',
  ];

  // 需要进行元/分转换的价格键
  private priceKeys = ['costPrice', 'skuPrice', 'supplyPrice'];
  private sellerPrivilege: number = Number(
    this.$cookies.get('seller_privilege'),
  );

  wechatId: string = this.$routeParams['wechat_id'];
  type: string;
  title: string;
  isSubmitting: boolean = false;
  formData: IItemData = {
    activityId: ~~this.$routeParams['id'] || undefined,
    kolId: ~~this.$routeParams['kolId'] || undefined,
    activityName: undefined,
    activityLabel: undefined,
    // startTime: null,
    // endTime: null,
    productId: undefined,
    isPurchase: false,
    saleCountLimit: undefined,
    dateRange: [null, null],
  };
  seckillListPath = `/event/seckill?kolId=${this.formData.kolId}&wechat_id=${
    this.wechatId
  }`;
  id: number = ~~this.$routeParams['id'] || undefined;
  item: IItemData = {
    ...this.formData,
    status: 0, // 默认为新建
  };
  product: IProduct;
  sameTriger: {
    promotionSupplyPrice?: number;
    price?: number;
    totalStock?: number;
    status?: number;
  } = {
    status: 1,
  };
  isNewBrand = this.sellerPrivilege === 30;
  isAdmin = [7, 10, 25].includes(this.sellerPrivilege);
  allChecked = false;
  indeterminate = false;
  stockOptions = [
    { value: 1, label: '锁定促销库存' },
    { value: 2, label: '不锁定促销库存' },
    { value: 3, label: '不参与促销活动' },
  ];
  isPromotionSupplyPriceTmpOpen: boolean = false;
  isSeckillPriceTmpOpen: boolean = false;
  isSeckillStockTmpOpen: boolean = false;

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private dataService: see.IDataService,
    private notification: see.INotificationService,
    private $window: ng.IWindowService,
    private $cookies: ng.cookies.ICookiesService,
    private seeModal: see.ISeeModalService,
  ) {}

  $onInit(): void {
    const promises: ng.IPromise<any>[] = [];
    this.title = titleMap[this.type];
    if (this.type === 'edit' || this.type === 'view') {
      promises.push(this.getSeckillItemDetail());
    }
    this.$q.all(promises);
    if (process.env.NODE_ENV === 'production') {
      this.$window.onbeforeunload = () => '您可能有数据没有保存';
    }
  }

  $onDestroy = () => (this.$window.onbeforeunload = null);

  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.product.sku.forEach(item => (item.checked = true));
    } else {
      this.product.sku.forEach(item => (item.checked = false));
    }
  }

  updateSingleChecked() {
    if (this.product.sku.every(item => item.checked === false)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.product.sku.every(item => item.checked === true)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  get skuSpecKeys(): string[] {
    if (
      isNil(this.product) === false &&
      Object.hasOwnProperty.call(this.product, 'sku') &&
      this.product.sku.length > 0
    ) {
      return Object.keys(this.product.sku[0].skuSpec);
    }
    return [];
  }

  backToSeckillList(form: ng.IFormController): void {
    if (form.$dirty) {
      this.seeModal
        .confirmP('返回秒杀活动列表', '当前填写内容将丢失，是否确认返回？')
        .then(() => this.routeToSeckillList())
        .catch(e => e);
    } else {
      this.routeToSeckillList();
    }
  }

  private routeToSeckillList(): void {
    this.$location.path('/event/seckill').search({
      wechat_id: this.wechatId,
      kolId: this.formData.kolId,
    });
  }

  get formDisabled(): boolean {
    return this.type !== 'add';
  }

  addProduct: (
    seckillForm: ng.IFormController,
  ) => ng.IPromise<any> = seckillForm =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalEventGroupAddGoods',
        resolve: {
          kolId: () => this.formData.kolId,
          api: () => 'seckill_activityProducts',
        },
      })
      .result.then(product => {
        seckillForm.$dirty = true;
        this.formData.productId = product.id;
        this.product = product;
        this.getProductSKU(product.id);
      })
      .catch(e => e);

  resetProduct(): void {
    this.product = null;
    this.sameTriger = {};
  }

  verifyLength(
    minlen: number,
    maxlen: number,
    field: string,
  ): {
    bool: boolean;
    number: number;
  } {
    let len = 0;
    const val = this.formData[field] || '';
    for (let i = 0; i < val.length; i += 1) {
      if (val[i].match(/[^x00-xff]/gi) != null) {
        // 全角
        len += 2;
      } else {
        len += 1;
      }
    }
    return {
      bool: len <= maxlen && len >= minlen,
      number: Math.ceil(len / 2),
    };
  }

  formatInputName(minlen: number, maxlen: number, field: string): void {
    const r = this.verifyLength(minlen, maxlen, field);
    if (!r.bool) {
      let len = 0;
      const val = this.formData[field] || '';
      let result = '';
      for (let i = 0; i < val.length; i += 1) {
        if (val[i].match(/[^x00-xff]/gi) != null) {
          // 全角
          len += 2;
        } else {
          len += 1;
        }
        if (len <= maxlen) {
          result += val[i];
        } else {
          break;
        }
      }
      this.formData[field] = result;
    }
  }

  verifySKURequired: () => boolean = () =>
    this.product &&
    this.product.sku &&
    this.product.sku.every(sku => {
      return sku.status === 3
        ? true
        : !this.isNil(sku.price) &&
            (sku.status === 1 && this.isAdmin
              ? !this.isNil(sku.totalStock)
              : true) &&
            (this.product.distribution
              ? !this.isNil(sku.promotionSupplyPrice)
              : true);
    });

  verifySKUCompare: () => boolean = () =>
    this.product &&
    this.product.sku &&
    this.product.sku.every(sku => this.verifySKUItemPrice(sku));

  verifySKUStockCompare: () => boolean = () =>
    this.product &&
    this.product.sku &&
    this.product.sku.every(sku => {
      return sku.status === 1 && this.isAdmin
        ? 0 <= sku.totalStock && sku.totalStock <= sku.stock
        : true;
    });

  verifySKUItemPrice: (item: ISku) => boolean = item => {
    if (!this.product) {
      return false;
    }
    if (item.status === 3 && (!item.price || !item.skuPrice)) {
      return true;
    }
    const min = this.product.distribution ? item.promotionSupplyPrice : 0;
    return min < item.price && item.price < item.skuPrice;
  };

  verifyStartEndTime(): boolean {
    if (!this.formData.dateRange[0] || !this.formData.dateRange[1]) {
      return true;
    }
    return (
      this.formData.dateRange[0].getTime() <
      this.formData.dateRange[1].getTime()
    );
  }

  verifyStartNowTime(): boolean {
    if (this.type === 'add') {
      if (!this.formData.dateRange[0]) {
        return true;
      }
      return new Date() <= this.formData.dateRange[0];
    }
    return true;
  }

  setSame(key: string): ng.IPromise<string> {
    const val = this.sameTriger[key];
    if (
      this.isNil(val) ||
      this.product.sku.filter(sku => sku.checked).length === 0
    ) {
      return this.$q.reject('fail');
    }
    if (key === 'totalStock' || key === 'status') {
      this.sameTriger[key] = Math.abs(parseInt(val, 10));
    } else {
      this.sameTriger[key] = parseFloat(
        Number(val)
          .toFixed(2)
          .replace(/\-/, ''),
      );
    }
    this.product.sku.filter(sku => sku.checked).forEach(sku => {
      sku[key] = val;
    });
    this.sameTriger[key] = undefined;
    return this.$q.resolve('success');
  }

  setSamePromotionSupplyPrice(): ng.IPromise<any> {
    return this.setSame('promotionSupplyPrice').then(() => {
      this.isPromotionSupplyPriceTmpOpen = false;
    });
  }

  setSamePrice(): ng.IPromise<any> {
    return this.setSame('price').then(() => {
      this.isSeckillPriceTmpOpen = false;
    });
  }

  setSameTotalStock(): ng.IPromise<any> {
    let promises;
    if (this.sameTriger.status === 1) {
      promises = [this.setSame('status'), this.setSame('totalStock')];
    } else {
      promises = [this.setSame('status')];
    }
    return this.$q.all(promises).then(() => {
      this.isSeckillStockTmpOpen = false;
      this.sameTriger.status = 1;
    });
  }

  formatPrice(index: number, field: string): void {
    const val = this.product.sku[index][field];
    this.product.sku[index][field] = this.isNil(val)
      ? val
      : parseFloat(val.toFixed(2).replace(/\-/, ''));
  }

  getSkuMinValue(): number[] {
    if (this.product) {
      const minSkuPrice = minBy(this.product.sku, 'skuPrice').skuPrice;
      const minPrice =
        this.verifySKURequired() && this.verifySKUCompare()
          ? minBy(this.product.sku, 'price').price
          : 0;
      return [minSkuPrice, minPrice];
    }
    return [0, 0];
  }

  save() {
    if (!this.getFormIsValid()) {
      return this.$q.reject('表单输入不合法！');
    }
    const params = {
      ...omit(this.formData, 'isPurchase', 'activityId'),
      saleCountLimit: this.formData.isPurchase
        ? this.formData.saleCountLimit
        : undefined,
      // startTime: moment(this.formData.startTime).format('YYYY-MM-DD HH:mm:ss'),
      // endTime: moment(this.formData.endTime).format('YYYY-MM-DD HH:mm:ss'),
      startTime: moment(this.formData.dateRange[0]).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      endTime: moment(this.formData.dateRange[1]).format('YYYY-MM-DD HH:mm:ss'),
      skus: this.product.sku.map(sku => {
        const realSku = { ...sku };
        this.priceKeys.push(...['price', 'promotionSupplyPrice']);
        this.priceKeys.forEach(k => {
          realSku[k] = this.formatYuanToCents(sku[k]);
        });
        return omit(realSku, 'skuSpec');
      }),
    };
    console.log('param====', params);
    return this.addSeckill(params);
  }

  // startValueChange = () => {
  //   if (this.formData.startTime > this.formData.endTime) {
  //     this.formData.endTime = null;
  //   }
  // };
  // endValueChange = () => {
  //   if (this.formData.startTime > this.formData.endTime) {
  //     this.formData.startTime = null;
  //   }
  // };
  disabledStartDate = startValue => {
    if (!startValue) {
      return false;
    }
    return (
      startValue.getTime() <=
        moment()
          .add(-1, 'days')
          .valueOf() || startValue.getTime() === Date.now()
    );
  };

  // disabledEndDate = endValue => {
  //   if (!endValue) {
  //     return false;
  //   }
  //   if (endValue && !this.formData.startTime) {
  //     return (
  //       endValue.getTime() <=
  //         moment()
  //           .add(-1, 'days')
  //           .valueOf() || endValue.getTime() === Date.now()
  //     );
  //   }
  //   return endValue.getTime() <= this.formData.startTime.getTime();
  // };

  // get endTime() {
  //   if (!this.formData.startTime && !this.formData.endTime) {
  //     return true;
  //   }
  //   return true;
  // }

  private getFormIsValid: () => boolean = () => {
    this.isSubmitting = true;
    if (
      !this.product ||
      !this.formData.dateRange[0] ||
      !this.formData.dateRange[1] ||
      !this.verifySKURequired() ||
      !this.verifySKUCompare() ||
      !this.verifySKUStockCompare() ||
      !this.verifyStartEndTime() ||
      !this.verifyStartNowTime()
    ) {
      return (this.isSubmitting = false);
    }
    return true;
  };

  private formatYuanToCents: (yuan: number) => number = yuan => {
    if (this.isNil(yuan)) {
      return undefined;
    }
    return ~~(yuan * 100).toFixed(0);
  };

  private formatCentToYuan: (cent: number) => number = cent => {
    if (this.isNil(cent)) {
      return undefined;
    }
    return parseFloat((cent / 100).toFixed(2));
  };

  private addSeckill: (params: any) => ng.IPromise<any> = params =>
    this.dataService
      .seckill_activityAdd(params)
      .then(res => {
        this.notification.success('创建成功！');
        return this.$location.path('/event/seckill').search({
          kolId: this.formData.kolId,
          wechat_id: this.wechatId,
        });
      })
      .finally(() => {
        this.isSubmitting = false;
      });

  private getSeckillItemDetail: () => ng.IPromise<any> = () =>
    this.dataService
      .seckill_activityDetail({ activityId: this.id })
      .then(({ data }) => {
        this.item = data;

        this.product = {
          id: data.productId,
          itemImgurl: data.itemImgurl,
          sku: data.skus.map(sku => {
            const realSku = { ...sku };
            this.priceKeys.push(...['price', 'promotionSupplyPrice']);
            this.priceKeys.forEach(k => {
              realSku[k] = this.formatCentToYuan(sku[k]);
            });
            return realSku;
          }),
          itemName: data.productName,
          distribution: data.isDistribution,
        };
        this.formData = {
          ...this.formData,
          productId: data.productId,
          activityName: data.activityName,
          activityLabel: data.activityLabel,
          // startTime: new Date(data.startTime),
          // endTime: new Date(data.endTime),
          saleCountLimit: data.saleCountLimit,
          isPurchase: !!data.saleCountLimit,
          dateRange: [new Date(data.startTime), new Date(data.endTime)],
        };
      });

  private getProductSKU: (itemId: number) => ng.IPromise<any> = itemId =>
    this.dataService.seckill_activitySkus({ itemId }).then(({ data }) => {
      this.product.sku = data.map(sku => {
        this.priceKeys.forEach(k => {
          sku[k] = this.formatCentToYuan(sku[k]);
        });
        return {
          ...sku,
          promotionSupplyPrice: sku.supplyPrice,
          status: this.isAdmin || !this.product.distribution ? 1 : undefined,
          checked: true,
        };
      });
      this.allChecked = true;
    });

  private isNil(input: string | number): boolean {
    return input === '' || isNil(input);
  }
}

export const EventSeckillAction: ng.IComponentOptions = {
  template: require('./event-seckill-action.template.html'),
  controller: EventSeckillActionController,
  bindings: {
    type: '@',
  },
};
