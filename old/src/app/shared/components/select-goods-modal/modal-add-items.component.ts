import { Component, OnInit, Input } from '@angular/core';
import { NzModalSubject, NzMessageService } from 'ng-zorro-antd';
import { omit, isNil } from 'lodash';
import { parse } from 'query-string';
import {
  // AddItemsService,
  IParams,
  // IAddType,
  // IFormData,
  MODAL_TYPE,
} from 'app/detail/store-construction/services';
import { Observable } from 'rxjs/Observable';
import { CODES } from '@utils';
import { getItem } from '@utils/storage';
import { _HttpClient, ModalHelper } from '@shared/services';
import { catchError } from 'rxjs/operators';

const isAdmin = () => {
  return [CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin].includes(
    getItem('seller_privilege') >>> 0,
  );
};

const goodsType = {
  title: '',
  size: 'lg',
  idKeyStr: 'item_id',
  placeholder: '请输入商品名称',
  itemIdPlaceholder: '请输入商品ID',
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
  // th: ['商品图', '商品名', '价格', '售卖状态'],
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

@Component({
  selector: 'see-select-goods-modal',
  templateUrl: './modal-add-items.component.html',
  styleUrls: ['./modal-add-items.component.less'],
})
export class SeeSelectGoodsModal implements OnInit {
  // 创建优惠券时的选择商品，使用xdpId，默认为false且使用kolId
  @Input() forCreateCoupon: boolean = false; // 用于创建优惠券时的选择商品，排除秒杀商品，拼团商品， 不排除满减商品。
  @Input() xdpId: number = 0;

  @Input() kolId: number = 0;
  @Input() limitCount: number = -1;
  @Input()
  set addedIdList(value: number[]) {
    this._addedIdList = value;
  }
  @Input()
  set type(value: MODAL_TYPE) {
    this._type = value;

    this.currentType = {
      ...goodsType,
      fetch: (params: any) =>
        this.forCreateCoupon
          ? this.getHotGoodsListForCoupon(params)
          : this.getHotGoodsList(params),
      th: ['商品图', '商品ID', '商品名', '价格', '售卖状态'],
      // th: ['商品图', '商品ID', '商品名', '价格', '售卖状态'],
      title: '添加商品',
      limitInfo: `商品最多添加${this.limitCount}个`,
    };
  }

  static sp = { newversion: 1 };

  /**
   * 所有爆款商品列表
   */
  getHotGoodsList(formdata): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .post('api/xiaodianpu/getItemList', {
        formdata,
        params: SeeSelectGoodsModal.sp,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  getHotGoodsListForCoupon(params): Observable<see.ICommonResponse<any[]>> {
    return this.http
      .get('/api/ng/couponv3/products', {
        ...params,
      })
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }

  currentType: any;
  page: number = 1;
  loading: boolean = false;
  /**
   * 是否真的一无所有
   */
  noAvailableList: boolean = false;
  isShowLimitInfo = false;
  _type: MODAL_TYPE;
  addedCount = 0;
  itemsList = {
    list: [],
    count: 0,
  };
  formData: any = {
    keyword: undefined,
    selectOne: undefined,
    selectTwo: undefined,
  };
  _addedIdList: number[] = [];

  constructor(
    private subject: NzModalSubject,
    // private addItemsSrv: AddItemsService,
    private http: _HttpClient,
    private messageService: NzMessageService,
  ) {}

  ngOnInit() {
    if (this.forCreateCoupon) {
      Object.assign(this.formData, { itemId: undefined });
    }
    this.getItemsList();
  }

  openNew() {
    const wechatId = parse(location.search)['wechatId'];
    const urlResult = this.currentType.getOpenUrl(this.kolId, wechatId);

    if (typeof urlResult === 'string') {
      window.open(urlResult);
    } else if (urlResult.then) {
      urlResult.then(url => {
        window.open(url);
      });
    }
  }

  addItem(event: MouseEvent, index: number) {
    event.preventDefault();
    const idKeyStr = this.currentType.idKeyStr;
    const ifDestroy = () => {
      if (this._addedIdList.length === this.limitCount) {
        this.subject.destroy();
      }
    };
    const listItem = this.itemsList.list[index];
    if (this.limitCount === -1) {
      listItem.added = true;
      this._addedIdList.push(listItem[idKeyStr]);
      this.subject.next(listItem);
      return;
    }
    if (this._addedIdList.length < this.limitCount) {
      listItem.added = true;
      this._addedIdList.push(listItem[idKeyStr]);
      this.subject.next(listItem);
      ifDestroy();
    } else {
      this.isShowLimitInfo = true;
    }
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  /**
   * 生成最终查询参数
   * @param type TYPE_LIST 中的 key
   * @param params 表单的默认参数
   * @param formData 表单的额外参数
   */
  getQueryListParams(type: string, params: IParams, formData: any) {
    return {
      kol_id: params.kolId,
      page: params.page,
      page_size: params.pageSize,
      type: formData.selectOne || 3,
      keyword: formData.keyword,
      // added_status: formData.selectTwo,
    };
  }

  convertCouponGoodsData(data) {
    return {
      count: data.total,
      list: data.rows.map(item => ({
        imgurl: item.itemImgurl,
        item_id: item.id,
        item_name: item.itemName,
        item_price: item.price / 100,
        item_status: item.status,
      })),
    };
  }

  getItemsList(noParams = false) {
    this.loading = true;
    const idKeyStr = this.currentType.idKeyStr;
    if (noParams) {
      this.page = 1;
    }
    let basicParams: any = {};
    let params;
    if (!this.forCreateCoupon) {
      basicParams = {
        page: this.page,
        currentPageNo: this.page,
        pageSize: this.currentType.pageSize,
        page_size: this.currentType.pageSize,
        kolId: this.kolId,
        kol_id: this.kolId,
      };
      params = this.getQueryListParams(this._type, basicParams, this.formData);
    } else {
      let itemId = this.formData.itemId;
      if (itemId) {
        const oldLength = itemId.length;
        itemId = parseInt(itemId, 10);

        if (oldLength !== String(itemId).length || String(itemId) === 'NaN') {
          this.messageService.create('warning', '请输入有效数字!');
          this.loading = false;
          return;
        }
      }
      params = {
        itemId,
        currentPage: this.page,
        pageSize: this.currentType.pageSize,
        xdpId: this.xdpId,
        name: this.formData.keyword,
        type: this.formData.selectOne || 0,
      };
    }
    return this.currentType.fetch(params).subscribe(
      ({ data: data0 }) => {
        this.loading = false;
        if (!data0) {
          return;
        }
        let data;
        if (!this.forCreateCoupon) {
          data = data0;
        } else {
          data = this.convertCouponGoodsData(data0);
        }
        const list = Object.values(data).filter(item =>
          Array.isArray(item),
        )[0] as any[];
        list.forEach(item => {
          item.added = this._addedIdList.some(
            id => `${id}` === `${item[idKeyStr]}`,
          );
        });
        this.itemsList = {
          list,
          count: data.count >>> 0,
        };
        this.currentType.td = this.currentType.getTd(this.itemsList.list);
        if (
          this.itemsList.count === 0 &&
          Object.values(omit(params, ...Object.keys(basicParams))).every(val =>
            isNil(val),
          )
        ) {
          this.noAvailableList = true;
        } else {
          if (
            [
              MODAL_TYPE.HOT_GOODS,
              MODAL_TYPE.GOODS_LINK,
              MODAL_TYPE.GROUPON,
            ].includes(this._type)
          ) {
            if (
              this.itemsList.count === 0 &&
              params.type >>> 0 === 3 &&
              Object.values(
                omit(params, 'type', ...Object.keys(basicParams)),
              ).every(val => isNil(val))
            ) {
              this.noAvailableList = true;
            } else {
              this.noAvailableList = false;
            }
            return;
          }
          this.noAvailableList = false;
        }
      },
      () => {
        this.loading = false;
      },
    );
  }
}
