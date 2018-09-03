import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as _ from 'lodash';
import * as md5 from 'md5';
import { checkFn, CODES } from '../../utils/permission-helper';
import { EventKolSelectorV2Component } from '../event-ng-module/components/kol-selector-v2/kol-selector-v2.component';
import { EventChildItemsResultV2Component } from '../event-ng-module/components/child-items-result-v2/child-items-result-v2.component';
import { ParentGoodsConfirmComponent } from '../event-ng-module/components/parent-goods-confirm/parent-goods-confirm.component';

// 1=商品 2=拼团 3=秒杀 4=优惠劵 5=下单返券 6=满减 7=微页面
enum BATCH_COPY_TYPE {
  GOODS = 1,
  GROUP = 2,
  SECKILL = 3,
  COUPON = 4,
  ORDER_RETURN_COUPON = 5,
  REDUCE = 6,
  MICRO_PAGE = 7,
}

@Component({
  selector: 'fashion-hot-goods-ng5',
  templateUrl: './fashion-hot-goods-ng5.component.html',
  styles: [
    `
      :host ::ng-deep .label {
        padding: 0;
      }

      :host ::ng-deep .daily_price_invalid input {
        border-color: #f04134 !important;
      }

      :host ::ng-deep .favor-btn {
        margin-left: 8px;
      }

      :host ::ng-deep .no-select .assign-btn,
      :host ::ng-deep .no-select .favor-btn {
        background-color: #d9d9d9;
        border-color: #d9d9d9;
        cursor: not-allowed;
      }
    `,
  ],
})
export class FashionHotGoodsNg5 implements OnInit {
  private seller_privilege = this.$cookies.get('seller_privilege');
  private is_kol = [24, 30].includes(Number(this.seller_privilege));
  private is_superorelect = [7, 10].includes(Number(this.seller_privilege)); // 超管或电商管理员
  public page = ~~this.$routeParams.page || 1;
  private is_show_all = 0;
  public loading = 1;
  public max_page = 0;
  public total_items = 0;
  private show_btn = 0;
  searchForm = {
    kol_flag: this.$routeParams['kol_flag'] || '0',
    goods_flag: this.$routeParams['goods_flag'] || '0',
    sort_flag: this.$routeParams['sort_flag'] || undefined,
    class_type: this.$routeParams['class_type'] || '0',
    filter_class_id: this.$routeParams.filter_class_id,
    filter_country_name: this.$routeParams.filter_country_name,
    keyword: this.$routeParams.keyword,
    filter_price_start: this.$routeParams.filter_price_start
      ? Number(this.$routeParams.filter_price_start)
      : undefined,
    filter_price_end: this.$routeParams.filter_price_end
      ? Number(this.$routeParams.filter_price_end)
      : undefined,
    suggested_retail_price_from: this.$routeParams.suggested_retail_price_from
      ? Number(this.$routeParams.suggested_retail_price_from)
      : undefined,
    suggested_retail_price_to: this.$routeParams.suggested_retail_price_to
      ? Number(this.$routeParams.suggested_retail_price_to)
      : undefined,
    // 批量生成子商品项目中，新增最低日常售价和最高日常售价
    daily_price_from: this.$routeParams.daily_price_from
      ? Number(this.$routeParams.daily_price_from)
      : undefined,
    daily_price_to: this.$routeParams.daily_price_to
      ? Number(this.$routeParams.daily_price_to)
      : undefined,
  };

  dailyPriceInvalid: boolean = false;

  sortFlagString: string;
  private searchFormBrand = {
    keyword: this.$routeParams.keyword,
  };
  private list_goods_status = [
    { id: 0, name: '稳定' },
    { id: 1, name: '不稳定' },
    { id: 2, name: '相对稳定' },
  ];

