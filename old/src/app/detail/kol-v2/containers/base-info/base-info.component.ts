import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { BaseInfoService } from '../../services';
import * as fromStore from '../../store';
import { Store } from '@ngrx/store';

@Component({
  templateUrl: './base-info.component.html',
  styleUrls: ['./base-info.component.less'],
})
export class BaseInfoComponent {
  data = {};
  kolInfo: any;
  constructor(
    private _message: NzMessageService,
    private baseInfoService: BaseInfoService,
    private store: Store<fromStore.KolState>,
  ) {
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(data => (this.kolInfo = data));
  }
  ngOnInit() {
    this.baseInfoService
      .getXdpInfo({
        kolId: this.kolInfo.kolId,
      })
      .subscribe(data => (this.data = data));
  }

  showMsg() {
    this._message.create('success', '复制成功！');
  }
}
