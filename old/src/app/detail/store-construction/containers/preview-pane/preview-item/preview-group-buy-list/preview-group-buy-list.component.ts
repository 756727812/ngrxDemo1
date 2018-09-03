import { PreviewItemComponent } from './../preview-item.component';
import { Component } from '@angular/core';
import { get } from 'lodash';

@Component({
  selector: 'app-preview-group-buy-list',
  templateUrl: './preview-group-buy-list.component.html',
  styleUrls: [
    './preview-group-buy-list.component.less',
    '../preview-item.component.css',
  ],
})
export class PreviewGroupBuyListComponent extends PreviewItemComponent {
  isMore: boolean = false;

  constructor() {
    super();
  }

  showMore() {
    // this.isMore = !this.isMore;
  }

  get targets() {
    return get(this.config, 'targets', []);
  }

  get showItems() {
    return this.isMore ? this.targets : this.targets.slice(0, 1);
  }

  // TODO 缺省值跟 配置面板 的表单分散了，考虑在组件初始化的时候处理
  get styleType() {
    return get(this.config, 'styleType', 3);
  }
}
