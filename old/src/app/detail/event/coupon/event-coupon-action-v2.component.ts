import * as moment from 'moment';
import * as _ from 'lodash';
import { formatSrc } from 'app/utils';

interface IItemData {
  name: string;
  limitPer: number;
  couponPrice: number;
  limitMoney: number;
  allCount: number;
  // avaliableTimeStart: Date;
  // avaliableTimeEnd: Date;
  moneyPayer?: number;
  xiaodianpuId?: any;
  type: number;
  dateRange: Date[];
  // 优惠券指定范围
  scope: number;
  frontendShowName: string;
  icon: string;
}

enum SCOPE_TYPE {
  SHOP = 1,
  CLASS = 2,
  BRAND = 3,
  COMMODITY = 4,
}

type ImgData = {
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  type?: string;
  sizeKB?: number;
  sizeMB?: number;
  url?: string;
};

const titleMap = {
  add: '创建',
  edit: '编辑',
  view: '查看',
};

export class EventCouponActionV2Controller implements ng.IComponentController {
  static $inject: string[] = [
    '$q',
    '$location',
    '$routeParams',
    '$cookies',
    'dataService',
    'Notification',
    'seeModal',
  ];

  // 默认全店优惠券商品图
  shopScopeCouponIcon: string =
    '/s/t/product_v2/62e/e7a/4m8/i60yhesssggss4gg40c4gwc0co.png';
  defaultInitImg: any[] = [
    {
      uid: -1,
      name: this.shopScopeCouponIcon
        ? this.getImageName(this.shopScopeCouponIcon)
        : '',
      status: 'done',
      url: formatSrc(this.shopScopeCouponIcon),
    },
  ];

  type: string;
  title: string;
  errors: string[] = [];
  isSubmitting: boolean = false;
  // tslint:disable-next-line prefer-array-literal
  limitNumbers: number[] = new Array(10).fill(1).map((v, i) => i + v);
  sellerPrivilege: number = Number(this.$cookies.get('seller_privilege'));
  isAdmin = [7, 10, 25].includes(this.sellerPrivilege);
  isNewBrand = this.sellerPrivilege === 30;
  formData: IItemData = {
    name: '',
    limitPer: this.limitNumbers[0],
    couponPrice: undefined,
    limitMoney: undefined,
    allCount: undefined,
    // avaliableTimeStart: null,
    // avaliableTimeEnd: null,
    moneyPayer: 1,
    type: 1, // 优惠券类型 => 1:普通, 2:新人, 3: 抽奖团, 4: 下单返券
    dateRange: [null, null],
    // 优惠券指定范围
    scope: SCOPE_TYPE.SHOP,
    frontendShowName: '全店铺商品通用',
    icon: this.shopScopeCouponIcon,
  };

  // 指定品类
  classFormData = {
    targetIds: [],
    showClassNamesForEdit: '',
  };
  // 指定品牌
  brandFormData = {
    targetIds: [],
  };
  // 指定商品
  CommodityFormData = {
    targetIds: [],
  };

  id: number = ~~this.$routeParams['id'] || undefined;
  item: IItemData;
  xdpList: any[];
  kolId: number = +this.$routeParams['kolId'] || undefined;

  private close: number = ~~this.$routeParams['close'];

  // 优惠券指定范围
  couponScopeConst = {
    [SCOPE_TYPE.SHOP]: {
      label: '全店',
      scopeTextLimit: 36,
    },
    [SCOPE_TYPE.CLASS]: {
      label: '指定品类',
      scopeTextLimit: 36,
    },
    [SCOPE_TYPE.BRAND]: {
      label: '指定品牌',
      scopeTextLimit: 36,
    },
    [SCOPE_TYPE.COMMODITY]: {
      label: '指定商品',
      scopeTextLimit: 36,
    },
  };

  initImg: any[] = this.defaultInitImg;
  validateImgShape: boolean = false;
  showImgShapeTips: boolean = false;
  select3rdClass: any[] = [];
  fastViewData: any[] = null;
  brands: any[] = [];
  brandIds: number[] = [];
  goodsList: any[] = [];
  goodsListDisplay: any[] = [];
  currentPage: number = 1;
  scopeTextTooltipImg: string =
    '/s/t/product_v2/f77/766/lhs/b7cls04occkskggw800gcokk0c.png';
  couponIconTooltipImg: string =
    '/s/t/product_v2/a45/535/2n9/8d4wfmsg8ok4ckskcsg444gssk.png';
  formatSrc = formatSrc;
  newBrandXdpId: number;