  private is_focus = false;
  private tmp_price_start: string | number = '';
  private tmp_price_end: string | number = '';
  private hash = this.$location.hash() || '1';
  private selected_class = [];
  private class_list = [];
  private set_class = true;
  private isShow = false;
  goodsCategoryList;
  routeParamsLv1: string[] = Boolean(this.$routeParams.goodsCategoryLevelOne)
    ? this.$routeParams.goodsCategoryLevelOne.split(',')
    : [];
  routeParamsLv2: string[] = Boolean(this.$routeParams.goodsCategoryLevelTwo)
    ? this.$routeParams.goodsCategoryLevelTwo.split(',')
    : [];
  routeParamsLv3: string[] = Boolean(this.$routeParams.goodsCategoryLevelThree)
    ? this.$routeParams.goodsCategoryLevelThree.split(',')
    : [];
  goodsCategoryLevelOne = [];
  goodsCategoryLevelTwo = [];
  goodsCategoryLevelThree = [];
  hotgoods_list = [];
  list_class;
  list_country;
  list_price;
  brand_list;
  pageSize = ~~this.$routeParams.pageSize || 20;
  show_type;
  checkOptions = [
    {
      label: '库存不稳定',
      value: 'goods_flag',
      checked: this.$routeParams['goods_flag'] === '1',
    },
    {
      label: 'kol不可见',
      value: 'kol_flag_no',
      checked: this.$routeParams['kol_flag'] === '2',
    },
    {
      label: 'kol可见',
      value: 'kol_flag_yes',
      checked: this.$routeParams['kol_flag'] === '1',
    },
    {
      label: '国内发货',
      value: 'china_send',
      checked: this.$routeParams['china_send'] === '1',
    },
    {
      label: 'SEE发货',
      value: 'see_send',
      checked: this.$routeParams['see_send'] === '1',
    },
  ];

  oldCheckStatus = JSON.parse(JSON.stringify(this.checkOptions));

  get isKolOrNewBand() {
    return checkFn([CODES.KOL, CODES.New_Brand])();
  }

  constructor(
    @Inject('$location') private $location: ng.ILocationService,
    @Inject('$routeParams') private $routeParams: ng.route.IRouteParamsService,
    @Inject('$q') private $q: ng.IQService,
    @Inject('Notification') private Notification: see.INotificationService,
    @Inject('fashionService') private fashionService,
    @Inject('dataService') private dataService: see.IDataService,
    @Inject('$cookies') private $cookies: ng.cookies.ICookiesService,
    @Inject('seeModal') private seeModal: see.ISeeModalService,
    @Inject('$uibModal') private $uibModal: ng.ui.bootstrap.IModalService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    if (this.is_kol) {
      this.show_type = 'grid';
    } else {
      this.show_type =
        sessionStorage.getItem(md5('show_type')) ||
        (this.is_kol ? 'grid' : 'table');
    }
    const sortFlagMap = {
      0: '默认排序',
      1: '按销量排序',
      2: '按库存排序',
      3: '按利润排序',
      4: '按最新发布排序',
    };
    this.sortFlagString = sortFlagMap[this.searchForm.sort_flag];
    // 电商或超管角色新增
    if (this.is_superorelect) {
      this.checkOptions = this.checkOptions.concat([
        {
          label: '平台化',
          value: 'platform',
          checked: this.$routeParams['platform'] === '1',
        },
        {
          label: '小便宜',
          value: 'small_gain',
          checked: this.$routeParams['small_gain'] === '1',
        },
      ]);
      this.oldCheckStatus = JSON.parse(JSON.stringify(this.checkOptions));
    }
  }

  ngOnInit() {
    this.set_class = true;
    const promises = [
      this.dataService.checkShopStatus(void 0),
      this.getClassList(),
      this.checkPopEditKol(),
    ];
    if (this.isKolOrNewBand === false) {
      promises.push(this.getGoodsClassTree());
    }
    this.$q.all(promises).then(() => this.getItemTopRank());

    this.restoreSelectInfo();
    // if (this.routeCheckedMap) {
    //   this.initCheckedMap(this.routeCheckedMap);
    // }
    this.showPaginaton = false;
  }

  /**** 使用自定义快速跳转 start ****/
  showPaginaton = false;

  ngAfterViewChecked() {
    const pagination = document.querySelector(
      '.ant-table-pagination.ant-pagination',
    );
    if (pagination) {
      this.showPaginaton = true;
      pagination.setAttribute('style', 'margin-right: 100px;');
    }
  }

  quickJumperFun = newPage => {
    this.page = newPage;
    this.showPaginaton = false;
    this.searchNextPage(newPage);
  };

  /**** 使用自定义快速跳转 end ****/

