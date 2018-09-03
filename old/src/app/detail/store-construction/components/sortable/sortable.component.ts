import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CtrlPaneService } from 'app/detail/store-construction/services/ctrl-pane.service';
import { MODAL_TYPE } from 'app/detail/store-construction/services/add-items.service';
import { isAdmin } from '@utils';
import {
  AddItemsService,
  IAddType,
} from 'app/detail/store-construction/services';
import { NzModalService, NzRangePickerComponent } from 'ng-zorro-antd';
import { parse, stringify } from 'query-string';

enum ShowType {
  ALWAYS = 1,
  RANGE = 2,
}

@Component({
  selector: 'sortableItems',
  templateUrl: './sortable.component.html',
  styleUrls: ['./sortable.component.less'],
  providers: [
    CtrlPaneService,
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SortableItemsComponent),
      multi: true,
    },
  ],
})
export class SortableItemsComponent implements ControlValueAccessor {
  sortableOptions: any;
  onChange;
  onTouched;
  _type: MODAL_TYPE;
  _currentAddType: IAddType;
  sortableItems = [];
  limit = 0;
  counter = 0;
  couponStatusClassMap = {
    3: 'dispensing',
    4: 'run-out',
    5: 'has-finished',
  };
  dateRangeMap: any[] = [];
  @ViewChildren(NzRangePickerComponent) datePickers: NzRangePickerComponent[];

  @Output('change') handleChange: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  set type(value: MODAL_TYPE) {
    this._type = value;
    this._currentAddType = this.addItemSrv.getCurrentType(value);
    this.limit = this._currentAddType.limit;
  }

  groupAndSeckillListPath(activityName: string) {
    const { kolId, wechatId } = parse(location.search);
    const queryString = stringify({
      kolId,
      wechat_id: wechatId,
      activityName: encodeURIComponent(activityName),
    });
    switch (this._type) {
      case MODAL_TYPE.GROUP_BUY:
      case MODAL_TYPE.GROUP_LOTTERY:
        return `event/group?${queryString}`;
      case MODAL_TYPE.SPEED_KILL:
        return `event/seckill?${queryString}`;
      default:
        return '';
    }
  }

  formatDate(date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }

  handleDateRangeNgModelChange(item, dateRange) {
    setTimeout(() => {
      this.setDateRange();
      this.onChange(this.sortableItems);
      this.handleChange.emit(this.sortableItems);
    }, 400);
  }

  setDateRange() {
    this.sortableItems = this.sortableItems.map(item => {
      const [dateStart, dateEnd] = item._dateRange || [null, null];
      item.startTime = dateStart ? this.formatDate(dateStart) : null;
      item.endTime = dateEnd ? this.formatDate(dateEnd) : null;
      item.showType = dateStart || dateEnd ? ShowType.RANGE : ShowType.ALWAYS;
      return item;
    });
  }

  getCategorySearchLink(item) {
    const { kolId, wechatId, xdpId, micropageId } = parse(location.search);
    return isAdmin()
      ? `/kol/kol-cooperation-management/${kolId}?keyword=${
          item.categoryName
        }#7`
      : `/goods/groups?page=1&keyword=${item.categoryName}`;
  }

  clearDateRange(i) {
    this.sortableItems[i]._dateRange = [null, null];
    this.setDateRange();
    this.onChange(this.sortableItems);
    this.handleChange.emit(this.sortableItems);
  }

  get sortableType() {
    switch (this._type) {
      case MODAL_TYPE.GROUP_BUY:
      case MODAL_TYPE.GROUP_LOTTERY:
      case MODAL_TYPE.SPEED_KILL:
        return 1;
      case MODAL_TYPE.COUPON:
        return 2;
      case MODAL_TYPE.HOT_GOODS:
        return 3;
      case MODAL_TYPE.CATEGORY:
        return 4;
    }
  }

  constructor(
    private datePipe: DatePipe,
    private ctrlPaneSrv: CtrlPaneService,
    private addItemSrv: AddItemsService,
  ) {
    this.sortableOptions = {
      onUpdate: (event: any) => {
        this.onChange(this.sortableItems);
        this.handleChange.emit(this.sortableItems);
      },
    };
  }

  delItem(index: number) {
    this.sortableItems.splice(index, 1);
    this.onChange(this.sortableItems);
    this.handleChange.emit(this.sortableItems);
  }

  addItem() {
    const idKeyStr = this._currentAddType.idKeyStr;
    this.ctrlPaneSrv
      .openModalForAdd(
        this._type,
        this.sortableItems.map(item => item[idKeyStr]),
      )
      .subscribe(item => {
        this.sortableItems.push(item);
        this.onChange(this.sortableItems);
        this.handleChange.emit(this.sortableItems);
      });
  }

  openDatePicker(index) {
    const picker = this.datePickers.find((v, i) => i === index);
    if (picker) {
      picker._openCalendar();
    }
  }

  writeValue(obj: any): void {
    this.sortableItems = Array.isArray(obj)
      ? obj.slice().map(item => {
          const obj = { ...item };
          if (!obj._id) {
            // tslint:disable-next-line
            obj._id = this.counter++;

            obj._dateRange = [null, null];
            const { startTime, endTime } = obj;
            if (startTime) {
              obj._dateRange[0] = new Date(startTime);
            }
            if (endTime) {
              obj._dateRange[1] = new Date(endTime);
            }

            delete obj.startTime;
            delete obj.endTime;
          }
          return obj;
        })
      : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
