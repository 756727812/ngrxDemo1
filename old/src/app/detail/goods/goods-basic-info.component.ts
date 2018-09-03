import * as moment from 'moment';
import * as _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { ModalGoodsSelectSkuMark } from './modal-goods-select-sku-mark.component';

declare const UE: any;

const ueditor = {
  config: {
    // 工具栏上的所有的功能按钮和下拉框
    toolbars: [
      [
        'fullscreen',
        'source',
        '|',
        'undo',
        'redo',
        '|',
        'bold',
        'italic',
        'underline',
        'fontborder',
        'strikethrough',
        'superscript',
        'subscript',
        'removeformat',
        'formatmatch',
        'autotypeset',
        'blockquote',
        'pasteplain',
        '|',
        'forecolor',
        'backcolor',
        'insertorderedlist',
        'insertunorderedlist',
        'selectall',
        'cleardoc',
        '|',
        'rowspacingtop',
        'rowspacingbottom',
        'lineheight',
        '|',
        'customstyle',
        'paragraph',
        'fontfamily',
        'fontsize',
        '|',
        'directionalityltr',
        'directionalityrtl',
        'indent',
        '|',
        'justifyleft',
        'justifycenter',
        'justifyright',
        'justifyjustify',
        '|',
        'touppercase',
        'tolowercase',
        '|',
        'horizontal',
        'date',
        'time',
        '|',
        'inserttable',
        'deletetable',
        'insertparagraphbeforetable',
        'insertrow',
        'deleterow',
        'insertcol',
        'deletecol',
        'mergecells',
        'mergeright',
        'mergedown',
        'splittocells',
        'splittorows',
        'splittocols',
        '|',
        'print',
        'searchreplace',
      ],
    ],
    // initialContent: '请务必在此详细描述商品基本信息（例如服装的衣长，面料，采购渠道等），主要卖点，注意事项，商品交付形式和售后服务，要求字数大于20',
    autoClearinitialContent: true,
    enableAutoSave: false,
    saveInterval: 0,

    // 服务器统一请求接口路径
    serverUrl: undefined,
  },
  ready(editor) {
    // editor.execCommand('pasteplain')
    (<any>(<any>$.fn)).isInViewport = function() {
      const elementTop = $(this).offset().top;
      const elementBottom = elementTop + $(this).outerHeight();
      const viewportTop = $(window).scrollTop();
      const viewportBottom = viewportTop + $(window).height();
      return elementBottom > viewportTop && elementTop < viewportBottom;
    };
    const topbar = $('.topbar');
    const header = $('.main-content > .page-content .header');
    const pageContent = $('.main-content > .page-content');
    const ueditorToolBar = $('.edui-default.edui-editor-toolbarbox');
    const ueditorFrame = $('.edui-editor-iframeholder.edui-default');
    $(window).on('resize scroll', () => {
      if (
        topbar.offset().top + topbar.height() > ueditorToolBar.offset().top &&
        (<any>ueditorFrame).isInViewport()
      ) {
        topbar.hide();
        header.hide();
        pageContent.addClass('hide-after');
      } else {
        topbar.show();
        header.show();
        pageContent.removeClass('hide-after');
      }
    });
  },
};

export class goodsBasicInfoController {
  static $inject: string[] = [
    '$scope',
    '$q',
    '$location',
    '$timeout',
    '$routeParams',
    '$cookies',
    'Notification',
    '$uibModal',
    'seeModal',
    'ADDRESS',
    'SHIPFEECHARGE',
    'seeUpload',
    'dataService',
    '$window',
    'goodsService',
    'NzModalService',
  ];

  private page_from = decodeURIComponent(this.$routeParams.page_from);
  private mainImgCount = 5; // 商品图的数量的最大数量
  private item_img_list_index = 0; // 商品详细图的数量
  private resp_sku_list = [];
  private brandAdded = false;
  private item_main_img_list_index = 0; // 商品图的数量
  private sellerPrivilege = ~~this.$cookies.get('seller_privilege');
  private prevAttr6 = {
    sku_attr: Object.create(null),
    spu_attr: Object.create(null),
  };

  /** 判断用户输入的品牌是不是未被记录 */
  isNewBrand = false;
  areaError = [];
  nocityList = [];
  provinceList = [];
  showProvList = [];
  showCityList = [];
  ship_province = '';
  ship_city = '';
  hasChildProductInGroupon = false;
  in_warehouse = 0;
  block_update_msg = '';
  is_have_sku = 0;
  warning_flag = 0;
  unit_size = 1;
  // is_1688 = 0;
  cloud_sku_list = [];
  seller_id = this.$scope['seller_id'];
  goodsType = this.$location.path().split('/')[2];
  page_url = encodeURIComponent(this.$location['$$url']);
  item_id = this.$routeParams.goodId;
  class_id = this.$routeParams.classId;
  class_weight = 0;
  express_list = [];
  sameTriger = Object.create(null);
  formData = {
    item_info: {
      guarantee_cert_image: [],
      guarantee_cert_type: '1',
      item_main_img_list: Array(this.item_img_list_index),
      ex_id_list: [],
      currency: '人民币',
      ship_type: '1',
      ship_method: '10',
      ship_tax_flag: '0',
      is_ship_recv_promiss: '0',
      ship_recv_time: undefined,
      ship_send_time: undefined,
      in_warehouse: '0', // 选择商品类型
      promotion_start_time: null,
      promotion_end_time: null, // 促销时间段
      seller_id: undefined, // 这里用 Object.prototype 做原型，因为 AngularJS 判断 input 有值后会调用 value 的 toString 方法
      item_desc: '',
      size_table_imgurl: undefined,
      ship_country: undefined,
      distribution_status: undefined,
      is_stored: undefined,
      backend_id: undefined,
      item_real_weight: undefined,
      item_imgurl: undefined,
      item_name: '',
      ship_province: undefined,
      ship_city: undefined,
      item_img_list: [],
      ex_id_1: undefined,
      dealer_package_type: 1,
      seven_days_refund: '3',
      parent_id: '0',
    },
    item_brand: undefined,
    spu_attr: Object.create(null), // 存放非销售属性
    sku_attr: Object.create(null), // 存放销售属性
    sku_attr_list: [], // 以attr_id为主键的sku数组
    sku_list: [], //  以sku_id为主键的sku数组
    addAttr2CustomValue: Object.create(null),
    addAttr5CustomValue: Object.create(null),
    addAttr6CustomValue: Object.create(null),
    attr_length: Object.create(null), // 销售属性初始化选中个数（默认、自选）
  };
  errors = [];
  errorsMap = Object.create(null);
  category = {
    one: '',
    two: '',
    three: '',
  };
  is_edit = !!this.item_id;
  attrList = Object.create(null); // 存放当前商品品类对应的属性
  attrType5 = Object.create(null); // 存放非互斥分组多选
  express_desc_list = [];
  tooltip = {
    shipfee_free: `1、商品详情页将默认展示该商品支持的运费模版中，价格最低的路线对应的物流信息；<br>
2、当勾选展示为包邮时，商详页显示的商品价格将包含价格最低的运费模版的运费；<br>
3、当勾选展示为不包邮时，商详页显示的商品价格将不包含任何运费模版的运费，只有当用户下单购买、病选择运费模版后，运费将另外展示给用户，与商品价格分开叠加；<br>
4、举例：商品价格100，价格最低额物流运费模版运费为20。若勾选展示为包邮，则商详页显示的商品价格为120元，若勾选展示为不包邮，则商详页显示的商品价格为100元。`,
  };
  /**
   * 记录商品原有的促销时间段
   */
  promotion_data = {
    promotion_start_time: null,
    promotion_end_time: null,
  };
  last_sku_list = Object.create(null);
  last_sku_attr = Object.create(null);
  is_c2c = [1, 30].includes(this.sellerPrivilege); // C2C、New-Brand
  is_admin = [7, 10].includes(this.sellerPrivilege); // 超管、电商
  isOldC2C = this.sellerPrivilege === 1;
  is_new_brand = this.sellerPrivilege === 30;
  is_super_admin = this.sellerPrivilege === 7;
  skuError = [];
  ueditor = ueditor;
  is_disabled_sku_new = false;
  express_desc = '';
  formChecked = false;
  submitType;
  isInGroupon = false;
  isInSeckill = false;
  is_sku_disabled = false;
  class_tree = Object.create(null);
  countryList;
  btn_disabled = false;
  lastParam = null;
  isInDistribution = false;
  seven_days_refundDisabled = false;
  surport_seven_days_refund = true;
  unsurport_seven_days_refund = false;

  get isInOnSale() {
    return this.isInGroupon || this.isInSeckill;
  }

  get isInWarehouseNotDisabled() {
    const seller = this.formData.item_info.seller_id;
    if (seller) {
      return seller.seller_email !== '624977698@qq.com';
    }
    return true;
  }

