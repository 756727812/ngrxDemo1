import { Injectable } from '@angular/core';
import { _HttpClient } from '@shared/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { isPlainObject, isArray } from 'lodash';
import { Elem, ElemType } from '../models/editor.model';

const commonElemFirstLevelSchema = {
  id: '',
  xdpId: '',
  micropageId: '',
  name: '',
  mainTitle: '',
  subTitle: '',
  icon: '',
  type: '',
  startTime: '',
  endTime: '',
  showType: '',
  preModuleId: '' /*如果没有可以不传递*/,
  nextModuleId: '' /*如果没有可以不传递*/,
  userShowType: '',
};

const commonLinkSchema = {
  imgUrl: ' 图片地址1',
  linkType: 1,
  target: { id: 1234 },
  showType: 2,
  startTime: '2018-01-01 00:00:00',
  endTime: '2018-01-02 00:00:00',
};

const videoSchema = {
  videoUrl: '',
  coverImgUrl: '',
  showStyle: 1,
};

const filterSchema = function(srcObj, schema) {
  const ret = {};
  if (!srcObj) {
    return null;
  }
  // 支持非map数组
  if (!isPlainObject(srcObj) && !isArray(srcObj)) {
    return srcObj;
  }
  Object.keys(srcObj).forEach(key => {
    const srcVal = srcObj[key];
    const schemaVal = schema[key];
    if (typeof schema[key] !== 'undefined') {
      // 对象
      if (isPlainObject(srcVal)) {
        // TODO >> webpack dev
        if (!isPlainObject(schemaVal)) {
          console.error(`某层过滤 schema ${key} 属性应该是对象`);
        }
        // << webpack dev
        ret[key] = filterSchema(srcVal, schemaVal);
      } else if (isArray(srcVal)) {
        // 数组

        // << webpack dev
        ret[key] = srcVal.map(item => filterSchema(item, schemaVal[0]));
      } else {
        // primate 类型
        ret[key] = srcVal;
      }
    } else {
      // console.log(`>>>过滤掉${key}`)
    }
  });
  return ret;
};

export interface IFetchConfigParams {
  /** 小店铺id：外部权限前端不需要传递xdpId后端通过登录态直接获取，内部权限前端需要传递xdpId */
  xdpId?: string;
  micropageId?: string;
  /** 模块id：如果id=null，表示获取所有模块信息，id!=null活动指定模块信息 */
  id?: string;
}

@Injectable()
export class EditorService {
  private xdpId: number;
  private kolId: number;
  private micropageId: number;

  constructor(private http: _HttpClient) {}

  // TODO 有点不优雅？
  setTargetUserInfo({ xdpId, kolId, micropageId, id }) {
    this.xdpId = xdpId ? +xdpId : this.xdpId;
    this.micropageId = micropageId ? +micropageId : this.micropageId;
    this.kolId = kolId ? +kolId : this.kolId;
  }

  scrollElemToVisibleByVid(vid) {
    // TODO 直接选择器还不是特别安全
    const jEditor = $('.shop-construct-editor');
    const scrollWrap = jEditor.find('.scroll-wrap')[0];
    const preEl = jEditor.find(`.preview-item-outlet-${vid}`)[0];
    if (!scrollWrap || !preEl) {
      return;
    }
    const editorRect = jEditor[0].getBoundingClientRect();
    const ctRect = scrollWrap.getBoundingClientRect();
    const preElRect = preEl.getBoundingClientRect();
    const visibleHeight = editorRect.bottom - ctRect.top;
    // 如果在预览可视区域，不管
    if (preElRect.top >= ctRect.top && preElRect.bottom <= editorRect.bottom) {
      return;
    }

    const dis = preElRect.top - ctRect.top;
    const scrollDelta = dis + ((visibleHeight + 40) * (dis > 0 ? 1 : -1)) / 2;
    scrollWrap.scrollTop += dis;

    // const scrollFn = preEl
    //   ? preEl['scrollIntoViewIfNeeded'] || preEl.scrollIntoView
    //   : null;
    // scrollFn && scrollFn.call(preEl);
    // return true;
  }

  scrollFirstTypeElemToVisible(type) {
    const el = $(`.${type}-preview-item-widget`)[0];
    const scrollFn = el
      ? el['scrollIntoViewIfNeeded'] || el.scrollIntoView
      : null;
    scrollFn && scrollFn.call(el);
  }

