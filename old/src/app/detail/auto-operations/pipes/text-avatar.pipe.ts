import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'textAvatar'
})
export class TextAvatarPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) {
      return null;
    }
    const reg = /[\u4e00-\u9fa5]/g;
    if (reg.test(value.substring(0, 1))) {
      return value.substring(0, 2);
    } else {
      return value.substring(0, 1).toUpperCase();
    }
  }

}
