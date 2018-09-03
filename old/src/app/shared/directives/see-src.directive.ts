import {
  Directive,
  OnChanges,
  HostBinding,
  Input,
  Inject,
} from '@angular/core';
import { formatSrc } from '@utils';
// 这里当做普通函数用
import webPService from '../../directives/see-src/webP.service';

@Directive({
  selector: '[seeSrc]',
  exportAs: 'seeSrc',
})
export class SeeSrcDirective implements OnChanges {
  @Input() seeSrc: string;
  @Input() thumbnail: string;
  @Input() crop: string;
  @Input() gravity: string;
  @HostBinding() src;
  @HostBinding('attr.data-original') dataOriginal;
  @HostBinding('attr.data-width') dataWidth;
  @HostBinding('attr.data-height') dataHeight;

  ngOnChanges() {
    const defaultImg =
      '//static.seecsee.com/seego_backend/images/placeholder.png';
    const thumbnail = this.thumbnail ? `/thumbnail/${this.thumbnail}` : '';
    const crop = this.crop ? `/crop/${this.crop}` : '';
    const gravity = this.gravity ? `/gravity/${this.gravity}` : '';
    webPService()
      .webPSupport()
      .then(hasWebp => {
        if (!this.seeSrc) {
          this.src = formatSrc(defaultImg, hasWebp, thumbnail, crop, gravity);
          return;
        }
        // 记录原图片
        this.dataOriginal = this.seeSrc;
        const seeSrc = formatSrc(
          this.seeSrc,
          hasWebp,
          thumbnail,
          crop,
          gravity,
        );

        // 记录原始图片宽高
        const image = new Image();
        // tslint:disable-next-line no-this-assignment
        const self = this;
        image.onload = function() {
          self.dataWidth = (<any>this).width;
          self.dataHeight = (<any>this).height;
          self.src = seeSrc;
        };
        image.onerror = () => {
          this.src = defaultImg;
          console.warn(new Error(`图片：${seeSrc} 加载错误，已替换为默认图片`));
        };
        image.src = seeSrc;
      });
  }
}
