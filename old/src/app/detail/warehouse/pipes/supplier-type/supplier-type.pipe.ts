import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'supplierType' })
export class SupplierTypePipe implements PipeTransform {
  transform(index: number): string {
    const dataMap: string[] = ['品牌商', '一级代理商', '二级代理商', '贸易商'];
    return dataMap[index];
  }
}
