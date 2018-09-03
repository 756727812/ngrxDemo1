import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { sortBy, isInteger } from 'lodash';
import { productTypes, salesSates } from './benefit.constant';

export const containSpecial = RegExp(/[(\!)(\#)(\$)(\%)(\^)(\&)(\*)(\;)]+/);
export const accuracy = new RegExp(/^[1-9]*[0-9]*(\.\d{0,2})*$/);
export const productIdValid = (
  productIds: string,
  defaultValue: any = false,
) => {
  let value = (productIds || '').trim().replace(/[,，]/g, ',');
  value = value.replace(/(^,|,$)/g, '');
  const arr = value.split(',');
  const ret = [];
  const result = arr.every(r => {
    const s: string = `${r}`.trim() || '';
    ret.push(s);
    return isInteger(+s) && s.length < 10;
  });
  return result ? ret : defaultValue;
};

export const getProductIds = productIds => {
  return productIdValid(productIds, false) || [];
};

@Injectable()
export class Utils {
  dateFormat(date: any, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(date ? date : '').format(format);
  }

  productIdValid(productIds, defaultValue: any = false) {
    return productIdValid(productIds, defaultValue);
  }

  getExportFileName(activityId) {
    const dt = moment().format('YYYYMMDDHHmmss');
    return `满减活动${activityId}添加失败商品${dt}`;
  }

  sortBy(items, byKey) {
    return sortBy(items, [
      function(o) {
        return -o[byKey];
      },
    ]);
  }

  rangeBy(el, defaultValue, min: number = 0, max: number = 99999999) {
    const value = (el.value || '').trim();
    const v = Number(value);
    if (!v || v > max || v < min) {
      return defaultValue;
    }
    return v;
  }

  getExceptProduct(items, ids, maps) {
    const data = ids.map(productId => {
      const { productName, mainImgUrl } = maps[productId];
      const { msg } = items[`${productId}`];
      return {
        productId,
        productName,
        mainImgUrl,
        msg,
      };
    });
    return { data, count: data.length };
  }

  setItemState(data, productId, ret) {
    return data.map(r => {
      if (r.productId === productId) {
        r.btnTitle = ret ? '已添加' : '添加失败';
        r._status = ret ? 'primary' : 'danger';
      }
      return r;
    });
  }

  saleType(type) {
    return productTypes[type];
  }

  salesSates(status) {
    return salesSates[status];
  }

  rmb(rmb) {
    return '¥' + rmb;
  }
}
