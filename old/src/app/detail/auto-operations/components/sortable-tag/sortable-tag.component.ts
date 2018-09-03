import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SortableTagComponent),
  multi: true,
};

@Component({
  selector: 'sortable-tag',
  templateUrl: './sortable-tag.component.html',
  styleUrls: ['./sortable-tag.component.less'],
  providers: [VALUE_ACCESSOR],
})
export class SortableTagComponent implements ControlValueAccessor {
  @Input() disabledEdit: boolean = false;
  sortableOptions: any;
  sortableItems = [];
  onChange;
  onTouched;
  @Output('change') handleChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.sortableOptions = {
      onUpdate: (event: any) => {
        this.emitData();
      },
    };
  }

  emitData() {
    if (this.onChange) {
      this.onChange(this.sortableItems);
    }
    this.handleChange.emit(this.sortableItems);
  }

  writeValue(obj: any): void {
    this.sortableItems = Array.isArray(obj) ? _.cloneDeep(obj) : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
