import { discountRule } from '../services/benefit.constant';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'discRule' })
export class DiscountRule implements PipeTransform {
  transform(rule: any, ...arg: any[]): any {
    return discountRule[rule] || '未知';
  }
}
