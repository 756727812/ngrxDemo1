import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzModalSubject, NzMessageService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { _HttpClient } from '@shared/services';
import { pickBy } from 'lodash';

@Component({
  selector: 'modal-goods-select-sku-mark',
  templateUrl: './modal-goods-select-sku-mark.component.html',
})
export class ModalGoodsSelectSkuMark implements OnInit {
  form: FormGroup = this.fb.group({
    itemNo: [null],
    itemName: [null],
  });
  // list$: Observable<any[]> = Observable.of([])
  // count$: Observable<number> = Observable.of(0);
  data$: Observable<{
    list: any[];
    count: number;
  }>;
  data = {
    list: [],
    count: 0,
  };
  page: number = 1;
  pageSize: number = 10;

  @Input() selectedSkuMarkList: string[];
  @Input() selectedSkuMark: string;
  @Input() sellerId: string;
  @Input() skuId: string;

  get loading() {
    return this.http.loading;
  }

  constructor(
    private subject: NzModalSubject,
    private message: NzMessageService,
    private http: _HttpClient, // @Inject('dataService') private dataService: see.IDataService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData(reset = false) {
    if (reset) {
      this.page = 1;
    }
    this.getWarehouseItems();
  }

  select(event: UIEvent, item) {
    event.preventDefault();

    this.subject.next(item);
    this.subject.destroy();
  }

  unSelect(event: UIEvent, index: number) {
    event.preventDefault();
    this.data.list[index].selected = false;
    const itemNo = this.data.list[index].itemNo;
    if (this.selectedSkuMark === itemNo) {
      this.selectedSkuMark = '';
    }
    this.selectedSkuMarkList = this.selectedSkuMarkList.filter(
      s => s !== itemNo,
    );
    this.subject.next({ itemNo, type: 'cancelSelect' });
  }

  private getWarehouseItems() {
    return this.http
      .post('api/ng/inventory/warehouseItem/list', {
        body: {
          ...pickBy(this.form.value, v => !!v),
          page: this.page,
          pageSize: this.pageSize,
          type: 2,
          sellerId: this.sellerId,
          skuId: this.skuId,
        },
      })
      .subscribe(
        ({ data: { list, count } }) =>
          (this.data = {
            count,
            list: list.map(item => ({
              ...item,
              selected: this.selectedSkuMarkList.includes(item.itemNo),
            })),
          }),
      );
  }
}
