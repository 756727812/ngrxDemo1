import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { NzMessageService, NzModalSubject } from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'event-coupon-picker',
  templateUrl: './coupon-picker.component.html',
  styleUrls: ['./coupon-picker.component.less'],
})
export class EventCouponPickerComponent implements OnInit {
  formGroup: FormGroup;
  keyword = '';
  _keyword = '';
  nzPageSizeSelectorValues = [5, 10, 20, 30];

  sortCreate: string = 'descend';
  isSortCreate: boolean = true;

  allChecked = false;
  indeterminate = false;

  _current = 1;
  _pageSize = 10;
  _total = 1;
  _loading = true;
  displayData = [];
  selectedData = []; // 当前已经选中的优惠券
  selectedDataOriginal = []; // 父组件中传过来的优惠券
  checkedMap = {};

  @Input()
  set addedCoupon(addedCoupon) {
    if (!addedCoupon) {
      return;
    }
    addedCoupon.forEach(data => {
      this.checkedMap[data.id] = data;
    });
    // this.selectedData = addedCoupon;
    // this.selectedDataOriginal = addedCoupon.concat();
  }
  @Input() kolId;

  constructor(
    private subject: NzModalSubject,
    private fb: FormBuilder,
    private eventService: EventService,
    private nzMessageService: NzMessageService,
  ) {}
  checkAll(checked: boolean): void {
    if (checked === false) {
      this.displayData.forEach(item => {
        delete this.checkedMap[item.id];
      });
    } else {
      this.displayData.forEach(item => {
        if (this.selectedCount < 10) {
          this.checkedMap[item.id] = item;
        }
      });
    }
    this.disableCoupon();
    this.refreshStatus();
  }

  displayDataChange($event) {
    let arr = [];
    arr = $event;
    arr.forEach(data => {
      if (this.displayData.indexOf(data.id) !== -1) {
        data.checked = true;
      }
    });

    this.displayData = arr;
    this.refreshStatus();
  }

  addToSelected(id) {
    this.displayData = this.displayData.map(item => {
      if (item.id === id) {
        item.checked = false;
        return item;
      }
      return item;
    });
  }

  unCheckItem(id) {
    this.displayData = this.displayData.map(item => {
      if (item.id === id) {
        item.checked = false;
        return item;
      }
      return item;
    });
  }

  // 单个勾选
  refreshStatus(checked = null, item = null): void {
    if (item) {
      if (checked && this.selectedCount < 10) {
        this.checkedMap[item.id] = item;
      } else {
        this.disableCoupon(checked);
      }
    }
    const allChecked = this.displayData.every(item => this.checkedMap[item.id]);
    const allUnChecked = this.displayData.every(
      item => !this.checkedMap[item.id],
    );
    this.allChecked = allChecked;
    this.indeterminate = !allChecked && !allUnChecked;
  }

  /**
   * 当前选中超过10, 让其他不可选(disabled), 否则所有都可以选.
   */
  disableCoupon(disabled: boolean = true) {
    if (disabled && this.selectedCount < 10) {
      return;
    }
    this.displayData.map(item => {
      if (!this.checkedMap[item.id]) {
        item.disabled = disabled;
      }
    });
  }
  get selectedCount(): number {
    let tmpCount = 0;
    const arrCoupon = Object.keys(this.checkedMap);
    arrCoupon.forEach(key => {
      if (this.checkedMap[key] && this.checkedMap[key].id) {
        tmpCount += 1;
      }
    });
    return tmpCount;
  }

  reset() {
    this.refreshData(true);
  }

  refreshData(reset = false) {
    if (reset) {
      this._current = 1; // 当前页码
    }
    this._loading = true;
    const params = {
      page: this._current,
      pageSize: this._pageSize,
      name: this.keyword,
      kolId: this.kolId,
      type: 4, // 下单返券类优惠券
      status: 3, // 发放中
    };

    this.eventService
      .getGrouponV3List(params)
      .pipe(
        catchError((error: any) => {
          this._loading = false;
          return Observable.of(null);
        }),
      )
      .subscribe(data => {
        this._loading = false;
        if (data) {
          const { count = 0, list = [] } = data.data;
          this._total = count;
          this.displayData = list;
          this.disableCoupon();
        }
      });
  }
  // 勾选已经选中的项目
  checkData(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
      return [];
    }
    arr.forEach(data => {
      this.checkedMap[data.id] = data;
    });
    return arr;
  }
  ngOnInit() {
    this.refreshData();
  }

  ok() {
    const arrCoupon = [];
    for (const key in this.checkedMap) {
      const itemData = this.checkedMap[key];
      if (itemData && itemData.id) {
        arrCoupon.push(itemData);
      }
    }
    this.subject.next(arrCoupon);
    this.subject.destroy();
  }
  cancel() {
    this.subject.destroy();
  }

  search() {
    this.keyword = this._keyword;
    this.reset();
  }

  sortByCreate(value) {
    if (value) {
      this.isSortCreate = true;
      this.reset();
    } else {
      this.isSortCreate = false;
      this.reset();
    }
  }
}
