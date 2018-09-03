import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzModalSubject, NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { MicroPage, GroupGoods, GroupGoodsData } from '../../models';
import { GoodsGroupService } from '../../services';
import { CHANNEL_OPTIONS } from '../../../goods/group/const';
import {
  SALE_STATUS_OPTIONS,
  IS_HIDDEN_OPTIONS,
} from '../../../goods/group/search-goods-form.component';
import { omit } from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'modal-goods-group-add-goods',
  templateUrl: 'modal-goods-group-add-goods.component.html',
  styles: [
    `
    :host ::ng-deep .formSplit {
      display: inline-block;
      width: 10px;
    }
  `,
  ],
})
export class ModalGoodsGroupAddGoodsComponent implements OnInit {
  _groupId: number;
  form: FormGroup = this.fb.group({
    type: [0],
    category: [null],
    saleStatus: [0],
    hiddenFlag: [0],
    keyWord: [null],
    dateRange: [[null, null]],
    priceFrom: [null],
    priceTo: [null],
  });
  channelOptions = CHANNEL_OPTIONS;
  categoryOptions$: Observable<
    any[]
  > = this.goodsGroupService
    .getCategoryList()
    .pipe(map(data => [{ categoryId: null, categoryName: '全部' }, ...data]));
  saleStatusOptions = SALE_STATUS_OPTIONS;
  isHiddenOptions = IS_HIDDEN_OPTIONS;
  page: number = 1;
  pageSize: number = 10;
  groupGoods: GroupGoodsData = {
    list: [],
    count: 0,
  };

  get loading(): boolean {
    return this.goodsGroupService.loading;
  }

  @Input()
  set groupId(groupId: number) {
    if (!groupId) {
      return;
    }
    this._groupId = groupId;
    this.loadGoodsList();
  }

  constructor(
    private fb: FormBuilder,
    private subject: NzModalSubject,
    private goodsGroupService: GoodsGroupService,
    private message: NzMessageService,
  ) {}

  ngOnInit() {}

  private loadGoodsList() {
    this.goodsGroupService
      .getAllGoodsList({
        ...this.getFormParams(),
        groupId: this._groupId,
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe(data => {
        this.groupGoods = data;
      });
  }

  submitForm($event: UIEvent, value: any) {
    $event.preventDefault();

    this.page = 1;
    this.loadGoodsList();
  }

  resetForm() {
    this.page = 1;
    this.form.reset();
    this.loadGoodsList();
  }

  changePage() {
    this.loadGoodsList();
  }

  select(item: GroupGoods) {
    this.goodsGroupService
      .addCommodityInCategory({
        commodityId: item.itemId,
        categoryId: this._groupId,
      })
      .subscribe(this.optionSuccess.bind(this));
  }

  cancel(item: GroupGoods) {
    this.goodsGroupService
      .removeCommodityInCategory({
        commodityId: item.itemId,
        categoryId: this._groupId,
      })
      .subscribe(this.optionSuccess.bind(this));
  }

  addInBatch() {
    this.goodsGroupService
      .addAllCommidityInCategory({
        category: this.form.get('category').value || undefined,
        groupId: this._groupId,
      })
      .subscribe(this.optionSuccess.bind(this));
  }

  private optionSuccess() {
    this.message.success('操作成功！');
    this.loadGoodsList();
  }

  private getFormParams() {
    const ret: any = omit(this.form.value, 'dateRange');

    ret.keyWord = (ret.keyWord || '').trim() || undefined;

    let { priceFrom, priceTo } = ret;

    if (Number(priceFrom) > Number(priceTo)) {
      [priceFrom, priceTo] = [priceTo, priceFrom];
      ret.priceFrom = priceFrom;
      ret.priceTo = priceTo;
      this.form.get('priceFrom').setValue(priceFrom);
      this.form.get('priceTo').setValue(priceTo);
    }

    const dateRange = this.form.get('dateRange').value;
    if (dateRange) {
      const [startTime, endTime] = dateRange;
      if (startTime && endTime) {
        ret.startTime = startTime.getTime();
        ret.endTime = moment(endTime)
          .endOf('day')
          .toDate()
          .getTime();
      }
    }

    return ret;
  }
}
