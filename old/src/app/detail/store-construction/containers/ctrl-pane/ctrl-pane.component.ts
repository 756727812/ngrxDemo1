import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { find, every } from 'lodash';

import { ModalHelper } from '@shared/services';
import * as fromStore from '../../store';
import { Elem, ElemType } from '../../models/editor.model';
import { ModalAddItems } from 'app/detail/store-construction/components';
import { CtrlPaneService } from '../../services/ctrl-pane.service';
import { CtrlWidgetOutletComponent } from './sub/ctrl-widget-outlet.component';

declare interface ElemEmitterModel {
  vid: string;
  data: any;
  valid?: boolean;
}

@Component({
  selector: 'app-ctrl-pane',
  templateUrl: './ctrl-pane.component.html',
  styleUrls: ['./ctrl-pane.component.less'],
  providers: [CtrlPaneService],
})
export class CtrlPaneComponent implements OnInit {
  @ViewChildren(CtrlWidgetOutletComponent)
  ctrlOutletList: QueryList<CtrlWidgetOutletComponent>;
  elems: Elem[];
  elems$: Observable<Elem[]>;
  forVid$: Observable<string | null>;
  curVid4Config: string;
  sortableItems: any[] = [
    { id: 1, name: '活动名称1', img: '' },
    { id: 2, name: '活动名称2', img: '' },
    { id: 3, name: '活动名称3', img: '' },
    { id: 4, name: '活动名称4', img: '' },
    { id: 5, name: '活动名称5', img: '' },
    { id: 6, name: '活动名称6', img: '' },
    { id: 7, name: '活动名称7', img: '' },
  ];

  constructor(
    private store: Store<fromStore.StoreConstructionState>,
    private modalHelper: ModalHelper,
    private ctrlService: CtrlPaneService,
  ) {}

  ngOnInit() {
    this.elems$ = this.store.select(fromStore.getEditorElems);
    this.forVid$ = this.store.select(fromStore.getCurElemVidForCtrl);

    // TODO unsub??
    this.forVid$.subscribe(value => {
      this.curVid4Config = value;
    });
    this.elems$.subscribe(elems => {
      this.elems = elems;
    });
  }

  trackByItem(i, item) {
    return item.vid;
  }

  markAllCtrlWidgetAsDirty() {
    this.ctrlOutletList &&
      this.ctrlOutletList.forEach(outletWidget => {
        outletWidget.markAsDirty();
      });
  }

  handleSave(obj: ElemEmitterModel) {
    const targetElem = find(this.elems, { vid: obj.vid });
    if (!targetElem || !targetElem.data) {
      // TODO when dev
      console.error('保存的目标没有 data', targetElem);
      return;
    }
    this.store.dispatch(
      new fromStore.EditorSaveElem({
        vid: obj.vid,
      }),
    );
  }
  /**
   *
   * 对于修改 store，可以出现冗余的信息（不需要保存后台）
   * 便于在预览区或者别的地方使用
   */
  handleChange(obj: ElemEmitterModel) {
    // console.log('>>>ctrl pane handle change', obj);
    this.store.dispatch(
      new fromStore.EditorUpdateElem({
        valid: obj.valid,
        vid: obj.vid,
        value: obj.data,
      }),
    );
  }
}
