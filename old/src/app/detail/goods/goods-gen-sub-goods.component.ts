import * as moment from 'moment';
import * as _ from 'lodash';
import { forEach } from 'lodash';
import { debug } from 'util';

declare const UE: any;

export class GenerateSubGoodsController {
  static $inject: string[] = [
    '$scope', '$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeUpload',
    '$timeout', '$cookies', 'seeModal', '$uibModal', 'goodsService',
  ];

  type: string;
  list_key: any[];
  form_data: any;
  item: any;
  sameTriger: any;
  sync_check: any;
  ex_id_list: any;
  promotion_required: boolean;
  promotion_errors: string[];
  price_table_errors: string[];
  price_table_dangers: string[];
  suggest_price_errors: string[];
  dealer_package_errors: string[];
  store_table_errors: string[];
  express_list: any[];
  express_desc_list: any[];
  express_desc: any;
  errors: string[];
  page_url: string;
  timeout: any;
  is_kol: boolean;
  is_admin: boolean;
  ueditor: any;
  isInGroupon: boolean;
  isInSeckill: boolean;

  isQuhaodian:boolean; // 是否是趣好店
  dealerPackageList:any[];
  surport_seven_days_refund: boolean;
  unsurport_seven_days_refund: boolean;
  batchForm = {
    center_member_price:undefined,
    sku_price:undefined,
    sku_ori_price:'',
    first_level_refund_ratio:undefined,
    second_level_refund_ratio:undefined
  };
  in_warehouse:string;

