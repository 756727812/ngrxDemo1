import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { get } from 'lodash';

import { getIconUrlByName } from 'app/detail/store-construction/components/icon-radio-group/icon-radio-group.component';
import { ElemType } from 'app/detail/store-construction/models/editor.model';

@Component({
  selector: 'app-preview-item',
  template: ``,
})
export class PreviewItemComponent implements OnChanges {
  @Input() itemData: any = null;
  icon: string;

  get data() {
    return this.itemData ? this.itemData.data : {};
  }

  get config() {
    return get(this.itemData, 'data.config', {});
  }

  constructor() {}

  ngOnChanges() {
    if (Object.hasOwnProperty.call(this.data, 'icon')) {
      this.icon = this.data.icon;
    } else {
      switch (this.data.type) {
        case ElemType.GROUP_BUY:
          this.icon = getIconUrlByName('stars');
          break;
        case ElemType.GROUP_LOTTERY:
          this.icon = getIconUrlByName('gift');
          break;
        case ElemType.SPEED_KILL:
          this.icon = getIconUrlByName('flash');
          break;
        case ElemType.EXPLORE_COL_GOODS:
          this.icon = getIconUrlByName('good');
          break;
      }
    }
    // console.table(this.data);
    // console.warn(this.icon);
  }
}
