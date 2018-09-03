import { Pipe, PipeTransform } from '@angular/core';
import { productTypes } from '../services/benefit.constant';

@Pipe({
  name: 'saleType',
})
export class SaleTypePipe implements PipeTransform {
  transform(type: string, args?: any): any {
    return productTypes[type] || '';
  }
}
