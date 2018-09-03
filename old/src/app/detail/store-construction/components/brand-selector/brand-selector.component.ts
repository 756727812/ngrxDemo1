import { Component, OnInit, Input, forwardRef } from '@angular/core';
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
import { Subject } from 'rxjs/Subject';
import { debounceTime, switchMap } from 'rxjs/operators';

export const EXE_BRAND_SELECTOR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => BrandSelectorComponent),
  multi: true,
};

export const validateBrandSelectorRange: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors => {
  return null;
};

export const EXE_BRAND_SELECTOR_VALIDATOR = {
  provide: NG_VALIDATORS,
  useValue: validateBrandSelectorRange,
  multi: true,
};

@Component({
  selector: 'app-brand-selector',
  templateUrl: './brand-selector.component.html',
  styleUrls: ['./brand-selector.component.less'],
  providers: [EXE_BRAND_SELECTOR_VALUE_ACCESSOR],
})
export class BrandSelectorComponent implements OnInit, ControlValueAccessor {
  @Input() _value: any; // 真正向外传的传
  @Input() placeholder: string;
  @Input() api: string = '/api/item/getStandardBrandListv2';
  @Input() getBrandNamesApi: string = '/api/ng/xdpDecorate/getBrandNames';
  @Input() dataSource: any;
  @Input() mode: string;
  @Input() type: number = 1;
  isLoading: boolean = false;
  searchChange$ = new Subject();
  propagateChange = (_: any) => {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const getStandardBrandList$: Observable<any> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(
        switchMap(query =>
          this.http.get(`${this.api}?keyword=${query}&type=${this.type}`),
        ),
      );

    getStandardBrandList$.subscribe(
      (data: any) => {
        if (data.result === 1 && data.data) {
          this.dataSource = data.data.map(item => ({
            label: item.brand_name,
            value: item.brand_id,
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

  searchChange(searchText) {
    console.log(searchText);
    const query = encodeURI(searchText);
    if (query === '') {
      return;
    }
    this.isLoading = true;
    this.searchChange$.next(query);
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

  set value(value: number) {
    this._value = value;
    this.propagateChange(this._value);
  }

  writeValue(value: any) {
    if (value !== undefined) {
      this.initData(value);
      this.value = value;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}
}