  fetchAllConfiguration(
    params: IFetchConfigParams,
  ): Observable<see.ICommonResponse<Elem[]>> {
    if (!params.xdpId) {
      return;
    }
    if (!params.micropageId) {
      params.micropageId =
        this.micropageId + '' || this.getQueryString('micropageId');
    }
    // const paramsMap = Object.create(null);
    // // micropageId: this.micropageId,
    // // }
    // if (this.micropageId) {
    //   paramsMap.micropageId = this.micropageId;
    // }
    // let qs = Object.entries(paramsMap)
    //   .map(([k, v]) => `${k}=${v}`)
    //   .join('&');
    // if (qs) {
    //   qs = `?${qs}`;
    // }
    return this.http.get(`/api/ng/xdpDecorate/configuration`, params).pipe(
      map(res => {
        if (params.xdpId) {
          this.xdpId = Number(params.xdpId);
        }
        if (params.micropageId) {
          this.micropageId = Number(params.micropageId);
        }
        return res;
      }),
      catchError((error: any) => {
        return Observable.throw(error.json ? error.json() : error);
      }),
    );
  }
  getQueryString(name) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return r[2];
    }
    return null;
  }
  saveElem(data): Observable<see.ICommonResponse<any>> {
    const op = data.id ? 2 : 1; // op: 操作类型 1=新增 2=修改 3=删除
    const body: any = this.filterElemData4Submit(data);
    if (this.xdpId) {
      body.xdpId = this.xdpId;
    }

    if (data.config.show !== undefined) {
      body.config.show = data.config.show;
    }
    if (this.micropageId) {
      body.micropageId = this.micropageId;
    }
    return this.http
      .post(
        `/api/ng/xdpDecorate/edit?op=${op}&micropageId=${this.micropageId}`,
        { body },
      )
      .pipe(
        catchError((error: any) =>
          Observable.throw(error.json ? error.json() : error),
        ),
      );
  }

  getXDPSummary(): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/xiaodianpu/getXiaoDianPuUser')
      .pipe(
        catchError((error: any) =>
          Observable.throw(error.json ? error.json() : error),
        ),
      );
  }

  removeElem(id): Observable<see.ICommonResponse<any>> {
    const body: { [key: string]: any } = { id };
    let q = '';
    if (this.xdpId) {
      body.xdpId = this.xdpId;
    }
    if (this.micropageId) {
      body.micropageId = this.micropageId;
      q = `&micropageId=${this.micropageId}`;
    }
    return this.http
      .post(`/api/ng/xdpDecorate/edit?op=3${q}`, {
        body,
      })
      .pipe(
        catchError((error: any) =>
          Observable.throw(error.json ? error.json() : error),
        ),
      );
  }

  release(): Observable<see.ICommonResponse<any>> {
    const url =
      '/api/ng/xdpDecorate/publish' +
      (this.xdpId
        ? `?xdpId=${this.xdpId}&micropageId=${this.micropageId}`
        : '');
    return this.http.post(url, {}).pipe(
      catchError((error: any) => {
        return Observable.throw(error.json ? error.json() : error);
      }),
    );
  }

  getLastTime(params): Observable<see.ICommonResponse<any>> {
    const url = '/api/ng/xdpDecorate/getLastTime';
    return this.http.get(url, params).pipe(
      catchError((error: any) => {
        return Observable.throw(error.json ? error.json() : error);
      }),
    );
  }

  getXDPInfo(kolId?: string): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/xiaodianpu/getXdpInfo' + (kolId ? `?kol_id=${kolId}` : ''))
      .pipe(
        catchError((error: any) => {
          return Observable.throw(error.json ? error.json() : error);
        }),
      );
  }

  getXDPStatus(params): Observable<see.ICommonResponse<any>> {
    const url = `api/xiaodianpu/checkCurrentStatus?xdp_id=${params.xdpId}`;
    return this.http.get(url).pipe(
      catchError((error: any) => {
        return Observable.throw(error.json ? error.json() : error);
      }),
    );
    // return this.http
    //   .get(url + (this.xdpId ? `?xdp_id=${this.xdpId}` : ''))
    //   .pipe(
    //     catchError((error: any) => {
    //       return Observable.throw(error.json ? error.json() : error);
    //     }),
    //   );
  }

  /*
    保存的信息只从 store 中取，并且每个模块类型都需要声明一个过滤器 schema，
    只有声明过的属性才会提交到后台

     举例:
    假如提交到后台的模块数据长这样:
    `
    {
    "name": "店铺名称",
    "introduct": "店铺介绍",
    "logoImgUrl": "小店铺logo图片地址",
    "links": [
        {
            "imgUrl": " 图片地址",
            "linkType": 0,
            "target": {"id":1234},
        }
    ]
    }
    `
    那么你的 schema 得这么声明 在 elemModelSubmitFilter 中:

    [elemType]: {
      name: '',
      introduct: '',
      logoImgUrl: '',
      links: [{
        imgUrl: '',
        linkType: '',
        target: {
          id: ''
        }
      }]
    }
   */
  filterElemData4Submit(data) {
    const { type } = data;
    const schema = this.elemModelSubmitFilter[type];
    if (!schema) {
      // TODO when dev
      console.error('该类型数据没有配置 filter schema');
      return null;
    }
    return filterSchema(data, schema);
  }

  elemModelSubmitFilter = {
    [ElemType.HOME_DIALOG]: {
      ...commonElemFirstLevelSchema,
      config: {
        links: [commonLinkSchema],
      },
    },
    [ElemType.SHOP_SUSPEND]: {
      ...commonElemFirstLevelSchema,
      config: {
        positions: [0],
        links: [commonLinkSchema],
      },
    },
    [ElemType.ITEM_DETAIL_BANNER]: {
      ...commonElemFirstLevelSchema,
      config: {
        brandShowType: '',
        brandIds: [0],
        categoryShowType: '',
        categotyIds: [0],
        links: [commonLinkSchema],
      },
    },
    [ElemType.CAROUSEL]: {
      ...commonElemFirstLevelSchema,
      config: {
        links: [commonLinkSchema],
      },
    },
    [ElemType.BASIC_INFO]: {
      ...commonElemFirstLevelSchema,
      config: {
        name: '',
        introduct: '',
        logoImgUrl: '',
        links: [commonLinkSchema],
        topColor: '',
        couponColor: '',
        couponFontColor: '',
        txInvest: {
          show: 1,
          imgUrl: '',
        },
      },
    },
    [ElemType.EXPLORE_COL_GOODS]: {
      ...commonElemFirstLevelSchema,
      config: {
        targets: [{ id: '' }],
        styleType: '',
        method: '',
        showCount: '',
        orderRule: '',
      },
    },
    [ElemType.COMMON_DOUBLE_COL_GOODS]: {
      ...commonElemFirstLevelSchema,
      showType: '',
      startTime: '',
      endTime: '',
      config: {
        targets: [{ id: '' }],
      },
    },
    [ElemType.COUPON]: {
      ...commonElemFirstLevelSchema,
      config: {
        targets: [
          {
            id: '',
            showType: '',
            startTime: '',
            endTime: '',
          },
        ],
        method: '',
        showCount: '',
      },
    },
    [ElemType.GROUP_BUY]: {
      ...commonElemFirstLevelSchema,
      config: {
        targets: [{ id: '' }],
        styleType: '',
        method: '',
        showCount: '',
        startTime: '',
        endTime: '',
      },
    },
    [ElemType.GROUP_LOTTERY]: {
      ...commonElemFirstLevelSchema,
      config: {
        targets: [{ id: '' }],
        method: '',
        showCount: '',
        startTime: '',
        endTime: '',
      },
    },
    [ElemType.SPEED_KILL]: {
      ...commonElemFirstLevelSchema,
      config: {
        targets: [{ id: '' }],
        styleType: '',
        method: '',
        showCount: '',
        startTime: '',
        endTime: '',
      },
    },
    [ElemType.COL_IMG]: {
      ...commonElemFirstLevelSchema,
      config: {
        marginType: '',
        links: [
          {
            imgUrl: '',
            linkType: '',
            target: { id: '' },
          },
        ],
      },
    },
    [ElemType.MAGIC_CUBE]: {
      ...commonElemFirstLevelSchema,
      config: {
        magicSize: '',
        marginType: '',
        links: [
          {
            imgUrl: '',
            linkType: '',
            target: { id: '' },
            rectangle: {
              x1: '',
              y1: '',
              x2: '',
              y2: '',
            },
          },
        ],
      },
    },
    [ElemType.MAGIC_CUBE_VIRTUAL]: {
      ...commonElemFirstLevelSchema,
      config: {
        magicSize: '',
        recommend: '',
        links: [
          {
            imgUrl: '',
            linkType: '',
            target: { id: '' },
            rectangle: {
              x1: '',
              y1: '',
              x2: '',
              y2: '',
            },
          },
        ],
      },
    },
    [ElemType.SALES_PROMOTION]: {
      ...commonElemFirstLevelSchema,
      config: {
        method: '',
        targets: [{ id: '' }],
      },
    },
    [ElemType.VIDEO_INFO]: {
      ...commonElemFirstLevelSchema,
      config: {
        ...videoSchema,
      },
    },
  };
}
