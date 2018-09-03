import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { stringify } from 'query-string';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
// import * as fromStore from '../store';
import { _HttpClient, ModalHelper } from '@shared/services';
import { CODES } from '@utils';
import { getItem } from '@utils/storage';
import { StoreConstructionState } from '../store/reducers/index';
import {
  getTargetKolId,
  getTargetWechatId,
  getTargetSellerMobile,
  getTargetXdpId,
} from '../store/selectors/editor.selectors';
import { getData } from '../../../auth-v2/app/services';
import {
  mapStatusTypes,
  discountRule,
} from '../../benefit/services/benefit.constant';

const isAdmin = () => {
  return [CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin].includes(
    getItem('seller_privilege') >>> 0,
  );
};

enum SECKILL_STATUS_MAP {
  '待开始' = 1,
  '进行中' = 2,
}

export type IAddType = {
  /**
   * 模态框头部标题
   */
  title: string;
  /**
   * 模态框尺寸
   */
  size?: number | '' | 'lg' | 'sm' | 'md';
  /**
   * HTTP Service
   */
  fetch?: (params: any) => Observable<see.ICommonResponse<any>>;
  /**
   * 搜索框占位符
   */
  placeholder?: string;
  /**
   * 每页数据量
   */
  pageSize?: number;
  /**
   * 限制总数量
   */
  limit?: number;
  /**
   * 数量达到上限展示的提示信息
   */
  limitInfo?: string;
  /**
   * 表头字段
   */
  th?: string[];
  /**
   * 动态计算表格内容
   */
  getTd?: (data: any) => any;
  /**
   * 表单元素 二维 HTML 字符串
   */
  td?: any;
  /**
   * 第一个选择框
   */
  selectOne?: any;
  /**
   * 第二个选择框
   */
  selectTwo?: any;
  /**
   * 列表为空时的提示信息
   */
  listEmptyInfo?: string;
  /**
   * 列表为空时的创建按钮文字
   */
  listEmptyButton?: string;
  /**
   * 表单中的创建按钮文字
   */
  openButton?: string;
  /**
   * 创建跳转地址
   */
  getOpenUrl?: (
    kolId?: number | string,
    wechatId?: number | string,
    xdpId?: number | string,
  ) => string | Promise<string>;
  /**
   * 添加/选择按钮的文字
   */
  addBtnText?: string;
  /**
   * 列表 id 键
   */
  idKeyStr?: string;
};

export type IAddTypeList = {
  [key: string]: IAddType;
};

export type IFormData = {
  keyword: string;
  selectOne: number;
  selectTwo: number;
};

export type IParams = {
  kolId: number;
  page: number;
  pageSize: number;
  xdpId?: any;
};

const grouponType: IAddType = {
  title: '添加拼团活动',
  idKeyStr: 'id',
  placeholder: '请输入商品名',
  pageSize: 5,
  limit: 20,
  limitInfo: '拼团活动最多添加20个',
  listEmptyInfo:
    '当前暂无有效拼团活动可以进行配置\n请在“营销工具”模块创建拼团后\n再返回这里配置~',
  listEmptyButton: '新建拼团活动',
  openButton: '新建拼团',
  getOpenUrl(kolId: number | string, wechat_id: number | string) {
    let path = '/event/group';
    if (kolId || wechat_id) {
      return (path += `?${stringify({
        kolId,
        wechat_id,
      })}`);
    }
    return path;
  },
  selectOne: {
    placeholder: '所有活动状态',
    options: [
      { label: '待开始', value: SECKILL_STATUS_MAP['待开始'] },
      { label: '进行中', value: SECKILL_STATUS_MAP['进行中'] },
    ],
  },
  th: [
    '活动封面图',
    '商品名称',
    '拼团价/日常售价',
    '拼团类型',
    '活动时间',
    '活动状态',
  ],
  getTd: (list: any[]): string[][] => {
    if (!list || (Array.isArray(list) && list.length === 0)) {
      return [];
    }
    return list.map(() => [
      `
      <div class="img-container img-container-sm">
        <img [seeSrc]="item.bannerUrl" seeViewer />
      </div>
      `,
      `
      <ellipsis lines="2" style="max-width: 200px">
        <span [title]="item.productName" [innerText]="item.productName"></span>
      </ellipsis>
      `,
      `{{ item.minGrouponPrice | _currency }}&amp;{{ item.itemPrice | _currency }}`,
      '{{ item.type | grouponType }}',
      `
      {{ item.startTime | date: 'yyyy-MM-dd HH:mm' }}
        ~
      {{ item.endTime | date: 'yyyy-MM-dd HH:mm' }}`,
      '{{ item.status | grouponStatus }}',
    ]);
  },
};