  changeCategory(status: boolean, idx: number, level: number = 1) {
    enum levelMap {
      goodsCategoryLevelOne = 1,
      goodsCategoryLevelTwo,
      goodsCategoryLevelThree,
    }
    this[levelMap[level]][idx].value = status;
    if (status === false) {
      if (level === 2) {
        const children = this.goodsCategoryLevelTwo[idx].children;
        const levelThreeIds = Boolean(children)
          ? children
              .filter(child => this.routeParamsLv3.includes(child.id))
              .map(child => child.id)
          : [];
        this.goodsCategoryLevelThree
          .filter(level => levelThreeIds.includes(level.id))
          .forEach(item => {
            item.value = false;
          });
      }
      if (level === 1) {
        const children = this.goodsCategoryLevelOne[idx].children;
        const levelTwoIds = Boolean(children)
          ? children
              .filter(child => this.routeParamsLv2.includes(child.id))
              .map(child => child.id)
          : [];
        const levelThreeIds = Boolean(children)
          ? children.reduce((acc, value) => {
              value.children
                .filter(grandson => this.routeParamsLv3.includes(grandson.id))
                .forEach(grandson => {
                  acc.push(grandson.id);
                });
              return acc;
            }, [])
          : [];
        this.goodsCategoryLevelTwo
          .filter(level => levelTwoIds.includes(level.id))
          .forEach(item => {
            item.value = false;
          });
        this.goodsCategoryLevelThree
          .filter(level => levelThreeIds.includes(level.id))
          .forEach(item => {
            item.value = false;
          });
      }
    }

    this.submitSearch();
  }

  onFavorChange(item_id, value) {
    const item: any = _.find(this.hotgoods_list, { item_id });
    item && (item.is_favor = value);
  }

  changeShowType(event: Event, type) {
    event.preventDefault();
    this.show_type = type;
    sessionStorage.setItem(md5('show_type'), type);

    this.page = 1;
    this.submitSearch();
  }

  private detectSellPointWetherPop = () => {
    $('.sell-point').each((i, el) => {
      setTimeout(() => {
        const width = $(el).innerWidth();
        if (width && width === el.scrollWidth) {
          $(el)
            .closest('.goods-sell-point-wrap')
            .find('.sell-point-tips')
            .hide();
        }
      }, 1);
    });
  };

