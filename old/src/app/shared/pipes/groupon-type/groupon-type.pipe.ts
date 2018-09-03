import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'grouponType' })
export class GrouponTypePipe implements PipeTransform {
  transform(value: number): string {
    const statusMap: string[] = [
      '',
      '普通拼团',
      '新人团',
      '抽奖团',
      '超级团',
      '拉新团',
    ];
    return statusMap[value];
  }
}
