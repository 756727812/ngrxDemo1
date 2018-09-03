import { Component, OnInit, Input } from '@angular/core';
import { NzModalSubject } from 'ng-zorro-antd';
import { omit, isNil } from 'lodash';
import { parse } from 'query-string';

import {
  AddItemsService,
  IAddType,
  IFormData,
  MODAL_TYPE,
} from 'app/detail/store-construction/services';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'modal-store-construction-add-items',
  templateUrl: './modal-add-items.component.html',
  styleUrls: ['./modal-add-items.component.less'],
})
export class ModalAddItems implements OnInit {
  currentType: IAddType;
  page: number = 1;
  loading: boolean = false;
  /**
   * 是否真的一无所有
   */
  noAvailableList: boolean = false;
  isShowLimitInfo = false;
  _type: MODAL_TYPE;
  addedCount = 0;
  itemsList = {
    list: [],
    count: 0,
  };
  formData: IFormData = {
    keyword: undefined,
    selectOne: undefined,
    selectTwo: undefined,
  };
  _addedIdList: number[] = [];

  constructor(
    private subject: NzModalSubject,
    private addItemsSrv: AddItemsService,
  ) {}

  ngOnInit() {
    this.getItemsList();
  }

  @Input() kolId: number = 0;
  @Input() xdpId?: number;

  @Input()
  set type(value: MODAL_TYPE) {
    this._type = value;

    this.currentType = this.addItemsSrv.getCurrentType(value);
  }

  @Input()
  set addedIdList(value: number[]) {
    this._addedIdList = value;
  }

  openNew() {
    const wechatId = parse(location.search)['wechatId'];
    const urlResult = this.currentType.getOpenUrl(
      this.kolId,
      wechatId,
      this.xdpId,
    );

    if (typeof urlResult === 'string') {
      window.open(urlResult);
    } else if (urlResult.then) {
      urlResult.then(url => {
        window.open(url);
      });
    }
  }

  addItem(event: MouseEvent, index: number) {
    event.preventDefault();
    const idKeyStr = this.currentType.idKeyStr;
    const ifDestroy = () => {
      if (this._addedIdList.length === this.currentType.limit) {
        this.subject.destroy();
      }
    };
    const listItem = this.itemsList.list[index];
    if (this._addedIdList.length < this.currentType.limit) {
      listItem.added = true;
      this._addedIdList.push(listItem[idKeyStr]);
      this.subject.next(listItem);
      ifDestroy();
    } else {
      this.isShowLimitInfo = true;
    }
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  getItemsList(noParams = false) {
    this.loading = true;
    const idKeyStr = this.currentType.idKeyStr;
    if (noParams) {
      this.page = 1;
    }
    const basicParams = {
      page: this.page,
      currentPageNo: this.page,
      pageSize: this.currentType.pageSize,
      page_size: this.currentType.pageSize,
      kolId: this.kolId,
      kol_id: this.kolId,
      xdpId: this.xdpId,
    };

    const extraParams = {
      xdpId: this.xdpId,
    };

    const params: { [key: string]: any } = this.addItemsSrv.getQueryListParams(
      this._type,
      basicParams,
      this.formData,
      extraParams,
    );
    return this.currentType.fetch(params).subscribe(
      ({ data }) => {
        this.loading = false;
        if (!data) {
          return;
        }
        const list = Object.values(data).filter(item =>
          Array.isArray(item),
        )[0] as any[];
        list.forEach(item => {
          item.added = this._addedIdList.some(
            id => `${id}` === `${item[idKeyStr]}`,
          );
        });
        this.itemsList = {
          list,
          count: data.count >>> 0,
        };
        this.currentType.td = this.currentType.getTd(this.itemsList.list);
        if (
          this.itemsList.count === 0 &&
          Object.values(omit(params, ...Object.keys(basicParams))).every(val =>
            isNil(val),
          )
        ) {
          this.noAvailableList = true;
        } else {
          if (this._type === MODAL_TYPE.SPEED_KILL) {
            if (
              this.itemsList.count === 0 &&
              Array.isArray(params.status) &&
              Object.values(
                omit(params, 'status', ...Object.keys(basicParams)),
              ).every(val => isNil(val))
            ) {
              this.noAvailableList = true;
            } else {
              this.noAvailableList = false;
            }
            return;
          }
          if (
            [
              MODAL_TYPE.HOT_GOODS,
              MODAL_TYPE.GOODS_LINK,
              MODAL_TYPE.GROUPON,
            ].includes(this._type)
          ) {
            if (
              this.itemsList.count === 0 &&
              params.type >>> 0 === 3 &&
              Object.values(
                omit(params, 'type', ...Object.keys(basicParams)),
              ).every(val => isNil(val))
            ) {
              this.noAvailableList = true;
            } else {
              this.noAvailableList = false;
            }
            return;
          }
          this.noAvailableList = false;
        }
      },
      () => {
        this.loading = false;
      },
    );
  }
}
