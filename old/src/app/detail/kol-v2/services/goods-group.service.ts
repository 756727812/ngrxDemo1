import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import {
  GoodsGroups,
  GoodsGroupSearch,
  GoodsAddOrRemoveInCategoryParams,
} from '../models';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class GoodsGroupService {
  private kolId: number;

  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getGoodsGroupsList(formdata: GoodsGroupSearch): Observable<GoodsGroups> {
    const {
      kolId,
      keyword: categoryName,
      page: currentPageNo,
      pageSize,
    } = formdata;
    this.kolId = kolId;
    return this.http
      .post('api/ng/cgs/getAllCommodityGroups', {
        formdata: {
          kolId,
          categoryName,
          currentPageNo,
          pageSize,
        },
      })
      .pipe(map(getData), catchError(throwObservableError));
  }

  deleteGoodsGroup(formdata: {
    kolId: number;
    categoryId: number;
  }): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/cgs/category/delete', { formdata })
      .pipe(catchError(throwObservableError));
  }

  updateGoodsGroup(formdata: {
    kolId: number;
    categoryId: number;
    categoryName: string;
  }): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/cgs/category/update', { formdata })
      .pipe(catchError(throwObservableError));
  }

  createGoodsGroup(body) {
    return this.http
      .post('api/ng/cgs/category/add', { body })
      .pipe(catchError(throwObservableError));
  }

  getCategoryList(params?) {
    return this.http
      .get('api/ng/cgs/commodity/category/list', {
        ...params,
        kolId: this.kolId,
      })
      .pipe(map(getData), catchError(throwObservableError));
  }

  getBrandList(params) {
    return this.http
      .get('api/ng/cgs/commodity/brand/list', params)
      .pipe(map(getData), catchError(throwObservableError));
  }

  getCommidityList(params) {
    return this.http
      .get('api/ng/cgs/category/commodity', params)
      .pipe(map(getData), catchError(throwObservableError));
  }

  getAllGoodsList(params) {
    return this.http
      .get('api/ng/cgs/commodity/search', { ...params, kolId: this.kolId })
      .pipe(map(getData), catchError(throwObservableError));
  }

  addCommodityInCategory(formdata: GoodsAddOrRemoveInCategoryParams) {
    return this.http
      .post('api/ng/cgs/addCommodityInCategory', {
        formdata: {
          ...formdata,
          kolId: this.kolId,
        },
      })
      .pipe(catchError(throwObservableError));
  }

  removeCommodityInCategory(formdata: GoodsAddOrRemoveInCategoryParams) {
    return this.http
      .post('api/ng/cgs/removeCommodityInCategory', {
        formdata: {
          ...formdata,
          kolId: this.kolId,
        },
      })
      .pipe(catchError(throwObservableError));
  }

  addAllCommidityInCategory(formdata) {
    return this.http
      .post('api/ng/cgs/commodity/add-all-commodity-in-category', {
        formdata: {
          ...formdata,
          kolId: this.kolId,
        },
      })
      .pipe(catchError(throwObservableError));
  }
}
