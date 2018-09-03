import {
  Component,
  OnInit,
  Input,
  Output,
  forwardRef,
  EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type IIconName = 'gift' | 'flash' | 'stars' | 'good';

type IIcon = {
  name: IIconName;
  imgUrl: string;
};

export const iconArray: IIcon[] = [
  {
    name: 'gift',
    imgUrl: 'https://static.seecsee.com/xcx/images/gift.png',
  },
  {
    name: 'flash',
    imgUrl: 'https://static.seecsee.com/xcx/images/flash.png',
  },
  {
    name: 'stars',
    imgUrl: 'https://static.seecsee.com/xcx/images/stars.png',
  },
  {
    name: 'good',
    imgUrl: 'https://static.seecsee.com/xcx/images/good.png',
  },
];
export const getIconUrlByName = name => {
  const icon = iconArray.find(item => item.name === name);
  return icon ? icon.imgUrl : '';
};

@Component({
  selector: 'app-icon-radio-group',
  templateUrl: './icon-radio-group.component.html',
  styleUrls: ['./icon-radio-group.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconRadioGroupComponent),
      multi: true,
    },
  ],
})
export class IconRadioGroupComponent implements OnInit, ControlValueAccessor {
  // ngModel Access
  @Input() _value: string = '';
  @Output() radioChange: EventEmitter<any> = new EventEmitter<any>();
  iconArray = iconArray;

  constructor() {}

  ngOnInit() {}

  private _onChange: (value: string) => void = () => null;
  private _onTouched: () => void = () => null;

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    if (this._value === val) {
      return;
    }
    // if (!val) {
    //   this._value = '';
    // } else {
    this._value = val;
    this._onChange(val);
    this.radioChange.emit();
    // }
  }

  handleIconChange(ev) {
    // console.log(ev);
  }

  /* model access start */

  writeValue(value: string) {
    this._value = value;
  }

  registerOnChange(fn: (_: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}