const salesPromotion: IAddType = {
  title: '添加满减活动',
  idKeyStr: 'id',
  placeholder: '请输入满减活动名称',
  pageSize: 5,
  limit: 1,
  limitInfo: '满减活动最多添加1个',
  listEmptyInfo: '当前没有商品可以放入该模块\n请添加商品后，再返回这里配置~',
  listEmptyButton: isAdmin() ? '' : '添加商品',
  selectOne: {
    placeholder: '未开始',
    options: [{ label: '未开始', value: 0 }, { label: '进行中', value: 1 }],
  },
  selectTwo: {
    placeholder: '优惠规则',
    options: [{ label: '满额减', value: 0 }, { label: '满件折', value: 1 }],
  },
  getOpenUrl(
    kolId: number | string,
    wechat_id: number | string,
    xdpId: number | string,
  ) {
    let path = '/kol-benefit';
    if (kolId || wechat_id) {
      return (path += `/v2/${kolId}/${wechat_id ||
        0}/${xdpId}/benefit-add?xpdId=${xdpId}`);
    }
    return path;
  },
  th: ['活动名称', '活动时间', '优惠规则', '活动状态'],
  getTd: (list: any[]): string[][] => {
    if (!list || (Array.isArray(list) && list.length === 0)) {
      return [];
    }
    return list.map(() => [
      '{{ item.activityName}}',
      `{{ item.startTime | date: 'yyyy-MM-dd HH:mm' }} ~ {{ item.endTime | date: 'yyyy-MM-dd HH:mm' }}`,
      '{{ item.thresholdTypeText}}',
      '{{ item.statusText}}',
    ]);
  },
};

const goodsType: IAddType = {
  title: '',
  size: 'lg',
  idKeyStr: 'item_id',
  placeholder: '请输入商品名称',
  pageSize: 5,
  limit: 20,
  limitInfo: '爆款商品最多添加20个',
  listEmptyInfo: '当前没有商品可以放入该模块\n请添加商品后，再返回这里配置~',
  listEmptyButton: isAdmin() ? '' : '添加商品',
  getOpenUrl() {
    return '/fashion/hot-goods-v2';
  },
  selectOne: {
    placeholder: '全部商品类型',
    options: [{ label: '自营', value: 1 }, { label: '分销', value: 2 }],
  },
  // selectTwo: {
  //   placeholder: '全部添加状态',
  //   options: [{ label: '已添加', value: 1 }, { label: '未添加', value: 0 }],
  // },
  th: ['商品图', '商品名', '价格', '售卖状态'],
  getTd: (list: any[]): string[][] => {
    if (!list || (Array.isArray(list) && list.length === 0)) {
      return [];
    }
    return list.map(() => [
      `
      <div class="img-container img-container-sm">
        <img [seeSrc]="item.imgurl" seeViewer />
      </div>
      `,
      `
      <ellipsis lines="2" style="max-width: 100px">
        <span [title]="item.item_name" [innerText]="item.item_name"></span>
      </ellipsis>
      `,
      `{{ item.item_price | _currency }}`,
      '{{ item.item_status}}',
    ]);
  },
};

export enum MODAL_TYPE {
  /** 跳转商品链接 */
  GOODS_LINK = 'goodsLink',
  /** 跳转文章链接 */
  ARTICLE = 'articleLink',
  /** 跳转微页面链接**/
  MICRO_PAGE = 'microPage',
  /** 优惠券 */
  COUPON = 'coupon',
  /** 爆款商品 */
  HOT_GOODS = 'hotGoods',
  /** 商品分组 */
  CATEGORY = 'category',
  /** 秒杀活动 */
  SPEED_KILL = 'seckill',
  /** 爆款拼团 */
  GROUP_BUY = 'hotGroup',
  /** 抽奖团 */
  GROUP_LOTTERY = 'luckyGroup',
  /** 拼团 */
  GROUPON = 'groupon',
  /** 满减活动*/
  SALES_PROMOTION = 'salesPromotion',
}

