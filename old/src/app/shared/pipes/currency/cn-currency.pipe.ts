import { PipeTransform, Pipe } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

/**
 * 内置 `_currency` 货币格式化
 * 简化原 `currency` 针对中文货币格式化问题
 */
@Pipe({ name: '_currency' })
export class CNCurrencyPipe extends CurrencyPipe implements PipeTransform {
  transform(
    value: any,
    currencyCode: string = '￥',
    display: 'code' | 'symbol' | 'symbol-narrow' | boolean = 'code',
    digits?: string,
  ): string | null {
    return super.transform(value, currencyCode, <any>display, digits);
  }
}
