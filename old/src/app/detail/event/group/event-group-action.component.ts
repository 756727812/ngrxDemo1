import * as _ from 'lodash';
import * as moment from 'moment';
import * as domtoimage from 'dom-to-image';
import { formatSrc, toImgDataURL } from 'app/utils';

const titleMap = {
  add: '创建',
  edit: '编辑',
  view: '查看',
};

type ISimulatedFlagInfo = {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
};

type IItemData = {
  type: number;
  activityId?: number;
  kolId: number;
  activityName: string;
  // startTime: Date;
  // endTime: Date;
  dateRange: Date[];
  lotteryTime?: string | Date;
  grouponSuccessNumber: number;
  // simulatedFlag: boolean;
  productId: number;
  status?: number;
  bannerUrl: string;
  productLimit?: number;
  // productShareImgUrl: string;
  // grouponShareImgUrlParticipate: string;
  couponId?: number;
  assistantFlag?: number;
  fansGroupFlag?: number;
  fansGroupName?: string;
  introduction?: string;
};

type ISku = {
  skuId: number;
  supplyPrice: number;
  skuPrice: number;
  price: number;
  promotionPrice?: number;
  status: number; // 是否参加拼团活动
  checked: boolean; // 是否选中
  skuSpec: any;
  grouponHeaderPrice?: number;
  grouponHeaderSkuCostPrice?: number;
};

type IProduct = {
  id: number;
  itemImgurl: string;
  sku: ISku[];
  itemName: string;
  distribution: boolean; // 是否是分销商品（子商品）
};

type GroupTypeItem = {
  label: string;
  value: number;
  disabled?: boolean;
};

export class EventGroupActionController implements ng.IComponentController {
  static $inject: string[] = [
    '$q',
    '$location',
    '$routeParams',
    '$uibModal',
    'dataService',
    'Notification',
    '$scope',
    '$window',
    'seeUpload',
    '$cookies',
    'seeModal',
  ];

  private sellerPrivilege: number = Number(
    this.$cookies.get('seller_privilege'),
  );
  isAdmin = [7, 10, 25].includes(this.sellerPrivilege);
  isNewBrand = this.sellerPrivilege === 30;
  wechatId: string = this.$routeParams['wechat_id'];
  type: string;
  title: string;
  errors: string[] = [];
  isSubmitting: boolean = false;
  formData: IItemData = {
    type: 1,
    activityId: ~~this.$routeParams['id'] || undefined,
    kolId: ~~this.$routeParams['kolId'] || undefined,
    activityName: '',
    // startTime: null,
    // endTime: null,
    dateRange: [null, null],
    grouponSuccessNumber: undefined,
    // simulatedFlag: true,
    productId: undefined,
    bannerUrl: '',
    // productShareImgUrl: '',
    // grouponShareImgUrlParticipate: '',
  };

  // 拉新福利团 新分享图的背景切图
  grouponHeaderShareImg =
    '/s/t/product_v2/784/4c7/qla/w8kfrkcw4cws4ogcsgo8ws48sg.png';
  // '/s/t/product_v2/96e/e23/bs5/dksw68kssg04ck0o88gw8sow80.png';

