import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Inject,
  forwardRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { CODES, formatSrc, toImgDataURL } from 'app/utils';
import { getItem } from '@utils/storage';
import {
  NzNotificationService,
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';
import { EventGoodsPickerComponent } from '../../components/goods-picker/goods-picker.component';
import { EventAddCouponComponent } from '../../components/add-coupon/add-coupon.component';
import * as domtoimage from 'dom-to-image';
import * as _ from 'lodash';
import { seeUpload } from '../../../../services/see-upload/see-upload.service';
import { EventProductTableComponent } from '../../components/product-table/product-table.component';

const DEFAULT_ERROR_TYPE_MSG = {
  required: '你有未设置完成的信息,请补充完整后再提交',
};

type GroupTypeItem = {
  label: string;
  value: number;
  disabled?: boolean;
};

type ISku = {
  skuId: number;
  supplyPrice: number;
  skuPrice: number;
  price: number;
  promotionPrice?: number;
  status: number;
  grouponHeaderPrice?: number;
  grouponHeaderSkuCostPrice?: number;
};

type IProduct = {
  itemId: number;
  productMainImgUrl: string;
};

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
  lotteryTime?: string | Date;
  grouponSuccessNumber: number;
  // simulatedFlag: boolean;
  productId: number;
  status?: number;
  bannerUrl: string;
  productLimit?: number;
  productShareImgUrl: string;
  grouponShareImgUrlParticipate: string;
  couponId?: number;
  assistantFlag?: number;
  fansGroupFlag?: number;
  fansGroupName?: string;
  introduction?: string;
};

enum GROUP_EVENT_TYPE {
  SIMPE = 1,
  NEW_ONE = 2,
  LUCKY = 3,
  SUPER = 4,
  ATTRACT_NEW = 5,
}

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.less'],
})
export class EventFormComponent implements OnInit {
  @ViewChild(EventProductTableComponent)
  productTableComp: EventProductTableComponent;
  submitted = false;
  formGroup: FormGroup;
  bannerUrl: string;
  busy: boolean = false;
  isView: boolean = false;
  skuInput: any;
  grouponShareImgUrlOpen: string = '';
  grouponShareImgUrlParticipate: string = '';
  actTimeResult: number = 0;

  coupon: any[] = [];
  statusMap: string[] = [
    '',
    '审核中',
    '审核拒绝',
    '发放中',
    '已领完',
    '已结束',
    '还未到领取时间',
  ];

  modalVisible: boolean = false;
  modalTitle: string = '';
  modalText: string = '';

  private sellerPrivilege = ~~(document.cookie.match(
    '(^|; )seller_privilege=([^;]*)',
  ) || 0)[2];
  isAdmin = [7, 10, 25].includes(this.sellerPrivilege);
  isNewBrand = this.sellerPrivilege === 30;
  groupTypeConst: GroupTypeItem[] = [
    {
      label: '普通拼团',
      value: GROUP_EVENT_TYPE.SIMPE,
    },
    {
      label: '新人团',
      value: GROUP_EVENT_TYPE.NEW_ONE,
    },
    {
      label: '抽奖团',
      value: GROUP_EVENT_TYPE.LUCKY,
      disabled: this.isNewBrand,
    },
    {
      label: '拉新团',
      value: GROUP_EVENT_TYPE.ATTRACT_NEW,
      disabled: this.isNewBrand,
    },
  ];

  product: IProduct;

  // wechatId: string = this.$routeParams['wechat_id'];
  wechatId: string = 'test_wechat_id';
  type: string;
  title: string;
  errors: string[] = [];
  isSubmitting: boolean = false;
  formData: IItemData = {
    type: 1,
    // activityId: ~~this.$routeParams['id'] || undefined,
    // kolId: ~~this.$routeParams['kolId'] || undefined,
    activityId: 123 || undefined,
    kolId: 456 || undefined,
    activityName: '',
    grouponSuccessNumber: undefined,
    // simulatedFlag: true,
    productId: undefined,
    bannerUrl: '',
    productShareImgUrl: '',
    grouponShareImgUrlParticipate: '',
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
  // id: number = ~~this.$routeParams['id'] || undefined;
  id: number = 666 || undefined;
  item: IItemData = {
    ...this.formData,
    status: 0, // 默认为新建
  };
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
  } = {};
  generatedImg: string;
  base64Url: string;
  shareImgPrice = $(
    '.event-group-action .share-img-container .share-goods-info .share-goods-info__price h1',
  );
  minuteOptions = _.times(60, i => i);