  classNameRadios = [
    { label: '显示1级品类', value: 1 },
    { label: '显示2级品类', value: 2 },
    { label: '显示3级品类', value: 3 },
  ];
  classNameDisplay: number = 1;

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
  ) {}

  $onInit(): void {
    this.title = titleMap[this.type];
    const promises: ng.IPromise<any>[] = [];
    if (this.type === 'edit' || this.type === 'view') {
      promises.push(this.getCouponItemDetail());
    } else if (typeof this.kolId !== 'undefined') {
      promises.push(this.getShopIdAndName());
    }
    this.$q.all(promises);

    // 外部权限通过kolId查询xdpId，在创建优惠券范围指定商品时，需要使用xdpId查询商品列表
    if (this.isNewBrand && this.type === 'add') {
      this.getXdpIdForNewBrand();
    }
  }

  get scopeTextLimit(): number {
    return this.couponScopeConst[this.formData.scope].scopeTextLimit;
  }

  get selectClassStr() {
    return _.uniq(
      this.select3rdClass.map(
        ({ pathInfo }) => pathInfo[this.classNameDisplay - 1].className,
      ),
    ).join('、');
  }

  get selectBrandsStr() {
    return this.brands.map(item => item.name).join('、');
  }

  get defaultScopeText(): string {
    let text;
    switch (this.formData.scope) {
      case SCOPE_TYPE.SHOP:
        text = '全店铺商品通用';
        break;
      case SCOPE_TYPE.CLASS:
        text = this.getCnLengthStr(
          `仅限${this.selectClassStr || 'xx'}商品使用`,
          this.scopeTextLimit,
        );
        break;
      case SCOPE_TYPE.BRAND:
        text = this.getCnLengthStr(
          `仅限${this.selectBrandsStr || 'xx'}商品使用`,
          this.scopeTextLimit,
        );
        break;
      case SCOPE_TYPE.COMMODITY:
        text = '仅限部分商品使用';
        break;
      default:
        text = '';
    }
    return text;
  }

  get defaultIcon(): any {
    let icon;
    let initImg;
    switch (this.formData.scope) {
      case SCOPE_TYPE.SHOP:
        icon = this.shopScopeCouponIcon;
        initImg = this.defaultInitImg;
        break;
      case SCOPE_TYPE.CLASS:
      case SCOPE_TYPE.BRAND:
      case SCOPE_TYPE.COMMODITY:
        icon = '';
        initImg = [];
        break;
      default:
        icon = '';
        initImg = [];
    }
    return { icon, initImg };
  }

  setDefaultInfo() {
    this.setDefaultScopeText();
    this.setDefaultIcon();
  }

  setDefaultScopeText() {
    if (this.type !== 'add') {
      return;
    }
    this.formData.frontendShowName = this.defaultScopeText;
  }

  setDefaultIcon() {
    if (this.type !== 'add') {
      return;
    }
    const { icon, initImg } = this.defaultIcon;
    this.formData.icon = icon;
    this.initImg = initImg;
    this.validateImgShape = false;
  }

  uploadImgSuccess(value, form: ng.IFormController) {
    form.$setDirty();
    const { fileList, imgUrl } = value;
    const { width, height } = fileList[0];
    this.initImg = _.cloneDeep(fileList);
    this.formData.icon = imgUrl;
    this.validateImgShape = true;
    this.showImgShapeTips = Math.abs(width - height) > 10;
  }

  uploadImgError(value, form: ng.IFormController) {
    form.$setDirty();
    this.validateImgShape = false;
    this.initImg = _.cloneDeep(value.fileList);
    this.formData.icon = '';
    console.log('uploadImgError:', value);
  }

  removeImg(value, form: ng.IFormController) {
    form.$setDirty();
    this.validateImgShape = false;
    this.initImg = _.cloneDeep(value.fileList);
    this.formData.icon = '';
  }

  imgValid = (imgData: ImgData) => {
    const { type, sizeKB } = imgData;
    const typeValid = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/gif',
    ].includes(type);
    const sizeValid = sizeKB <= 500;
    if (!typeValid) {
      this.Notification.warn('图片格式不正确！');
    }
    if (typeValid && !sizeValid) {
      this.Notification.warn('图片不应大于500K！');
    }
    return typeValid && sizeValid;
  };

  getImageName(url: string): string {
    return /\/[^\/]+$/.exec(url)[0].slice(1);
  }

  classChange(outputData) {
    const { selectLeaves, selectTags } = outputData;
    this.select3rdClass = selectLeaves;
    this.classFormData.targetIds = selectLeaves.map(leaf => leaf.levelId);
    this.classFormData.showClassNamesForEdit = JSON.stringify(
      selectTags.map(({ levelId: id, label }) => ({ id, label })),
    );
    this.setDefaultScopeText();
  }

  brandChange(brands: any[]) {
    this.brands = brands;
    this.updateBrandIds();
    this.setDefaultScopeText();
  }

  updateBrandIds() {
    this.brandFormData.targetIds = this.brands.map(item => item.id);
  }

  goodsChange(goodsList) {
    this.goodsList = goodsList;
    this.pageChanged(1);
    this.updateGoodsIds();
  }

  pageChanged(page: number) {
    const startIndex = (page - 1) * 10;
    this.goodsListDisplay = this.goodsList.slice(startIndex, startIndex + 10);
  }

  removeGoods(index) {
    const item_id = this.goodsListDisplay[index].item_id;
    this.goodsList.splice(_.findIndex(this.goodsList, { item_id }), 1);
    this.pageChanged(this.currentPage);
    this.updateGoodsIds();
  }

  updateGoodsIds() {
    this.CommodityFormData.targetIds = this.goodsList.map(item => item.item_id);
  }

  getXdpIdForNewBrand() {
    this.dataService
      .kol_mgr_checkUserPri({ kol_id: this.kolId })
      .then(({ data: { kol_info: { xdp_info } } }) => {
        this.newBrandXdpId = xdp_info.id;
      });
  }

  get isNewBrandFormDisabled(): boolean {
    return this.type === 'edit' && this.isNewBrand;
  }

  backToCouponList(form: ng.IFormController): void {
    console.log('formdata:', this.formData);
    console.log('classFormData:', this.classFormData);
    console.log('brandFormData:', this.brandFormData);
    console.log('CommodityFormData:', this.CommodityFormData);
    if (form.$dirty) {
      this.seeModal
        .confirmP('返回优惠券列表', '当前填写内容将丢失，是否确认返回？')
        .then(() => this.routeToCouponList())
        .catch(e => e);
    } else {
      this.routeToCouponList();
    }
  }

  private routeToCouponList(): void {
    this.$location.path('/event/couponv2').search({
      name: this.$routeParams.name,
      kolId: this.kolId,
    });
  }

  getEnLength(str: string): number {
    let len = 0;
    const val = str || '';
    for (let i = 0; i < val.length; i += 1) {
      if (val[i].match(/[^x00-xff]/gi) != null) {
        // 全角
        len += 2;
      } else {
        len += 1;
      }
    }
    return len;
  }

  getCnLengthStr(str: string, cnLen: number): string {
    let len = 0;
    const val = str || '';
    for (let i = 0; i < val.length; i += 1) {
      if (val[i].match(/[^x00-xff]/gi) != null) {
        // 全角
        len += 2;
      } else {
        len += 1;
      }
      if (len > cnLen * 2) {
        return str.slice(0, i);
      }
    }
    return str;
  }

  verifyLength(minlen: number, maxlen: number, formVal: string): boolean {
    const len = this.getEnLength(formVal);
    return len <= maxlen * 2 && len >= minlen * 2;
  }

  verifyCouponPrice(): boolean {
    const couponPrice = this.formData.couponPrice;
    if (typeof couponPrice === 'undefined') {
      return true;
    }
    const dotArr = String(couponPrice).split('.');
    if (dotArr[1] && dotArr[1].length) {
      return false;
    }
    return couponPrice > 0 && couponPrice < 10000000;
  }

  verifyLimitMoney(): boolean {
    const limitMoney = this.formData.limitMoney;
    const couponPrice = this.formData.couponPrice;
    if (typeof limitMoney === 'undefined') {
      return false;
    }
    if (typeof couponPrice === 'undefined') {
      return false;
    }
    const dotArr = String(limitMoney).split('.');
    if (dotArr[1] && dotArr[1].length) {
      return true;
    }
    return limitMoney <= couponPrice || limitMoney >= 10000000;
  }

  verifyAllCount(): boolean {
    if (typeof this.formData.allCount === 'undefined') {
      return false;
    }
    return this.formData.allCount <= 0; // || this.formData.allCount > 999999;
  }
  /*
  beforeRenderStartTime(
    $view: any,
    $dates: any[],
    $leftDate: any,
    $upDate: any,
    $rightDate: any,
  ) {
    const now = new Date();
    $dates
      .filter(
        date =>
          new Date(date.utcDateValue) <=
          new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      )
      .forEach(date => (date.selectable = false));

    if (this.formData.avaliableTimeEnd) {
      const activeDate = moment(this.formData.avaliableTimeEnd);
      $dates
        .filter(date => date.localDateValue() >= activeDate.valueOf())
        .forEach(date => (date.selectable = false));
    }
  }

  beforeRenderEndTime(
    $view: any,
    $dates: any[],
    $leftDate: any,
    $upDate: any,
    $rightDate: any,
  ) {
    const now = new Date();
    $dates
      .filter(
        date =>
          new Date(date.utcDateValue) <=
          new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      )
      .forEach(date => (date.selectable = false));

    if (this.formData.avaliableTimeStart) {
      const activeDate = moment(this.formData.avaliableTimeStart)
        .subtract(1, $view)
        .add(1, 'minute');
      $dates
        .filter(date => date.localDateValue() <= activeDate.valueOf())
        .forEach(date => (date.selectable = false));
    }
  }
  */
  log(item: any) {
    console.log(item);
  }

  save(): ng.IPromise<any> {
    this.isSubmitting = true;
    this.errors.length = 0;

    // 新增优惠券: 抽奖团(type=3),下单返券优惠券(type=4)
    if (this.formData.type > 2) {
      this.formData.allCount = 4; // 发行量数量不做限制
      this.formData.limitPer = 4; // 每人领取数量不做限制
      this.formData.moneyPayer = 2; // see承担
      if (this.type === 'edit' && this.item) {
        this.item.allCount = 4;
      }
    }

    if (
      (this.isAdmin && !this.formData.moneyPayer) ||
      this.verifyLimitMoney() ||
      this.verifyAllCount() ||
      (this.type === 'edit' && this.formData.allCount < this.item.allCount) ||
      (this.isAdmin && !this.formData.xiaodianpuId) ||
      // 优惠券指定范围项目相关的校验
      !this.verifyLength(
        0,
        this.scopeTextLimit,
        this.formData.frontendShowName,
      ) ||
      !this.formData.icon ||
      (this.validateImgShape && this.showImgShapeTips) ||
      (this.formData.scope === SCOPE_TYPE.CLASS
        ? !this.classFormData.targetIds.length
        : false) ||
      (this.formData.scope === SCOPE_TYPE.BRAND
        ? !this.brandFormData.targetIds.length
        : false) ||
      (this.formData.scope === SCOPE_TYPE.COMMODITY
        ? !this.CommodityFormData.targetIds.length
        : false)
    ) {
      this.isSubmitting = false;
      return;
    }
    if (
      this.type === 'add' &&
      this.formData.dateRange[0].getTime() <= new Date().getTime()
    ) {
      this.errors.push('有效期开始时间应晚于当前时间');
    }
    // if (this.formData.avaliableTimeStart >= this.formData.avaliableTimeEnd) {
    //   this.errors.push('有效期结束时间应晚于开始时间');
    // }
    if (this.errors.length) {
      this.isSubmitting = false;
      return this.$q.reject('表单输入不合法');
    }
    // 处理 1.0 这种输入
    this.formData.allCount = Math.floor(this.formData.allCount);

    const avaliableTimeStart = moment(this.formData.dateRange[0]).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    const avaliableTimeEnd = moment(this.formData.dateRange[1]).format(
      'YYYY-MM-DD HH:mm:ss',
    );

    if (this.type === 'add') {
      let params: any = {
        ...this.formData,
        avaliableTimeStart,
        avaliableTimeEnd,
        xiaodianpuId: this.isAdmin
          ? (this.formData.xiaodianpuId as any).id
          : undefined,
      };
      // 处理优惠券指定范围额外字段
      switch (this.formData.scope) {
        case SCOPE_TYPE.CLASS:
          params = { ...params, ...this.classFormData };
          break;
        case SCOPE_TYPE.BRAND:
          params = { ...params, ...this.brandFormData };
          break;
        case SCOPE_TYPE.COMMODITY:
          params = { ...params, ...this.CommodityFormData };
          break;
      }
      return this.dataService
        .couponv3_add(params)
        .then(res => {
          this.Notification.success('创建成功！');
          return this.$location.path('/event/couponv2');
        })
        .finally(() => {
          this.isSubmitting = false;
          if (this.close === 1) {
            window.close();
          }
        });
    }
    const { name, allCount } = this.formData;
    if (name === this.item.name && allCount === this.item.allCount) {
      this.$location.path('/event/couponv2');
      return this.$q.reject('信息未更改');
    }
    let updateParam: any = { name, allCount, id: this.id };
    if (this.formData.type > 2) {
      // 只允许修改名称
      updateParam = { name, id: this.id };
    }
    return this.dataService
      .couponv3_update(updateParam)
      .then(res => {
        this.Notification.success('更新成功！');
        return this.$location.path('/event/couponv2');
      })
      .finally(() => (this.isSubmitting = false));
  }

  getXDPList: (keyword: string) => ng.IPromise<any> = keyword =>
    this.dataService.couponv3_xdp_list({ keyword }).then(({ data }) => data);

  private getCouponItemDetail: () => ng.IPromise<any> = () =>
    this.dataService.couponv3_detail({ id: this.id }).then(({ data }) => {
      this.item = data;
      this.formData = {
        type: data.type,
        name: data.name,
        moneyPayer: data.moneyPayer,
        couponPrice: parseFloat(data.couponPrice),
        limitMoney: parseFloat(data.limitMoney),
        // avaliableTimeStart: new Date(data.avaliableTimeStart),
        // avaliableTimeEnd: new Date(data.avaliableTimeEnd),
        dateRange: [
          new Date(data.avaliableTimeStart),
          new Date(data.avaliableTimeEnd),
        ],
        allCount: data.allCount,
        limitPer: data.limitPer,
        xiaodianpuId: this.isAdmin
          ? {
              id: data.xiaodianpuId,
              sellerName: data.xiaodianpuName,
            }
          : undefined,
        // 优惠券指定范围
        scope: data.scope,
        frontendShowName: data.frontendShowName,
        icon: data.icon,
      };
      // 优惠券图片
      this.initImg = [
        {
          uid: -1,
          name: data.icon ? this.getImageName(data.icon) : '',
          status: 'done',
          url: formatSrc(data.icon),
        },
      ];
      // 处理优惠券指定范围额外字段
      switch (data.scope) {
        case SCOPE_TYPE.CLASS:
          const showClassNamesForEdit = JSON.parse(data.showClassNamesForEdit);
          if (showClassNamesForEdit instanceof Array) {
            this.fastViewData = showClassNamesForEdit.map(tag => tag.label);
          }
          break;
        case SCOPE_TYPE.BRAND:
          if (data.targetJson) {
            const targetJson = JSON.parse(data.targetJson);
            if (targetJson instanceof Array) {
              this.brandIds = targetJson.map(t => t.id);
            }
          }
          break;
        case SCOPE_TYPE.COMMODITY:
          if (data.targetJson) {
            const targetJson = JSON.parse(data.targetJson);
            if (targetJson instanceof Array) {
              const goodsList = targetJson.map(t => ({
                item_name: t.name,
                item_price: t.price / 100,
                item_status: t.status,
              }));
              this.goodsChange(goodsList);
            }
          }
          break;
      }
    });

  private getShopIdAndName: () => ng.IPromise<any> = () =>
    this.dataService.kol_mgr_checkUserPri({ kol_id: this.kolId }).then(
      ({
        data: {
          kol_info: { xdp_info },
        },
      }) =>
        (this.formData.xiaodianpuId = this.isAdmin
          ? {
              id: xdp_info.id,
              sellerName: xdp_info.app_title,
            }
          : undefined),
    );

  // startValueChange = () => {
  //   if (this.formData.avaliableTimeStart > this.formData.avaliableTimeEnd) {
  //     this.formData.avaliableTimeEnd = null;
  //   }
  // };
  // endValueChange = () => {
  //   if (this.formData.avaliableTimeStart > this.formData.avaliableTimeEnd) {
  //     this.formData.avaliableTimeStart = null;
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
  //   if (endValue && !this.formData.avaliableTimeStart) {
  //     return (
  //       endValue.getTime() <=
  //         moment()
  //           .add(-1, 'days')
  //           .valueOf() || endValue.getTime() === Date.now()
  //     );
  //   }
  //   return endValue.getTime() <= this.formData.avaliableTimeStart.getTime();
  // };

  // get endTime() {
  //   if (!this.formData.avaliableTimeStart && !this.formData.avaliableTimeEnd) {
  //     return true;
  //   }
  //   return true;
  // }
  dateRangeChange(val) {
    console.log('val===', val);
  }
}

export const EventCouponActionV2: ng.IComponentOptions = {
  template: require('./event-coupon-action-v2.template.html'),
  controller: EventCouponActionV2Controller,
  bindings: {
    type: '@',
  },
};
