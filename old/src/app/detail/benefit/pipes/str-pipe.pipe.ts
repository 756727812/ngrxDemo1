import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strPipe',
})
export class StrPipePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    const len = args || 200;
    if (!value) return '';
    if (value.length <= len) return value;
    const txtLen = value.length;

    let n = 0;
    let s = '';

    for (let i = 0; i < txtLen; i++) {
      if (value.charCodeAt(i) > 255) n++;
      n++;
      s += value[i];
      if (n >= len) {
        return s;
      }
    }
    return null;
  }

}