  getSellPointTips(item) {
    return item.topic_item_sell_point
      .split(/\r?\n/)
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  onSellGoodsSuccess(item_id) {
    const item: any = _.find(this.hotgoods_list, { item_id });
    if (item) {
      item.is_xdp_item = 1;
    }
  }

  onAddWarehouseSuccess(item_id) {
    const item: any = _.find(this.hotgoods_list, { item_id });
    if (item) {
      item.warehouse_flag = 1;
    }
  }

  addDistributionItem(itemId) {
    return this.dataService
      .kol_mgr_addDistributionItem({ item_ids: `[${itemId}]` })
      .then(res => {
        this.Notification.success('添加到小电铺成功！');
        const i = _.findIndex(this.hotgoods_list, { item_id: itemId });
        this.hotgoods_list[i].is_xdp_item = 1;
      });
  }

  changeOrder(event: Event, sort_flag) {
    event.preventDefault();
    this.searchForm.sort_flag = sort_flag;
    this.page = 1;
    this.submitSearch();
  }

  changeInputPrice() {
    this.is_focus = true;
    if (this.tmp_price_start === '') {
      this.tmp_price_start = this.searchForm.filter_price_start;
      this.tmp_price_end = this.searchForm.filter_price_end;
    }
    this.show_btn = 1;
  }

  lostInput() {
    this.is_focus = false;
    setTimeout(() => {
      if (!this.is_focus) {
        this.show_btn = 0;
      }
    });
  }

  resetInputPrice() {
    this.show_btn = 0;
    this.searchForm.filter_price_start = Number(this.tmp_price_start);
    this.searchForm.filter_price_end = Number(this.tmp_price_end);
  }

  classTypeFilter(class_type) {
    this.searchForm.class_type = class_type;
    this.searchForm.sort_flag = '';
    this.searchForm.kol_flag = '0';
    this.searchForm.goods_flag = '0';
    this.searchForm.keyword = '';
    this.page = 1;
    this.submitSearch();
  }

  getClassList() {
    setTimeout(() => {
      this.isShow = true;
    }, 500);

    return this.dataService.mall_mallClassChoice({}).then(res => {
      this.class_list = res.data.class_list;

      const tmp_class_id = this.$routeParams['tmp_class_id']
        ? JSON.parse(decodeURIComponent(this.$routeParams['tmp_class_id']))
        : [];
      tmp_class_id.length &&
        _.forEach(tmp_class_id, c1 => {
          _.forEach(this.class_list, c2 => {
            if (Number(c1) === Number(c2.class_id)) {
              this.selected_class.push(c2);
            }
          });
        });
    });
  }

  /** 临时加的法务需求，强制让Kol编辑资料，并且在几个页面加判断 */
  private checkPopEditKol() {
    return this.dataService.seller_checkPopEditKol().then(res => {
      if (Number(res.data.pop) === 1) {
        this.seeModal
          .confirmP(
            '注意',
            '后台系统升级，为了提升账号安全性，请你前往个人中心补充个人信息',
            '现在就去^_^',
            false,
          )
          .then(() =>
            this.$location.url(
              'personalInfo/account/modifyinfo-kol?id=' + res.data.id,
            ),
          );
      }
    });
  }

  deleteItem(item_id) {
    this.dataService
      .item_deleteItem({ item_id })
      .then(() => this.Notification.success());
  }

  selectTab() {
    this.$location.search({});
  }

  private getCheckOptionFlag(fieldValue: string, value: string = '1') {
    return _.find(this.checkOptions, { value: fieldValue }).checked === true
      ? value
      : undefined;
  }

  private getCheckOptionFlagObject() {
    const result = this.checkOptions.reduce((acc, option, index, arr) => {
      let number = '1';
      if (option.value === 'kol_flag_yes') {
        const tmpKolFlag = this.getCheckOptionFlag(option.value, number);
        if (tmpKolFlag) {
          acc['kol_flag'] = tmpKolFlag;
        }
      } else if (option.value === 'kol_flag_no') {
        number = '2';
        const tmpKolFlag = this.getCheckOptionFlag(option.value, number);
        if (tmpKolFlag) {
          acc['kol_flag'] = tmpKolFlag;
        }
      } else {
        acc[option.value] = this.getCheckOptionFlag(option.value, number);
      }
      return acc;
    }, {});
    if (!result['kol_flag']) {
      result['kol_flag'] = undefined;
    }
    return result;
  }

  private getIdString(categoryLevel: any[]): string {
    return (
      categoryLevel
        .filter(item => item.value === true)
        .map(item => item.id)
        .join(',') || undefined
    );
  }

  // private get goodsCategoryLevelRouteParams() {

  //   return {
  //     goodsCategoryLevelOne,
  //     goodsCategoryLevelTwo,
  //     goodsCategoryLevelThree,
  //   }
  // }

  updateDailyPriceValid(from, to) {
    if (!from || !to || +from <= +to) {
      this.dailyPriceInvalid = false;
    }
  }

  dailyPriceInvalidFrom(daily_price_from) {
    const { daily_price_to } = this.searchForm;
    this.updateDailyPriceValid(daily_price_from, daily_price_to);
  }

  dailyPriceInvalidTo(daily_price_to) {
    const { daily_price_from } = this.searchForm;
    this.updateDailyPriceValid(daily_price_from, daily_price_to);
  }

  submitSearch() {
    const { daily_price_from, daily_price_to } = this.searchForm;
    if (
      daily_price_from &&
      daily_price_to &&
      +daily_price_from > +daily_price_to
    ) {
      this.message.create('warning', '最低日常售价不应大于最高日常售价');
      this.dailyPriceInvalid = true;
      return;
    }
    this.saveSelectInfo();
    this.$location.search({
      ...this.$location.search(),
      ...this.searchForm,
      ...this.getCheckOptionFlagObject(),
      page: 1,
      pageSize: this.pageSize,
      // checked_map: this.getCheckedMapString(),
      goodsCategoryLevelOne: this.getIdString(this.goodsCategoryLevelOne),
      goodsCategoryLevelTwo: this.getIdString(this.goodsCategoryLevelTwo),
      goodsCategoryLevelThree: this.getIdString(this.goodsCategoryLevelThree),
      tmp_class_id:
        (this.selected_class.length &&
          JSON.stringify(this.selected_class.map(o => o.class_id))) ||
        undefined,
    });
  }

  submitSearchBrand() {
    this.$location.search(
      _.assignIn({}, this.$location.search(), this.searchFormBrand),
    );
    this.ngOnInit();
  }

  addGoodsModal() {
    this.fashionService.addGoodsModal().then(() => this.ngOnInit());
  }

  hideGoods(event: Event, index, is_public) {
    // event.preventDefault();
    // const tips =
    //   is_public === 0
    //     ? '确认设置该商品对KOL可见？'
    //     : '确认设置该商品对KOL隐藏？';
    // this.seeModal.confirm('确认提示', tips, () => {
    const id = this.hotgoods_list[index].item_id;
    return this.dataService
      .data_api_materialHideItems({
        ids: id,
        hide_status: +!is_public,
        is_v2: 1,
      })
      .then(res => this.message.success('恭喜！操作成功！'))
      .catch(() => this.getItemTopRank());
    // });
  }

  getNextPage() {
    if (this.loading) {
      return;
    }
    if (this.page >= this.max_page) {
      this.is_show_all = 1;
      return;
    }

    this.page += 1;
    this.getItemTopRank(0, true);
  }

  searchNextPage(value) {
    this.saveSelectInfo();
    this.$location.search({
      ...this.$location.search(),
      page: value,
      pageSize: this.pageSize,
      // checked_map: this.getCheckedMapString(),
    });
  }

  private formatObjectToArray(object: any, routeParams: string | null) {
    return Object.keys(object).map(key => {
      const item = object[key];
      return {
        id: item.class_id,
        text: item.class_name,
        value: this.$routeParams[routeParams]
          ? this.$routeParams[routeParams].includes(item.class_id)
          : false,
        children: item.children
          ? this.formatObjectToArray(item.children, routeParams)
          : undefined,
      };
    });
  }

  private getGoodsCategoryLevelTwoAndThree(
    fatherCategory: any[],
    fatherRouteParams: string[],
    selfRouteParams: string[],
  ) {
    return fatherRouteParams.reduce((acc, value) => {
      const father = _.find(fatherCategory, { id: value });
      if (!father) {
        return [];
      }
      return [
        ...acc,
        ...father.children.map(item => ({
          ...item,
          value: selfRouteParams.includes(item.id),
        })),
      ];
    }, []);
  }

  private getGoodsClassTree(): ng.IPromise<any> {
    return this.dataService.item_class2Tree({ only_on: 1 }).then(({ data }) => {
      this.goodsCategoryList = data;

      this.goodsCategoryLevelOne = this.formatObjectToArray(
        data,
        'goodsCategoryLevelOne',
      );

      this.goodsCategoryLevelTwo = this.getGoodsCategoryLevelTwoAndThree(
        this.goodsCategoryLevelOne,
        this.routeParamsLv1,
        this.routeParamsLv2,
      );
      this.goodsCategoryLevelThree = this.getGoodsCategoryLevelTwoAndThree(
        this.goodsCategoryLevelTwo,
        this.routeParamsLv2,
        this.routeParamsLv3,
      );
      return this.goodsCategoryList;
    });
  }

  private formatInfo = (list: any[]) => {
    list
      .filter(item => item.brand_name === '')
      .forEach(item => (item.brand_name = '-'));
    list
      .filter(item => item.class_name === '')
      .forEach(item => (item.class_name = '-'));
    list.forEach(item => {
      item.word_link = (item.word_link as string).startsWith('http')
        ? `<a href="${item.word_link}" target="_blank">${item.word_link}</a>`
        : item.word_link;
    });
    return list;
  };

  private get classParams() {
    const class_3 = new Set(this.routeParamsLv3);

    const class_2 = new Set(this.routeParamsLv2);
    this.goodsCategoryLevelTwo
      .filter(
        level =>
          Boolean(level.children) &&
          level.children.filter(child => class_3.has(child.id)).length > 0,
      )
      .forEach(level => {
        class_2.delete(level.id);
      });

    const class_1 = new Set(this.routeParamsLv1);
    this.goodsCategoryLevelOne
      .filter(
        level =>
          Boolean(level.children) &&
          level.children.filter(child => class_2.has(child.id)).length > 0,
      )
      .concat(
        this.goodsCategoryLevelOne.filter(
          level =>
            Boolean(level.children) &&
            level.children.filter(
              child =>
                Boolean(child.children) &&
                child.children.filter(grandson => class_3.has(grandson.id))
                  .length > 0,
            ).length > 0,
        ),
      )
      .forEach(level => {
        class_1.delete(level.id);
      });

    return {
      class_1: Array.from(class_1),
      class_2: Array.from(class_2),
      class_3: Array.from(class_3),
    };
  }

  // select_flag 0：按热度  1：按时间
  getItemTopRank(select_flag = 0, add_to_ori = false) {
    this.is_show_all = 0;
    this.loading = 1;
    let filter_class_id = [];
    if (this.$routeParams['tmp_class_id']) {
      const tmp_class_id = JSON.parse(
        decodeURIComponent(this.$routeParams['tmp_class_id']),
      );
      _.forEach(tmp_class_id, c2 => {
        filter_class_id.push(c2);
      });
    }

    const classParams = Object.keys(this.classParams).reduce((acc, value) => {
      acc[value] = this.classParams[value].join(',');
      return acc;
    }, {});

    const params = {
      select_flag,
      ...this.getCheckOptionFlagObject(),
      ...classParams,
      page: this.page,
      page_size: this.pageSize,
      seller_privilege: this.seller_privilege,
      sort_flag: this.searchForm.sort_flag,
      filter_class_id: JSON.stringify(filter_class_id),
      filter_price_start: this.searchForm.filter_price_start || 0,
      filter_price_end: this.searchForm.filter_price_end || 0,
      // suggested_retail_price_from: this.searchForm.suggested_retail_price_from,
      // suggested_retail_price_to: this.searchForm.suggested_retail_price_to,
      suggested_retail_price_from: this.searchForm.daily_price_from,
      suggested_retail_price_to: this.searchForm.daily_price_to,
      filter_country_name: JSON.stringify(this.searchForm.filter_country_name),
      keyword: this.searchForm.keyword,
    };
    if (Number(this.searchForm.class_type) > 0) {
      filter_class_id = [this.searchForm.class_type];
      params.filter_class_id = JSON.stringify(filter_class_id);
    }

    return this.dataService.data_api_materialSelectItem(params).then(
      ({ data }) => {
        this.loading = 0;
        if (Boolean(data)) {
          if (!add_to_ori) {
            this.hotgoods_list = this.formatInfo(data.list_item);
            this.list_class = data.list_class;
            this.list_country = data.list_country;
            this.list_price = data.list_price;
            this.total_items = data.count_item;
            this.max_page = Math.ceil(this.total_items / this.pageSize);
          } else {
            const tmp_list = this.formatInfo(data.list_item);
            for (let i = 0; i < tmp_list.length; i += 1) {
              this.hotgoods_list.push(tmp_list[i]);
            }
          }
          setTimeout(this.detectSellPointWetherPop, 10);
          this._refreshStatus();
          return this.hotgoods_list;
        }
        this.Notification.serverError();
      },
      res => {
        this.loading = 0;
      },
    );
  }

  materialSync(event: Event, id) {
    event.preventDefault();
    this.seeModal.confirm('确认提示', '确认要将商品移出单品库？', () => {
      return this.dataService
        .data_api_materialDelItem({
          item_id: id,
        })
        .then(res => {
          this.Notification.success('移出单品库成功');
          return this.ngOnInit();
        });
    });
  }

  materialTop(event: Event, id, flag) {
    event.preventDefault();
    const tips = flag === 1 ? '确认要取消置顶？' : '确认要置顶？';
    this.seeModal.confirm('确认提示', tips, () => {
      return this.dataService
        .data_api_materialTop({
          top_flag: +!flag,
          ids: id,
          is_v2: 1,
        })
        .then(res => {
          this.Notification.success(flag === 1 ? '取消' : '' + '置顶成功！');
          return this.ngOnInit();
        });
    });
  }

  saveNotes(data, item_id) {
    if (data && data.trim()) {
      return this.dataService
        .data_api_materialNotes({
          item_id,
          opt_type: 2,
          notes: data,
          is_v2: 1,
        })
        .then(res => {
          this.Notification.success('添加备注成功！');
          return this.ngOnInit();
        });
    }
  }

  saveRecommend(data, item_id) {
    if (data && data.trim()) {
      return this.dataService
        .data_api_materialRecommend({
          item_id,
          opt_type: 2,
          recommend: data,
          is_v2: 1,
        })
        .then(res => {
          this.Notification.success('添加推荐理由成功！');
          return this.ngOnInit();
        });
    }
  }

  materialSupplyPrice(item_id, supply_price_start, supply_price_end) {
    return this.fashionService
      .materialSupplyPrice(item_id, supply_price_start, supply_price_end)
      .then(() => this.ngOnInit());
  }

  /************************** 单品品牌相关接口 **************************/
  // 获取品牌列表
  materialBrandList() {
    const filter_info = {
      keyword: this.searchFormBrand.keyword,
    };
    const params = {
      page: this.page,
      page_size: this.pageSize,
      filter_info: JSON.stringify(filter_info),
    };
    return this.dataService.data_api_materialBrandList(params).then(res => {
      this.brand_list = res.data.list;
      this.total_items = res.data.count;
      return this.brand_list;
    });
  }

  changeGoodsStatus(event: Event, index: number, goods_status) {
    event.preventDefault();
    // const tips = '确认要修改库存状态?';
    // this.seeModal.confirm(
    //   '确认提示',
    //   tips,
    //   () => {
    const item_id = this.hotgoods_list[index].item_id;
    return this.dataService
      .data_api_materialGoodsStatus({
        goods_status,
        item_id,
        is_v2: 1,
      })
      .then(res => this.message.success('恭喜！操作成功！'))
      .catch(() => this.getItemTopRank());
    // },
    // () => {},
    // );
  }

  addBrandModal(kol_brand_id) {
    this.fashionService.addBrandModal(kol_brand_id).then(() => {
      this.ngOnInit();
    });
  }

  materialBrandDelete(kol_brand_id) {
    this.fashionService.materialBrandDelete(kol_brand_id, () => {
      this.ngOnInit();
    });
  }

  // 显示选择品类的表
  toSelectClass() {
    // console.log($ctrl.selected_class);
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../datacenter/modal-select-class.html'),
      controller: 'modalSelectClassController',
      controllerAs: 'vm',
      resolve: {
        // 获取选择的列表
        selected_class: () => this.selected_class,
        // 获取全部的列表
        class_list: () => this.class_list,
      },
    });