@Injectable()
export class AddItemsService {
  private get isAdmin(): boolean {
    return isAdmin();
  }
  private TYPE_LIST: IAddTypeList = {
    /**
     * 添加优惠券
     */
    [MODAL_TYPE.COUPON]: {
      title: '优惠券列表',
      idKeyStr: 'id',
      fetch: (params: any) => this.getAllCouponList(params),
      placeholder: '请输入优惠券名称',
      pageSize: 8,
      limit: 15,
      limitInfo: '优惠券最多添加15个',
      listEmptyInfo:
        '当前没有生效的优惠券可以配置到小电铺\n请在“营销工具”模块创建优惠券后\n再返回这里配置~',
      listEmptyButton: '创建优惠券',
      openButton: '创建优惠券',
      getOpenUrl: () => {
        let path = '/event/couponv2';
        if (this.isAdmin) {
          return (path += `?${stringify({
            kolId: this.kolId,
            name: this.sellerMobile,
          })}`);
        }
        return path;
      },
      selectOne: {
        placeholder: '所有状态',
        options: [{ label: '发放中', value: 3 }, { label: '已领完', value: 4 }],
      },
      selectTwo: {
        placeholder: '所有领取资格',
        options: [
          { label: '全体用户', value: 1 },
          { label: '仅限新用户', value: 2 },
        ],
      },
      th: ['名称', '面额&门槛', '有效期', '状态', '领取资格', '限领/人'],
      getTd: (list: any[]): string[][] => {
        if (!list || (Array.isArray(list) && list.length === 0)) {
          return [];
        }
        return list.map(() => [
          `
          <ellipsis lines="1" style="max-width: 200px">
            <span [title]="item.name" [innerText]="item.name"></span>
          </ellipsis>
          `,
          `{{ item.couponPrice | _currency }}&amp;{{ item.limitMoney | _currency }}`,
          `
          {{ item.avaliableTimeStart | date: 'yyyy-MM-dd HH:mm' }}
            ~
          {{ item.avaliableTimeEnd | date: 'yyyy-MM-dd HH:mm' }}`,
          `
          <span [style.color]="item.status > 3 ? '#FF6B6B' : '#666'" [innerText]="item.status | couponStatus"></span>
          `,
          '{{ item.type === 1 ? "全体用户" : "仅限新人" }}',
          '{{ item.limitPer }}',
        ]);
      },
    },
    /**
     * 添加秒杀活动
     */
    [MODAL_TYPE.SPEED_KILL]: {
      title: '添加秒杀活动',
      idKeyStr: 'id',
      fetch: (params: any) => this.getAllSeckillList(params),
      placeholder: '请输入商品名',
      pageSize: 5,
      limit: 6,
      limitInfo: '秒杀活动最多添加6个',
      listEmptyInfo:
        '当前暂无有效秒杀活动可以进行配置\n请在“营销工具”模块创建秒杀后\n再返回这里配置~',
      listEmptyButton: '新建秒杀活动',
      openButton: '新建秒杀',
      getOpenUrl(kolId: number | string, wechat_id: number | string) {
        let path = '/event/seckill';
        if (kolId || wechat_id) {
          return (path += `?${stringify({
            kolId,
            wechat_id,
          })}`);
        }
        return path;
      },
      selectOne: {
        placeholder: '所有活动状态',
        options: [{ label: '待开始', value: 1 }, { label: '进行中', value: 2 }],
      },
      selectTwo: null,
      th: ['商品主图', '商品名称', '秒杀价/日常售价', '活动时间', '活动状态'],
      getTd: (list: any[]): string[][] => {
        if (!list || (Array.isArray(list) && list.length === 0)) {
          return [];
        }
        return list.map(() => [
          `
          <div class="img-container img-container-sm">
            <img [seeSrc]="item.itemImgurl" seeViewer />
          </div>
          `,
          `
          <ellipsis lines="2" style="max-width: 200px">
            <span [title]="item.productName" [innerText]="item.productName"></span>
          </ellipsis>
          `,
          `{{ item.price / 100 | _currency }}&amp;{{ item.skuPrice / 100 | _currency }}`,
          `{{ item.startTime | date: 'yyyy-MM-dd HH:mm' }}~{{ item.endTime | date: 'yyyy-MM-dd HH:mm' }}`,
          '{{ item.status | seckillStatus}}',
        ]);
      },
    },
    /**
     * 添加爆款拼团
     */
    [MODAL_TYPE.GROUP_BUY]: {
      ...grouponType,
      fetch: (params: any) => this.getGroupBuyList(12, params),
      selectTwo: {
        placeholder: '所有拼团类型',
        options: [
          { label: '普通拼团', value: 1 },
          { label: '新人团', value: 2 },
          { label: '拉新团', value: 5 },
        ],
      },
    },
    /**
     * 添加满减活动方式
     */
    [MODAL_TYPE.SALES_PROMOTION]: {
      ...salesPromotion,
      fetch: (params: any) => this.getFullOfList(params),
      openButton: '新建满减',
    },
    /**
     * 添加抽奖团
     */
    [MODAL_TYPE.GROUP_LOTTERY]: {
      ...grouponType,
      fetch: (params: any) => this.getGroupBuyList(3, params),
    },
    /**
     * 所有团
     */
    [MODAL_TYPE.GROUPON]: {
      ...grouponType,
      fetch: (params: any) => this.getGroupBuyList(123, params),
      limit: 1,
    },

    /**
     * 爆款商品
     */
    [MODAL_TYPE.HOT_GOODS]: {
      ...goodsType,
      fetch: (params: any) => this.getHotGoodsList(params),
      title: '添加商品',
      limit: 20,
    },
    /**
     * 商品分组
     */
    [MODAL_TYPE.CATEGORY]: {
      title: '添加商品分组',
      size: 'md',
      idKeyStr: 'categoryId',
      fetch: (params: any) => this.getMallCategory(params),
      placeholder: '请输入分组名称',
      pageSize: 10,
      limit: 4,
      limitInfo: '商品分组最多添加4个',
      openButton: '分组管理',
      listEmptyButton: '创建商品合集',
      getOpenUrl: () => {
        const url = isAdmin()
          ? `/kol-v2/kol-cooperation-management/${this.kolId}/${
              this.wechatId
            }/goods-group`
          : `/goods/groups`;
        return url;
      },
      th: ['商品分组名', '创建时间', '类型', '商品数'],
      getTd: (list: any[]): string[][] => {
        if (!list || (Array.isArray(list) && list.length === 0)) {
          return [];
        }
        return list.map(() => [
          `
          <ellipsis lines="1" style="max-width: 200px">
            <span [title]="item.categoryName" [innerText]="item.categoryName"></span>
          </ellipsis>
          `,
          `{{ item.createTime | date: 'yyyy-MM-dd' }}`,
          `{{ (item.isSystem || item.type === 1)? '自动' : '手动' }}`,
          '{{ item.commodityCount }}',
        ]);
      },
    },
    /**
     * 跳转商品链接
     */
    [MODAL_TYPE.GOODS_LINK]: {
      ...goodsType,
      title: '跳转地址',
      limit: 1,
      addBtnText: '选择',
      fetch: (params: any) => this.getHotGoodsList(params),
    },
    /**
     * 跳转文章链接
     */
    [MODAL_TYPE.ARTICLE]: {
      title: '跳转地址',
      size: 'md',
      idKeyStr: 'article_id',
      fetch: (params: any) => this.getArticleList(params),
      placeholder: '请输入文章（商品合集）名',
      pageSize: 8,
      limit: 1,
      openButton: '创建商品合集',
      addBtnText: '选择',
      listEmptyInfo:
        '当前没有商品合集可以进行跳转\n请在“内容电商”模块创建商品合集后\n再返回这里配置~',
      listEmptyButton: '创建商品合集',
      getOpenUrl: () => {
        return `/kol-v2/kol-cooperation-management/${this.kolId}/${
          this.wechatId
        }/micro-page`;
      },
      th: ['文章名（商品合集）', '上线时间', '文内商品数'],
      getTd: (list: any[]): string[][] => {
        if (!list || (Array.isArray(list) && list.length === 0)) {
          return [];
        }
        return list.map(() => [
          `
          <ellipsis lines="1" style="max-width: 200px">
            <span [title]="item.title" [innerText]="item.title"></span>
          </ellipsis>
          `,
          `{{ item.start_time | date: 'yyyy-MM-dd' }}`,
          '{{ item.item_count }}',
        ]);
      },
    },
    /**
     * 跳转微页面链接
     */
    [MODAL_TYPE.MICRO_PAGE]: {
      title: '跳转地址',
      size: 'md',
      idKeyStr: 'id',
      fetch: (params: any) => this.getMicroPageList(params),
      placeholder: '请输入页面名称',
      pageSize: 8,
      limit: 1,
      // openButton: '创建商品合集',
      addBtnText: '选择',
      listEmptyInfo: '当前没有微页面进行跳转\n请创建微页面后\n再返回这里配置~',
      listEmptyButton: '创建微页面',
      getOpenUrl: () => {
        // 这个路由就是需要 kol id，不管是不是内部，所以将就，先获取吧
        localStorage.setItem(
          '__checkIfOpenNewArticleInKolCooperationManagement__',
          '1',
        );
        return `/kol/kol-cooperation-management/${this.kolId}?wechat_id=${
          this.wechatId
        }&needCheckOpenNewArticle=1#1`;
      },
      // selectOne: {
      //   placeholder: '页面标签',
      //   options: [
      //     { label: '未关联文章', value: 0 },
      //     { label: '已关联文章', value: 1 },
      //   ],
      // },
      th: ['页面名称', '创建时间'],
      getTd: (list: any[]): string[][] => {
        if (!list || (Array.isArray(list) && list.length === 0)) {
          return [];
        }
        return list.map(() => [
          `
          <ellipsis lines="1" style="max-width: 200px">
            <span [title]="item.name" [innerText]="item.name"></span>
          </ellipsis>
          `,
          `{{ item.createTime | date: 'yyyy-MM-dd' }}`,
          // `<nz-badge *ngIf="item.link === 1" [nzStatus]="'success'" [nzText]="'已关联文章'"></nz-badge>`,
        ]);
      },
    },
  };
  private kolId: number | string;
  private wechatId: string;
  private xdpId: any;
  private sellerMobile: string;

