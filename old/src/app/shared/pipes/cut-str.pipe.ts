import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cutStr' })
export class CurStrPipe implements PipeTransform {
  transform(value, len: number = 20): string {
    const nLen = len || 200;
    const text = value || '';
    let n = 0;
    let s = '';
    if (!text) {
      return '';
    }
    const strLen = value.replace(/[\u4e00-\u9fa5]/g, 'xx').length;
    if (strLen <= nLen) return value;
    for (let i = 0; i < strLen; i += 1) {
      const a = text.charAt(i);
      if (text.charCodeAt(i) > 256) {
        n = n + 1;
      }
      n = n + 1;
      s += a;
      if (n >= nLen) {
        return s + '...';
      }
    }
    return text;
  }
}
