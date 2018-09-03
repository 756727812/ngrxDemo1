import { Component, OnInit } from '@angular/core';
import { PreviewItemComponent } from '../preview-item.component';

@Component({
  selector: 'app-preview-coupon-list',
  templateUrl: './preview-coupon-list.component.html',
  styleUrls: ['./preview-coupon-list.component.less'],
})
export class PreviewCouponListComponent extends PreviewItemComponent
  implements OnInit {
  constructor() {
    super();
  }

  ngOnInit() {}
}
