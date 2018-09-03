import {
  Component,
  OnInit,
  Input,
  forwardRef,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

const EXE_BRAND_SELECTOR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => BrandSelectorComponentNg1),
  multi: true,
};

const validateBrandSelectorRange: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors => {
  return null;
};

const EXE_BRAND_SELECTOR_VALIDATOR = {
  provide: NG_VALIDATORS,
  useValue: validateBrandSelectorRange,
  multi: true,
};

@Component({
  selector: 'ng1-app-brand-selector',
  templateUrl: './brand-selector.component.html',
  styleUrls: ['./brand-selector.component.less'],
  providers: [EXE_BRAND_SELECTOR_VALUE_ACCESSOR],
})
export class BrandSelectorComponentNg1 implements OnInit, ControlValueAccessor {
  @Input() _value: any;
  @Input() placeholder: string;
  @Input() disabled: boolean;
  @Input() api: string = '/api/item/getStandardBrandListv2';
  @Input() getBrandNamesApi: string = '/api/ng/xdpDecorate/getBrandNames';
  @Input() dataSource: any;
  @Input() mode: string;
  @Input() type: number = 1;
  @Input('brandIds')
  set brandIds(value) {
    this.writeValue(value);
  }
  @Output() onValueChange = new EventEmitter<any>();
  isLoading: boolean = false;
  propagateChange = (_: any) => {};
  brandNames: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  searchChange(searchText) {
    const query = encodeURI(searchText);
    if (query === '') {
      return;
    }
    this.isLoading = true;
    this.http.get(`${this.api}?keyword=${query}&type=${this.type}`).subscribe(
      (data: any) => {
        if (data.result === 1 && data.data instanceof Array) {
          // this.dataSource = data.data.map(item => ({
          //   label: item.brand_name,
          //   value: item.brand_id,
          // }));
          const dataSource = [];
          data.data.forEach(({ brand_name: label, brand_id: value }) => {
            this.brandNames[value] = label;
            dataSource.push({ label, value });
          });
          this.dataSource = dataSource;
        } else {
          this.dataSource = [];
        }
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      },
    );
  }

  initData(ids: number[]) {
    this.isLoading = true;
    this.http
      .post(`${this.getBrandNamesApi}?brandIds[]=${ids.join(',')}`, {})
      .subscribe(
        (data: any) => {
          if (data.result === 1) {
            this.dataSource = data.data.map(item => ({
              label: item.name,
              value: item.id,
            }));
          } else {
            this.dataSource = [];
          }
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
        },
      );
  }

  get value() {
    return this._value;
  }

  set value(value: number[]) {
    this._value = value;
    this.onValueChange.emit(
      this._value.map(id => ({ id, name: this.brandNames[id] })),
    );
    this.propagateChange(this._value);
  }

  writeValue(value: any) {
    if (value instanceof Array && value.length) {
      this.initData(value);
      this.value = value;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}
}
