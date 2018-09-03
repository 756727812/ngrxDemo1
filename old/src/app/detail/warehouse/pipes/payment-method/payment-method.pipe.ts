import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'paymentMethod' })
export class PaymentMethodPipe implements PipeTransform {
  transform(index: number): string {
    const dataMap: string[] = ['支付宝', '银行'];
    return dataMap[index];
  }
}
