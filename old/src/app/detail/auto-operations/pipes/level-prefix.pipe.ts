import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'levelPrefix',
})
export class LevelPrefixPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (typeof value === 'number') {
      return `P${value}`;
    }
    if (typeof value === 'string') {
      return value.startsWith('P') ? value : `P${value}`;
    }
    return '';
  }
}
