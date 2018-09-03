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
  useExisting: forwardRef(() => TagArraysComponent),
  multi: true,
};

@Component({
  selector: 'see-tag-arrays',
  templateUrl: './tag-arrays.component.html',
  styleUrls: ['./tag-arrays.component.less'],
  providers: [VALUE_ACCESSOR],
})
export class TagArraysComponent implements ControlValueAccessor {
  @Input() tags: any[] = [];
  onChange;
  onTouched;
  @Output('change') handleChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  emitData() {
    if (this.onChange) {
      this.onChange(this.tags);
    }
    this.handleChange.emit(this.tags);
  }

  onClose(index: number): void {
    this.tags.splice(index, 1);
    this.emitData();
  }

  onEdit(): void {
    this.edit.emit(this.tags);
  }

  writeValue(obj: any): void {
    this.tags = Array.isArray(obj) ? _.cloneDeep(obj) : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