  simulatedFlagInfo: ISimulatedFlagInfo = {
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
  };
  id: number = ~~this.$routeParams['id'] || undefined;
  item: IItemData = {
    ...this.formData,
    status: 0, // 默认为新建
  };
  product: IProduct;
  allChecked = false;
  indeterminate = false;
  minutes: number[] = _.fill(Array(60), 1).map((v, i) => i);
  termOfValidity: {
    hours: number;
    minutes: number;
  } = {
    hours: undefined,
    minutes: 0,
  };
  sameTriger: {
    price?: number;
    promotionPrice?: number;
    grouponHeaderPrice?: number;
    grouponHeaderSkuCostPrice?: number;
    status?: number;
  } = {};
  generatedImg: string;
  base64Url: string;
  shareImgPrice = $(
    '.event-group-action .share-img-container .share-goods-info .share-goods-info__price h1',
  );
  groupTypeConst: {
    NORMAL: GroupTypeItem;
    LUCKY: GroupTypeItem;
    // SUPER: GroupTypeItem;
    ROOKIE: GroupTypeItem;
    ATTRACT_NEW: GroupTypeItem;
  } = {
    NORMAL: {
      label: '普通拼团',
      value: 1,
    },
    ROOKIE: {
      label: '新人团',
      value: 2,
    },
    LUCKY: {
      label: '抽奖团',
      value: 3,
      disabled: this.isNewBrand,
    },
    // SUPER: {
    //   label: '超级团',
    //   value: 4,
    //   disabled: this.isNewBrand,
    // },
    ATTRACT_NEW: {
      label: '拉新团',
      value: 5,
      disabled: this.isNewBrand,
    },
  };
  coupon: any;
  get introImages(): string[] {
    if (this.formData.type === 1) {
      return [
        '//static.seecsee.com/seego_plus/images/event-normal-group-intro-1.jpg',
        '//static.seecsee.com/seego_plus/images/event-normal-group-intro-2.jpg',
      ];
    }
    if (this.formData.type === 2) {
      return [
        '//static.seecsee.com/seego_plus/images/event-group-intro.jpg',
        '//static.seecsee.com/seego_plus/images/event-group-intro-2.jpg',
      ];
    }
    return [];
  }

