import { Utils } from './utils.service';
import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import { Observable } from 'rxjs/Observable';
import {
  mapCappingTypes,
  mapCostBearerTypes,
  mapOverRanges,
  mapStatusTypes,
  mapUserTypes,
} from './benefit.constant';
import { isEmpty } from 'lodash';
@Injectable()
export class BenefitService {
  routeParams: {
    url?: string;
    from?: string;
  } = {};

  kolInfo: {
    kolId?: any;
    wechatId?: any;
  } = {};
  constructor(private http: _HttpClient, private utils: Utils) {}

  searchByCondition(data?: any): Observable<any> {
    const params: any = {};
    Object.keys(data)
      .filter(r => data[r] === 0 || data[r])
      .map(key => {
        const value = data[key];
        if (typeof value === 'object' && value != null) {
          params[key] = this.utils.dateFormat(value);
        } else {
          if (key === 'id') {
            if (+data[key] > 0) {
              params[key] = value;
            }
          } else {
            params[key] = value;
          }
        }
      });
    return this.http
      .get('/api/ng/fulloff/activity/searchByCondition', { ...params })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  dataListFormat(data: any) {
    const ret = Array.isArray(data) ? data : [data];
    return ret.map(r => {
      const {
        costBearer,
        status,
        userType,
        capping,
        overRange,
        startTime,
        endTime,
      } = r;
      const extra = {
        costBearer: mapCostBearerTypes[costBearer],
        status: mapStatusTypes[status],
        userType: mapUserTypes[userType],
        startTime: this.utils.dateFormat(startTime),
        endTime: this.utils.dateFormat(endTime),
        capping: mapCappingTypes[capping],
        overRange: mapOverRanges[overRange],
      };
      r.extra = extra;
      return r;
    });
  }

  get loading() {
    return this.http.loading;
  }

  createBenefit(formdata) {
    return this.http.post(`/api/ng/fulloff/activity/create`, { body:formdata })
      .pipe(map(getData), catchError(throwObservableError));
  }

  discardActivity(formdata) {
    return this.http
      .post(`/api/ng/fulloff/activity/discard`, { formdata })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  edityActivity(formdata) {
    return this.http.post(`/api/ng/fulloff/activity/edit`, { body:formdata })
      .pipe(map(getData), catchError(throwObservableError));
  }

  addProductToGroup(data) {
    const formdata = new FormData();
    formdata.append('groupId', data.groupId);
    formdata.append('productIdList', `${data.productIdList}`);
    return this.http
      .post(`/api/ng/fulloff/group/addProductToGroup`, { formdata })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  createGroup(formdata: {
    groupName: string;
    sortId: number;
    activityId: number;
    mock?: number;
  }) {
    return this.http.post(`/api/ng/fulloff/group/create`, { formdata }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  deleteGroup(formdata) {
    return this.http.post(`/api/ng/fulloff/group/delete`, { formdata }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  editGroup(formdata?: { id: number; groupName: string; sortId: number }) {
    return this.http.post(`/api/ng/fulloff/group/edit`, { formdata }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  groupList(params) {
    return this.http
      .get(`/api/ng/fulloff/group/list`, {
        ...params,
      })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  queryByGroupId(params: any) {
    const fullOffActivityGroupQueryDTO: any = {};
    const keys = Object.keys(params);
    for (const key of keys) {
      const value = params[key];
      if (!value || (Array.isArray(value) && value[0] === '')) {
        continue;
      }
      fullOffActivityGroupQueryDTO[key] = value;
    }
    return this.http
      .get(`/api/ng/fulloff/group/queryByGroupId`, {
        ...fullOffActivityGroupQueryDTO,
      })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  removeGroupProduct(formdata) {
    return this.http
      .post(`/api/ng/fulloff/group/removeGroupProduct`, { formdata })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  searchShopProductByCondition(data: {
    productIdList: number[];
    xiaodianpuId: number;
    productName: string;
    page?: number;
    pageSize?: number;
  }) {
    const formdata = new FormData();
    Object.keys(data)
      .filter(key => data[key])
      .forEach(key => {
        formdata.append(key, data[key]);
      });
    return this.http
      .post(`/api/ng/fulloff/searchShopProductByCondition`, { formdata })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  activityById(params) {
    return this.http.get(`/api/ng/fulloff/activity`, { ...params }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  private getFormdata(data) {
    const formdata = new FormData();
    Object.keys(data)
      .filter(key => data[key])
      .forEach(key => {
        formdata.append(key, data[key]);
      });
    return formdata;
  }

  validateProductId(data) {
    const formdata = this.getFormdata(data);
    return this.http
      .post(`/api/ng/fulloff/validateProductId`, { formdata })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  updateOrderNum(params: {
    groupId: number;
    productId: number;
    orderNum: number;
  }) {
    return this.http
      .post(`/api/ng/fulloff/group/updateOrderNum`, { params })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }
}
