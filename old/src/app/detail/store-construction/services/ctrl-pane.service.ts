import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../store';
import { MODAL_TYPE, AddItemsService } from './add-items.service';
import { ModalHelper } from '@shared/services';
import { ModalAddItems } from 'app/detail/store-construction/components/modal-add-items/modal-add-items.component';
import { ElemType } from '../models/editor.model';
import { isArray, isPlainObject } from 'lodash';

@Injectable()
export class CtrlPaneService {
  static MODAL_TYPE = MODAL_TYPE;
  private kolId;
  private xdpId;
  constructor(
    private modalHelper: ModalHelper,
    private addItemsSrv: AddItemsService,
    private store: Store<fromStore.StoreConstructionState>,
  ) {
    store.select(fromStore.getTargetKolId).subscribe(val => (this.kolId = val));
    store.select(fromStore.getTargetXdpId).subscribe(val => (this.xdpId = val));
  }

  /**
   * 打开添加项目模态框
   * @param type TYPE_LIST 中的 Key
   * @param addedIdList 当前类型已添加的 ID 列表
   * @param kolId
   */
  openModalForAdd(
    type: MODAL_TYPE,
    addedIdList: number[] = [],
    kolId: number = this.kolId,
    xdpId: number = this.xdpId,
  ) {
    const { size, title } = this.addItemsSrv.getCurrentType(type);
    return this.modalHelper.static(
      ModalAddItems,
      { kolId, type, addedIdList, xdpId },
      size,
      { title, footer: false },
    );
  }
}
