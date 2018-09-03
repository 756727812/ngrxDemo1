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
  selector: 'app-sales-benefit',
  templateUrl: './sale-benefit.component.html',
  styleUrls: ['./sale-benefit.component.less'],
  providers: [
    CtrlPaneService,
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SalesBenefitComponent),
      multi: true,
    },
  ],
})
export class SalesBenefitComponent implements ControlValueAccessor {
  onChange;
  onTouched;
  _type: MODAL_TYPE;
  _currentAddType: IAddType;
  sortableItems: any[] = [];
  limit = 0;
  counter = 0;
  kolInfo: any = {};

  @Output('change') handleChange: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  set type(value: MODAL_TYPE) {
    this._type = value;
    this._currentAddType = this.addItemSrv.getCurrentType(value);
    this.limit = this._currentAddType.limit;
  }

  constructor(
    private datePipe: DatePipe,
    private ctrlPaneSrv: CtrlPaneService,
    private addItemSrv: AddItemsService,
  ) {
    this.kolInfo = parse(location.search);
  }

  delItem(e: MouseEvent) {
    e.preventDefault();
    this.sortableItems = [];
    this.onChange(this.sortableItems);
    this.handleChange.emit(this.sortableItems);
  }

  get hasData() {
    return this.sortableItems.length > 0;
  }

  get data() {
    return this.sortableItems[0] || {};
  }

  addActive(e: MouseEvent) {
    e.preventDefault();
    this.ctrlPaneSrv.openModalForAdd(this._type).subscribe(item => {
      this.sortableItems = [item];
      this.onChange(this.sortableItems);
      this.handleChange.emit(this.sortableItems);
    });
  }

  writeValue(obj: any[]): void {
    this.sortableItems = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