  static sp = { newversion: 1 };
  constructor(
    private http: _HttpClient,
    private modalHelper: ModalHelper,
    private store: Store<StoreConstructionState>,
  ) {
    store.select(getTargetKolId).subscribe(val => (this.kolId = val));
    store.select(getTargetWechatId).subscribe(val => (this.wechatId = val));
    store
      .select(getTargetSellerMobile)
      .subscribe(val => (this.sellerMobile = val));
    store.select(getTargetXdpId).subscribe(val => (this.xdpId = val));
  }

  getCurrentUserInfo(): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/kol_mgr/kolGetWithSeller')
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  /**
   * 添加优惠券时展示该小电铺所有优惠券列表
   */
  getAllCouponList(formdata: {
    page: number;
    pageSize: number;
    name?: string;
    status?: number;
    kolId?: number;
  }): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/ng/couponv3/xiaodianpu/list', {
        formdata,
        params: AddItemsService.sp,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  /**
   * 所有秒杀活动列表
   */
  getAllSeckillList(params: {
    kolId?: number;
    activityName?: string;
    productName?: string;
    status?: number[];
    page: number;
    pageSize?: number;
    toBanner?: number;
  }): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .get('api/ng/seckill/activity/activities', {
        ...params,
        ...AddItemsService.sp,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  /**
   * 获取拼团列表
   * @param gtype 拼团类型：12 - 热门拼团；3 - 抽奖拼团
   * @param formdata 接口参数
   */
  getGroupBuyList(
    gtype: number,
    formdata: {
      type?: number;
      page: number;
      pageSize?: number;
      kolId?: number;
      keyword?: string;
    },
  ): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/ng/groupon/config/allList', {
        formdata,
        params: {
          ...AddItemsService.sp,
          gtype,
        },
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  getFullOfList(formdata: {
    page?: number;
    pageSize?: number;
    activityName?: string;
    rule?: any;
    status?: number;
    xiaodianpuId?: number;
  }) {
    return this.http
      .get('/api/ng/fulloff/activity/searchByCondition', formdata)
      .map(
        (res: {
          data: {
            list: any[];
            count: number;
          };
          msg: string;
          result: number;
        }) => {
          if (res.result === 1) {
            res.data.list.map(r => {
              r.statusText = mapStatusTypes[r.status];
              r.thresholdTypeText = discountRule[r.thresholdType];
              return r;
            });
          }
          return res;
        },
      )
      .pipe(catchError(error => Observable.throw(error.json())));
  }

  /**
   * 所有商品分组列表
   */
  getMallCategory(formdata): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/ng/cgs/mall/category/list4add', {
        formdata,
        params: AddItemsService.sp,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  getCategoryItems(categoryId): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .get('/api/ng/cgs/group/commodity/list', {
        groupId: categoryId,
        kolId: this.kolId,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  /**
   * 所有爆款商品列表
   */
  getHotGoodsList(formdata): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/xiaodianpu/getItemList', {
        formdata,
        params: AddItemsService.sp,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  /**
   * 跳转文章列表
   */
  getArticleList(formdata): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/xiaodianpu/getArticleList', {
        formdata,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  /**
   * 微页面列表
   */
  getMicroPageList(formdata): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .get('api/ng/microPage/list', {
        xdpId: this.xdpId,
        ...formdata,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  getCurrentType(type: string): IAddType {
    return this.TYPE_LIST[type];
  }

  /**
   * 生成最终查询参数
   * @param type TYPE_LIST 中的 key
   * @param params 表单的默认参数
   * @param formData 表单的额外参数
   * @param extraParams 另外一些额外参数
   */
  getQueryListParams(
    type: string,
    params: IParams,
    formData: IFormData,
    extraParams,
  ) {
    switch (type) {
      case MODAL_TYPE.COUPON:
        return {
          ...params,
          status: formData.selectOne,
          type: formData.selectTwo,
          name: formData.keyword,
        };
      case MODAL_TYPE.SPEED_KILL:
        return {
          kolId: params.kolId,
          page: params.page,
          pageSize: params.pageSize,
          status: formData.selectOne || [
            SECKILL_STATUS_MAP['待开始'],
            SECKILL_STATUS_MAP['进行中'],
          ],
          productName: formData.keyword,
        };
      case MODAL_TYPE.GROUP_BUY:
      case MODAL_TYPE.GROUP_LOTTERY:
      case MODAL_TYPE.GROUPON:
        return {
          ...params,
          keyword: formData.keyword,
          status: formData.selectOne,
          type: formData.selectTwo,
        };
      case MODAL_TYPE.HOT_GOODS:
      case MODAL_TYPE.GOODS_LINK:
        return {
          kol_id: params.kolId,
          page: params.page,
          page_size: params.pageSize,
          type: formData.selectOne || 3,
          keyword: formData.keyword,
          // added_status: formData.selectTwo,
        };
      case MODAL_TYPE.CATEGORY:
        return {
          kolId: params.kolId,
          pageSize: params.pageSize,
          currentPageNo: params.page,
          categoryName: formData.keyword,
        };
      case MODAL_TYPE.ARTICLE:
        return {
          kol_id: params.kolId,
          page: params.page,
          page_size: params.pageSize,
          keyword: formData.keyword,
        };
      case MODAL_TYPE.MICRO_PAGE:
        return {
          ...params,
          name: formData.keyword,
          range: formData.selectOne,
          ...extraParams,
        };
      case MODAL_TYPE.SALES_PROMOTION: {
        const { page, pageSize, xdpId: xiaodianpuId } = params;
        const { selectOne, selectTwo, keyword } = formData;
        const status = selectOne === undefined ? 0 : +selectOne;
        const thresholdType = selectTwo === undefined ? '' : +selectTwo;
        return {
          page,
          pageSize,
          status,
          thresholdType,
          activityName: keyword,
          xiaodianpuId: +this.xdpId || 0,
        };
      }
      default:
        return params;
    }
  }
}
