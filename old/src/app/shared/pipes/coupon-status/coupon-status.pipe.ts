import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'couponStatus' })
export class CouponStatusPipe implements PipeTransform {
  transform(value: number): string {
    const statusMap: string[] = [
      '',
      '审核中',
      '审核拒绝',
      '发放中',
      '已领完',
      '已结束',
      '还未到领取时间',
    ];
    return statusMap[value];
  }
}
