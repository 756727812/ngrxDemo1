import { Component, OnInit } from '@angular/core';
import { PreviewItemComponent } from '../preview-item.component';
import { AddItemsService } from 'app/detail/store-construction/services';
import { get } from 'lodash';

@Component({
  selector: 'app-double-col-goods-list',
  templateUrl: './double-col-goods-list.component.html',
  styleUrls: [
    './double-col-goods-list.component.less',
    '../preview-item.component.css',
  ],
})
export class DoubleColGoodsListComponent extends PreviewItemComponent {
  activeIndex: number = 0;
  constructor(private addItemsSrv: AddItemsService) {
    super();
  }

  get targets(): any[] {
    return get(this.config, 'targets');
  }

  ngOnInit() {}

  switchTab(index) {
    this.activeIndex = index;
  }
}
