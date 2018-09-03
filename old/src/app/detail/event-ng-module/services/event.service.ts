import { Injectable } from '@angular/core';
import { _HttpClient } from '@shared/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { isPlainObject, isArray, merge } from 'lodash';
import * as moment from 'moment';
import { Router, ActivatedRoute, Params } from '@angular/router';

const wrapCatchError = (ob: Observable<see.ICommonResponse<any>>) => {
  return ob.pipe(
    catchError((error: any) => {
      return Observable.throw(error.json ? error.json() : error);
    }),
  );
};

@Injectable()
export class EventService {
  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
  ) {}

  // pipeCatch(url, parmas) {
  //     // TODO 这里判断是否 200 并且 data 有值
  //     return this.http
  //       .get(
  //         biHost + url,
  //         merge({}, parmas, this.kolId ? { kol_id: this.kolId } : null),
  //         {
  //           withCredentials: true,
  //         },
  //       )
  //       .pipe(
  //         catchError((error: any) => {
  //           return Observable.throw(error.json ? error.json() : error);
  //         }),
  //       );
  //   }

  // 拼团模板列表接口
  fetchGroupEventList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/list', {
        ...params,
      }),
    );
  }

  // 用于创建拼团模板时拉取热门单品库母商品列表
  fetchGroupEventProductList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/get-product-list', {
        ...params,
      }),
    );
  }

  // sku列表
  fetchSku(itemId: number): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/sku', {
        itemId,
      }),
    );
  }

  // logs列表
  fetchLogs(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/task/list', {
        ...params,
      }),
    );
  }

  // log详情
  fetchLogDetail(taskId: number): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/task/detail', {
        taskId,
      }),
    );
  }

  // 创建拼团
  addGroupon(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/template/groupon/add', { formdata }),
    );
  }

  // kol列表
  fetchKolList(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/kol/list', {
        pageSize: 99999,
      }),
    );
  }

  // 批量生成子商品
  postBatchGenChildItems(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/template/groupon/batch-generate-child-item', {
        formdata,
      }),
    );
  }

  // 批量生成子商品
  postBatchGenChildItems_asyn(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(
        '/api/ng/template/groupon/batch-generate-child-item-result',
        { formdata },
      ),
    );
  }

  // 批量指派营销活动
  postBatchAssignActivities(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(
        '/api/ng/template/groupon/batch-generate-groupon-activity',
        { formdata },
      ),
    );
  }

  // 批量指派营销活动
  postBatchAssignActivities_asyn(
    formdata,
  ): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(
        '/api/ng/template/groupon/batch-generate-groupon-activity-result',
        { formdata },
      ),
    );
  }

  // 重新生成拼团活动
  postReAssignActivities(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/template/groupon/re-generate-groupon-activity', {
        formdata,
      }),
    );
  }

  // 获取优惠券
  getCouponList(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/couponv3/xiaodianpu/list', { formdata }),
    );
  }

  // 更新活动时间
  updateActivityTime(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(
        '/api/ng/template/groupon/batch-update-groupon-activity-time',
        { formdata },
      ),
    );
  }
  // 获取模板详细内容
  getGrouponDetail(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/template/groupon/detail', { formdata }),
    );
  }

  // 获取营销工具创建的优惠券
  getGrouponV3List(formdata): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/couponv3/xiaodianpu/list', { formdata }),
    );
  }

  // 创建下单返券活动
  addCouponActivity(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/couponactivity/add', { body }),
    );
  }

  // 编辑下单返券活动
  editCouponActivity(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/couponactivity/edit', { body }),
    );
  }

  // 获取下单返券活动列表
  getCouponActivityList(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/couponactivity/list', {
        ...params,
      }),
    );
  }

  // 查询下单返券活动明细
  getCouponActivityDetail(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/couponactivity/detail', {
        ...params,
      }),
    );
  }

  // 强制下单返券活动结束
  endCouponActivity(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/couponactivity/end', { params }),
    );
  }

  /**********************  批量复制相关接口(ng5模块使用)  start  **********************/
  ng_batchCopy_add(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/batchCopy/add', {
        body,
      }),
    );
  }
  ng_batchCopy_listTask(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.get('/api/ng/batchCopy/listTask', params));
  }
  // 日志列表
  ng_batchCopy_listBatch(params): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(this.http.get('/api/ng/batchCopy/listBatch', params));
  }
  ng_batchCopy_reAdd(batchId): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post(`/api/ng/batchCopy/reAdd?batchId=${batchId}`, {}),
    );
  }
  ng_batchCopy_setSeckillTime(body): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.post('/api/ng/seckill/activity/setSeckillTime', {
        body,
      }),
    );
  }
  /**********************  批量复制相关接口(ng5模块使用)  end  **********************/
}
