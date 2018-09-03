import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'active-rules',
  templateUrl: './active-rules.component.html',
  styleUrls: ['./active-rules.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ActiveRulesComponent),
      multi: true,
    },
  ],
})
export class ActiveRulesComponent implements ControlValueAccessor {
  onChange: Function;
  isDisabled: boolean;
  types: any[] = [{ type: 1, label: '满额减' }, { type: 2, label: '满件折' }];
  data: any = {
    type: 1,
    rules: [{ rank: 1, num: 0, discount: 0 }],
    money: {
      targetPrice: '',
      offPrice: '',
      capping: '',
    },
  };

  get rules() {
    return this.data.rules;
  }

  get money() {
    return this.data.money;
  }

  get isFull() {
    return this.rules.length <= 4;
  }

  validate(target, m, key) {
    const value = Number(target.value);
    if (!value || value < 0.1 || value > 9.9) {
      target.value = m[key] || 0.1;
      return;
    }
    m[key] = value;
  }

  addRow() {
    console.log(this.data);
    const index = this.data.rules.length + 1;
    this.data.rules.splice(index, 0, { rank: index, num: 0, discount: 0 });
  }

  rmRow(e: MouseEvent, index) {
    e.preventDefault();
    if (this.data && this.data.rules.length > 1) {
      this.data.rules.splice(index, 1);
      this.data.rules.map((r, i) => {
        r.rank = i + 1;
        return r;
      });
      console.log(this.data);
    }
  }

  constructor() {}

  ngOnInit() {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(data: any): void {
    this.data = data;
  }
}
