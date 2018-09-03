import { Component, OnInit, Input } from '@angular/core';
import { PreviewItemComponent } from '../preview-item.component';

@Component({
  selector: 'app-big-banner',
  templateUrl: './big-banner.component.html',
  styleUrls: ['./big-banner.component.css'],
})
export class BigBannerComponent extends PreviewItemComponent {
  constructor() {
    super();
  }

  ngOnInit() {}
}