  isPromotionSupplyPriceTmpOpen: boolean = false;
  isGroupPriceTmpOpen: boolean = false;
  isHeaderPromotionSupplyPriceTmpOpen: boolean = false;
  isHeaderGroupPriceTmpOpen: boolean = false;
  isJoinGroupTmpOpen: boolean = false;

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private dataService: see.IDataService,
    private notification: see.INotificationService,
    private $scope: ng.IScope,
    private $window: ng.IWindowService,
    private seeUpload: see.ISeeUploadService,
    private $cookies: ng.cookies.ICookiesService,
    private seeModal: see.ISeeModalService,
  ) {}

  $onInit(): void {
    const promises: ng.IPromise<any>[] = [];
    this.title = titleMap[this.type];
    if (this.type === 'edit' || this.type === 'view') {
      promises.push(this.getGroupItemDetail());
    }
    this.$q.all(promises);
    if (process.env.NODE_ENV === 'production') {
      this.$window.onbeforeunload = () => '您可能有数据没有保存';
    }
  }

  $onDestroy = () => (this.$window.onbeforeunload = null);

  get skuSpecKeys(): string[] {
    if (
      this.product &&
      Object.hasOwnProperty.call(this.product, 'sku') &&
      this.product.sku.length > 0
    ) {
      return Object.keys(this.product.sku[0].skuSpec);
    }
    return [];
  }

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
  isLuckyType: () => boolean = () =>
    this.formData.type === this.groupTypeConst.LUCKY.value;

  isSuperType: () => boolean = () => false; // 已经移除超级团
  // this.formData.type === this.groupTypeConst.SUPER.value;

  isAttractNewType: () => boolean = () =>
    this.formData.type === this.groupTypeConst.ATTRACT_NEW.value;

  get isNewBrandFormDisabled(): boolean {
    return (
      (this.type === 'edit' || this.type === 'view') &&
      this.isNewBrand &&
      [
        this.groupTypeConst.LUCKY.value,
        // this.groupTypeConst.SUPER.value,
        this.groupTypeConst.ATTRACT_NEW.value,
      ].includes(this.item.type)
    );
  }

  addProduct: (groupForm: ng.IFormController) => ng.IPromise<any> = groupForm =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalEventGroupAddGoods',
        resolve: {
          kolId: () => this.formData.kolId,
          api: () => 'groupon_activity_products',
        },
      })
      .result.then(product => {
        // product.distribution = false;
        groupForm.$dirty = true;
        this.formData.productId = product.id;
        this.formData.bannerUrl = product.itemImgurl;
        this.product = product;
        this.allChecked = true;
        this.$q.all([
          this.getProductSKU(product),
          this.getBase64Data(this.formatImg(product.itemImgurl)),
        ]);
      });

  resetProduct(): void {
    this.product = null;
    this.formData.bannerUrl = null;
    this.sameTriger = {};
  }

  resetFormBanner(): void {
    if (this.product && this.product.itemImgurl) {
      this.formData.bannerUrl = this.getProductBannerUrl(this.product);
    }
  }

  get isShowResetFormBannerButton(): boolean {
    if (this.formData.bannerUrl && this.product) {
      return this.formData.bannerUrl.includes(
        this.getProductBannerUrl(this.product),
      );
    }
    return false;
  }

  backToGroupBuyList(form: ng.IFormController): void {
    if (form.$dirty) {
      this.seeModal
        .confirmP('返回拼团活动列表', '当前填写内容将丢失，是否确认返回？')
        .then(() => this.routeToGroupBuyList())
        .catch(e => e);
    } else {
      this.routeToGroupBuyList();
    }
  }

  private routeToGroupBuyList(): void {
    this.$location.path('/event/group').search({
      wechat_id: this.wechatId,
      kolId: this.formData.kolId,
    });
  }

  addCoupon: () => ng.IPromise<any> = () =>
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalShopOperateAddCoupon',
        resolve: {
          kolId: () => this.formData.kolId,
          addedCouponListLength: () => 0,
          from: () => 'groupon',
        },
      })
      .result.then(coupon => {
        this.coupon = coupon;
        this.formData.couponId = coupon.id;
      })
      .catch(e => e);

  uploadBanner: (file: File) => ng.IPromise<any> = file => {
    if (file) {
      return this.seeUpload.readImageData(file).then(data => {
        if (data.width === 708 && data.height === 416) {
          return this.seeUpload
            .uploadAuthImage(file)
            .then(res => (this.formData.bannerUrl = res.data));
        }
        return this.notification.warn('活动 Banner 尺寸要求708X 416');
      });
    }
  };

  removeCouponItem: () => void = () => {
    this.coupon = null;
    this.formData.couponId = null;
  };

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

  verifygrouponSuccessNumber(): boolean {
    return _.isNumber(this.formData.grouponSuccessNumber);
  }

  verifyProductLimit: () => boolean = () => {
    const val = this.formData.productLimit;
    if (_.isNumber(val)) {
      if (val <= 0) {
        return false;
      }
    }
    return true;
  };

  private get isProductSkuValid() {
    return this.product && this.product.sku && this.product.sku.length > 0;
  }

  verifySKURequired: () => boolean = () =>
    this.isProductSkuValid &&
    this.product.sku.every(
      sku =>
        sku.status === 1
          ? !this.isNil(sku.price) &&
            (this.product.distribution ? !this.isNil(sku.promotionPrice) : true)
          : true,
    );

  verifySKURequiredHead: () => boolean = () =>
    !this.isAttractNewType() ||
    (this.isProductSkuValid &&
      this.product.sku.every(
        sku =>
          sku.status === 1
            ? !this.isNil(sku.grouponHeaderPrice) &&
              (this.product.distribution
                ? !this.isNil(sku.grouponHeaderSkuCostPrice)
                : true)
            : true,
      ));

  verifySKUStatusRequired(): boolean {
    return (
      this.isProductSkuValid && this.product.sku.some(sku => sku.status === 1)
    );
  }

  verifySKUCompare: () => boolean = () => {
    if (this.product.distribution) {
      return (
        this.isProductSkuValid &&
        this.product.sku.every(
          sku =>
            sku.status === 1 &&
            !this.isNil(sku.price) &&
            !this.isNil(sku.promotionPrice) &&
            !this.isNil(sku.skuPrice)
              ? sku.promotionPrice < sku.price && sku.price < sku.skuPrice
              : true,
        )
      );
    }
    // 自营商品创建拼团页，应校验0<拼团价<日常售价
    return (
      this.isProductSkuValid &&
      this.product.sku.every(
        sku =>
          sku.status === 1 &&
          !this.isNil(sku.price) &&
          !this.isNil(sku.skuPrice)
            ? 0 < sku.price && sku.price < sku.skuPrice
            : true,
      )
    );
  };

  verifySKUCompareHead: () => boolean = () => {
    if (!this.isAttractNewType()) {
      return true;
    }
    if (this.product.distribution) {
      return (
        this.isProductSkuValid &&
        this.product.sku.every(
          sku =>
            sku.status === 1 &&
            !this.isNil(sku.grouponHeaderPrice) &&
            !this.isNil(sku.grouponHeaderSkuCostPrice) &&
            !this.isNil(sku.skuPrice)
              ? sku.grouponHeaderSkuCostPrice < sku.grouponHeaderPrice &&
                sku.grouponHeaderPrice < sku.skuPrice
              : true,
        )
      );
    }
    return (
      this.isProductSkuValid &&
      this.product.sku.every(
        sku =>
          sku.status === 1 &&
          !this.isNil(sku.grouponHeaderPrice) &&
          !this.isNil(sku.skuPrice)
            ? 0 < sku.grouponHeaderPrice &&
              sku.grouponHeaderPrice < sku.skuPrice
            : true,
      )
    );
  };

  verifySKUCompareGrouponAndHead: () => boolean = () => {
    return (
      !this.isAttractNewType() ||
      (this.isProductSkuValid &&
        this.product.sku.every(
          sku =>
            sku.status === 1 &&
            !this.isNil(sku.grouponHeaderPrice) &&
            !this.isNil(sku.price)
              ? sku.grouponHeaderPrice <= sku.price
              : true,
        ))
    );
  };

  verifySKUCompareGrouponProAndHeadPro: () => boolean = () => {
    return (
      !this.isAttractNewType() ||
      !this.product.distribution ||
      (this.isProductSkuValid &&
        this.product.sku.every(
          sku =>
            sku.status === 1 &&
            !this.isNil(sku.grouponHeaderSkuCostPrice) &&
            !this.isNil(sku.promotionPrice)
              ? sku.grouponHeaderSkuCostPrice <= sku.promotionPrice
              : true,
        ))
    );
  };

  verifySKUItemPrice: (item: ISku, field: string) => boolean = (
    item,
    field,
  ) => {
    if (item.status !== 1) {
      return true;
    }
    if (this.isNil(item[field])) {
      return false;
    }

    const {
      skuPrice,
      price,
      promotionPrice,
      grouponHeaderPrice,
      grouponHeaderSkuCostPrice,
    } = item;
    if (
      (!this.product.distribution
        ? !this.isNil(price) && !(0 < price && skuPrice > price)
        : (!this.isNil(price) &&
            !this.isNil(promotionPrice) &&
            !(price > promotionPrice)) ||
          (field === 'price' && !this.isNil(price) && !(price < skuPrice))) ||
      (this.isAttractNewType && field === 'price'
        ? !this.isNil(grouponHeaderPrice) &&
          !this.isNil(price) &&
          !(grouponHeaderPrice <= price)
        : this.product.distribution &&
          !this.isNil(grouponHeaderSkuCostPrice) &&
          !this.isNil(promotionPrice) &&
          !(grouponHeaderSkuCostPrice <= promotionPrice))
    ) {
      return false;
    }
    return true;
  };

  verifySKUItemPriceHead: (item: ISku, field: string) => boolean = (
    item,
    field,
  ) => {
    if (item.status !== 1) {
      return true;
    }
    if (this.isNil(item[field])) {
      return false;
    }

    const {
      skuPrice,
      price,
      promotionPrice,
      grouponHeaderPrice,
      grouponHeaderSkuCostPrice,
    } = item;
    if (
      (!this.product.distribution
        ? !this.isNil(grouponHeaderPrice) &&
          !(0 < grouponHeaderPrice && skuPrice > grouponHeaderPrice)
        : (!this.isNil(grouponHeaderPrice) &&
            !this.isNil(grouponHeaderSkuCostPrice) &&
            !(grouponHeaderPrice > grouponHeaderSkuCostPrice)) ||
          (field === 'grouponHeaderPrice' &&
            !this.isNil(grouponHeaderPrice) &&
            !(grouponHeaderPrice < skuPrice))) ||
      (this.isAttractNewType && field === 'grouponHeaderPrice'
        ? !this.isNil(grouponHeaderPrice) &&
          !this.isNil(price) &&
          !(grouponHeaderPrice <= price)
        : this.product.distribution &&
          !this.isNil(grouponHeaderSkuCostPrice) &&
          !this.isNil(promotionPrice) &&
          !(grouponHeaderSkuCostPrice <= promotionPrice))
    ) {
      return false;
    }
    return true;
  };
  /*
  verifyStartEndTime(): boolean {
    if (!this.formData.startTime || !this.formData.endTime) {
      return true;
    }
    return this.formData.startTime.getTime() < this.formData.endTime.getTime();
  }

  verifyStartNowTime(): boolean {
    if (this.type === 'add') {
      if (!this.formData.startTime) {
        return true;
      }
      return new Date() <= this.formData.startTime;
    }
    return true;
  }*/
  // 批量设置拼团价/促销供货价
  setSame(key: string): void {
    const val = this.sameTriger[key];
    this.sameTriger[key] = this.isNil(val)
      ? val
      : parseFloat(val.toFixed(2).replace(/\-/, ''));
    this.product.sku = this.product.sku.map(sku => {
      if (sku.checked) {
        // 只批量设置勾选的sku
        return { ...sku, [key]: this.sameTriger[key] };
      }
      return { ...sku };
    });
    this.sameTriger.price = null;
    this.sameTriger.promotionPrice = null;
    this.sameTriger.grouponHeaderPrice = null;
    this.sameTriger.grouponHeaderSkuCostPrice = null;
    this.isGroupPriceTmpOpen = false;
    this.isPromotionSupplyPriceTmpOpen = false;
    this.isHeaderGroupPriceTmpOpen = false;
    this.isHeaderPromotionSupplyPriceTmpOpen = false;
  }
  // 批量设置是否参加拼团活动
  setSameJoin(): void {
    const val = this.sameTriger.status;
    this.sameTriger.status = val;

    this.product.sku = this.product.sku.map(sku => {
      if (sku.checked) {
        // 只批量设置勾选的sku
        return { ...sku, status: val };
      }
      return { ...sku };
    });
    this.sameTriger.status = null;
    this.isJoinGroupTmpOpen = false;
  }

  formatPrice(index: number, field: string): void {
    const val: number = this.product.sku[index][field];
    this.product.sku[index][field] = this.isNil(val)
      ? val
      : parseFloat(val.toFixed(2).replace(/\-/, ''));
  }

  getSkuMinValue(): number[] {
    if (this.isProductSkuValid) {
      const validSku = this.product.sku.filter(sku => sku.status === 1);
      const minSkuPriceSku = _.minBy(validSku, 'skuPrice');
      const minPriceSku =
        this.type !== 'add' ||
        (this.verifySKURequired() && this.verifySKUCompare())
          ? _.minBy(validSku, 'price')
          : null;
      const minHeaderPrice =
        this.isAttractNewType() &&
        (this.type !== 'add' ||
          (this.verifySKURequiredHead() && this.verifySKUCompareHead()))
          ? _.minBy(validSku, 'grouponHeaderPrice')
          : null;
      return [
        minSkuPriceSku ? minSkuPriceSku.skuPrice : 0,
        minPriceSku ? minPriceSku.price : 0,
        minHeaderPrice ? minHeaderPrice.grouponHeaderPrice : 0,
      ];
    }
    return [0, 0];
  }

  getFloatSubtraction(a: number, b: number): string {
    return (
      (parseInt(String(a * 100), 10) - parseInt(String(b * 100), 10)) /
      100
    ).toFixed(2);
  }

  getGrouponSuccessNumber: () => number = () =>
    Math.ceil(
      (this.formData.grouponSuccessNumber || 0) / (this.isSuperType() ? 10 : 1),
    );

  private setLotteryTime(): void {
    if (this.formData.dateRange[1]) {
      this.formData.lotteryTime = moment(this.formData.dateRange[1])
        .add(1, 'd')
        .set('hour', 11)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toDate();
    }
  }

  setLuckyGroup: () => void = () => {
    if (this.isLuckyType()) {
      this.setFormDataIfIsNil('assistantFlag', 1);
      this.setFormDataIfIsNil('fansGroupFlag', 0);
      if (this.isProductSkuValid) {
        this.setSameTrigerIfIsNil('price', 0.01);
        if (this.product.distribution) {
          this.setSameTrigerIfIsNil('promotionPrice', 0);
        }
      }
      // if (this.formData.startTime && !this.formData.endTime) {
      //   this.formData.endTime = moment(this.formData.startTime)
      //     .add(1, 'd')
      //     .subtract(1, 'm')
      //     .toDate();
      // }
      this.setLotteryTime();
    }
  };

  async save() {
    if (!this.getFormIsValid()) {
      return this.$q.reject('表单输入不合法！');
    }
    // 处理 1.0 这种输入
    this.formData.grouponSuccessNumber = Math.floor(
      this.formData.grouponSuccessNumber,
    );

    try {
      const [
        // productShareImgUrl,
        // grouponShareImgUrlParticipate,
        widthHeight,
      ] = await Promise.all([
        // this.getDOMImageById('productShareImgUrl'),
        // this.getDOMImageById('grouponShareImgUrlParticipate'),
        this.loadImage(this.formData.bannerUrl),
      ]);

      const params = {
        ...this.formData,
        widthHeight,
        // productShareImgUrl,
        // grouponShareImgUrlParticipate,
        simulatedFlag: this.simulatedFlagInfo[this.formData.type],
        skuList: JSON.stringify(
          this.product.sku.map(
            ({
              skuId,
              skuPrice,
              price,
              supplyPrice,
              promotionPrice,
              grouponHeaderPrice,
              grouponHeaderSkuCostPrice,
              status,
            }) => ({
              skuId,
              price,
              skuPrice,
              promotionPrice,
              grouponHeaderPrice,
              grouponHeaderSkuCostPrice,
              status,
              skuCostPrice: supplyPrice,
            }),
          ),
        ),
        termOfValidity:
          ~~this.termOfValidity.hours * 60 + this.termOfValidity.minutes,
        startTime: moment(this.formData.dateRange[0]).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        endTime: moment(this.formData.dateRange[1]).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        lotteryTime: this.formData.lotteryTime
          ? moment(this.formData.lotteryTime).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
      };
      if (this.type === 'add') {
        return this.addGroupon(params);
      }
      return this.updateGroupon(params);
    } catch (e) {
      console.error('创建拼团活动失败：', e);
    }
  }

  getFormIsValid: () => boolean = () => {
    this.isSubmitting = true;
    this.errors.length = 0;
    if (
      !this.isProductSkuValid ||
      // !this.formData.startTime ||
      // !this.formData.endTime ||
      !this.formData.dateRange[0] ||
      !this.formData.bannerUrl ||
      (this.isLuckyType() && !this.formData.couponId) ||
      !this.verifySKURequired() ||
      !this.verifySKUStatusRequired() ||
      !this.verifySKUCompare() || // 自营也需要校验
      // !this.verifyStartEndTime() ||
      // !this.verifyStartNowTime() ||
      (!this.termOfValidity.hours && !this.termOfValidity.minutes) ||
      !_.isNumber(this.formData.grouponSuccessNumber) ||
      this.formData.grouponSuccessNumber < 2 ||
      (this.isAttractNewType() && !this.verifySKURequiredHead()) ||
      (this.isAttractNewType() && !this.verifySKUCompareHead()) ||
      (this.isAttractNewType() && !this.verifySKUCompareGrouponAndHead()) ||
      (this.isAttractNewType() && !this.verifySKUCompareGrouponProAndHeadPro())
    ) {
      return (this.isSubmitting = false);
    }
    const startTime = moment(this.formData.dateRange[0]).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    const endTime = moment(this.formData.dateRange[1]).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    if (this.item.status === 2) {
      const originalEndTime = moment(this.formData.dateRange[1]).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      if (new Date(endTime) < new Date(originalEndTime)) {
        this.errors.push('仅支持延长活动时间');
      }
    }
    if (this.errors.length) {
      return (this.isSubmitting = false);
    }
    return true;
  };

  private addGroupon: (params: any) => ng.IPromise<any> = params =>
    this.dataService
      .groupon_activity_add(params)
      .then(res => {
        this.notification.success('创建成功！');
        return this.$location.path('/event/group').search({
          kolId: this.formData.kolId,
          wechat_id: this.wechatId,
        });
      })
      .finally(() => {
        this.isSubmitting = false;
      });

  private updateGroupon: (params: any) => ng.IPromise<any> = params =>
    this.dataService
      .groupon_activity_update(params)
      .then(res => {
        this.notification.success('更新成功！');
        return this.$location.path('/event/group').search({
          kolId: this.formData.kolId,
          wechat_id: this.wechatId,
        });
      })
      .finally(() => (this.isSubmitting = false));

  private getGroupItemDetail: () => ng.IPromise<any> = () =>
    this.dataService
      .groupon_activity_detail({ activityId: this.id })
      .then(({ data }) => {
        // debugger;
        this.item = data;
        this.termOfValidity = {
          hours: Math.floor(data.termOfValidity / 60) || undefined,
          minutes: data.termOfValidity % 60,
        };
        this.getBase64Data(this.formatImg(data.itemImgurl));
        this.product = {
          id: data.productId,
          itemImgurl: data.itemImgurl,
          sku: data.skuList.map(item => ({
            ...item,
            price: this.isNil(item.price) ? undefined : parseFloat(item.price),
            // 编辑拼团时, 如果没有促销供货价, 就取日常供货价作为促销供货价
            promotionPrice: this.isNil(item.promotionPrice)
              ? this.isNil(item.supplyPrice)
                ? undefined
                : parseFloat(item.supplyPrice)
              : parseFloat(item.promotionPrice),
            grouponHeaderPrice: this.isNil(item.grouponHeaderPrice)
              ? undefined
              : parseFloat(item.grouponHeaderPrice),
            grouponHeaderSkuCostPrice: this.isNil(
              item.grouponHeaderSkuCostPrice,
            )
              ? undefined
              : parseFloat(item.grouponHeaderSkuCostPrice),
          })),
          itemName: data.itemName,
          distribution: data.distribution,
        };
        this.formData = {
          ...this.formData,
          bannerUrl: data.bannerUrl,
          productLimit: data.productLimit,
          productId: data.productId,
          activityName: data.activityName,
          // startTime: new Date(data.startTime),
          // endTime: new Date(data.endTime),
          dateRange: [new Date(data.startTime), new Date(data.endTime)],
          grouponSuccessNumber: data.grouponSuccessNumber,
          // simulatedFlag: !!data.simulatedFlag,
          type: data.type,
          introduction: data.introduction,
        };
        this.simulatedFlagInfo[data.type] = !!data.simulatedFlag;
        if (this.isLuckyType()) {
          this.coupon = data.couponVO;
          this.formData = {
            ...this.formData,
            couponId: data.couponVO.id,
            assistantFlag: data.assistantFlag,
            fansGroupFlag: data.fansGroupFlag,
            fansGroupName: data.fansGroupFlag ? data.fansGroupName : undefined,
            lotteryTime: new Date(data.lotteryTime),
          };
        }
      });

  private getProductSKU: (product: IProduct) => ng.IPromise<any> = product =>
    this.dataService
      .groupon_activity_sku({ itemId: product.id })
      .then(({ data }) => {
        this.product.sku = data.map(sku => ({
          ...sku,
          status: sku.status || 1,
          checked: true,
          promotionPrice: this.isNewBrand
            ? Number(sku.supplyPrice)
            : sku.promotionPrice,
        }));
        this.setLuckyGroup();
      });

  private getBase64Data(url: string): Promise<any> {
    return toImgDataURL(`${url}?imageView2/1/w/204/h/204/q/100`)
      .then(base64 => {
        this.base64Url = base64;
        this.$scope.$apply();
      })
      .catch(e => {
        throw new Error('转换图片至 base64 出错' + e);
      });
  }

  /*
  private getDOMImageById(nodeName: string): Promise<string> {
    return domtoimage
      .toBlob(document.getElementById(nodeName))
      .then((blob: Blob) => {
        const b: any = blob;
        b.lastModifiedDate = new Date();
        b.name = 'productShareImgUrl.png';
        return this.seeUpload.uploadAuthImage(<File>b).then(({ data }) => data);
      })
      .catch(error => {
        this.notification.warn('分享图片创建失败，请重试！');
        throw new Error('分享图片创建失败，请重试！' + error);
      });
  }
   */

  private formatImg(url: string): string {
    if (url.startsWith('http')) {
      return url.replace(/^https?\:\/\//, '//');
    }
    if (url.startsWith('/s')) {
      return `//image.seecsee.com${url}`;
    }
    return url;
  }

  private isNil(input: string | number): boolean {
    return input === '' || _.isNil(input);
  }

  private setFormDataIfIsNil(field: string, defaultValue: number): void {
    if (_.isNil(this.formData[field])) {
      this.formData[field] = defaultValue;
    }
  }

  private setSameTrigerIfIsNil(skuField: string, defaultValue: number): void {
    if (this.product.sku.every(sku => this.isNil(sku[skuField]))) {
      this.sameTriger[skuField] = defaultValue;
      this.setSame(skuField);
    }
  }

  private getProductBannerUrl(product: IProduct): string {
    return `${
      product.itemImgurl
    }?imageMogr2/thumbnail/708x/gravity/center/crop/708x416`;
  }

  // private setEndTimeAdd48() {
  //   this.formData.endTime = moment(this.formData.startTime)
  //     .add(48, 'h')
  //     .toDate();
  //   this.setLotteryTime();
  // }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function() {
        resolve(`${(<any>this).width},${(<any>this).height}`);
      };
      img.onerror = function() {
        reject('图片加载错误');
      };
      img.src = formatSrc(url);
    });
  }
  dateRangeChange() {
    this.setLuckyGroup();
  }
  /*
  startValueChange = () => {
    if (this.item.status === 3) {
      return;
    }
    if (_.isNil(this.formData.startTime)) {
      return;
    }
    if (_.isNil(this.formData.endTime)) {
      this.setEndTimeAdd48();
      return;
    }
    if (this.formData.startTime.getTime() > this.formData.endTime.getTime()) {
      this.setEndTimeAdd48();
    }
    this.setLuckyGroup();
  };
  endValueChange = () => {
    if (this.item.status === 3) {
      return;
    }
    if (_.isNil(this.formData.startTime) || _.isNil(this.formData.endTime)) {
      return;
    }
    if (this.formData.startTime.getTime() > this.formData.endTime.getTime()) {
      this.formData.startTime = null;
    }
    this.setLotteryTime();
    this.setLuckyGroup();
  };
  */
  disabledStartDate = startValue => {
    // console.log('startValue==', startValue);
    if (this.item.status === 3) {
      return false;
    }
    if (!startValue) {
      return false;
    }
    return (
      startValue.getTime() <=
        moment()
          .add(-1, 'days')
          .valueOf() || startValue.getTime() === Date.now()
    );
    /*
    if (startValue && !this.formData.endTime) {
      return (
        startValue.getTime() <=
          moment()
            .add(-1, 'days')
            .valueOf() || startValue.getTime() === Date.now()
      );
    }
    return startValue.getTime() >= this.formData.endTime.getTime();
    */
  };
  /*
  disabledEndDate = endValue => {
    if (this.item.status === 3) {
      return false;
    }
    if (!endValue) {
      return false;
    }
    if (endValue && !this.formData.startTime) {
      return (
        endValue.getTime() <=
          moment()
            .add(-1, 'days')
            .valueOf() || endValue.getTime() === Date.now()
      );
    }
    return endValue.getTime() <= this.formData.startTime.getTime();
  };

  get endTime() {
    if (!this.formData.startTime && !this.formData.endTime) {
      return true;
    }
    return true;
  }*/
}

export const EventGroupAction: ng.IComponentOptions = {
  template: require('./event-group-action.template.html'),
  controller: EventGroupActionController,
  bindings: {
    type: '@',
  },
};
