import { Pipe, PipeTransform } from '@angular/core';
import { salesSates } from '../services/benefit.constant';

@Pipe({
  name: 'productState',
})
export class ProductStatePipe implements PipeTransform {
  transform(state: string, args?: any): any {
    return salesSates[state] || '';
  }
}