    return modalInstance.result.then((new_selected_class: any[]) => {
      this.selected_class = new_selected_class;
      this.submitSearch();
    });
  }

  // 在搜索中显示
  getSelectedClassName() {
    return this.selected_class.map(o => o.class_name).join(',');
  }

  /**** 单品品牌相关接口 end ****/

  /**** 批量生成子商品 start ****/
  get materialItemIds(): any[] {
    return Object.keys(this.checkedMap)
      .filter(item_id => this.checkedMap[item_id])
      .map(idStr => +idStr);
  }
  targetKols: any[] = [];
  get xdpIdList(): number[] {
    return this.targetKols.map(cur => cur.weixinAuthInfoId);
  }

  parentGoodsConfirm() {
    if (!this.selectedCount) {
      this.message.create('warning', '请至少选择一个商品');
      return;
    }
    this.modalService
      .open({
        title: '母商品确认',
        content: ParentGoodsConfirmComponent,
        onOk() {},
        width: 700,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          selectGoods: this.selectGoods,
        },
      })
      .subscribe(output => {
        if (typeof output === 'object' && output.type) {
          this.selectGoods = output.selectGoods;
          this.updateCheckedMap(output.selectGoods);
          this._refreshStatus();
          if (output.type === 'assign') {
            this.selectKOLs();
          }
        }
      });
  }

  updateCheckedMap(selectGoods) {
    const tmpObj = {};
    Object.keys(selectGoods).forEach(id => {
      tmpObj[id] = true;
    });
    this.checkedMap = tmpObj;
  }

  selectKOLs() {
    this.modalService
      .open({
        title: 'KOL选择',
        content: EventKolSelectorV2Component,
        onOk() {},
        width: 1000,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          confirmText: '子商品生成',
        },
      })
      .subscribe(targetKols => {
        if (typeof targetKols === 'object' && targetKols.length) {
          this.targetKols = targetKols;
          this.batchChildgoods();
        }
      });
  }

  _allChecked = false;
  _indeterminate = false;
  routeCheckedMap = this.$routeParams.checked_map || undefined;
  checkedMap = Object.create(null);

  selectGoods = {};

  get selectedCount(): number {
    return this.materialItemIds.length;
  }

  clearChecked() {
    this.checkedMap = {};
    this.selectGoods = {};
    this._refreshStatus();
  }

  _displayDataChange($event) {
    this._refreshStatus();
  }

  _refreshStatus() {
    const allChecked =
      this.hotgoods_list.length &&
      this.hotgoods_list.every(
        value => this.checkedMap[value.item_id] === true,
      );
    const allUnChecked = this.hotgoods_list.every(
      value => !this.checkedMap[value.item_id],
    );
    this._allChecked = allChecked;
    this._indeterminate = !allChecked && !allUnChecked;

    // update selectGoods
    this.hotgoods_list.forEach(item => {
      const { item_id, item_imgurl, item_name, is_favor } = item;
      if (this.checkedMap[item_id] === true) {
        this.selectGoods[item_id] = {
          item_id,
          item_imgurl,
          item_name,
          is_favor,
        };
      } else {
        delete this.selectGoods[item_id];
      }
    });
  }

  _checkAll(value) {
    if (value) {
      this.hotgoods_list.forEach(item => {
        this.checkedMap[item.item_id] = true;
      });
    } else {
      this.hotgoods_list.forEach(item => {
        this.checkedMap[item.item_id] = false;
      });
    }
    this._refreshStatus();
  }

  selectMaterialItem(event, item_id) {
    if (
      event.target.tagName === 'TD' ||
      (event.target.tagName === 'SPAN' && !event.target.childElementCount)
    ) {
      this.checkedMap[item_id] = !this.checkedMap[item_id];
      this._refreshStatus();
    }
  }

  searchNewPageSize(value) {
    this.saveSelectInfo();
    this.$location.search({
      ...this.$location.search(),
      page: 1,
      pageSize: this.pageSize,
      // checked_map: this.getCheckedMapString(),
    });
  }

  _isSpinning: boolean = false;
  // 批量生成子商品
  batchChildgoods() {
    this._isSpinning = true;

    const BatchCopyAddReq = {
      destXdpIds: this.xdpIdList,
      sourceIds: this.materialItemIds,
      type: BATCH_COPY_TYPE.GOODS,
    };
    // 开启批量复制任务
    this.dataService.ng_batchCopy_add(BatchCopyAddReq).then(
      res => {
        this._isSpinning = false;
        if (!res) {
          return;
        }
        const { batchId } = res.data;
        if (!batchId) {
          this.message.create('error', '无法获取任务ID！');
          return;
        }
        this.showChildItemsResult(batchId, BATCH_COPY_TYPE.GOODS);
      },
      err => {
        this._isSpinning = false;
        this.message.create('error', '创建任务失败！');
        console.log('add_err', err);
      },
    );
  }

  // 生成子商品结果
  showChildItemsResult(batchId: string, type: BATCH_COPY_TYPE): void {
    this.modalService
      .open({
        title: '生成子商品结果',
        content: EventChildItemsResultV2Component,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          batchId,
          type,
          exitBtn: { show: true, type: 'default' },
          exportBtn: { show: true, type: 'primary' },
        },
      })
      .subscribe(exitSignal => {
        // 批量指派
        if (exitSignal === 'batchAssign') {
          console.log('get signal: batchAssign!');
        }
      });
  }

  /* getCheckedMapString() {
    return Object.keys(this.checkedMap)
      .filter(item_id => this.checkedMap[item_id])
      .join(',');
  }

  initCheckedMap(mapStr) {
    mapStr.split(',').forEach(id => {
      this.checkedMap[+id] = true;
    });
  } */

  saveSelectInfo() {
    window['fashion_checkedMap'] = this.checkedMap;
    window['fashion_selectGoods'] = this.selectGoods;
  }

  restoreSelectInfo() {
    if (window['fashion_checkedMap']) {
      this.checkedMap = window['fashion_checkedMap'];
    }
    if (window['fashion_selectGoods']) {
      this.selectGoods = window['fashion_selectGoods'];
    }
  }

  /**** 批量生成子商品 end ****/

  /**** 热门单品收藏夹功能 start ****/
  changeFavor(isAdd: boolean, item_id: string): void {
    const del = isAdd ? 0 : 1;
    this.materialFavorItemAdd(item_id, del);
  }
  selectedFavorIds(isFavor: number) {
    return Object.keys(this.selectGoods)
      .filter(item_id => this.selectGoods[item_id].is_favor === isFavor)
      .map(idStr => +idStr);
  }
  batchFavor(isAdd: boolean): void {
    if (!this.selectedCount) {
      this.message.create('warning', '请至少选择一个商品');
      return;
    }
    const del = isAdd ? 0 : 1;
    const item_id = this.selectedFavorIds(isAdd ? 0 : 1).join(',');
    if (item_id) {
      this.materialFavorItemAdd(item_id, del);
    } else {
      this.message.create('success', `${del === 1 ? '取消' : '收藏'}成功！`);
    }
  }
  materialFavorItemAdd(item_id: string, del: number): void {
    this.fashionService.materialFavorItemAdd(item_id, del).then(res => {
      this.dataService.updateFavourCount({});
      this.updateFavorFlag(item_id, del);
    });
  }
  updateFavorFlag(id: string, del: number) {
    const idArr = id.split(',');
    idArr.forEach(item_id => {
      const item: any = _.find(this.hotgoods_list, { item_id });
      const is_favor = del === 1 ? 0 : 1;
      item.is_favor = is_favor;
      if (this.selectGoods[item_id]) {
        this.selectGoods[item_id].is_favor = is_favor;
      }
    });
  }
  showFavorList() {
    this.router.navigate(['/fashion/hot-goods-v2/favor'], {
      relativeTo: this.route,
    });
  }

  changeCheckbox() {
    if (
      this.getCheckOptionFlag('kol_flag_yes', '1') &&
      this.getCheckOptionFlag('kol_flag_no', '2')
    ) {
      const oldCheckKolFlag = _.find(
        this.oldCheckStatus,
        (option: any) =>
          option.value.indexOf('kol_flag') !== -1 && option.checked,
      );
      _.find(
        this.checkOptions,
        { value: oldCheckKolFlag.value },
      ).checked = false;
    }
    this.submitSearch();
  }
  /**** 热门单品收藏夹功能 end ****/
}