  isQuhaodian: boolean; // 是否是趣好店
  dealerPackageList: any[];

  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $timeout: ng.ITimeoutService,
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: ng.cookies.ICookiesService,
    private notification: see.INotificationService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private seeModal: see.ISeeModalService,
    private ADDRESS,
    private SHIPFEECHARGE,
    private seeUpload: see.ISeeUploadService,
    private dataService: see.IDataService,
    private $window: ng.IWindowService,
    private goodsService,
    private modalService: NzModalService,
  ) {
    this.isQuhaodian = localStorage.getItem('is_quhaodian') === '1';
    this.dealerPackageList = [{ id: 1, name: '0.01元不发货礼包' }];
    try {
      this.formData.item_info.ship_send_time = JSON.parse(
        localStorage.getItem('ship_send_time'),
      );
    } catch (e) {
      console.error('转换预计发货时长出错', e);
    }
    /**
     * 判断用户输入的是否是原品牌库不存在的品牌
     */
    $scope.$watch('$ctrl.formData.item_brand', current => {
      if (_.isString(current)) {
        this.isNewBrand = true;
      } else if (_.isObject(current)) {
        this.isNewBrand = false;
      }
    });

    if (!this.is_edit) {
      $scope.$watch(
        '$ctrl.formData.sku_attr',
        (cur, pre) => {
          this.formData.sku_attr_list = this.formatSkuSpuAttrList(cur);
          this.formData.sku_list = this.skuListSimpler(
            this.formData.sku_attr_list,
          );
        },
        true,
      );

      $scope.$watch(
        '$ctrl.formData.item_info.seller_id',
        (cur: any, pre) => {
          if (
            Boolean(cur) &&
            Boolean(cur.seller_id) &&
            cur.seller_id !== pre.seller_id
          ) {
            if (cur.seller_id.seller_email !== '624977698@qq.com') {
              this.formData.item_info.in_warehouse = '0';
              this.in_warehouse = 0;
            }
            this.changeLogistic();
          }
        },
        true,
      );

      /**
       * 售价不得大于市场价
       */
      let timeout = $q.when();
      $scope.$watch(
        '$ctrl.formData.sku_list',
        sku_list => {
          $timeout.cancel(timeout);
          timeout = $timeout(() => this.changeLogistic(), 1000);
          this.handleSkuError();
        },
        true,
      );
    }
  }

  $onInit() {
    this.initializeUE();

    const promises = [
      this.renderAreaList(),
      this.renderCountryList(),
      this.getClassWeightById(this.class_id),
      this.getClassTree(this.class_id),
      this.getClassAttr(this.class_id),
    ];

    return this.$q.all(promises).then(() => {
      this.is_edit && this.editRenderItem();
      this.bindWarningBeforeUnload();
    });
  }

  $onDestroy() {
    this.$window.onbeforeunload = null;
    $(window).off('resize scroll');
  }

  private bindWarningBeforeUnload() {
    if (process.env.NODE_ENV === 'production') {
      this.$window.onbeforeunload = e => {
        const evt = e || this.$window.event;
        if (evt) {
          evt.returnValue = '您可能有数据没有保存';
        }
        return '您可能有数据没有保存';
      };
    }
  }

  // 初始化服务说明
  private init_service_desciption() {
    if (this.formData.item_info.parent_id !== '0') {
      this.seven_days_refundDisabled = true;
    } else {
      this.seven_days_refundDisabled = false;
    }
    this.surport_seven_days_refund =
      this.formData.item_info.seven_days_refund === '3';
    this.unsurport_seven_days_refund =
      this.formData.item_info.seven_days_refund === '2';
  }

  private initializeUE() {
    UE.registerUI('picturecenter', (editor, uiName) => {
      const btn = new UE.ui.Button({
        name: uiName,
        title: '图片库',
        cssRules: 'background-position: -726px -77px;',
        onclick: () => {
          this.goodsService
            .openPictureCenterModal(3)
            .then((result: string[]) => {
              result.map(src => {
                // 此处的 timeout 避免重复应用 $scope.$apply
                this.$timeout(() => {
                  editor.execCommand('insertimage', {
                    src: src.includes('http')
                      ? src
                      : `//img-qn.seecsee.com${src}`,
                  });
                });
              });
            });
        },
      });
      // 当点到编辑内容上时，按钮要做的状态反射
      editor.addListener('selectionchange', () => {
        const state = editor.queryCommandState(uiName);
        btn.setDisabled(state === -1 ? true : false);
        btn.setChecked(state === -1 ? false : state);
      });
      return btn;
    });
  }

  changeWareHoust() {
    this.in_warehouse = +this.formData.item_info.in_warehouse;
    if (this.in_warehouse === 1) {
      this.is_disabled_sku_new = true;
    }
    this.formData.sku_list.forEach(sku => {
      sku.sku_mark = undefined;
      sku.sku_stock = undefined;
      sku.warehouse_item_id = undefined;
    });
    this.handleSkuError();
  }

  openSelectSkuMark(index: number) {
    const selectedSkuMark = this.formData.sku_list[index].sku_mark;
    const skuId = this.formData.sku_list[index].sku_id;
    const modalFn = () => this.openSkuMarkModal(index, selectedSkuMark);
    if (this.is_edit && selectedSkuMark && skuId > -1) {
      if (this.isInOnSale) {
        this.seeModal.alertP(
          '编辑货号',
          '该商品正在参与拼团/秒杀活动，请先终止活动再修改货号',
          false,
          false,
        );
        return;
      }
      this.seeModal
        .confirmP('编辑货号', '若解绑货号，则为子商品锁定的库存会被释放')
        .then(modalFn);
    } else {
      modalFn();
    }
  }

  private openSkuMarkModal(index, selectedSkuMark) {
    const subscription = this.modalService.open({
      title: '选择商品',
      content: ModalGoodsSelectSkuMark,
      footer: false,
      maskClosable: false,
      width: 768,
      componentParams: {
        selectedSkuMark,
        skuId: this.formData.sku_list[index].sku_id,
        selectedSkuMarkList: this.formData.sku_list.map(o => o.sku_mark),
        // 发布时，待日后加了更多 See 仓账号后再做限制，目前有且只有一个 “外仓库624977698@qq.com”
        sellerId: _.get(
          this.formData.item_info,
          'seller_id.seller_id',
          undefined,
        ),
      },
    });
    subscription.subscribe(value => {
      if (value && value.id) {
        this.formData.sku_list[index].warehouse_item_id = value.id;
        this.formData.sku_list[index].sku_mark = value.itemNo;
        this.formData.sku_list[index].sku_stock = value.sellableStock;
        if (this.is_edit) {
          const stockSum = this.formData.sku_list[index].stock_sum;
          if (!!stockSum) {
            this.formData.sku_list[index].stock_sum.free_stock =
              value.sellableStock;
          } else {
            this.formData.sku_list[index].stock_sum = {
              free_stock: value.sellableStock,
              locked_stock: 0,
            };
          }
          this.formData.sku_list[index].supply_price = value.costPrice;
        }
      } else if (value && value.type === 'cancelSelect') {
        // 构建一个自定义的数据结构
        const m = value.itemNo;
        const i = this.formData.sku_list.findIndex(sku => sku.sku_mark === m);
        if (~i) {
          this.formData.sku_list[i].warehouse_item_id = null;
          this.formData.sku_list[i].sku_mark = null;
          this.formData.sku_list[i].sku_stock = null;
          if (this.is_edit) {
            this.formData.sku_list[index].stock_sum.free_stock = 0;
            this.formData.sku_list[index].supply_price = null;
          }
        }
      }
    });
  }

  uploadMain() {
    return this.goodsService
      .openPictureCenterModal(1, this.formData.item_info.item_main_img_list)
      .then(result =>
        this.formData.item_info.item_main_img_list.push(...result),
      );
  }

  uploadSizeImg() {
    return this.goodsService
      .openPictureCenterModal(
        2,
        null,
        this.formData.item_info.size_table_imgurl,
      )
      .then(result => (this.formData.item_info.size_table_imgurl = result[0]));
  }

  onSelectColors(key, index, { attr_id, is_sell_property, attrType5Arr }) {
    const model = <any>_.find(attrType5Arr, { attr_value_id: key });
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    let flag = true;
    _.forEach(this.formData[formKey][attr_id].value, (v, k) => {
      if (k !== index && v.selected.attr_value_id === model.attr_value_id) {
        this.notification.warn('『' + model.attr_value + '』属性值已被选择！');
        flag = false;
      }
    });
    if (flag) {
      this.selectAttrType5(model, attr_id, is_sell_property, index);
    }
  }

  /**
   * 获取商户账号列表
   */
  getSellerList(keyword: string) {
    return this.dataService
      .user_getAllSeller({ keyword, limit: 10 })
      .then(({ data }) => data.list);
  }

  handleSkuError(fieldName = '') {
    let b_status_empty = false;
    let b_status_price = false;
    let b_status_mark = false;
    const b_satus_inhouse_price = false;
    let b_status_supply_price = false;
    let b_status_sku_price = false;
    // let b_status_neg_num = false;
    this.warning_flag = 0;

    this.skuError = [];
    _.forEach(this.formData.sku_list, (v, k) => {
      if (this.is_c2c === false) {
        if (+this.in_warehouse === 1) {
          if (String(v.sku_set_type) === 'undefined') {
            v.sku_set_type = 0;
          }
          // 如果是囤货型的话
          if (
            String(v.init_set_warehouse_sku) === 'undefined' &&
            !this.is_admin
          ) {
            v.init_set_warehouse_sku = '1';
            v.cost_price = v.cost_price === null ? 0 : v.cost_price;
            v.supply_price = v.supply_price === null ? 0 : v.supply_price;
            v.sku_price = v.sku_price === null ? 0 : v.sku_price;
            v.sku_ori_price = v.sku_ori_price === null ? 0 : v.sku_ori_price;
            v.sku_stock = v.sku_stock === null ? 0 : v.sku_stock;
          }

          v.sku_mark = v.sku_mark === 'undefined' ? '' : v.sku_mark;
          if (v.sku_mark === '') {
            this.skuError.push(
              'sku（' + v.display_value.join('、') + '）的货号/条码不能为空！',
            );
            b_status_empty = true;
          }

          // 检查sku_mark是否重复
          for (
            let cur_i = 0;
            v.sku_mark !== '' && cur_i < Number(k);
            cur_i += 1
          ) {
            if (
              String(v.sku_mark) !== 'undefined' &&
              String(v.sku_mark) !== '' &&
              v.sku_mark === this.formData.sku_list[cur_i].sku_mark
            ) {
              this.skuError.push(
                'sku（' +
                  v.display_value.join('、') +
                  '）的货号/条码重复，请检查！',
              );
              b_status_mark = true;
            }
          }

          if (this.is_edit) {
            if (
              (v.cost_price <= 0 ||
                v.suggested_retail_price_from <= 0 ||
                v.suggested_retail_price_to <= 0) &&
              v.sku_id > 0 &&
              +this.in_warehouse === 1 &&
              v.sku_stock > 0 &&
              this.formData.item_info.distribution_status > 0
            ) {
              this.skuError.push(
                'sku（' +
                  v.display_value.join('、') +
                  '）的供货价不能为空或0！',
              );
            }
          }
        }
      }

      // 新品牌角色 不对成本价做判断
      // 管理员、旧C2C角色对非囤货型商品不判断
      // 进销存新增：管理员不对库存为0的 SEE 仓（囤货型）商品做判断
      if (
        !this.is_new_brand &&
        !((this.is_admin || this.isOldC2C) && +this.in_warehouse === 0) &&
        !(this.is_admin && +this.in_warehouse === 1) &&
        v.sku_stock > 0
      ) {
        if (typeof v.supply_price !== 'number') {
          this.skuError.push(
            'sku（' + v.display_value.join('、') + '）的成本价不能为空！',
          );
          b_status_empty = true;
        }
      } else {
        if (+this.in_warehouse === 1 && v.sku_stock > 0) {
          if (v.supply_price === 0 || v.supply_price === '0') {
            b_status_supply_price = true;
          }
        }
        if (v.sku_price === 0 || v.sku_price === '0') {
          b_status_sku_price = true;
        }
      }
      let is_check_cur = false;
      if (!_.isNil(v.sku_set_type)) {
        if (+v.sku_set_type === 1) {
          is_check_cur = true;
          if (
            v.sku_set_supply_price >= 0 &&
            v.sku_price >= 0 &&
            v.sku_ori_price >= 0 &&
            !(v.sku_price <= v.sku_ori_price)
          ) {
            if (
              this.is_new_brand ||
              (this.isOldC2C && +this.in_warehouse === 0)
            ) {
              this.skuError.push('市场价需大于售价');
            } else {
              this.skuError.push(
                'sku（' +
                  v.display_value.join('、') +
                  '）的价格填写有误，需满足成本价≤See建议售价≤市场价！',
              );
            }
            b_status_price = true;
          }
          if (
            v.sku_set_supply_price > v.cost_price ||
            v.sku_set_supply_price >= v.sku_price
          ) {
            this.warning_flag = 1;
          }
        }
      }

      if (!(v.sku_price <= v.sku_ori_price)) {
        b_status_price = true;
      }
      // if (this.is_admin) {
      //   if (
      //     Number(this.in_warehouse) === 1 &&
      //     (v.cost_price > v.suggested_retail_price_from ||
      //       v.suggested_retail_price_from > v.suggested_retail_price_to)
      //   ) {
      //     b_status_price = true;
      //   }
      // }

      if (typeof v.sku_price !== 'number') {
        b_status_empty = true;
        this.skuError.push(
          'sku（' + v.display_value.join('、') + '）的See建议售价不能为空！',
        );
      }
      if (typeof v.sku_ori_price !== 'number') {
        b_status_empty = true;
        this.skuError.push(
          'sku（' + v.display_value.join('、') + '）的市场价不能为空！',
        );
      }
      if (this.is_edit) {
        if (this.formData.item_info.is_stored === '0' && v.sku_stock === null) {
          b_status_empty = true;
          this.skuError.push(
            'sku（' + v.display_value.join('、') + '）的库存不能为空！',
          );
        }
      } else if (typeof v.sku_stock !== 'number') {
        b_status_empty = true;
        this.skuError.push(
          'sku（' + v.display_value.join('、') + '）的库存不能为空！',
        );
      }
    });

    console.warn(this.skuError);

    this.skuError = [];
    if (b_status_empty) {
      this.skuError.push('请完善规格表必填项');
    }

    // if (b_status_neg_num) {
    //   this.skuError.push('供货价、建议售价需必填并大于0');
    // }
    if (b_satus_inhouse_price) {
      this.skuError.push(
        '请重新检查报价，需满足 0<最新成本价≤售价≤市场价，最新成本价≤默认供货价',
      );
    } else if (b_status_price) {
      if (this.is_new_brand || this.is_admin) {
        this.skuError.push('请重新检查报价，需满足 0＜售价≤市场价');
      } else if (Number(this.in_warehouse) === 1) {
        this.skuError.push(
          '请重新检查报价，需满足 供货价≤最低建议零售价≤最高建议零售价；售价≤市场价',
        );
      } else {
        this.skuError.push('请重新检查报价，需满足 售价≤市场价');
      }
    }
    if (b_status_supply_price) {
      this.skuError.push('成本价不能为0');
    }
    if (b_status_sku_price) {
      this.skuError.push('日常售价不能为0');
    }

    // this.control1688Sku();
  }

  /**
   * 判断是否有选择1688 规格
   */
  // private control1688Sku() {
  //   if (!this.is_1688) {
  //     return;
  //   }
  //   if (
  //     this.formData.sku_list.length === 0 ||
  //     this.cloud_sku_list.length === 0
  //   ) {
  //     return;
  //   }

  //   let is_set_2 = false;
  //   _.forEach(this.formData.sku_list, (v, k) => {
  //     // 判断是否有选择
  //     if (+v.cloud_sku_id === 0 || typeof v.cloud_sku_id === 'undefined') {
  //       this.skuError.push(
  //         '1688（' + v.display_value.join('、') + '）请选择1688商品规格',
  //       );
  //     }

  //     // 判断是否有重复选择
  //     _.forEach(this.formData.sku_list, (v2, k2) => {
  //       if (
  //         is_set_2 === false &&
  //         Number(v.cloud_sku_id) > 0 &&
  //         Number(v2.cloud_sku_id) > 0 &&
  //         Number(k) !== Number(k2)
  //       ) {
  //         if (Number(v.cloud_sku_id) === Number(v2.cloud_sku_id)) {
  //           this.skuError.push(
  //             '1688（' +
  //               v2.display_value.join('、') +
  //               '）请检查1688商品规格，不能重复选择',
  //           );
  //           is_set_2 = true;
  //         }
  //       }
  //     });
  //   });
  // }

  selectStoreId(sku_id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-select-store-id.html'),
      controller: 'modalSelectStoreIdController',
      controllerAs: 'vm',
      size: 'lg',
      backdrop: 'static',
      resolve: {
        sku_id: () => sku_id,
        backend_id: () => this.formData.item_info.backend_id,
      },
    });
    modalInstance.result.then(list_storage_allot_id => {
      return this.dataService
        .storage_bindSkuAllot({
          sku_id,
          list_storage_allot_id,
          backend_id: this.formData.item_info.backend_id,
        })
        .then(() => {
          this.notification.success('库存绑定成功！');
        });
    });
  }

  changeArea() {
    if (typeof this.ship_province === 'undefined') {
      this.ship_province = '';
    }
    if (typeof this.ship_city === 'undefined') {
      this.ship_city = '';
    }

    this.areaError = [];
    this.showProvList = [];
    if (
      this.formData.item_info.ship_country &&
      this.formData.item_info.ship_country === '中国大陆'
    ) {
      // 选择省份
      let index = 0;
      _.forEach(this.provinceList, (v, k) => {
        this.showProvList.push({ key: index, value: v.province });
        index += 1;
      });
    } else {
      this.ship_province = '';
      this.ship_city = '';
    }
    this.changeProvince();
  }

  private changeProvince() {
    this.showCityList = [];
    if (this.ship_province !== '') {
      _.forEach(this.provinceList, (v, k) => {
        if (v.province === this.ship_province && v.no_city === false) {
          let index = 0;
          _.forEach(v.city, (city, j) => {
            this.showCityList.push({ key: index, value: city });
            index += 1;
          });
          return true;
        }
      });
    }

    let city_in = false;
    _.forEach(this.showCityList, (city, j) => {
      if (city.value === this.ship_city) {
        city_in = true;
        return true;
      }
    });
    if (!city_in) {
      this.ship_city = '';
    }

    if (this.ship_province === '' && this.showProvList.length > 0) {
      this.areaError.push('请选择省份');
    }
    if (this.ship_city === '' && this.showCityList.length > 0) {
      this.areaError.push('请选择城市');
    }
  }

  funcSkuSet(sku, type) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-goods-sku-set.html'),
      controller: 'modalGoodsSkuSetController',
      controllerAs: 'vm',
      size: 'md',
      backdrop: false,
      resolve: {
        type: () => type,
        sku: () => sku,
      },
    });
    modalInstance.result.then(formData => formData);
  }

  syncChildSkuConfirm(skuId) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'modalSyncChildSku',
      size: 'md',
      backdrop: false,
      resolve: { sku_id: () => skuId },
    });
  }

  /**
   * 触发切换品类、货币、发货地和更改sku后重新获取运费模版信息
   */
  changeLogistic(forceFetch = false) {
    // 省市判断
    this.changeArea();

    // 判断运费模版变化
    if (this.formData.item_info.ship_country) {
      const max = _.maxBy(this.formData.sku_list, o => {
        return o['sku_price'];
      });
      const max_sku_price = this.formData.sku_list.length
        ? max
          ? max['sku_price']
          : null
        : 0;

      return this.getGoodsExpress(
        this.formData.item_info.ship_country,
        max_sku_price,
        this.formData.item_info.item_real_weight,
        forceFetch,
      ).catch(e => e);
    }
  }

  changeSkuCloud1688(sku) {
    sku.cloud_info = {
      id: '',
      label: '',
      stock: '',
      unit: '',
    };
    _.forEach(this.cloud_sku_list, (v, k) => {
      if (Number(sku.cloud_sku_id) === Number(v.id)) {
        sku.cloud_info = v;
        sku.sku_stock = this.unit_size * sku.cloud_info.stock;
        return true;
      }
    });
  }

  changeUnitSize() {
    _.forEach(this.formData.sku_list, (sku, k) => {
      if (
        !(typeof sku.cloud_sku_id === 'undefined' || +sku.cloud_sku_id === 0)
      ) {
        sku.sku_stock = this.unit_size * sku.cloud_info.stock;
      }
    });
  }

  getExpressDesc() {
    this.dataService
      .express_getExpressDesc({
        expressId: this.formData.item_info.ex_id_list[0],
      })
      .then(({ data }) => {
        this.express_desc = data ? data.expressDesc : '';
      });
  }

  /**
   * 新建品牌模态框
   */
  addNewBrandModal() {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-add-new-brand.template.html'),
      controller: 'addNewBrandCtrl',
      controllerAs: 'anbc',
      size: 'lg',
      backdrop: false,
      resolve: {
        brand_name: () => this.formData.item_brand,
      },
    });
    modalInstance.result.then(formData => {
      return this.dataService.item_addBrand(formData).then(res => {
        this.brandAdded = true;
        this.formData.item_brand = formData.brand_name;
        this.isNewBrand = false;
        this.notification.success('添加品牌成功！');
      });
    });
  }

  /**
   * 交换图片数组元素位置，实现图片左右移动
   */
  changeOrder(index1, index2, type) {
    switch (type) {
      case 'item_main_img':
        this.swapArrEle(
          this.formData.item_info.item_main_img_list,
          index1,
          index2,
        );
        break;
      default:
      // swapArrEle(this.formData.item_info.item_img_list, index1, index2);
    }
  }

  /**
   * 删除已上传的图片
   */
  delImage(type, index) {
    switch (type) {
      case 'item_imgurl':
        this.formData.item_info.item_imgurl = null;
        break;
      case 'item_main_img_list':
        this.formData.item_info.item_main_img_list.splice(index, 1);
        break;
      case 'guarantee_cert_image':
        if (Array.isArray(this.formData.item_info.guarantee_cert_image)) {
          this.formData.item_info.guarantee_cert_image.splice(index, 1);
        }
        break;
      case 'size_table_imgurl':
        this.formData.item_info.size_table_imgurl = '';
        break;
      default:
        return;
    }
  }
  /**
   * 上传商品保障证书图片
   */
  uploadCertificateImg(file) {
    console.log('file-==========', file);
    if (!file) {
      return;
    }
    if (!Array.isArray(this.formData.item_info.guarantee_cert_image)) {
      this.formData.item_info.guarantee_cert_image = [];
    }
    if (this.formData.item_info.guarantee_cert_image.length > 1) {
      return;
    }
    const minWidth: number = 550;
    const minHeight: number = 810;
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      const img = new Image();
      img.src = result;
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        console.log(width + '======' + height + '=====' + file.size);
        if (width !== minWidth || height !== minHeight) {
          return this.notification.warn('请上传尺寸 550 * 810 的图片！');
        }
        this.seeUpload.uploadImage(file, data => {
          this.formData.item_info.guarantee_cert_image.push(data);
        });
      };
      img.src = result;
    };

    reader.readAsDataURL(file);
  }

  /**
   * 上传sku图片
   */
  uploadSkuImg(file, attr_type, attr_id, key, type) {
    this.seeUpload.uploadImage(file, data => {
      if (
        Object.hasOwnProperty.call(this.formData.sku_attr[attr_id][type], key)
      ) {
        this.formData.sku_attr[attr_id][type][key].sku_imgurl = data;
      } else {
        this.formData.sku_attr[attr_id][type][key] = {
          sku_imgurl: data,
        };
      }
    });
  }

  /**
   * 删除上传的sku图片
   */
  deleteSkuImg(attr_type, attr_id, key, type) {
    this.formData.sku_attr[attr_id][type][key].sku_imgurl = '';
  }

  /**
   * 设置多选属性在价格表格里的展示名称
   * @param { attr_id: Number } 当前互斥分组多选属性的属性ID
   * @param { key: Number } 当前选项的索引key
   * @param { attr_value: String } 当前选项的显示值
   * @param { is_sell_property: String } 该属性是否是销售属性 '1': 是；'0': 不是
   */
  setAttrType2Value(attr_id, key, attr_value, is_sell_property) {
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    this.formData[formKey][attr_id].value[key].attr_value = attr_value;
  }

  /**
   * 给当前多选属性添加自定义属性
   * @param { attr_id: Number } 当前互斥分组多选属性的属性ID
   * @param { is_sell_property: String } 该属性是否是销售属性 '1': 是；'0': 不是
   */
  addAttrType2Custom(attr_id, is_sell_property) {
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    const attrType = is_sell_property === '1' ? 'sell' : 'common';
    const customValue = this.formData.addAttr2CustomValue;
    if (
      Object.hasOwnProperty.call(customValue, attr_id) &&
      customValue[attr_id].trim()
    ) {
      let flag = true;
      const value = customValue[attr_id].trim();
      if (this.formData[formKey][attr_id]) {
        _.forEach(this.formData[formKey][attr_id].custom, (v, k) => {
          if (v.attr_value === value) flag = false;
        });
      } else {
        this.formData[formKey][attr_id] = {
          attr_type: '2',
          value: Object.create(null),
          custom: [],
        };
      }
      const own_attr_list = this.attrList[attrType].filter(
        o => o.attr_id === attr_id,
      )[0].option_values;

      _.forEach(own_attr_list, (v, k) => {
        if (v.attr_value === value) flag = false;
      });
      if (flag) {
        this.formData[formKey][attr_id].custom.push({
          is_checked: true,
          attr_value: value,
        });
        this.formData.addAttr2CustomValue[attr_id] = '';
      } else {
        this.notification.warn(
          '『' +
            this.formData.addAttr2CustomValue[attr_id] +
            '』属性值已存在，请勿重复自定义！',
        );
      }
    }
  }

  /**
   * 非互斥分组多选新增选项
   * @param { attr_id: Number } 当前互斥分组多选属性的属性ID
   * @param { type: String } 新增的是预定义还是自定义属性  'value': 预定义; 'custom': 自定义
   * @param { is_sell_property: String } 该属性是否是销售属性 '1': 是；'0': 不是
   */
  addAttrType5(attr_id, type, is_sell_property) {
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    const attrType = is_sell_property === '1' ? 'sell' : 'common';
    const customValue = this.formData.addAttr5CustomValue;
    if (type === 'value') {
      const last_selected = _.last(this.formData[formKey][attr_id][type])[
        'selected'
];
      if (!_.keys(last_selected).length) return;
      this.formData[formKey][attr_id][type].push({
        is_checked: false,
        selected: Object.create(null),
      });
    } else if (type === 'custom') {
      if (customValue[attr_id] && customValue[attr_id].trim()) {
        let flag = true;
        const value = customValue[attr_id].trim();
        const own_attr_list = this.attrList[attrType].filter(
          o => o.attr_id === attr_id,
        )[0].groups;
        if (this.formData[formKey][attr_id]) {
          _.forEach(this.formData[formKey][attr_id].custom, (v, k) => {
            if (v.attr_value === value) flag = false;
          });
        } else {
          this.formData[formKey][attr_id] = {
            attr_type: '5',
            value: [
              {
                is_checked: false,
                selected: Object.create(null),
              },
            ],
            custom: [],
          };
        }
        _.forEach(own_attr_list, (v1, k1) => {
          _.forEach(v1.values, (v2, k2) => {
            if (v2.attr_value === value) flag = false;
          });
        });
        if (flag) {
          this.formData[formKey][attr_id].custom.push({
            is_checked: true,
            attr_value: value,
            attr_value_id: -1,
          });
          this.formData.addAttr5CustomValue[attr_id] = '';
        } else {
          this.notification.warn(
            '『' +
              this.formData.addAttr5CustomValue[attr_id] +
              '』属性值已存在，请勿重复自定义！',
          );
        }
      }
    }
  }

  /**
   * 非互斥分组多选属性中，选中了属性值后自动勾选
   * @param { model: Object } 当前选中的选项
   * @param { attr_id: Number } 当前互斥分组多选属性的属性ID
   * @param { is_sell_property: String } 该属性是否是销售属性 '1': 是；'0': 不是
   * @param { index: number } 原值数组里的索引
   */
  private selectAttrType5(model, attr_id, is_sell_property, index) {
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    this.formData[formKey][attr_id].value[index].selected = model;
    this.formData[formKey][attr_id].value[index].is_checked = true;
    this.addAttrType5(attr_id, 'value', is_sell_property);
  }

  /**
   * 互斥分组多选中选项发生变化时清空原来的选择值
   * @param { attr_id: Number } 当前互斥分组多选属性的属性ID
   * @param { is_sell_property: String } 该属性是否是销售属性 '1': 是；'0': 不是
   */
  clearAttrType6(attr_id, is_sell_property) {
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    if (this.prevAttr6[formKey][attr_id]) {
      this.seeModal.confirm(
        '确认切换',
        '确认切换' +
          this.formData[formKey][attr_id].attr_name +
          '后，已勾选的原属性值和自定义属性值将丢失。',
        () => {
          this.prevAttr6[formKey][attr_id] = this.formData[formKey][
            attr_id
].group_id;
          this.formData[formKey][attr_id].value = Object.create(null);
          this.formData[formKey][attr_id].custom.length = 0;
        },
        () => {
          this.formData[formKey][attr_id].group_id = this.prevAttr6[formKey][
            attr_id
];
        },
      );
    } else {
      this.prevAttr6[formKey][attr_id] = this.formData[formKey][
        attr_id
].group_id;
      this.formData[formKey][attr_id].value = Object.create(null);
      this.formData[formKey][attr_id].custom.length = 0;
    }
  }

  /**
   * 设置互斥分组多选在价格表格里的展示名称
   * @param { attr_id: Number } 当前互斥分组多选属性的属性ID
   * @param { key: Number } 当前选项的索引key
   * @param { attr_value: String } 当前选项的显示值
   * @param { is_sell_property: String } 该属性是否是销售属性 '1': 是；'0': 不是
   */
  setAttrType6Value(attr_id, key, attr_value, is_sell_property) {
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    this.formData[formKey][attr_id].value[key].attr_value = attr_value;
  }

  /**
   * 给当前互斥分组多选属性添加自定义属性
   * @param { attr_id: Number } 当前互斥分组多选属性的属性ID
   */
  addAttrType6Custom(attr_id, is_sell_property) {
    const formKey = is_sell_property === '1' ? 'sku_attr' : 'spu_attr';
    const attrType = is_sell_property === '1' ? 'sell' : 'common';
    const customValue = this.formData.addAttr6CustomValue;
    if (
      Object.hasOwnProperty.call(customValue, attr_id) &&
      customValue[attr_id].trim()
    ) {
      let flag = true;
      const value = customValue[attr_id].trim();
      const own_attr_list = this.attrList[attrType].filter(
        o => o.attr_id === attr_id,
      )[0].ways;
      _.forEach(this.formData[formKey][attr_id].custom, (v, k) => {
        if (v.attr_value === value) flag = false;
      });
      _.forEach(
        own_attr_list[this.formData[formKey][attr_id].group_id].values,
        (v, k) => {
          if (v.attr_value === value) flag = false;
        },
      );
      if (flag) {
        this.formData[formKey][attr_id].custom.push({
          is_checked: true,
          attr_value: value,
        });
        this.formData.addAttr6CustomValue[attr_id] = '';
      } else {
        this.notification.warn(
          '『' +
            this.formData.addAttr6CustomValue[attr_id] +
            '』属性值已存在，请勿重复自定义！',
        );
      }
    }
  }
  /**
   * 统一设置价格和库存
   * 要设置的类型 'sku_ori_price': 市场价; 'sku_price': 售价; 'sku_stock': 库存 'sku_mark': 货号
   */
  setSame() {
    Object.keys(this.sameTriger)
      .filter(key => !_.isNil(this.sameTriger[key]))
      .forEach(key => {
        this.formData.sku_list.forEach(sku => {
          sku[key] = this.sameTriger[key];
        });
      });
    Object.keys(this.sameTriger).forEach(key => {
      this.sameTriger[key] = undefined;
    });
  }
  /**
   * 删除sku
   * @param { index: number } sku数组里的索引
   * @param { sku_id: number } 该条sku的id，用来删除编辑商品里的原有sku
   */
  deleteSku(index, sku_id) {
    this.seeModal.confirm(
      '删除SKU',
      `
      <span class="text-danger" style="font-weight: bolder;">
        确认删除该SKU？一旦确认删除，该SKU将立刻失效，且不可恢复！
      </span>
      `,
      () => {
        this.formData.sku_list.splice(index, 1);
        +sku_id !== -1 && this.deleteSkuService(this.item_id, sku_id);
      },
    );
  }

  /**
   * 提交保存
   * @param warehouse true: 保存商品至仓库（下架商品）
   */
  save(warehouse = false) {
    this.formChecked = true;
    if (warehouse === false) {
      this.submitType = 1;
      // 错误信息处理
      this.controlFormError();
      this.errorsMap = _.mapValues(_.keyBy(this.errors, 'name'), 'errors');
      if (this.errors.length > 0) return;
    } else {
      if (this.isInGroupon) {
        this.notification.warn(
          '该商品已配置了待开始或者正在进行中的拼团活动，可先联系 SEE 研发使活动失效再下架',
        );
        return;
      }
      this.submitType = 2;
      if (
        this.is_admin &&
        (!this.formData.item_info.seller_id ||
          _.isString(this.formData.item_info.seller_id))
      ) {
        return;
      }
      if (!this.formData.item_info.item_name) {
        return;
      }
    }
    let modal_flag = false;
    const new_sku_list: any[] = _.filter(
      this.formData.sku_list,
      obj => +obj['sku_id'] === -1,
    );
    const old_sku_list: any[] = _.filter(
      this.formData.sku_list,
      obj => +obj['sku_id'] > -1,
    );

    if (
      this.is_edit &&
      new_sku_list.length > 0 &&
      this.formData.item_info.distribution_status > 1 &&
      +this.in_warehouse === 0
    ) {
      this.warning_flag = 2;
    }

    if (this.is_edit && this.is_c2c && this.last_sku_list.length > 0) {
      old_sku_list.forEach((sku, index) => {
        if (sku.supply_price !== this.last_sku_list[index].supply_price) {
          modal_flag = true;
        }
      });
    }

    modal_flag &&
      this.seeModal.confirmP(
        '友情提示',
        `
        <p>
          商品被
          <span class="text-primary">调整成本价</span>
          后，需要See工作人员
          <span class="text-primary">审核后才能生效</span>
          噢！See将在
          <span class="text-primary">2天内</span>
          处理你的调价申请。
        </p>
        <p>
          <a href="/goods/myPriceAdjustApply" class="text-primary">点击此处</a>
          查看你的调价申请列表。
        </p>
      `,
        '我知道了',
        false,
      );

    const item_info: any = {
      ...this.formData.item_info,
      seller_id: _.get(this.formData.item_info, 'seller_id.seller_id'),
      brand_name: _.isObject(this.formData.item_brand)
        ? this.formData.item_brand.brand_name
        : this.formData.item_brand,
      class_id: this.class_id,
      ex_id_list: JSON.stringify(
        this.formData.item_info.ex_id_list.slice(0, 1),
      ), // 只保留一条运费模版
      ship_send_time: JSON.stringify(this.formData.item_info.ship_send_time),
      ship_recv_time: JSON.stringify(this.formData.item_info.ship_recv_time),
      in_promotion:
        !(this.is_edit && this.is_c2c) &&
        (this.formData.item_info.promotion_start_time &&
        this.formData.item_info.promotion_start_time
          ? '1'
          : '0'),
      promotion_start_time:
        !(this.is_edit && this.is_c2c) &&
        (this.formData.item_info.promotion_start_time &&
          moment(this.formData.item_info.promotion_start_time).format(
            'YYYY-MM-DD HH:mm:ss',
          )),
      promotion_end_time:
        !(this.is_edit && this.is_c2c) &&
        (this.formData.item_info.promotion_end_time &&
          moment(this.formData.item_info.promotion_end_time).format(
            'YYYY-MM-DD HH:mm:ss',
          )),
      operate_type: !warehouse ? 1 : 0,
    };
    localStorage.setItem('ship_send_time', item_info.ship_send_time);
    localStorage.setItem('ship_recv_time', item_info.ship_recv_time);

    const spu_attr = this.paramizeSpuAttr(this.formData.spu_attr);

    if (item_info.guarantee_cert_type === '1') {
      item_info.guarantee_cert_image = '';
    }

    // 删除的SKU将其字段 ispublic 设为0
    const removedSkuList = [];
    if (this.is_edit) {
      const old_sku_list: any[] = _.filter(
        this.formData.sku_list,
        obj => +obj['sku_id'] > -1,
      );
      _.forEach(this.last_sku_list, sku => {
        if (
          _.isNil(_.find(old_sku_list, o => (o as any).sku_id === sku.sku_id))
        ) {
          sku.ispublic = 0;
          removedSkuList.push(sku);
        }
      });
    }

    const sku_list = [...this.formData.sku_list, ...removedSkuList];
    _.forEach(sku_list, (v, k) => {
      v.sku_stock_delta = 0;
      if (this.is_edit && +this.in_warehouse === 1) {
        if (String(v.sku_set_type) !== 'undefined') {
          if (Number(v.sku_set_type) === 1) {
            v.supply_price = v.sku_set_supply_price;
            v.sku_stock_delta = v.sku_set_sku_stock_delta;
          } else if (Number(v.sku_set_type) === 2) {
            v.sku_stock_delta = -v.sku_set_sku_stock_delta;
          }
        }
      }
      delete v.$$hashKey;
      v.currency = this.formData.item_info.currency;
    });

    item_info.unit_size = this.unit_size;
    item_info.ship_province = this.ship_province;
    item_info.ship_city = this.ship_city;
    item_info.item_real_weight = _.isUndefined(item_info.item_real_weight)
      ? '-1'
      : item_info.item_real_weight;
    const params = {
      item_info: JSON.stringify(
        item_info,
        (k, v) => (_.isUndefined(v) ? '' : v),
      ),
      spu_attr: JSON.stringify(spu_attr),
      sku_list: JSON.stringify(sku_list),
    };
    // return console.log("params========",params);
    return this.$q(resolve => {
      switch (this.warning_flag) {
        case 1:
          this.seeModal
            .confirmP(
              '提示',
              '该商品“供货价”或“日常售价”比“成本价”低，会导致亏本售卖，确认当前操作吗？',
              '确定',
              '取消',
            )
            .then(() => resolve());
          break;
        case 2:
          this.seeModal
            .confirmP(
              '提示',
              '该商品正在供货中，请在“供货商品管理”内，通过“调价”操作，设置新SKU的分销信息，否则分销方不会同步新SKU的信息',
              '知道了',
              '取消',
            )
            .then(() => resolve());
          break;
        default:
          resolve();
      }
    }).then(() => {
      const func = () =>
        this.is_edit
          ? this.editProduct(params, warehouse)
          : this.addProduct(params, warehouse);
      if (!this.is_edit && +this.in_warehouse === 1) {
        return this.addProduct(params);
      }
      if (warehouse === true) {
        return func();
      }
      return this.checkGoodsExpress().then(() => func());
    });
  }

  clickSubmit(type) {
    this.submitType = type;
  }

  change_seven_days_refund(ev, str) {
    let _refund = '3';
    if (!str && this.surport_seven_days_refund) {
      _refund = '3';
      this.unsurport_seven_days_refund = false;
    }
    if (str && this.unsurport_seven_days_refund) {
      _refund = '2';
      this.surport_seven_days_refund = false;
    }
    if (!this.surport_seven_days_refund && !this.unsurport_seven_days_refund) {
      _refund = '1';
    }
    this.formData.item_info.seven_days_refund = _refund;
  }

  private editRenderItem() {
    this.getProduct(this.item_id).then(() => {
      const max_sku_price = this.formData.sku_list.length
        ? _.maxBy(this.formData.sku_list, o => o['sku_price'])['sku_price']
        : 0;
      this.formData.item_info.item_real_weight =
        this.formData.item_info.item_real_weight > 0
          ? this.formData.item_info.item_real_weight
          : '';
      if (this.formData.item_info.ship_country && max_sku_price) {
        this.getGoodsExpress(
          this.formData.item_info.ship_country,
          max_sku_price,
          this.formData.item_info.item_real_weight,
        ).then(() => this.getExpressDesc());
      }
      this.init_service_desciption();
    });
  }

  private checkGoodsExpress() {
    const max_sku_price = this.formData.sku_list.length
      ? _.maxBy(this.formData.sku_list, o => o['sku_price'])['sku_price']
      : 0;
    const seller_id =
      _.get(this.formData.item_info, 'seller_id.seller_id') ||
      this.formData.item_info.seller_id;
    return this.dataService
      .express_checkGoodsExpress({
        max_sku_price,
        seller_id,
        class_id: this.class_id,
        item_id: this.item_id || 0,
        currency: this.formData.item_info.currency,
        ship_country: this.formData.item_info.ship_country,
        ex_id_list: JSON.stringify(this.formData.item_info.ex_id_list),
      })
      .then(res => res.data.list);
  }

  /**
   * 提交时处理表单的错误
   */
  private controlFormError() {
    this.errors = [];
    this.formData.item_info.ex_id_list = this.formData.item_info.ex_id_list.filter(
      o => !!o,
    );
    this.handleSkuError();
    if (this.skuError.length > 0) {
      this.errors.push({ name: 'skuError', errors: this.skuError });
    }
    if (
      this.is_admin &&
      (!this.formData.item_info.seller_id ||
        _.isString(this.formData.item_info.seller_id))
    ) {
      this.errors.push({ name: 'seller_id', errors: '请选择商户账号！' });
    }
    if (_.isString(this.formData.item_brand) && this.isNewBrand) {
      this.errors.push({
        name: 'item_brand',
        errors:
          '你填写了一个不存在的品牌，请完善相关信息并将其添加到品牌库，或重新填写！',
      });
    }
    if (this.formData.item_info.item_main_img_list.length < 1) {
      this.errors.push({
        name: 'item_main_img_list',
        errors: '请上传商品主图！',
      });
    }

    if (
      this.formData.item_info.guarantee_cert_type === '2' &&
      this.formData.item_info.guarantee_cert_image.length < 1
    ) {
      this.errors.push({
        name: 'item_main_img_list',
        errors: '请上传上传商品保障证书！',
      });
    }

    if (!this.formData.item_info.ex_id_list.length) {
      if (this.is_edit || Number(this.in_warehouse) === 0) {
        this.errors.push({
          name: 'ex_id_list',
          errors: '请选择支持的运费模版',
        });
      }
    }
    this.controlFormErrorAttrType256('spu_attr');
    this.controlFormErrorAttrType256('sku_attr');
    this.controlFormErrorSkuImg();
  }

  /**
   * 『所有支持可配图的销售属性，都需要完整上传图片』解释一下，她的完整上传图片就是1.全部都上传；2.全部都不上传
   */
  private controlFormErrorSkuImg() {
    const obj = Object.create(null);
    let flag1 = false;
    let flag2 = false;
    _.forEach(this.attrList.sell, (v, k) => {
      if (v.is_support_add_image === '1') {
        obj[v.attr_id] = true;
      }
    });
    _.forEach(this.formData.sku_attr, (v1, k1) => {
      if (obj[k1] === true) {
        _.forEach(v1.value, (v2, k2) => {
          if (v2.is_checked === true) {
            if (v2.sku_imgurl) flag1 = true;
            if (!v2.sku_imgurl) flag2 = true;
          }
        });
        _.forEach(v1.custom, (v3, k3) => {
          if (v3.is_checked === true) {
            if (v3.sku_imgurl) flag1 = true;
            if (!v3.sku_imgurl) flag2 = true;
          }
        });
      }
    });
    if (_.keys(obj).length > 0) {
      if (flag1 === flag2) {
        this.errors.push({
          name: 'sku_img',
          errors:
            '商品规格里支持上传图片的属性需要全部上传图片或全部不传图片！',
        });
      }
    }
  }

  /**
   * 处理attrtype=2、5、6的情况下的required error
   * @param { formKey: string } sku_attr: 销售属性；spu_attr: 非销售属性
   */
  private controlFormErrorAttrType256(formKey) {
    const str = formKey === 'sku_attr' ? '商品规格' : '商品属性';
    const obj = Object.create(null);
    // 产品说销售属性都会是必填项
    if (formKey === 'spu_attr') {
      _.forEach(this.attrList.common, (v, k) => {
        if (v.is_required === '1') obj[v.attr_id] = '';
      });
    }
    const errors = [];
    _.forEach(this.formData[formKey], (v, k) => {
      let flag = true;
      if (formKey === 'spu_attr') {
        flag = Object.hasOwnProperty.call(obj, k);
      }
      if (flag) {
        if (v.attr_type === '2') {
          let flag2 = true;
          _.forEach(v.value, (v2, k2) => {
            if (v2.is_checked === true) flag2 = false;
          });
          _.forEach(v.custom, (v3, k3) => {
            if (v3.is_checked === true) flag2 = false;
          });
          flag2 && errors.push(str + '里的' + v.attr_name + '不能为空！');
        }
        if (v.attr_type === '5') {
          let flag5 = true;
          _.forEach(v.value, (v2, k2) => {
            if (v2.is_checked === true && _.keys(v2.selected).length > 0) {
              flag5 = false;
            }
          });
          _.forEach(v.custom, (v3, k3) => {
            if (v3.is_checked === true) flag5 = false;
          });
          flag5 && errors.push(str + '里的' + v.attr_name + '不能为空！');
        }
        if (v.attr_type === '6') {
          let flag6 = true;
          _.forEach(v.value, (v2, k2) => {
            if (v2.is_checked === true) flag6 = false;
          });
          _.forEach(v.custom, (v3, k3) => {
            if (v3.is_checked === true) flag6 = false;
          });
          if (!v.group_id || flag6) {
            errors.push(str + '里的' + v.attr_name + '不能为空！');
          }
        }
      }
    });
    if (errors.length > 0) {
      this.errors.push({ errors, name: formKey });
    }
  }

  /**
   * 编辑页面获取商品信息
   * @param { item_id: string } 商品ID
   */
  private getProduct(item_id) {
    return this.dataService
      .product_mgr_getProduct({
        item_id,
        class_id: this.class_id,
      })
      .then(res => {
        const { item_info, cloud_sku_list, sku_list } = res.data;

        // if (Number(item_info.cloud_item_id) > 0) {
        //   this.is_1688 = 1;
        //   this.cloud_sku_list = cloud_sku_list;
        //   _.forEach(this.cloud_sku_list, (v, k) => {
        //     v.id = String(v.id);
        //   });
        //   this.unit_size = item_info.unit_size || 1;
        //   this.unit_size = Number(this.unit_size);
        // }

        const {
          activity_status,
          seckill_status,
          child_activity_status,
          distribution_status,
        } = item_info;
        /**
         * distribution_status
         * 1 - 分销审核中
         * 2 - 分销审核通过
         * 3 - 分销申请已拒绝
         * 4 - 调价审核中
         * 5 - 调价审核通过
         * 6 - 调价审核拒绝
         * 7 - 不再分销
         */
        this.isInDistribution = [2, 4, 5, 6].includes(
          distribution_status >>> 0,
        );
        /**
         * activity_status
         * 0 - 没有参加拼团活动
         * 1 - 待开始
         * 2 - 进行中
         * 3 - 已结束
         */
        this.isInGroupon = [1, 2].includes(Number(activity_status));
        /**
         * seckill_status
         * 0 - 没有参加秒杀活动
         * 1 - 待开始
         * 2 - 进行中
         * 3 - 已结束
         * 4 - 强制结束
         */
        this.isInSeckill = [1, 2].includes(Number(seckill_status));

        /**
         * child_activity_status
         * 1 有子商品处于拼团中
         */
        this.hasChildProductInGroupon = Number(child_activity_status) === 1;

        // 2017-02-25，55海淘同步库存功能去掉了，也去掉不可编辑功能
        this.is_sku_disabled = false;
        this.is_disabled_sku_new = false;
        _.forEach(sku_list, (v, k) => {
          v.sku_set_type = 0;
        });
        this.in_warehouse = Number(item_info.in_warehouse);
        if (this.in_warehouse === 1) {
          this.is_disabled_sku_new = true;
        }
        const { brand_id, brand_name } = item_info;
        this.formData = {
          ...this.formData,
          item_brand: {
            brand_id,
            brand_name,
          },
          item_info: Object.assign(
            this.formData.item_info,
            this.formatRespItemInfo(item_info),
          ),
          sku_list: Object.assign(
            this.formData.sku_list,
            this.formatRespSkuList(sku_list, item_info.in_promotion),
          ),
          spu_attr: Object.assign(
            this.formData.spu_attr,
            this.formatRespSpuAttr(res.data.spu_attr),
          ),
        };
        this.promotion_data = {
          promotion_start_time: this.formData.item_info.promotion_start_time,
          promotion_end_time: this.formData.item_info.promotion_end_time,
        };

        this.ship_province = this.formData.item_info.ship_province;
        this.ship_city = this.formData.item_info.ship_city;
        if (this.formData.item_info.ship_country === '中国大陆') {
          this.changeArea();
        }

        this.last_sku_list = this.formData.sku_list;
        this.formData.item_info.currency =
          res.data.sku_list.length > 0
            ? res.data.sku_list[0].currency
            : '人民币';
        this.is_have_sku = res.data.sku_list.length > 0 ? 1 : 0;
        // item_img_list_index = this.formData.item_info.item_img_list.length;
        this.item_main_img_list_index = this.formData.item_info.item_main_img_list.length;

        if (!this.formData.item_info.item_desc.includes('<img')) {
          // 插入原来的细节图至编辑器底部
          this.formData.item_info.item_img_list.map((src: string) => {
            const imgSrc =
              src.includes('http') ||
              (_.startsWith(src, '//') && ~src.indexOf('seecsee.com'))
                ? src
                : `//img-qn.seecsee.com${src}`;
            this.formData.item_info.item_desc += `<img src="${imgSrc}" >`;
          });
        }

        // 新增一个可供选择的选项
        _.forEach(this.formData.sku_attr, (v, k) => {
          if (v.attr_type === '5') {
            this.formData.attr_length = {
              value_length: v.value.length,
              custom_length: v.custom.length,
            };
            v.value.push({
              is_checked: false,
              selected: Object.create(null),
            });
          }
        });
        let flag = true;
        this.$scope.$watch(
          '$ctrl.formData.sku_attr',
          (cur, pre) => {
            this.formData.sku_attr_list = this.formatSkuSpuAttrList(cur);

            this.formData.sku_list = this.skuListSimpler(
              this.formData.sku_attr_list,
            );

            if (flag) {
              _.remove(this.formData.sku_list, o => o['sku_id'] === -1);
              flag = false;
            }
          },
          true,
        );
        this.last_sku_attr = _.cloneDeep(this.formData.sku_attr);
        let flag2 = 0;
        let timeout = this.$q.when();
        this.$scope.$watch(
          '$ctrl.formData.sku_list',
          sku_list => {
            if (flag2) {
              // 避免奇怪的第一次调用
              this.$timeout.cancel(timeout);
              timeout = this.$timeout(() => this.changeLogistic(), 1000);
            }
            flag2 += 1;
            this.handleSkuError();
          },
          true,
        );

        if (this.is_c2c) {
          // if (this.is_1688) {
          //   this.notification.error(
          //     '该商品需联系超级管理员或电商管理员进行编辑',
          //   );
          // }
          if (this.in_warehouse === 1) {
            this.notification.error(
              '抱歉，囤货型商品无法进行商品编辑，请联系管理员进行操作',
            );
          }
        }
      });
  }

  private formatRespItemInfo(item_info) {
    return {
      ...this.formData.item_info,
      ...item_info,
      seller_id: {
        seller_id: item_info.seller_id,
        seller_name: item_info.seller_name,
      },
      expire_time:
        Number(item_info.expire_time) === 0
          ? undefined
          : moment(item_info.expire_time)['_d'],
      ship_send_time: this.arrStr2Int(item_info.ship_send_time),
      ship_recv_time: this.arrStr2Int(item_info.ship_recv_time),
      ship_type: item_info.ship_method === '2' ? '2' : '1',
      item_real_weight: item_info.item_real_weight
        ? +item_info.item_real_weight
        : this.class_weight,
      promotion_start_time:
        item_info.in_promotion === '1' &&
        item_info.promotion_start_time !== '0000-00-00 00:00:00'
          ? new Date(item_info.promotion_start_time)
          : null,
      promotion_end_time:
        item_info.in_promotion === '1' &&
        item_info.promotion_end_time !== '0000-00-00 00:00:00'
          ? new Date(item_info.promotion_end_time)
          : null,
      ex_id_list: this.arrStr2Int(item_info.ex_id_list),
    };
  }

  private arrStr2Int(arr) {
    return arr.map(val => +val);
  }

  /**
   * 编辑商品，删除sku记录
   * @param { item_id: int } 商品ID
   * @param { sku_id: int } 要删除的skuID
   */
  private deleteSkuService(item_id, sku_id) {
    return this.dataService
      .product_mgr_deleteSku({
        item_id,
        sku_id,
      })
      .then(res => this.notification.success('删除商品规格成功！'));
  }

  /**
   * 获取当前选择商品的品类在三级品类树的层级关系，并获取当前品类的重量(g)
   * @param { id: String } 商品品类ID
   */
  private getClassTree(id) {
    return this.dataService
      .item_class2Tree({
        only_on: 1,
      })
      .then(res => {
        this.class_tree = res.data;
        _.forEach(res.data, (v1, i1) => {
          if (i1 === id) {
            this.category.one = v1.class_id;
          } else {
            _.forEach(v1.children, (v2, i2) => {
              if (i2 === id) {
                this.category.one = v1.class_id;
                this.category.two = v2.class_id;
              } else {
                _.forEach(v2.children, (v3, i3) => {
                  if (i3 === id) {
                    this.category.one = v1.class_id;
                    this.category.two = v2.class_id;
                    this.category.three = v3.class_id;
                  }
                });
              }
            });
          }
        });
      });
  }

  /**
   * 根据品类ID获取品类重量(g)
   * @param { id: String } 品类ID
   */
  private getClassWeightById(class_id) {
    return this.dataService
      .item_class2List({
        class_id,
      })
      .then(res => {
        this.class_weight = +res.data[0].class_weight;
      });
  }

  /**
   * 获取当前品类加挂的属性
   * @param { cls_id: String } 品类ID
   */
  private getClassAttr(cls_id) {
    /**
     * @param { arr: array } res.data
     * @param { type: string } 'common' || 'sell'
     * @param { formKey: string } 'sku_attr' || 'spu_attr'
     */
    const formatAttr = (arr, type, formKey) => {
      _.forEach(arr[type], (v1, k1) => {
        this.formData[formKey][v1.attr_id] = {
          attr_type: v1.attr_type,
          attr_name: v1.attr_name,
          value: Object.create(null),
          custom: [],
        };
        if (v1.attr_type === '6') {
          Object.assign(this.formData[formKey][v1.attr_id], {
            group_id: '',
          });
        }
        if (v1.attr_type === '5') {
          Object.assign(this.formData[formKey][v1.attr_id], {
            value: this.is_edit
              ? []
              : [
                  {
                    is_checked: false,
                    selected: Object.create(null),
                  },
                ],
          });
          this.attrList[type][k1].attrType5Arr = [];
          _.forEach(v1.groups, (v2, k2) => {
            _.forEach(v2.values, (v3, k3) => {
              this.attrList[type][k1].attrType5Arr.push({
                group_id: k2,
                group_name: v2.group_name,
                attr_value: v3.attr_value,
                attr_value_id: k3,
              });
            });
          });
        }
      });
    };

    return this.dataService
      .product_mgr_getClassAttr({
        class_id: cls_id,
      })
      .then(res => {
        if (res.result === 1 && res.data) {
          this.attrList = res.data;
          formatAttr(res.data, 'sell', 'sku_attr');
          formatAttr(res.data, 'common', 'spu_attr');
        } else if (res.result === 1 && !res.data) {
          this.notification.warn('抱歉，该品类已被删除，请重新创建！');
        } else this.notification.dataError(res);
      });
  }

  /**
   * 获取产地国家信息
   */
  private renderCountryList() {
    return this.dataService
      .CommonData_getConfigLocation()
      .then(res => (this.countryList = res.data));
  }

  /**
   * 获取大陆的省市
   */
  private renderAreaList() {
    return this.dataService.CommonData_getConfigArea().then(res => {
      this.nocityList = res.data.nocityList;
      this.provinceList = res.data.provinceList;
      this.changeArea();
    });
  }

  /**
   * 交换数组元素位置
   * @param { arr: Array }
   * @param { k1: Number } index
   * @param { k2: Number } another index
   */
  private swapArrEle(arr, k1, k2) {
    let realK2 = k2;
    if (k2 < 0) {
      realK2 = arr.length - 1;
    } else if (k2 >= arr.length) {
      realK2 = 0;
    }
    if (k1 < arr.length && realK2 < arr.length) {
      const _t = arr[realK2];
      arr[realK2] = arr[k1];
      arr[k1] = _t;
    }
  }

  /**
   * 格式化输出sku_attr_list || spu_attr_list
   * this.formData.sku_attr || this.formData.spu_attr
   * @param { cur: Object } 当前品类加挂的属性，对象的key是属性ID，value是属性详情对象
   */
  private formatSkuSpuAttrList(cur) {
    const r = [];
    _.forEach(cur, (v1, k1) => {
      const a = {
        attr_name: v1.attr_name,
        attr_option: [],
      };
      if (
        v1.attr_type === '6' &&
        (Object.keys(v1.value).length > 0 || v1.custom.length > 0)
      ) {
        _.forEach(v1.value, (v2, k2) => {
          // 选项ID和显示值
          if (v2.is_checked === true) {
            a.attr_option.push({
              attr_id: k1,
              attr_type: v1.attr_type,
              attr_value_id: k2,
              attr_value: '',
              sku_imgurl: v2.sku_imgurl,
              display_value: v2.attr_value,
            });
          }
        });
        _.forEach(v1.custom, (v3, k3) => {
          if (v3.is_checked === true) {
            a.attr_option.push({
              attr_id: k1,
              attr_type: v1.attr_type,
              custom_way_id: v1.group_id,
              attr_value_id: -1,
              attr_value: v3.attr_value,
              sku_imgurl: v3.sku_imgurl,
              display_value: v3.attr_value,
            });
          }
        });
      }
      if (
        v1.attr_type === '5' &&
        (v1.value.length > 0 || v1.custom.length > 0)
      ) {
        _.forEach(v1.value, v2 => {
          if (v2.is_checked === true && _.keys(v2.selected).length > 0) {
            a.attr_option.push({
              attr_id: k1,
              attr_type: v1.attr_type,
              attr_value_id: v2.selected.attr_value_id,
              attr_value: '',
              sku_imgurl: v2.sku_imgurl,
              display_value: v2.selected.attr_value,
            });
          }
        });
        _.forEach(v1.custom, v3 => {
          if (v3.is_checked === true) {
            a.attr_option.push({
              attr_id: k1,
              attr_type: v1.attr_type,
              custom_group_id: 0,
              attr_value_id: -1,
              attr_value: v3.attr_value,
              sku_imgurl: v3.sku_imgurl,
              display_value: v3.attr_value,
            });
          }
        });
      }
      if ((v1.attr_type === '4' || v1.attr_type === '3') && v1.attr_value) {
        a.attr_option.push({
          attr_id: k1,
          attr_type: v1.attr_type,
          attr_value_id: -1,
          attr_value:
            typeof v1.attr_value === 'number'
              ? v1.attr_value
              : v1.attr_value.trim(),
        });
      }
      if (
        v1.attr_type === '2' &&
        (Object.keys(v1.value).length > 0 || v1.custom.length > 0)
      ) {
        _.forEach(v1.value, (v2, k2) => {
          if (v2.is_checked === true) {
            a.attr_option.push({
              attr_id: k1,
              attr_type: v1.attr_type,
              attr_value_id: k2,
              attr_value: '',
              sku_imgurl: v2.sku_imgurl,
              display_value: v2.attr_value,
            });
          }
        });
        _.forEach(v1.custom, (v2, k2) => {
          if (v2.is_checked === true) {
            a.attr_option.push({
              attr_id: k1,
              attr_type: v1.attr_type,
              attr_value_id: -1,
              attr_value: v2.attr_value,
              sku_imgurl: v2.sku_imgurl,
              display_value: v2.attr_value,
            });
          }
        });
      }
      if (v1.attr_type === '1' && v1.attr_value_id) {
        if (v1.attr_value) {
          a.attr_option.push({
            attr_id: k1,
            attr_type: v1.attr_type,
            attr_value_id: -1,
            attr_value: v1.attr_value.trim(),
          });
        } else {
          a.attr_option.push({
            attr_id: k1,
            attr_type: v1.attr_type,
            attr_value_id: v1.attr_value_id,
            attr_value: '',
          });
        }
      }
      r.push(a);
    });
    return r;
  }

  /**
   * this.formData.sku_attr_list => this.formData.sku_list   属性纬度 =》 sku纬度
   * @param { r: Array } this.formData.sku_attr_list 以属性ID为纬度的sku属性列表
   *
   */
  private skuListSimpler(r) {
    const R = [];
    const genT = display_value => {
      const index = _.findIndex(this.formData.sku_list, o =>
        _.isEqual(o['display_value'], display_value),
      );
      let _sku =
        index > -1
          ? this.formData.sku_list[index]
          : {
              sku_id: -1,
              sku_ori_price: null,
              sku_price: null,
              sku_stock: null,
              sku_mark: '',
              supply_price: null,
              promotion_price: undefined,
              cost_price: null,
            };
      // 如果这里是恢复了之前删除的SKU，则恢复之
      if (this.is_edit && index === -1) {
        const sku = <any>(
          _.find(this.last_sku_list, o =>
            _.isEqual(o['display_value'], display_value),
          )
        );
        _sku = sku;
      }
      return Object.assign(
        {
          display_value,
          attr_value_list: [],
        },
        _sku,
      );
    };
    const genS = v => ({
      attr_value_id: v.attr_value_id,
      attr_value: v.attr_value,
      attr_id: v.attr_id,
      attr_type: v.attr_type,
      sku_imgurl: v.sku_imgurl,
      custom_way_id: v.custom_way_id || 0,
      custom_group_id: v.custom_group_id || 0,
    });
    switch (r.length) {
      case 1:
        if (Object.keys(r[0].attr_option).length > 0) {
          _.forEach(r[0].attr_option, (v, k) => {
            const display_value = [v.display_value];
            const t = genT(display_value);
            const s = genS(v);
            t.attr_value_list.length = 0;
            t.attr_value_list.push(s);
            R.push(t);
          });
        }
        break;
      case 2:
        if (
          Object.keys(r[0].attr_option).length > 0 ||
          Object.keys(r[1].attr_option).length > 0
        ) {
          _.forEach(r[0].attr_option, (v1, k1) => {
            _.forEach(r[1].attr_option, (v2, k2) => {
              const display_value = [v1.display_value, v2.display_value];
              const t = genT(display_value);
              const s1 = genS(v1);
              const s2 = genS(v2);
              t.attr_value_list.length = 0;
              t.attr_value_list.push(s1, s2);
              R.push(t);
            });
          });
        }
        break;
      case 3:
        if (
          Object.keys(r[0].attr_option).length > 0 ||
          Object.keys(r[1].attr_option).length > 0 ||
          Object.keys(r[2].attr_option).length > 0
        ) {
          _.forEach(r[0].attr_option, (v1, k1) => {
            _.forEach(r[1].attr_option, (v2, k2) => {
              _.forEach(r[2].attr_option, (v3, k3) => {
                const display_value = [
                  v1.display_value,
                  v2.display_value,
                  v3.display_value,
                ];
                const t = genT(display_value);
                const s1 = genS(v1);
                const s2 = genS(v2);
                const s3 = genS(v3);
                t.attr_value_list.length = 0;
                t.attr_value_list.push(s1, s2, s3);
                R.push(t);
              });
            });
          });
        }
        break;
      default:
        return;
    }
    return R;
  }

  /**
   * 查找单选类型的'其他'值的attr_value_id
   */
  private getOtherValueID(attr_id) {
    const attr = this.attrList.common.filter(
      item => item.attr_id === attr_id,
    )[0];
    let r = null;
    _.forEach(attr.option_values, (v1, k1) => {
      if (v1.attr_value === '其他') r = k1;
    });
    return r;
  }

  /**
   * 将接口返回的非销售属性显示在UI
   */
  private formatRespSpuAttr(spu_attr) {
    const r = Object.create(null);
    _.forEach(spu_attr, (v1, k1) => {
      r[k1] = {
        attr_type: v1.attr_type,
        attr_name: '',
      };
      if (v1.attr_type === '1') {
        if (v1.values[0].value_id === '0') {
          // 自定义值
          Object.assign(r[k1], {
            attr_value_id: this.getOtherValueID(k1),
            attr_value: v1.values[0].text,
          });
        } else {
          Object.assign(r[k1], {
            attr_value_id: v1.values[0].value_id,
          });
        }
      } else if (v1.attr_type === '2') {
        const valueArr = v1.values.filter(item => item.value_id !== '0');
        const customArr = v1.values.filter(item => item.value_id === '0');
        r[k1].value = Object.create(null);
        _.forEach(valueArr, (v2, k2) => {
          r[k1].value[v2.value_id] = {
            is_checked: true,
            attr_value: v2.text,
          };
        });
        r[k1].custom = [];
        _.forEach(customArr, (v2, k2) => {
          r[k1].custom[k2] = {
            is_checked: true,
            attr_value: v2.text,
          };
        });
      } else if (v1.attr_type === '3') {
        r[k1].attr_value = +v1.values[0].text;
      } else if (v1.attr_type === '4') {
        r[k1].attr_value = v1.values[0].text;
      } else if (v1.attr_type === '5') {
        const valueArr = v1.values.filter(item => item.value_id !== '0');
        const customArr = v1.values.filter(item => item.value_id === '0');
        r[k1].value = [];
        r[k1].custom = [];
        _.forEach(valueArr, (v2, k2) => {
          r[k1].value[k2] = {
            is_checked: true,
            selected: {
              group_id: this.getGroup('common', 'groups', k1, v2.value_id)
                .group_id,
              group_name: this.getGroup('common', 'groups', k1, v2.value_id)
                .group_name,
              attr_value: this.getGroup('common', 'groups', k1, v2.value_id)
                .attr_value,
              attr_value_id: v2.value_id,
            },
          };
        });
        _.forEach(customArr, (v2, k2) => {
          r[k1].custom[k2] = {
            is_checked: true,
            attr_value: v2.text,
          };
        });
      } else if (v1.attr_type === '6') {
        const valueArr = v1.values.filter(item => item.value_id !== '0');
        const customArr = v1.values.filter(item => item.value_id === '0');
        r[k1].group_id = v1.custom_way_id;
        this.prevAttr6.sku_attr[k1] = v1.custom_way_id;
        r[k1].value = Object.create(null);
        _.forEach(valueArr, (v2, k2) => {
          r[k1].value[v2.value_id] = {
            is_checked: true,
            attr_value: this.getGroup('common', 'ways', k1, v2.value_id)
              .attr_value,
          };
        });
        r[k1].custom = [];
        _.forEach(customArr, (v2, k2) => {
          r[k1].custom.push({
            is_checked: true,
            attr_value: v2.text,
          });
        });
      }
    });

    return r;
  }

  /**
   * 格式化返回的
   */
  private formatRespSkuList(sku_list, in_promotion) {
    const r = [];
    _.forEach(sku_list, (v1, k1) => {
      const sku = {
        sku_id: v1.sku_id,
        sku_ori_price: v1.sku_ori_price,
        sku_mark: v1.sku_mark,
        sku_price: v1.sku_price,
        sku_stock: +v1.sku_stock,
        display_value: [],
        attr_value_list: [],
        supply_price: !this.isNilOrString(v1.supply_price)
          ? +v1.supply_price
          : null,
        cost_price: !this.isNilOrString(v1.cost_price) ? +v1.cost_price : null,
        promotion_price:
          !(this.is_edit && this.is_c2c) && in_promotion === '1'
            ? +v1.promotion_price
            : undefined,
        stock_sum: v1.stock_sum,
        cloud_sku_id: '0',
        cloud_info: { id: '', stock: '', unit: '', label: '' },
        suggested_retail_price_from: v1.suggested_retail_price_from,
        suggested_retail_price_to: v1.suggested_retail_price_to,
        warehouse_item_id: v1.warehouse_item_id,
      };
      // if (+this.is_1688 === 1) {
      //   sku.cloud_sku_id =
      //     typeof v1.cloud_sku_id === 'undefined' ? '0' : v1.cloud_sku_id;
      //   sku.cloud_sku_id = String(sku.cloud_sku_id);
      //   _.forEach(this.cloud_sku_list, (v_cloud_sku, k_sku) => {
      //     if (Number(v_cloud_sku.id) === Number(sku.cloud_sku_id)) {
      //       sku.cloud_info = v_cloud_sku;
      //       return true;
      //     }
      //   });
      // }
      _.forEach(v1.sku_attr, (v2, k2) => {
        const isCustom = v2.value_id === '0';
        const t = {
          attr_value_id: isCustom ? -1 : v2.value_id,
          attr_value: '',
          attr_id: v2.attr_id,
          attr_type: v2.attr_type,
          sku_imgurl: v2.sku_imgurl,
          custom_way_id: +v2.custom_way_id,
          custom_group_id: +v2.custom_group_id,
        };

        if (v2.attr_type === '5') {
          const group = this.getGroup(
            'sell',
            'groups',
            v2.attr_id,
            v2.value_id,
          );
          // 修改了品类的销售属性
          if (!group) {
            return;
          }
          const attr_value = group.attr_value;
          isCustom
            ? sku.display_value.push(v2.text)
            : sku.display_value.push(attr_value);
          if (
            !this.skuHasAttrValueIDInAttrType5(v2.attr_id, v2.value_id, v2.text)
          ) {
            if (isCustom) {
              this.formData.sku_attr[v2.attr_id].custom.push({
                is_checked: true,
                attr_value: v2.text,
                sku_imgurl: v2.sku_imgurl,
              });
              t.attr_value = v2.text;
            } else {
              t.attr_value = attr_value;
              this.formData.sku_attr[v2.attr_id].value.push({
                is_checked: true,
                sku_imgurl: v2.sku_imgurl,
                selected: {
                  attr_value,
                  group_id: this.getGroup(
                    'sell',
                    'groups',
                    v2.attr_id,
                    v2.value_id,
                  ).group_id,
                  group_name: this.getGroup(
                    'sell',
                    'groups',
                    v2.attr_id,
                    v2.value_id,
                  ).group_name,
                  attr_value_id: v2.value_id,
                },
              });
            }
          }
        } else if (v2.attr_type === '6') {
          const attr_value = this.getGroup(
            'sell',
            'ways',
            v2.attr_id,
            v2.value_id,
          ).attr_value;
          isCustom
            ? sku.display_value.push(v2.text)
            : sku.display_value.push(attr_value);
          if (
            !this.skuHasAttrValueIDInAttrType6(v2.attr_id, v2.value_id, v2.text)
          ) {
            if (isCustom) {
              this.formData.sku_attr[v2.attr_id].group_id = v2.custom_way_id;
              this.prevAttr6.sku_attr[v2.attr_id] = v2.custom_way_id;
              this.formData.sku_attr[v2.attr_id].custom.push({
                is_checked: true,
                attr_value: v2.text,
                sku_imgurl: v2.sku_imgurl,
              });
              t.attr_value = v2.text;
            } else {
              if (!this.formData.sku_attr[v2.attr_id].group_id) {
                const group_id = this.getGroup(
                  'sell',
                  'ways',
                  v2.attr_id,
                  v2.value_id,
                ).group_id;
                if (group_id !== '0') {
                  this.formData.sku_attr[v2.attr_id].group_id = group_id;
                  this.prevAttr6.sku_attr[v2.attr_id] = group_id;
                }
              }
              t.attr_value = attr_value;
              this.formData.sku_attr[v2.attr_id].value[v2.value_id] = {
                attr_value,
                is_checked: true,
                sku_imgurl: v2.sku_imgurl,
              };
            }
          }
        } else if (v2.attr_type === '2') {
          let attr_value2;
          if (isCustom) {
            sku.display_value.push(v2.text);
          } else {
            attr_value2 = this.attrList.sell.filter(
              item => item.attr_id === v2.attr_id,
            )[0].option_values[v2.value_id].attr_value;
            sku.display_value.push(attr_value2);
          }
          if (
            !this.skuHasAttrValueIDInAttrType2(v2.attr_id, v2.value_id, v2.text)
          ) {
            if (isCustom) {
              this.formData.sku_attr[v2.attr_id].custom.push({
                is_checked: true,
                attr_value: v2.text,
                sku_imgurl: v2.sku_imgurl,
              });
              t.attr_value = v2.text;
            } else {
              t.attr_value = attr_value2;
              this.formData.sku_attr[v2.attr_id].value[v2.value_id] = {
                is_checked: true,
                attr_value: attr_value2,
                sku_imgurl: v2.sku_imgurl,
              };
            }
          }
        }
        sku.attr_value_list.push(t);
      });
      r.push(sku);
    });
    this.formData.sku_attr_list = this.formatSkuSpuAttrList(
      this.formData.sku_attr,
    );

    return r;
  }

  private skuHasAttrValueIDInAttrType5(attr_id, attr_value_id, text) {
    let flag = false;
    if (attr_value_id === '0') {
      _.forEach(this.formData.sku_attr[attr_id].custom, (v, k) => {
        if (v.attr_value === text) flag = true;
      });
    } else {
      _.forEach(this.formData.sku_attr[attr_id].value, (v, k) => {
        if (v.selected.attr_value_id === attr_value_id) flag = true;
      });
    }
    return flag;
  }

  private skuHasAttrValueIDInAttrType6(attr_id, attr_value_id, text) {
    let flag = false;
    if (attr_value_id === '0') {
      _.forEach(this.formData.sku_attr[attr_id].custom, (v, k) => {
        if (v.attr_value === text) flag = true;
      });
    } else {
      _.forEach(this.formData.sku_attr[attr_id].value, (v, k) => {
        if (k === attr_value_id) flag = true;
      });
    }
    return flag;
  }

  private skuHasAttrValueIDInAttrType2(attr_id, attr_value_id, text) {
    let flag = false;
    if (attr_value_id === '0') {
      _.forEach(this.formData.sku_attr[attr_id].custom, (v, k) => {
        if (v.attr_value === text) flag = true;
      });
    } else {
      _.forEach(this.formData.sku_attr[attr_id].value, (v, k) => {
        if (k === attr_value_id) flag = true;
      });
    }
    return flag;
  }
  /**
   * 接口返回数据中attrtype === 5 || 6 获取group_id
   * @param { type: string } 'common' || 'sell'
   * @param { attr_type: string } 'groups' || 'ways'
   * @param { attr_id: string } 属性ID
   * @param { attr_value_id: string } 属性值ID
   */
  private getGroup(type, attr_type, attr_id, attr_value_id) {
    const attr = this.attrList[type].filter(item => item.attr_id === attr_id);
    const r = {
      group_id: '0',
      group_name: '',
      attr_value: '',
    };
    if (attr.length === 0) return;
    _.forEach(attr[0][attr_type], (v1, k1) => {
      _.forEach(v1.values, (v2, k2) => {
        if (k2 === attr_value_id) {
          Object.assign(r, {
            group_id: k1,
            group_name: v1.group_name || v1.display_name,
            attr_value: v2.attr_value,
          });
        }
      });
    });
    return r;
  }

  /**
   * 按照后端接口格式使vm.formData.spu_attr参数化
   * @param {spu_attr: array } this.formData.spu_attr
   */
  private paramizeSpuAttr(spu_attr) {
    const paramArr = spu_attr || this.formData.spu_attr;
    const spu_attr_list = this.formatSkuSpuAttrList(paramArr);
    const result = [];
    _.forEach(spu_attr_list, v1 => {
      if (v1.attr_option.length > 0) {
        _.forEach(v1.attr_option, v2 => {
          result.push(v2);
        });
      }
    });
    return result;
  }

  /**
   * 发布商品信息
   * @param { params: Object } 商品参数
   */
  private addProduct(params, warehouse = false) {
    this.btn_disabled = true;
    return this.dataService
      .product_mgr_addProduct(params)
      .then(res => {
        this.notification.success('商品发布成功！');
        $(window).unbind('beforeunload');
        if (warehouse) {
          if (this.is_new_brand) {
            this.$location.path('/goods/all').hash('0');
          } else {
            this.$location.path('/goods/Off');
          }
        } else if (this.is_new_brand) {
          this.$location.path('/goods/all');
        } else {
          this.$location.path('/goods/posted');
        }
      })
      .finally(() => (this.btn_disabled = false));
  }

  /**
   * 编辑商品保存
   */
  private editProduct(params, warehouse = false) {
    this.btn_disabled = true;
    return this.dataService
      .product_mgr_editProduct(params)
      .then(res => {
        this.notification.success('商品修改成功！');
        $(window).unbind('beforeunload');
        if (this.$routeParams.needClose) {
          window.close();
        } else if (warehouse) {
          if (this.is_new_brand) {
            this.$location.path('/goods/all').hash('0');
          } else {
            this.$location.path('/goods/Off');
          }
        } else if (this.is_new_brand) {
          this.$location.path('/goods/all');
        } else if (this.page_from === 'thirdparty') {
          this.$location.path('/goods/thirdparty');
        } else if (this.page_from.indexOf('/') > -1) {
          this.$location.path(this.page_from);
        } else {
          this.$location.path('/goods/posted');
        }
      })
      .finally(() => (this.btn_disabled = false));
  }

  /**
   * 根据发货地和最大sku价格获取路线
   */
  private getGoodsExpress(
    ship_country,
    max_sku_price,
    item_real_weight: number = this.class_weight,
    forceFetch = false,
  ) {
    let can_get = false;
    const isFullfilledConditions = Boolean(
      this.formData.item_info.ship_country &&
        max_sku_price &&
        item_real_weight &&
        (this.is_c2c || _.get(this.formData.item_info, 'seller_id.seller_id')),
    );

    can_get = isFullfilledConditions === true;
    if (this.is_edit === false && Number(max_sku_price) === 0) {
      can_get = false;
    }
    const newParams: any = {
      max_sku_price,
      item_real_weight,
      item_id: this.item_id || 0,
      class_id: this.class_id,
      currency: this.formData.item_info.currency,
      ship_country: this.formData.item_info.ship_country,
      sell_id: this.is_c2c
        ? undefined
        : _.get(this.formData.item_info, 'seller_id.seller_id'),
    };
    if (can_get && this.lastParam && _.isEqual(this.lastParam, newParams)) {
      can_get = false;
    }
    if (can_get || forceFetch) {
      this.lastParam = newParams;
      if (this.formData.item_info.ex_id_1) {
        this.getExpressDesc();
      }
      return this.dataService.express_getGoodExpress(newParams).then(res => {
        // 判断返回的数组，与当前物流数组是否一样，如果一致，不需要设置
        if (!_.isEqual(res.data, this.express_list)) {
          this.express_list = res.data;
        }
      });
    }

    return this.$q.reject();
  }

  searchBrands(keyword) {
    return this.dataService
      .item_getStandardBrandListv2({ keyword })
      .then(({ data }) => data);
  }

  private isNilOrString(some: any) {
    return _.isNil(some) || some === '';
  }
}

export const goodsBasicInfo: ng.IComponentOptions = {
  template: require('./goods-basic-info.template.html'),
  controller: goodsBasicInfoController,
};
