import { Component } from '@angular/core';
import { PreviewItemComponent } from 'app/detail/store-construction/containers/preview-pane/preview-item/preview-item.component';

@Component({
  selector: 'app-single-col-goods-list',
  templateUrl: './single-col-goods-list.component.html',
  styleUrls: [
    './single-col-goods-list.component.less',
    '../preview-item.component.css',
  ],
})
export class SingleColGoodsListComponent extends PreviewItemComponent {
  constructor() {
    super();
  }
}