  constructor(
    @Inject('seeUpload') private seeUpload: see.ISeeUploadService,
    private nzNotification: NzNotificationService,
    private fb: FormBuilder,
    private el: ElementRef,
    private eventService: EventService,
    private modalService: NzModalService,
    // private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {}

  get isShowResetFormBannerButton(): boolean {
    if (this.bannerUrl && this.product) {
      return this.bannerUrl.includes(this.getProductBannerUrl(this.product));
    }
    return false;
  }

  private getProductBannerUrl(product: IProduct): string {
    const productMainImgUrl = this.replaceHttpOrHttps(
      product.productMainImgUrl,
    );
    return `${productMainImgUrl}?imageMogr2/thumbnail/708x/gravity/center/crop/708x416`;
  }

  onFaceFileChange(event, fileInput) {
    // debugger;
    const file: any = _.get(event, 'target.files.0');
    if (file) {
      // 清空value属性，防止选择同一文件不会触发change事件，如点击恢复默认后再次点击上传同一图片
      fileInput.value = '';
      return this.seeUpload.readImageData(file).then((data: any) => {
        if (data.width === 708 && data.height === 416) {
          return this.seeUpload
            .uploadAuthImage(file)
            .then(res => (this.bannerUrl = res.data));
        }
        return this.nzNotification.create(
          'warning',
          '活动 Banner 尺寸要求 708x416',
          '',
          {
            nzDuration: 4500,
          },
        );
      });
    }
  }

  ngOnInit() {
    // 使用ActivateRoute中的queryParams来获取查询参数
    this.route.queryParams.subscribe(params => {
      const grouponTemplateActivityId = params.templateId;
      if (grouponTemplateActivityId) {
        this.busy = true;
        this.isView = true;
        const params = { grouponTemplateActivityId };
        this.eventService
          .getGrouponDetail(params)
          .pipe(
            catchError((error: any) => {
              // debugger;
              this.busy = false;
              return Observable.of(null);
            }),
          )
          .subscribe(res => {
            this.busy = false;
            if (res && res.data) {
              this.patchFormGroup(res.data);
            }
          });
      }
    });

    const formGroup = this.fb.group({
      type: [1],
      activityName: ['', Validators.required],
      productLimit: [null],
      rangeTime: [[null, null], Validators.required],
      grouponSuccessNumber: [null, Validators.required],
      // simulatedFlag: [true],
      hours: [null],
      minutes: [0, Validators.required],
      sku: [],
    });
    // formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));

    this.formGroup = formGroup;

    // this.validationMessages = {
    //   name: {
    //     required: '名称必填',
    //   },
    // };
  }

  get groupEventType() {
    return this.formGroup.get('type').value;
  }

  get isLuckyType() {
    return this.groupEventType === GROUP_EVENT_TYPE.LUCKY;
  }

  get isSuperType() {
    return this.groupEventType === GROUP_EVENT_TYPE.SUPER;
  }

  get isAttractNewType() {
    return this.groupEventType === GROUP_EVENT_TYPE.ATTRACT_NEW;
  }

  get grouponSuccessNumber() {
    return _.get(this.formGroup, 'value.grouponSuccessNumber');
  }

  private get isProductSkuValid() {
    return (
      this.product &&
      this.formGroup.value.sku &&
      this.formGroup.value.sku.length > 0
    );
  }

  // 最低拼团价格
  getMinGroupPrice(): number {
    const sku = _.get(this, 'formGroup.value.sku');
    if (sku) {
      const validSku = this.formGroup.value.sku.filter(sku => sku.status === 1);
      const minSkuPriceSku: number = _.get(
        _.minBy(validSku, 'price'),
        'price',
        0,
      );
      return minSkuPriceSku || 0;
    }
    return 0;
  }

  // 最低团长拼团价格
  getMinHeaderPrice(): number {
    const sku = _.get(this, 'formGroup.value.sku');
    if (sku) {
      const validSku = this.formGroup.value.sku.filter(sku => sku.status === 1);
      const minSkuHeaderPriceSku: number = _.get(
        _.minBy(validSku, 'grouponHeaderPrice'),
        'grouponHeaderPrice',
        0,
      );
      return minSkuHeaderPriceSku || 0;
    }
    return 0;
  }

  // onFormValueChanged(data?: any) {
  //   this.collectErrors();
  // }

  getFormIsValid: () => boolean = () => {
    // debugger;
    this.errors.length = 0;
    const grouponSuccessNumber = this.formGroup.get('grouponSuccessNumber')
      .value;
    if (
      !this.formGroup.valid ||
      !this.isProductSkuValid ||
      !this.bannerUrl ||
      !this.productTableComp.isValid() ||
      (this.isLuckyType && !this.coupon.length) ||
      this.actTimeResult !== 0 ||
      (!this.formGroup.get('hours').value &&
        this.formGroup.get('minutes').value === 0) ||
      isNaN(grouponSuccessNumber) ||
      grouponSuccessNumber < 2 ||
      (!this.formGroup.get('rangeTime').value[0] ||
        !this.formGroup.get('rangeTime').value[1])
      //   !this.verifySKURequired() ||
      //   !this.verifySKUStatusRequired() ||
      //   !_.isNumber(this.formData.grouponSuccessNumber) ||
      //   this.formData.grouponSuccessNumber < 2
    ) {
      return false;
    }
    return true;
  };

  resetProduct(): void {
    this.product = null;
    this.bannerUrl = null;
    // this.sameTriger = {}; // TODO 价格组件提供方法清空
  }

  resetFormBanner(): void {
    if (this.product && this.product.productMainImgUrl) {
      this.bannerUrl = this.getProductBannerUrl(this.product);
    }
  }

  collectErrors() {
    // TODO 考虑不用配置 formErrors,如果漏了配置就完蛋了
    const form = this.formGroup;
    Object.keys(form.controls).forEach(field => {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages =
          this.validationMessages[field] || '内容有误，请重新填写';
        for (const key in control.errors) {
          const msg = messages[key] || DEFAULT_ERROR_TYPE_MSG[key];
          this.formErrors[field] += msg + ' ';
        }
      }
    });
  }
  formErrors = {};
  validationMessages = {};

