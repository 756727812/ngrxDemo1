import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'seckillStatus' })
export class SeckillStatusPipe implements PipeTransform {
  transform(value: number): string {
    const statusMap: string[] = ['', '待开始', '进行中', '已结束', '强制结束'];
    return statusMap[value];
  }
}