  private item_main_img_list_index: number;
  private item_img_list_index: number;
  private item_insale:string ="1";
  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeUpload: see.ISeeUploadService,
    private $timeout: ng.ITimeoutService,
    private $cookies: ng.cookies.ICookiesService,
    private seeModal: see.ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private goodsService: any,
  ) {
    this.form_data = {
      item_id: '',
      sku_list: [],
      spu_info: {
        item_main_img_list: [],
        // item_img_list: [],
        promotion_start_time: null,
        promotion_end_time: null,
        expire_time: null,
      },
      dealer_package_type:0
    };
    this.sync_check = {
      all: false,
      item_name: true,
      sell_point: true,
      item_main_img_list: true,
      // item_img_list: true,
      item_desc: true,
      // ex_id_list: true,
    };
    this.item = {};
    this.promotion_errors = [];
    this.price_table_errors = [];
    this.price_table_dangers = [];
    this.suggest_price_errors = [];
    this.dealer_package_errors = [];
    this.store_table_errors = [];
    this.sameTriger = {
      share_parent_stock: this.type === 'edit' ? 0 : 1,
    };
    this.item_main_img_list_index = 0;
    this.item_img_list_index = 0;
    this.express_list = [];
    this.express_desc_list = [];
    this.errors = [];
    this.page_url = encodeURIComponent($location['$$url']) // tslint:disable-line
    this.timeout = this.$q.when();
    this.is_kol = $cookies.get('seller_privilege') === '24'
      || $cookies.get('seller_privilege') === '30';
    this.is_admin = $cookies.get('seller_privilege') === '7'
      || $cookies.get('seller_privilege') === '10';
    this.ex_id_list = {};
    this.ueditor = {
      config: {
        initialContent: '请务必在此详细描述商品基本信息（例如服装的衣长，面料，采购渠道等），主要卖点，注意事项，商品交付形式和售后服务，要求字数大于20',
        autoClearinitialContent: true,
        enableAutoSave: false,
        saveInterval: 0,

        // 服务器统一请求接口路径
        serverUrl: undefined,

        // 工具栏上的所有的功能按钮和下拉框
        toolbars: [[
          'fullscreen', 'source', '|', 'undo', 'redo', '|',
          'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript',
          'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|',
          'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall',
          'cleardoc', '|',
          'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
          'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
          'directionalityltr', 'directionalityrtl', 'indent', '|',
          'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
          'touppercase', 'tolowercase', '|',
          'horizontal', 'date', 'time', '|',
          'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow',
          'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells',
          'splittorows', 'splittocols', '|',
          'print', 'searchreplace',
        ]],
      },
    };
    this.isQuhaodian = localStorage.getItem('is_quhaodian') === '1';;
    this.dealerPackageList = [{id:0,name:"不是经理礼包"},{id:2,name:"299礼包"},{id:3,name:"399礼包"},{id:1,name:"不发货礼包"}];
  }

  $onInit() {
    const promises = [this.getKeyList()];
    if (this.type === 'edit') {
      promises.push(this.getChildProduct(this.$routeParams['id'])) // tslint:disable-line
    }
    this.$q.all(promises);
    UE.registerUI('picturecenter', (editor: any, uiName: string) => {
      const btn = new UE.ui.Button({
        name: uiName,
        title: '图片库',
        cssRules: 'background-position: -726px -77px;',
        onclick: () => {
          this.goodsService.openPictureCenterModal(3)
            .then((result: string[]) => {
              result.map(src => {
                // 此处的 timeout 避免重复应用 $scope.$apply
                this.$timeout(() => {
                  editor.execCommand('insertimage', {
                    src: src.includes('http') ? src : `//img-qn.seecsee.com${src}`,
                  });
                });
              });
            });
        },
      });
      // 当点到编辑内容上时，按钮要做的状态反射
      editor.addListener('selectionchange', () => {
        const state = editor.queryCommandState(uiName);
        if (state === -1) {
          btn.setDisabled(true);
          btn.setChecked(false);
        } else {
          btn.setDisabled(false);
          btn.setChecked(state);
        }
      });
      return btn;
    });
  }

  uploadMain() {
    return this.goodsService.openPictureCenterModal(1, this.form_data.spu_info.item_main_img_list)
      .then(result => this.form_data.spu_info.item_main_img_list.push(...result));
  }

  save: () => void = () => {
    this.errors.length = 0;
    this.changePromotion();
    this.onSkuChanged();
    if (this.suggest_price_errors.length > 0 || this.dealer_package_errors.length > 0) {
      return;
    }
    if (!this.is_kol && (this.price_table_errors.length || this.price_table_dangers.length)) {
      const errors = 'SKU价格不满足<span class="text-primary">市场价≥售价供≥供货价</span>,';
      const dangers = '<span class="text-primary">供货价低于see成本价</span>,';
      const el = this.price_table_errors.length;
      const dl = this.price_table_dangers.length;

      this.seeModal
        .confirmP('提示', `当前${el ? errors : ''}${dl ? dangers : ''}确定修改吗？`)
        .then(
        () => {
          this.price_table_errors.length = 0;
          this.price_table_dangers.length = 0;
          this.saveChildProduct();
        },
        () => this.saveChildProduct(),
        );
    } else {
      this.saveChildProduct();
    }

  }

  checkInventoryCheckbox: (type: string, index?: number) => any = (type, index) => {
    let ta = 0;
    this.form_data.sku_list.forEach(sku => {
      if (!sku[type]) {
        ta += 1;
      }
      if (!sku.lock_quantitative_inventory) {
        sku.sku_stock = 0;
        sku.release_time = null;
      }
    });
    if (index !== void (0) && this.form_data.sku_list[index][type] === 0) {
      this.sameTriger[type] = 0;
    }
    if (ta === 0) {
      this.sameTriger[type] = 1;
    }
    return ta === this.form_data.sku_list.length;
  }

  changePromotion: () => any = () => {
    this.promotion_required = false;
    this.promotion_errors.length = 0;
    if (this.type === 'add') {  // 子商品编辑页屏蔽促销价格 【拼团商品需求】tapd 1002054
      forEach(this.form_data.sku_list, sku => {
        if (sku.promotion_price || sku.promotion_price === 0) {
          this.promotion_required = true;
        }
      });
      if (!!this.form_data.spu_info.promotion_start_time) {
        this.promotion_required = true;
      }
      if (!!this.form_data.spu_info.promotion_start_time) {
        this.promotion_required = true;
      }
      if (!!this.form_data.spu_info.promotion_end_time) {
        this.promotion_required = true;
      }
    }
    for (const sku of this.form_data.sku_list) {
      if ((_.isNil(sku.promotion_price) || sku.promotion_price === null)
        && this.promotion_required
      ) {
        this.promotion_errors.push('请填写完整促销价格！');
        break;
      }
    }
    if (this.promotion_required) {
      if (!this.form_data.spu_info.promotion_start_time) {
        this.promotion_errors.push('请填写促销开始时间！');
      }
      if (!this.form_data.spu_info.promotion_end_time) {
        this.promotion_errors.push('请填写促销结束时间！');
      }
      if (this.form_data.spu_info.promotion_start_time
        && this.form_data.spu_info.promotion_end_time
      ) {
        if (this.form_data.spu_info.promotion_start_time
          > this.form_data.spu_info.promotion_end_time
        ) {
          this.promotion_errors.push('促销结束时间需晚于开始时间！');
        }
      }
    }
  }

  formatFloat(val:number,num?:number):number{
    const number = num || 2;
    return Math.round(val*Math.pow(10,number)) / Math.pow(10,number);
  }

  calculatePrice(sku:any,name:string):number{

    let value:number = undefined;

    if(name === 'center_supply_price'){
      value = (sku.center_member_price - sku.supply_price)*sku.center_profit_rate/100 + sku.supply_price;
    }
    if(name === 'center_profit_rate'){
      if(sku.center_member_price === sku.supply_price){
        value = 0;
      }else{
        value = (sku.center_supply_price - sku.supply_price) / (sku.center_member_price - sku.supply_price);
      }
    }
    if(name === 'center_member_price'){
      value = sku.supply_price + (sku.center_supply_price - sku.supply_price)/sku.center_profit_rate/100;
    }
    return value;
  }

  /**
   * 计算券后价
   * @param {number} skuPrice 日常售价
   * @param {number} centerMemberPrice 券后价
   * @returns {number}
   */
  private calculateCouponAmount(skuPrice:number,centerMemberPrice:number):number{
    return this.formatFloat(skuPrice - centerMemberPrice);
  }

  /**
   * 计算公司利润
   * @param {number} supplyPrice 成本价
   * @param {number} centerMemberPrice 券后价
   * @param {number} companyProfitRatio 公司利润比率
   * @returns {number}
   */
  private calculateCompanyProfit(supplyPrice:number,centerMemberPrice:number, companyProfitRatio:number):number{
    return this.formatFloat((centerMemberPrice - supplyPrice) * companyProfitRatio / 100);
  }

  /**
   *计算趣好店供货价
   * @param {number} supplyPrice 成本价
   * @param {number} centerMemberPrice 券后价
   * @param {number} companyProfitRatio 公司利润比率
   * @param {number} fare
   * @returns {number}
   */
  private calculateCenterSupplyPrice(supplyPrice:number,centerMemberPrice:number,companyProfitRatio:number,fare:number = 0):number{
    const companyProfit = this.calculateCompanyProfit(supplyPrice, centerMemberPrice, companyProfitRatio);
    return this.formatFloat(supplyPrice + fare + companyProfit);
  }

  /**
   * 计算公司利润率
   * @param {number} firstLevelRefundRatio
   * @param {number} secondLevelRefundRatio
   */
  private calculateCompanyProfitRatio(firstLevelRefundRatio:number,secondLevelRefundRatio:number):any{
    return  this.formatFloat(100 - firstLevelRefundRatio - secondLevelRefundRatio);
  }

  /**
   * 批量操作利润率表单change
   * @param {string} name
   */
  onBatchItemChanged(name:string):void{
    const batchForm = this.batchForm;
    switch (name){
      case 'first_level_refund_ratio':
        const maxFirstValue = batchForm.second_level_refund_ratio ? 100 - batchForm.second_level_refund_ratio : 100;
        batchForm[name] = batchForm[name] <0 ? 0: batchForm[name] > maxFirstValue ? maxFirstValue : batchForm[name];
        break;
      case 'second_level_refund_ratio':
        const maxSecondValue = batchForm.first_level_refund_ratio ? 100 - batchForm.first_level_refund_ratio : 100;
        batchForm[name] = batchForm[name] <0 ? 0: batchForm[name] > maxSecondValue ? maxSecondValue : batchForm[name];
        break;
    }
  }

  /**
   * 批量操作确定
   */
  batchSubmit():void{
    const batchForm = this.batchForm;
    const skuList = this.form_data.sku_list;
    skuList.forEach(
      (sku:any)=>{
       for(const i in batchForm){
         batchForm[i] && (sku[i] = batchForm[i]);
         if(_.isNumber(sku.first_level_refund_ratio) && _.isNumber(sku.second_level_refund_ratio)){
           sku.company_profit_ratio = this.calculateCompanyProfitRatio(sku.first_level_refund_ratio,sku.second_level_refund_ratio);
         }
         if(_.isNumber(sku.sku_price) && _.isNumber(sku.center_member_price)){
           sku.coupon_amount = this.calculateCouponAmount(sku.sku_price,sku.center_member_price);
         }
         if(_.isNumber(sku.supply_price) && _.isNumber(sku.company_profit_ratio) &&_.isNumber(sku.center_member_price)){
           sku.center_supply_price = this.calculateCenterSupplyPrice(sku.supply_price,sku.center_member_price,sku.company_profit_ratio);
         }
         if(sku.center_member_price === sku.supply_price){
           sku.first_level_refund_ratio = sku.second_level_refund_ratio = sku.company_profit_ratio = 0;
           sku.center_supply_price = this.calculateCenterSupplyPrice(sku.supply_price,sku.center_member_price,sku.company_profit_ratio);
         }
       }
      }
    );
    this.onSkuChanged();
  }



  onSkuItemChanged: (index:number,name:string,shouldChangeExpress?: boolean) => void = (index,name,shouldChangeExpress = false) => {
    const sku = this.form_data.sku_list[index];
    if(!_.isNumber(sku[name])){
      return;
    }
    sku[name] = this.formatFloat(sku[name]);
    switch (name){
      case 'center_member_price': // 券后价
        _.isNumber(sku.sku_price) && (sku.coupon_amount = this.calculateCouponAmount(sku.sku_price,sku.center_member_price));
        if(_.isNumber(sku.supply_price) && _.isNumber(sku.company_profit_ratio)){
            sku.center_supply_price = this.calculateCenterSupplyPrice(sku.supply_price,sku.center_member_price,sku.company_profit_ratio);
        }
        break;
      case 'first_level_refund_ratio':
        const maxFirstValue = sku.second_level_refund_ratio ? 100 - sku.second_level_refund_ratio : 100;
        sku[name] = sku[name] < 0 ? 0: sku[name] > maxFirstValue ? maxFirstValue : sku[name];
        sku.company_profit_ratio =  _.isNumber(sku.second_level_refund_ratio) &&  this.calculateCompanyProfitRatio(sku.first_level_refund_ratio,sku.second_level_refund_ratio);
        if(_.isNumber(sku.supply_price)  && _.isNumber(sku.company_profit_ratio) && _.isNumber(sku.center_member_price)){
          sku.center_supply_price = this.calculateCenterSupplyPrice(sku.supply_price,sku.center_member_price,sku.company_profit_ratio);
        }
        break;
      case 'second_level_refund_ratio':
        const maxSecondValue = sku.first_level_refund_ratio ? 100 - sku.first_level_refund_ratio : 100;
        sku[name] = sku[name] <0 ? 0: sku[name] > maxSecondValue ? maxSecondValue : sku[name];
        sku.company_profit_ratio =  _.isNumber(sku.first_level_refund_ratio)  &&  this.calculateCompanyProfitRatio(sku.first_level_refund_ratio,sku.second_level_refund_ratio);
        if(_.isNumber(sku.supply_price)  && _.isNumber(sku.company_profit_ratio) && _.isNumber(sku.center_member_price)){
          sku.center_supply_price = this.calculateCenterSupplyPrice(sku.supply_price,sku.center_member_price,sku.company_profit_ratio);
        }
        break;
      case 'sku_price':
        sku.sku_price = this.formatFloat(sku.sku_price);
        _.isNumber(sku.center_member_price) && (sku.coupon_amount = this.calculateCouponAmount(sku.sku_price,sku.center_member_price));
        break;
      case 'sku_ori_price':
        sku.sku_ori_price = this.formatFloat(sku.sku_ori_price);
        break;
    }

    if(sku.center_member_price === sku.supply_price){
      sku.first_level_refund_ratio = sku.second_level_refund_ratio = sku.company_profit_ratio = 0;
      sku.center_supply_price = this.calculateCenterSupplyPrice(sku.supply_price,sku.center_member_price,sku.company_profit_ratio);
    }

    // if(name === 'center_supply_price'){
    //     if(sku.center_member_price){
    //       const rate = this.calculatePrice(sku,'center_profit_rate');
    //       sku.center_profit_rate = this.formatFloat(rate*100);
    //     }else if(sku.center_profit_rate){
    //       const center_member_price =  this.calculatePrice(sku,'center_member_price');
    //       sku.center_member_price = this.formatFloat(center_member_price);
    //     }
    //
    // }else if(name === 'center_profit_rate'){
    //   if(sku.center_member_price){
    //     const center_supply_price = this.calculatePrice(sku,'center_supply_price');
    //     sku.center_supply_price = this.formatFloat(center_supply_price);
    //   }else if(sku.center_profit_rate){
    //     const center_member_price = this.calculatePrice(sku,'center_member_price');
    //     sku.center_member_price = this.formatFloat(center_member_price);
    //   }
    //
    // }else if(name === 'center_member_price'){
    //   if(sku.center_supply_price){
    //     const rate =  this.calculatePrice(sku,'center_profit_rate');
    //     sku.center_profit_rate = this.formatFloat(rate*100);
    //   }else if(sku.center_profit_rate){
    //     const center_supply_price = this.calculatePrice(sku,'center_supply_price');
    //     sku.center_supply_price = this.formatFloat(center_supply_price);
    //   }
    // }else if(name === 'sku_price'){
    //   sku.sku_price = this.formatFloat(sku.sku_price);
    // }else if(name === 'sku_ori_price'){
    //   sku.sku_ori_price = this.formatFloat(sku.sku_ori_price);
    // }
    this.onSkuChanged(shouldChangeExpress);

  }

  onSkuChanged: (shouldChangeExpress?: boolean) => void = (shouldChangeExpress = false) => {
    if (shouldChangeExpress) {
      try{
        this.$timeout.cancel(this.timeout);
        this.timeout = this.$timeout(() => this.getExpressByMaxSku(), 1000);
      }catch (e) {
        console.error(e);
      }
    }
    this.price_table_errors.length = 0;
    this.price_table_dangers.length = 0;
    this.suggest_price_errors.length = 0;
    this.dealer_package_errors.length = 0;

    forEach(this.form_data.sku_list, (sku, index) => {
      if(this.isQuhaodian){
        // 趣好店特殊处理
        const isPriceOk = sku.supply_price <= sku.center_supply_price
                        && sku.center_supply_price <= sku.center_member_price
                        && sku.center_member_price < sku.sku_price
                        && sku.sku_price < sku.sku_ori_price;
        if(+sku.onsale > 0 && !isPriceOk){
          this.suggest_price_errors.push(`SKU ${_.values(this.item.sku_list[index].sku_pros).join('/')} 需满足 成本价≤趣好店供货价≤券后价＜日常售价<市场价；`);
        }
        if(sku.center_member_price !== sku.supply_price && sku.first_level_refund_ratio === 0 && sku.second_level_refund_ratio === 0 && sku.company_profit_ratio === 0){
          this.suggest_price_errors.push(`SKU ${_.values(this.item.sku_list[index].sku_pros).join('/')} 请补充佣金比率;`);
        }
        const dealer_package_type = this.form_data.dealer_package_type;
        if((dealer_package_type === 2 && Number(sku.sku_price) !== 299)
          || (dealer_package_type === 3 && Number(sku.sku_price) !== 399)){
          this.dealer_package_errors.push(`SKU ${_.values(this.item.sku_list[index].sku_pros).join('/')} 需满足 礼包的日常售价需与礼包类型匹配；`);
        }

      }else{
        if (sku.cost_price != null && sku.sku_price != null && sku.sku_ori_price != null) {
          if (!(sku.sku_price <= sku.sku_ori_price) && +sku.onsale > 0) {
            this.price_table_errors.push(`SKU ${
              _.values(this.item.sku_list[index].sku_pros).join('/')} 需满足市场价≥售价`);
          }
        }

        if (+sku.onsale > 0
          && (sku.suggested_retail_price_from && sku.sku_price < sku.suggested_retail_price_from
          || sku.suggested_retail_price_to && sku.sku_price > sku.suggested_retail_price_to)
        ) {
          this.suggest_price_errors.push(`SKU ${
            _.values(this.item.sku_list[index].sku_pros).join('/')} 日常售价需在建议售价范围内`);
        }
      }
    });

  }

  getExpressByMaxSku: (changed?: boolean) => any = (changed = true) => {
    const sku_list_of = changed ? 'form_data' : 'item';
    let max_sku_price = this[sku_list_of].sku_list.length ? _.maxBy(this[sku_list_of].sku_list, o => o['sku_price'])['sku_price'] : 0 // tslint:disable-line
    if (max_sku_price) {
      this.getGoodsExpress(max_sku_price).then(() => {
        const ex_id_list = this.form_data.spu_info.ex_id_list.slice();
        forEach(
          this.express_list,
          (expv, expi) => this.form_data.spu_info.ex_id_list[expi] = undefined,
        );
        forEach(this.express_list, (expv, expi) => {
          forEach(ex_id_list, (v, k) => {
            const _i = _.findIndex(expv.list, o => o['ex_id'] === v);
            if (_i > -1) {
              this.form_data.spu_info.ex_id_list[0] = v;
              this.showExpressDesc();
            } else {
            }
          });
        });
      });
    }
  }

  setSame: (type: string) => void = type =>
    forEach(this.form_data.sku_list, (v, k) => v[type] = this.sameTriger[type])

  onTimeSet: (new_date: Date, old_date: Date | any) => any = (new_date, old_date) =>
    this.sameTriger.release_time
      && forEach(this.form_data.sku_list, sku => sku.release_time = new_date)

  getSyncCheck: (type: string) => void = type => {
    if (type === 'all') {
      for (const item in this.sync_check) {
        this.sync_check[item] = this.sync_check.all;
      }
      this.changeExp();
    } else {
      let flag = true;
      for (const item in this.sync_check) {
        if (item !== 'all') {
          if (this.sync_check[item] === false) {
            flag = false;
          }
        }
      }
      this.sync_check.all = flag;
      if (type === 'ex_id_list') {
        this.changeExp();
      }
      if (type === 'item_desc' && this.sync_check.item_desc) {
        this.form_data.spu_info.item_desc = this.item.item_desc;
      }
    }

  }
  changeExp: () => any = () => {
    if (this.form_data.item_id) {
      if (this.sync_check.ex_id_list) {
        delete this.item.backend_id;
        this.form_data.spu_info.ex_id_list = this.ex_id_list.parent;
        this.getExpressByMaxSku();
      } else {
        if (this.form_data.spu_info.backend_id) {
          this.changeKOL();
        } else {
          this.Notification.warn('请选择KOL账号再切换是否同步物流');
          this.sync_check.ex_id_list = true;
        }
      }
    }
  }

  changeKOL: () => any = () => {
    if (this.form_data.item_id) {
      this.item.backend_id = this.form_data.spu_info.backend_id;
      this.form_data.spu_info.ex_id_list = this.ex_id_list.child || [];
      this.getExpressByMaxSku();
    } else {
      this.form_data.spu_info.backend_id = '';
      this.Notification.warn('请填写母商品ID！');
    }
  }
  onGetParentProduct: () => any = () =>
    this.form_data.item_id
      ? this.getParentProduct(this.form_data.item_id).then(data => this.handleGetProductInfo(data))
      : this.Notification.warn('请填写母商品ID！')

  getParentProduct: (item_id: string) => ng.IPromise<any> = item_id =>
    this.dataService.product_mgr_getParentProduct({ item_id })
      .then(({ data }) => data)

  getChildProduct: (item_id: string) => ng.IPromise<any> = item_id =>
    this.dataService.product_mgr_getChildProduct({ item_id })
      .then(({ data: child }) => {
        this.item = child;
        const {
          parent_id,
          backend_id,
        } = child;
        const { activity_status, seckill_status } = child;
        /**
         * activity_status
         * 0 - 没有参加拼团活动
         * 1 - 待开始
         * 2 - 进行中
         * 3 - 已结束
         */
        this.isInGroupon = activity_status === 1 || activity_status === 2;
        /**
         * seckill_status
         * 0 - 没有参加秒杀活动
         * 1 - 待开始
         * 2 - 进行中
         * 3 - 已结束
         * 4 - 强制结束
         */
        this.isInSeckill = +seckill_status === 1 || +seckill_status === 2;
        this.form_data.item_id = parent_id;
        this.form_data.spu_info.backend_id = backend_id;
        this.form_data.dealer_package_type = child.dealer_package_type || 0;
        if (!_.isUndefined(child.syn_conf)) {
          this.sync_check = {
            ...this.sync_check,
            item_name: !!+child.syn_conf.syn_item_name,
            sell_point: !!+child.syn_conf.syn_sell_point,
            item_main_img_list: !!+child.syn_conf.syn_item_main_img_list,
            item_desc: !!+child.syn_conf.syn_item_desc,
            ex_id_list: !!+child.syn_conf.syn_express,
          };
        }
        this.getParentProduct(parent_id).then(parent => {
          this.form_data.spu_info = {
            ...this.form_data.spu_info,
            item_name: child.syn_conf.syn_item_name === '1' ? parent.item_name : child.item_name,
            item_main_img_list: child.syn_conf.syn_item_main_img_list === '1'
              ? parent.item_main_img_list
              : child.item_main_img_list,
            sell_point: child.syn_conf.syn_sell_point === '1'
              ? parent.sell_point
              : child.sell_point,
            item_desc: child.syn_conf.syn_item_desc === '1' ? parent.item_desc : child.item_desc,
            ex_id_list: child.syn_conf.syn_express === '1' ? parent.ex_id_list : child.ex_id_list,
            expire_time: child.expire_time && new Date(child.expire_time),
            promotion_start_time: child.in_promotion === '1'
              ? new Date(child.promotion_start_time)
              : null,
            promotion_end_time: child.in_promotion === '1'
              ? new Date(child.promotion_end_time)
              : null,
          };
          this.form_data.sku_list = this.handleSkuList(child.sku_list);
          this.item_main_img_list_index = this.form_data.spu_info.item_main_img_list.length;
          // this.item_img_list_index = this.form_data.spu_info.item_img_list.length

          this.item = {
            ...this.item,
            item_name: parent.item_name,
            item_main_img_list: parent.item_main_img_list,
            item_imgurl: parent.item_imgurl,
            sell_point: parent.sell_point,
            // item_img_list: parent.item_img_list,
            item_desc: parent.item_desc,
            ex_id_list: parent.ex_id_list,
            item_created_at: child.item_created_at && new Date(child.item_created_at),
            promotion_start_time: child.in_promotion === '1'
              ? new Date(child.promotion_start_time) : null,
            promotion_end_time: child.in_promotion === '1'
              ? new Date(child.promotion_end_time) : null,
          };
          this.item.sku_list.forEach((sku, index) => {
            this.item.sku_list[index] = {
              ...sku,
              cost_price: sku.cost_price && +sku.cost_price,
              sku_price: this.getParentSkuAttrValue('sku_price', sku.parent_id, parent.sku_list),
              sku_ori_price: this.getParentSkuAttrValue(
                'sku_ori_price',
                sku.parent_id, parent.sku_list,
              ),
              supply_price: this.getParentSkuAttrValue(
                'supply_price',
                sku.parent_id, parent.sku_list,
              ),
              total_stock: this.getParentSkuAttrValue(
                'total_stock',
                sku.parent_id, parent.sku_list,
              ),
              locked_stock: this.getParentSkuAttrValue(
                'locked_stock',
                sku.parent_id, parent.sku_list,
              ),
              free_stock: this.getParentSkuAttrValue(
                'free_stock',
                sku.parent_id, parent.sku_list,
              ),
            };
          });
          // (this.item.syn_conf.syn_express == 0) && (delete this.item.backend_id)
          if (this.item.syn_conf.syn_express === '1') {
            delete this.item.backend_id;
          }
          this.ex_id_list = { parent: parent.ex_id_list, child: child.ex_id_list };
          this.getExpressByMaxSku();
          this.changePromotion();
          // 插入原来的细节图至编辑器底部
          const item_img_list = child.syn_conf.syn_item_img_list === '1'
            ? parent.item_img_list
            : child.item_img_list;
          if (!(this.form_data.spu_info.item_desc as string).includes('<img')
            && _.isArray(item_img_list) && item_img_list.length
          ) {
            item_img_list.map((src: string) => {
              const imgSrc = src.includes('http') || _.startsWith(src, '//')
                ? src
                : `//img-qn.seecsee.com${src}`;
              this.form_data.spu_info.item_desc += `<img src="${imgSrc}" >`;
            });
          }
          this.init_service_desciption();
        });

        if(child){
          this.item_insale = child.item_insale;
          this.in_warehouse = child.in_warehouse;
        }
      })

  showExpressDesc: () => void = () => {
    this.express_list.forEach((path: any) => {
      path.list.forEach((ex: { ex_id: string, express_desc_list: string }) => {
        if (ex.ex_id === this.form_data.spu_info.ex_id_list[0]) {
          this.express_desc = ex.express_desc_list;
        }
      });
    });
  }

  getSellPointLength: () => number = () => {
    let len = 0;
    const val = this.form_data.spu_info.sell_point || '';
    for (let i = 0; i < val.length; i += 1) {
      if (val[i].match(/[^x00-xff]/ig) != null) { // 全角
        len += 2;
      } else {
        len += 1;
      }
    }
    len = Math.ceil(len / 2);
    return len;
  }

  delImage: (type: string, index: number) => any = (type, index) => {
    switch (type) {
      case 'item_main_img_list':
        this.form_data.spu_info.item_main_img_list.splice(index, 1);
        this.item_main_img_list_index -= 1;
        break;
      default:
        return;
    }
  }

  changeOrder: (index1: number, index2: number, type: string) => void = (index1, index2, type) => {
    switch (type) {
      case 'item_main_img':
        this.swapArrEle(this.form_data.spu_info.item_main_img_list, index1, index2);
        break;
      default:
      // this.swapArrEle(this.form_data.spu_info.item_img_list, index1, index2)
    }
  }

  swapArrEle: (arr: any[], k1: number, k2: number) => void = (arr, k1, k2) => {
    let realK2 = k2;
    if (realK2 < 0) {
      realK2 = arr.length - 1;
    } else if (realK2 >= arr.length) {
      realK2 = 0;
    }
    if (k1 < arr.length && realK2 < arr.length) {
      const _t = arr[realK2];
      arr[realK2] = arr[k1];
      arr[k1] = _t;
    }
  }

  resetImage: (file: File, index: number, type: string) => void = (file, index, type) => {
    switch (type) {
      case 'item_main_img':
        this.seeUpload.uploadImage(
          file,
          data => this.form_data.spu_info.item_main_img_list[+index] = data,
        );
        break;
      default:
    }
  }

  checkPromotionStart: (newDate: Date, oldDate: Date | any) => any = (newDate, oldDate) => {
    if (this.type === 'new' && newDate.getTime() < Date.now()) {
      this.Notification.warn('促销开始时间不能为当前之前！');
      this.form_data.spu_info.promotion_start_time = null;
    }
    if (this.type === 'edit' && newDate < this.item.item_created_at) {
      this.Notification.warn('促销开始时间必须在创建时间之后！');
      this.form_data.spu_info.promotion_start_time = this.item.promotion_start_time || null;
    }
  }

  checkPromotionEnd: (newDate: Date, oldDate: Date | any) => any = (newDate, oldDate) => {
    if (this.type === 'new' && newDate.getTime() < Date.now()) {
      this.Notification.warn('促销结束时间必须是当前之后！');
      this.form_data.spu_info.promotion_end_time = null;
    }
    if (this.type === 'edit' && newDate < this.item.item_created_at) {
      this.Notification.warn('促销结束时间必须在创建时间之后！');
      this.form_data.spu_info.promotion_end_time = this.item.promotion_end_time || null;
    }
  }

  checkReleaseTimeIsValid: (newDate: Date, oldDate: Date, index: number) => any =
    (newDate, oldDate, index) => {
      if (this.type === 'new' && newDate.getTime() < Date.now()) {
        this.Notification.warn('释放时间不能为当前之前！');
        if (index === 999) {
          this.sameTriger.release_time = null;
        } else {
          this.form_data.sku_list[index].release_time = null;
        }
      }
      if (this.type === 'edit' && newDate < this.item.item_created_at) {
        this.Notification.warn('释放时间必须在创建时间之后！');
        if (index === 999) {
          this.sameTriger.release_time = null;
        } else {
          this.form_data.sku_list[index].release_time =
            new Date(this.item.sku_list[index].release_time) || null;
        }
      }
    }

  private checkReleaseTime: () => string[] = () => {
    const r: string[] = [];
    forEach(this.form_data.sku_list, (sku, index) => {
      if (sku.lock_quantitative_inventory === 1 && !sku.release_time) {
        r.push(`SKU ${_.values(this.item.sku_list[index].sku_pros).join('/')} 的释放时间为必填！`);
      }
      if (sku.lock_quantitative_inventory === 1 && !sku.sku_stock) {
        r.push(`SKU ${_.values(this.item.sku_list[index].sku_pros).join('/')} 的库存锁定数量为必填！`);
      }
      if (sku.lock_quantitative_inventory === 0 && sku.share_parent_stock === 0) {
        r.push(`SKU ${_.values(this.item.sku_list[index].sku_pros).join('/')} 的闲置库存和锁定库存至少勾选一个！`);
      }
    });
    return r;
  }

  private saveChildProduct: () => any = () => {
    this.errors = [
      ...this.price_table_errors,
      ...this.price_table_dangers,
      ...this.promotion_errors,
      ...this.store_table_errors,
      ...this.checkReleaseTime(),
    ];
    if (!this.form_data.spu_info.backend_id) {
      this.errors.push('请选择分销账号！');
    }
    this.form_data.spu_info.ex_id_list = this.form_data.spu_info.ex_id_list.filter(o => !!o);
    if (!this.sync_check.item_main_img_list
      && this.form_data.spu_info.item_main_img_list.length < 1
    ) {
      this.errors.push('请上传商品主图！');
    }
    if (!this.sync_check.item_desc && this.form_data.spu_info.item_desc.length < 20) {
      this.errors.push('详细描述填写不少于20字！');
    }
    if(this.form_data.spu_info.expire_time){
      // debugger
      if(moment(this.form_data.spu_info.expire_time).isBefore(new Date())){
        this.errors.push('自动下架时间不能晚于当前时间!')
      }
    }
    if (!this.sync_check.ex_id_list && !this.form_data.spu_info.ex_id_list.length) {
      this.errors.push('请选择支持的运费模版！');
    }
    if (!this.sync_check.ex_id_list && this.form_data.spu_info.ex_id_list.length > 3) {
      this.errors.push('最多只能选择3条路线！');
    }
    if (this.errors.length) {
      return;
    }

    const params = {
      item_id: this.item.item_id,
      dealer_package_type:this.form_data.dealer_package_type,
      spu_info: JSON.stringify({
        backend_id: this.form_data.spu_info.backend_id,
        expire_time: this.form_data.spu_info.expire_time
          ? moment(this.form_data.spu_info.expire_time).format('YYYY-MM-DD HH:mm:ss')
          : '',
        item_name: this.sync_check.item_name
          ? this.item.item_name
          : this.form_data.spu_info.item_name,
        item_imgurl: this.item.item_imgurl,
        item_main_img_list: this.sync_check.item_main_img_list
          ? this.item.item_main_img_list
          : this.form_data.spu_info.item_main_img_list,
        sell_point: this.sync_check.sell_point
          ? this.item.sell_point
          : this.form_data.spu_info.sell_point,
        item_desc: this.sync_check.item_desc
          ? this.item.item_desc
          : this.form_data.spu_info.item_desc,
        ex_id_list: this.sync_check.ex_id_list
          ? this.item.ex_id_list.filter(o => !!o)
          : this.form_data.spu_info.ex_id_list,
        in_promotion: !!this.form_data.spu_info.promotion_start_time ? 1 : 0,
        promotion_start_time: !!this.form_data.spu_info.promotion_start_time
          ? moment(this.form_data.spu_info.promotion_start_time).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        promotion_end_time: !!this.form_data.spu_info.promotion_end_time
          ? moment(this.form_data.spu_info.promotion_end_time).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
      }),
      sku_list: JSON.stringify(this.form_data.sku_list.map((sku, index) => ({
        currency: this.item.currency,
        parent_id: sku.parent_id,
        sku_id: sku.sku_id,
        cost_price: sku.cost_price,
        sku_ori_price: sku.sku_ori_price,
        onsale: sku.onsale,
        sku_price: sku.sku_price,
        promotion_price: sku.promotion_price,
        share_parent_stock: sku.share_parent_stock,
        sku_stock: sku.lock_quantitative_inventory ? sku.sku_stock : 0,
        release_time: sku.lock_quantitative_inventory
          ? moment(sku.release_time).format('YYYY-MM-DD HH:mm:ss')
          : '0000-00-00 00:00:00',
        supply_price:sku.supply_price, // 成本价
        center_member_price: sku.center_member_price, // 券后价
        center_supply_price: sku.center_supply_price, //  趣好店供货价
        center_profit_rate: sku.center_profit_rate, // 公司利润率
        first_level_refund_ratio: sku.first_level_refund_ratio,// 一级佣金比率
        second_level_refund_ratio: sku.second_level_refund_ratio,// 二级佣金比率
        company_profit_ratio:sku.company_profit_ratio, // 公司利润比率
      }))),
      syn_conf: JSON.stringify({
        syn_item_name: +this.sync_check.item_name,
        syn_sell_point: +this.sync_check.sell_point,
        syn_item_main_img_list: +this.sync_check.item_main_img_list,
        // syn_item_img_list: +this.sync_check.item_img_list,
        syn_item_desc: +this.sync_check.item_desc,
        // syn_express: +this.sync_check.ex_id_list,
      }),
    };
    const api = this.type === 'edit'
      ? 'product_mgr_editChildProduct'
      : 'product_mgr_addChildProduct';
    return this.dataService[api](params)
      .then(res => {
        this.Notification.success(`${this.type === 'edit' ? '编辑' : '生成'}子商品成功！`);
        if(window.opener){
          window.location.href = window.opener.location.href;
        }else{
          this.$location.path('/goods/all').search({page:1}).hash(this.item_insale);
        }
      });
  }

  private getParentSkuAttrValue: (attr: string, parent_id: string, sku_list: any[]) => any =
    (attr, parent_id, sku_list) => {
      let r;
      forEach(sku_list, (val, index) => {
        if (parent_id === val.sku_id) {
          r = val[attr];
        }
      });
      return r;
    }

  private getGoodsExpress: (max_sku_price: number) => ng.IPromise<any> = max_sku_price => {
    const {
      item_id,
      class_id,
      currency,
      ship_country,
      item_real_weight,
      backend_id,
    } = this.item;
    return this.dataService.express_getGoodsExpress({
      item_id,
      class_id,
      currency,
      ship_country,
      item_real_weight,
      backend_id,
      max_sku_price,
    }).then(res => {
      // 判断返回的数组，与当前物流数组是否一样，如果一致，不需要设置
      const list_ex_id_1 = [];
      const list_ex_id_2 = [];
      forEach(
        this.express_list,
        (v, k) => forEach(v.list, (v_ex, k_ex) => list_ex_id_1.push(v_ex.ex_id)),
      );
      forEach(
        res.data.list,
        (v, k) => forEach(v.list, (v_ex, k_ex) => list_ex_id_2.push(v_ex.ex_id)),
      );
      // console.log('获取的路线ID:' + list_ex_id_2)
      // console.log('当前路线ID:' + list_ex_id_1)
      // console.log('当前选择路线ID:' + this.form_data.spu_info.ex_id_list)
      if (_.intersection(list_ex_id_2, this.form_data.spu_info.ex_id_list).length === 0) {
        this.form_data.spu_info.ex_id_list.length = 0;
        // console.log('当前选择路线条件不满足，将重置')
      }
      if (list_ex_id_1.toString() !== list_ex_id_2.toString()) {
        this.express_list = res.data.list;
        // console.log('运费模版发生变化，重置路线选择')
        return this.express_list;
      } else {
        // console.log('运费模版没发生变化，不重置')
        return false;
      }
    });
  }

  private handleGetProductInfo: (res_data: any) => void = res_data => {
    this.item = res_data;
    this.form_data.spu_info = this.handleItemInfo(res_data);
    this.form_data.spu_info.expire_time = null;
    this.form_data.sku_list = this.handleSkuList(res_data.sku_list);
    this.item_main_img_list_index = this.form_data.spu_info.item_main_img_list.length;
    // this.item_img_list_index = this.form_data.spu_info.item_img_list.length
    this.item.sku_list.forEach((sku, index) => {
      this.item.sku_list[index] = {
        ...sku,
        cost_price: sku.cost_price && +sku.cost_price,
        free_stock: +sku.free_stock,
        locked_stock: +sku.locked_stock,
        sku_ori_price: +sku.sku_ori_price,
        sku_price: +sku.sku_price,
        supply_price: sku.supply_price && +sku.supply_price,
        total_stock: +sku.total_stock,
      };
    });
    this.ex_id_list = { parent: this.form_data.spu_info.ex_id_list, child: [] };
    if (this.sync_check.ex_id_list) {
      this.getExpressByMaxSku();
    }
  }
  // 初始化服务说明
  private init_service_desciption() {
    // if(this.item.parent_id!==0){
    //   this.seven_days_refundDisabled = true;
    // }else{
    //   this.seven_days_refundDisabled = false;
    // }
    this.surport_seven_days_refund = this.item.seven_days_refund==='3';
    this.unsurport_seven_days_refund = this.item.seven_days_refund==='2';
  }

  private getKeyList: () => ng.IPromise<any> = () =>
    this.dataService.user_getAllKOL().then(res => this.list_key = res.data.list_key)

  private handleItemInfo: (data: any) => any = ({
    item_name,
    item_main_img_list,
    sell_point,
    item_img_list,
    item_desc,
    ex_id_list,
  }) => {
    // 插入原来的细节图至编辑器底部
    if (!(item_desc as string).includes('<img')
      && _.isArray(item_img_list)
      && item_img_list.length
    ) {
      item_img_list.map((src: string) => {
        const imgSrc = src.includes('http') || _.startsWith(src, '//')
          ? src
          : `//img-qn.seecsee.com${src}`;
        item_desc += `<img src="${imgSrc}" >`;
      });
    }

    return {
      ...this.form_data.spu_info,
      item_name,
      item_main_img_list,
      sell_point,
      // item_img_list,
      item_desc,
      ex_id_list,
    };
  }

  private handleSkuList: (list_data: any) => any[] = list_data => {
    const r = [];
    if (list_data.length) {
      forEach(list_data, (sku, index) => {
        r[index] = {
          parent_id: sku.sku_id,
          sku_id: this.type === 'edit' ? sku.sku_id : undefined,
          share_parent_stock: this.type === 'edit' ? +sku.share_parent_stock : 1,
          cost_price: sku.cost_price && +sku.cost_price,
          promotion_price: sku.promotion_price,
          lock_quantitative_inventory: sku.release_time
            && sku.release_time !== '0000-00-00 00:00:00' ? 1 : 0,
          release_time: sku.release_time && sku.release_time !== '0000-00-00 00:00:00'
            ? new Date(sku.release_time) : null,
          sku_stock: sku.release_time && sku.release_time !== '0000-00-00 00:00:00'
            && !_.isUndefined(sku.sku_stock) ? +sku.sku_stock : 0,
          sku_price: this.type === 'edit' ? sku.sku_price : this.item.sku_list[index].sku_price,
          suggested_retail_price_to: sku.suggested_retail_price_to,
          suggested_retail_price_from: sku.suggested_retail_price_from,
          sku_ori_price: this.type === 'edit'
            ? sku.sku_ori_price
            : this.item.sku_list[index].sku_ori_price,
          onsale: this.type === 'edit' ? +sku.onsale : 1,
          supply_price:sku.supply_price, // 成本价
          center_member_price: sku.center_member_price, // 券后价
          center_supply_price: sku.center_supply_price, //  趣好店供货价
          center_profit_rate: sku.center_profit_rate, // 公司利润率
          first_level_refund_ratio: +sku.first_level_refund_ratio,// 一级佣金比率
          second_level_refund_ratio: +sku.second_level_refund_ratio,// 二级佣金比率
          company_profit_ratio: +sku.company_profit_ratio, // 公司利润比率
          coupon_amount: this.formatFloat(sku.sku_price - sku.center_member_price)  // 优惠券金额
        };
      });
    }
    return r;
  }

}

export const goodsGenSubGoods: ng.IComponentOptions = {
  template: require('./goods-gen-sub-goods.template.html'),
  controller: GenerateSubGoodsController,
  bindings: {
    type: '@',
  },
};