  async submit() {
    this.markAsDirty();
    this.submitted = true;
    this.isSubmitting = true;
    if (!this.getFormIsValid()) {
      console.log('>>>return error');
      return;
    }
    const formGroup = this.formGroup.value;

    /*
skuList: [
  {"skuId":1676187,
  "price":34,
  "skuPrice":"121.00",
  "promotionPrice":23,
  "status":1,
  "skuCostPrice":"55.00"},
  */

    try {
      const [
        // productShareImgUrl,
        // grouponShareImgUrlParticipate,
        widthHeight,
      ] = await Promise.all([
        // this.getDOMImageById('productShareImgUrl'),
        // this.getDOMImageById('grouponShareImgUrlParticipate'),
        this.loadImage(this.bannerUrl),
      ]);

      const {
        type,
        activityName,
        productLimit,
        rangeTime,
        grouponSuccessNumber,
        hours,
        minutes,
        sku,
      } = this.formGroup.value;
      const [startDate, endDate] = rangeTime;
      // tslint:disable-next-line no-this-assignment
      const { bannerUrl } = this;

      const params = {
        widthHeight,
        type,
        bannerUrl,
        activityName,
        productLimit,
        grouponSuccessNumber,
        // productShareImgUrl: this.replaceHttpOrHttps(productShareImgUrl),
        // grouponShareImgUrlParticipate: this.replaceHttpOrHttps(
        //   grouponShareImgUrlParticipate,
        // ),
        productId: this.product.itemId,
        startTime: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
        simulatedFlag: this.simulatedFlagInfo[type],
        assistantFlag: 1,
        fansGroupFlag: 0,
        lotteryTime: type === GROUP_EVENT_TYPE.LUCKY ? this.lotteryTime : '',
        termOfValidity: ~~hours * 60 + minutes,
        skuList: JSON.stringify(
          sku.map(item => ({
            skuId: item.skuId,
            price: item.price,
            skuPrice: item.skuPriceStart,
            promotionPrice: item.promotionPrice,
            grouponHeaderPrice: item.grouponHeaderPrice,
            grouponHeaderSkuCostPrice: item.grouponHeaderSkuCostPrice,
            status: item.status,
            skuCostPrice: item.productionCostPrice,
          })),
        ),
      };
      if (type === GROUP_EVENT_TYPE.LUCKY) {
        params['couponId'] = this.coupon[0].id;
        delete params.productLimit;
      }
      // console.log(sku);
      this.eventService
        .addGroupon(params) //
        .pipe(
          // TODO functional
          catchError((error: any) => {
            // debugger;
            this.isSubmitting = false;
            // TODO 所有都要抛出
            return Observable.of(null);
          }),
        )
        .subscribe(() => {
          // debugger;
          this.isSubmitting = false;
          this.router.navigate(['../assign'], {
            relativeTo: this.route,
          });
        });
      // lotteryTime
    } catch (e) {}
  }

