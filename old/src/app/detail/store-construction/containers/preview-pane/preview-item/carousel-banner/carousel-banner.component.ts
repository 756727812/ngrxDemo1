import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { PreviewItemComponent } from '../preview-item.component';

@Component({
  selector: 'app-carousel-banner',
  templateUrl: './carousel-banner.component.html',
  styleUrls: ['./carousel-banner.component.css'],
})
export class CarouselBannerComponent extends PreviewItemComponent
  implements AfterViewInit, OnDestroy {
  array = [1, 2, 3];
  domReady = false;
  _timer: any;

  constructor(private el: ElementRef) {
    super();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this._timer = setInterval(() => {
      if (
        $(this.el.nativeElement)
          .find('.carousel-banner')
          .width()
      ) {
        this.domReady = true;
        clearInterval(this._timer);
        this._timer = null;
      }
    }, 1000);
  }

  ngOnDestroy() {
    this._timer && clearInterval(this._timer);
  }
}
