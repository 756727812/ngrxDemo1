import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'grouponStatus' })
export class GrouponStatusPipe implements PipeTransform {
  transform(value: number): string {
    const statusMap: string[] = ['', '待开始', '活动中', '已结束'];
    return statusMap[value];
  }
}
