import {
  Directive,
  HostBinding,
  ElementRef,
  HostListener,
} from '@angular/core';
import Viewer from 'viewerjs/dist/viewer.esm';
import { formatSrc } from '../../utils';

@Directive({
  selector: '[seeViewer]',
})
export class SeeViewerDirective {
  @HostBinding() src;
  @HostBinding('attr.data-original') dataOriginal;
  @HostBinding('class.img-viewer')
  bool = $(this.element.nativeElement).is('img');

  constructor(private element: ElementRef) {}

  @HostListener('load', ['$event.target'])
  onLoad(element: HTMLElement) {
    const el = new Viewer(element, {
      // 使用原始图片地址做预览
      url: () =>
        this.dataOriginal
          ? formatSrc(this.dataOriginal, !!~~localStorage.getItem('hasWebP'))
          : this.src,
    });
  }
}