  get lotteryTime() {
    const rangeTime = this.formGroup.value.rangeTime;
    if (rangeTime && rangeTime[1]) {
      return moment(rangeTime[1])
        .add(1, 'd')
        .set('hour', 11)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .format('YYYY-MM-DD HH:mm:ss');
    }
    return '';
  }

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
        this.nzNotification.create(
          'warning',
          '提示',
          '分享图片创建失败，请重试！',
        );
        throw new Error('分享图片创建失败，请重试！' + error);
      });
  }

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

  getFormControl(name) {
    return this.formGroup.controls[name];
  }

  openGoodsPicker(event) {
    if (event.target.tagName === 'A') {
      return;
    }
    if (this.isView) {
      return;
    }
    this.modalService
      .open({
        title: '添加商品',
        content: EventGoodsPickerComponent,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        componentParams: {},
      })
      .subscribe(item => {
        if (item.itemId) {
          this.resetPorduct(item);
        }
      });
  }

  resetPorduct(item) {
    if (item && item.itemId) {
      this.submitted = false;
      this.product = item;
      this.product['productName'] = this.product['productName'].slice(0, 40);
      this.bannerUrl = item.productMainImgUrl;
      this.getBase64Data(this.formatImg(item.productMainImgUrl));
    }
  }

  markAsDirty() {
    const form = this.formGroup;
    Object.keys(form.controls).forEach(field => {
      this.formErrors[field] = '';
      const control = form.get(field);
      control.markAsDirty();
    });
  }

  private getBase64Data(url: string): Promise<any> {
    return toImgDataURL(`${url}?imageView2/1/w/204/h/204/q/100`)
      .then(base64 => {
        this.base64Url = base64;
        // this.$scope.$apply(); // TODO
      })
      .catch(e => {
        throw new Error('转换图片至 base64 出错' + e);
      });
  }

  private formatImg(url: string): string {
    if (url.startsWith('http')) {
      return url.replace(/^https?\:\/\//, '//');
    }
    if (url.startsWith('/s')) {
      return `//image.seecsee.com${url}`;
    }
    return url;
  }

  private replaceHttpOrHttps(url: string): string {
    if (url.startsWith('http')) {
      return url.replace(/^https?\:\/\//, '//');
    }
    return url;
  }

  addProduct(groupForm) {}

  addCoupon() {
    this.modalService
      .open({
        title: '优惠券列表',
        content: EventAddCouponComponent,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        componentParams: {},
      })
      .subscribe(item => {
        if (typeof item === 'object' && item.id) {
          this.coupon = [item];
        }
      });
  }

  removeCouponItem() {
    this.coupon = [];
  }

  cancelCreate(dirty: boolean): void {
    if (dirty) {
      this.modalTitle = '返回拼团模板列表';
      this.modalText = '当前填写内容将丢失，是否确认返回？';
      this.modalVisible = true;
    } else {
      this.routeToBatchAssign();
    }
  }

  handleOk(e) {
    this.modalVisible = false;
    this.routeToBatchAssign();
  }

  handleCancel(e) {
    this.modalVisible = false;
  }

  private routeToBatchAssign(): void {
    this.router.navigate(['../assign'], {
      relativeTo: this.route,
    });
  }

  private isNil(input: string | number): boolean {
    return input === '' || _.isNil(input);
  }

  patchFormGroup(grouponDetail) {
    console.log('grouponDetail', grouponDetail);
    const {
      type,
      activityName,
      productLimit,
      grouponSuccessNumber,
      simulatedFlag,
      startTime,
      endTime,
      termOfValidity,
    } = grouponDetail;
    const rangeTime = [moment(startTime).toDate(), moment(endTime).toDate()];
    const hours = ~~(termOfValidity / 60);
    const minutes = termOfValidity - hours * 60;
    this.formGroup.patchValue({
      type,
      activityName,
      productLimit,
      grouponSuccessNumber,
      // simulatedFlag,
      rangeTime,
      hours,
      minutes,
    });
    this.simulatedFlagInfo[type] = !!simulatedFlag;

    const productMainImgUrl = grouponDetail.itemImgurl;
    const productName = grouponDetail.itemName;
    const itemId = grouponDetail.productId;

    this.skuInput = grouponDetail.skuList.map(item => {
      return {
        ...item,
        price: this.isNil(item.price) ? undefined : parseFloat(item.price),
        promotionPrice: this.isNil(item.promotionPrice)
          ? undefined
          : parseFloat(item.promotionPrice),
        grouponHeaderPrice: this.isNil(item.grouponHeaderPrice)
          ? undefined
          : parseFloat(item.grouponHeaderPrice),
        grouponHeaderSkuCostPrice: this.isNil(item.grouponHeaderSkuCostPrice)
          ? undefined
          : parseFloat(item.grouponHeaderSkuCostPrice),
      };
    });

    this.grouponShareImgUrlOpen = grouponDetail.grouponShareImgUrlOpen;
    this.grouponShareImgUrlParticipate =
      grouponDetail.grouponShareImgUrlParticipate;

    this.coupon = [grouponDetail.couponVO];

    const product = { productMainImgUrl, productName, itemId };
    this.resetPorduct(product);
  }

  validateActTime(value) {
    // debugger;
    if (!value.length || value[0] === null) {
      return;
    }
    if (moment(value[0]).isBefore(moment())) {
      this.actTimeResult = 1;
      return;
    }
    if (!moment(value[0]).isBefore(moment(value[1]))) {
      this.actTimeResult = 2;
      return;
    }
    this.actTimeResult = 0;
  }

  formatPrice(type) {
    const oldVal = this.formGroup.get(type).value;
    if (!oldVal) {
      return;
    }
    const newVal = parseInt(('' + oldVal).split('.')[0].replace(/\-/, ''), 10);
    this.formGroup.patchValue({
      [type]: newVal,
    });
  }

  initActTime() {
    if (this.formGroup.get('rangeTime').value[0]) {
      return;
    }
    const fiveMinAfter = new Date(Date.now() + 60 * 5 * 1000);
    this.formGroup.patchValue({
      rangeTime: [fiveMinAfter, fiveMinAfter],
    });
  }
}
