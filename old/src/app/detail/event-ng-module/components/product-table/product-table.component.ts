import {
  Component,
  OnInit,
  Input,
  Output,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';
import * as _ from 'lodash';

export const EXE_COUNTER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EventProductTableComponent),
  multi: true,
};

type IProduct = {
  itemId: number;
  itemImgurl: string;
  itemName: string;
  distribution: boolean; // 是否是分销商品（子商品）
};

@Component({
  selector: 'app-event-product-table',
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.less'],
  providers: [EXE_COUNTER_VALUE_ACCESSOR],
})
export class EventProductTableComponent
  implements OnInit, ControlValueAccessor {
  @Input() product: IProduct;
  @Input() itemStatus: number;
  @Input() formDataType: number;
  @Input() submitted: boolean = false;
  @Input() isAttractNewType: boolean = false;

  @Input() isView: boolean;
  @Input() skuInput: any[];

  _skuList: any[];
  get skuList() {
    return this._skuList;
  }
  set skuList(value: any[]) {
    this._skuList = value;
    this.sendSkuList();
  }
  sendSkuList(): void {
    // if (this._skuList) {this.propagateChange(this._skuList.filter(sku => sku.status === 1));}
    if (this._skuList && this.propagateChange) {
      this.propagateChange(this._skuList);
    }
  }
  sameTriger: {
    price?: number;
    promotionPrice?: number;
    grouponHeaderPrice?: number;
    grouponHeaderSkuCostPrice?: number;
    status?: number; // 是否参加
  } = {};

  private setSameTrigerIfIsNil(
    skuField: string,
    defaultValue: number | string,
  ): void {
    this.sameTriger[skuField] = defaultValue;
    this.setSame(skuField);
  }

  setSameForGroupType: (type: number) => void = (type: number) => {
    if (!this.isProductSkuValid) {
      return;
    }
    if (type === 3) {
      this.setSameTrigerIfIsNil('price', 0.01);
      this.setSameTrigerIfIsNil('promotionPrice', 0);
    } else {
      this.setSameTrigerIfIsNil('price', '');
      this.setSameTrigerIfIsNil('promotionPrice', '');
    }
  };

  formGroup: FormGroup;
  propagateChange: any;

  indeterminate = false;
  allChecked = true;

  isShowPromotionPricePopOver: boolean = false;
  isShowGroupPricePopOver: boolean = false;
  isHeaderPromotionSupplyPriceTmpOpen: boolean = false;
  isHeaderGroupPriceTmpOpen: boolean = false;
  isShowJoinPopOver: boolean = false;

  constructor(private eventService: EventService) {}

  ngOnInit() {}
  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.skuList.forEach(item => (item.checked = true));
    } else {
      this.skuList.forEach(item => (item.checked = false));
    }
  }
  updateSingleChecked(curItem): void {
    if (this.skuList.every(item => item.checked === false)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.skuList.every(item => item.checked === true)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }
  setSamePrice(key): void {
    const price = this.sameTriger[key];
    this.skuList = this.skuList.map(sku => {
      if (sku.checked) {
        // 只批量设置勾选的sku
        return { ...sku, [key]: price };
      }
      return { ...sku };
    });
    this.sameTriger[key] = null;
    this.isShowGroupPricePopOver = false;
    this.isShowPromotionPricePopOver = false;
    this.isHeaderGroupPriceTmpOpen = false;
    this.isHeaderPromotionSupplyPriceTmpOpen = false;
  }
  // 批量设置是否参加拼团活动
  setSameJoin(): void {
    const val = this.sameTriger.status;
    this.sameTriger.status = val;

    this.skuList = this.skuList.map(sku => {
      if (sku.checked) {
        // 只批量设置勾选的sku
        return { ...sku, status: val };
      }
      return { ...sku };
    });
    this.sameTriger.status = null;
    this.isShowJoinPopOver = false;
  }
  ngOnChanges(changeInfo) {
    const { product, formDataType } = changeInfo;
    if (product) {
      if (
        _.get(product, 'currentValue.itemId') ===
        _.get(product, 'previousValue.itemId')
      ) {
        return;
      }
      if (this.product) {
        if (!this.isView) {
          this.eventService
            .fetchSku(this.product.itemId)
            .pipe(
              catchError((error: any) => {
                return Observable.of(null);
              }),
            )
            .subscribe(({ data }) => {
              if (data) {
                this.skuList = this.formatSkuList(data);
                this.setSameForGroupType(this.formDataType);
              }
            });
        } else {
          if (this.skuInput) {
            this.skuList = this.formatSkuList(this.skuInput);
          }
        }
      }
    }
    if (!this.isView) {
      formDataType && this.setSameForGroupType(formDataType.currentValue);
    }
  }

  formatSkuList(skuList: any[]): any[] {
    return skuList.map(cur => {
      if (cur.skuSpec) {
        cur.skuSpecKeys = Object.keys(cur.skuSpec);
        const vals: string[] = [];
        cur.skuSpecKeys.forEach(key => {
          vals.push(cur.skuSpec[key]);
        });
        cur.skuSpecValues = vals;
        cur.checked = true;
      }
      return cur;
    });
  }

  private isNil(input: string | number): boolean {
    return input === '' || _.isNil(input);
  }

  setSame(key: string): void {
    const val = this.sameTriger[key];
    this.sameTriger[key] = this.isNil(val)
      ? val
      : parseFloat(val.toFixed(2).replace(/\-/, ''));
    this.skuList = this.skuList.map(sku => ({
      ...sku,
      [key]: this.sameTriger[key],
    }));
  }

  formatPrice(index: number, field: string): void {
    const val: number = this.skuList[index][field];
    this.skuList[index][field] = this.isNil(val)
      ? val
      : parseFloat(val.toFixed(2).replace(/\-/, ''));
  }

  private get isProductSkuValid() {
    return this.product && this.skuList && this.skuList.length > 0;
  }

  verifySKURequired: () => boolean = () =>
    this.isProductSkuValid &&
    this.skuList.every(
      sku =>
        sku.status === 1
          ? !this.isNil(sku.price) && !this.isNil(sku.promotionPrice)
          : true,
    );

  verifySKURequiredHead: () => boolean = () =>
    !this.isAttractNewType ||
    this.isProductSkuValid &&
    this.skuList.every(
      sku =>
        sku.status === 1
          ? !this.isNil(sku.grouponHeaderPrice) && !this.isNil(sku.grouponHeaderSkuCostPrice)
          : true,
    );

  verifySKUStatusRequired(): boolean {
    return this.isProductSkuValid && this.skuList.some(sku => sku.status === 1);
  }

  verifySKUCompare: () => boolean = () =>
    this.isProductSkuValid &&
    this.skuList.every(
      sku =>
        sku.status === 1 &&
        !this.isNil(sku.price) &&
        !this.isNil(sku.promotionPrice)
          ? sku.promotionPrice < sku.price
          : true,
    );

  verifySKUCompareHead: () => boolean = () =>
    !this.isAttractNewType ||
    this.isProductSkuValid &&
    this.skuList.every(
      sku =>
        sku.status === 1 &&
        !this.isNil(sku.grouponHeaderPrice) &&
        !this.isNil(sku.grouponHeaderSkuCostPrice)
          ? sku.grouponHeaderSkuCostPrice < sku.grouponHeaderPrice
          : true,
    );

  verifySKUCompareGrouponAndHead: () => boolean = () => {
    return (
      !this.isAttractNewType ||
      this.isProductSkuValid &&
      this.skuList.every(
        sku =>
          sku.status === 1 &&
          !this.isNil(sku.grouponHeaderPrice) &&
          !this.isNil(sku.price)
            ? sku.grouponHeaderPrice <= sku.price
            : true,
      )
    );
  };

  verifySKUCompareGrouponProAndHeadPro: () => boolean = () => {
    return (
      !this.isAttractNewType ||
      this.isProductSkuValid &&
      this.skuList.every(
        sku =>
          sku.status === 1 &&
          !this.isNil(sku.grouponHeaderSkuCostPrice) &&
          !this.isNil(sku.promotionPrice)
            ? sku.grouponHeaderSkuCostPrice <= sku.promotionPrice
            : true,
      )
    );
  };

  verifySKUItemPrice: (item: any, field: string) => boolean = (item, field) => {
    if (this.isNil(item[field])) {
      return false;
    }
    if (
      (!this.isNil(item.price) && !this.isNil(item.promotionPrice) && !(item.price > item.promotionPrice)) ||
      (this.isAttractNewType &&
        field === 'price'
        ? (!this.isNil(item.grouponHeaderPrice) && !this.isNil(item.price) && !(item.grouponHeaderPrice <= item.price))
        : (!this.isNil(item.grouponHeaderSkuCostPrice) && !this.isNil(item.promotionPrice) && !(item.grouponHeaderSkuCostPrice <= item.promotionPrice)))
    ) { return false; }
    return true;
  };

  verifySKUItemPriceHead: (item: any, field: string) => boolean = (item, field) => {
    if (this.isNil(item[field])) {
      return false;
    }

    if (
      (!this.isNil(item.grouponHeaderPrice) && !this.isNil(item.grouponHeaderSkuCostPrice) && !(item.grouponHeaderPrice > item.grouponHeaderSkuCostPrice)) ||
      (this.isAttractNewType &&
        field === 'grouponHeaderPrice'
        ? (!this.isNil(item.grouponHeaderPrice) && !this.isNil(item.price) && !(item.grouponHeaderPrice <= item.price))
        : (!this.isNil(item.grouponHeaderSkuCostPrice) && !this.isNil(item.promotionPrice) && !(item.grouponHeaderSkuCostPrice <= item.promotionPrice)))
    ) { return false; }
    return true;

  };

  trackBySkus(index: number, sku: any): number {
    return sku.skuId;
  }

  writeValue(value: any) {}

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}

  isValid: () => boolean = () => {
    return (
      this.verifySKUStatusRequired() &&
      this.verifySKURequired() &&
      this.verifySKUCompare() &&
      (!this.isAttractNewType || this.verifySKURequiredHead()) &&
      (!this.isAttractNewType || this.verifySKUCompareHead()) &&
      (!this.isAttractNewType || this.verifySKUCompareGrouponAndHead()) &&
      (!this.isAttractNewType || this.verifySKUCompareGrouponProAndHeadPro())
    );
  }

}
