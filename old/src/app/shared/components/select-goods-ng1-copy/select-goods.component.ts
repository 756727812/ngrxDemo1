import {
  Component,
  OnInit,
  Input,
  Output,
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
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SeeSelectGoodsModal } from '@shared/components/select-goods-modal/modal-add-items.component';
import { MODAL_TYPE } from 'app/detail/store-construction/services';

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SeeSelectGoodsNg1),
  multi: true,
};

@Component({
  selector: 'ng1-see-select-goods',
  templateUrl: 'select-goods.component.html',
  styleUrls: ['select-goods.component.less'],
  providers: [VALUE_ACCESSOR],
})
export class SeeSelectGoodsNg1 implements OnInit, ControlValueAccessor {
  @Input() linkText: string = '商品选择';
  @Input() kolId: number;

  @Input() addedList: any[] = [];
  @Input() limitCount: number = -1;

  // 创建优惠券时的选择商品，使用xdpId，默认为false且使用kolId
  @Input() forCreateCoupon: boolean = false;
  @Input() xdpId: number = 0;

  @Output() onSelectChange = new EventEmitter<any>();

  propagateChange: any;

  constructor(private modalService: NzModalService) {}

  ngOnInit() {}

  selectGoods() {
    let inputParams: any = {
      type: MODAL_TYPE.HOT_GOODS,
      limitCount: this.limitCount,
      addedIdList: this.addedList.map(item => item.item_id),
    };
    if (!this.forCreateCoupon) {
      inputParams = { ...inputParams, kolId: this.kolId };
    } else {
      inputParams = {
        ...inputParams,
        forCreateCoupon: true,
        xdpId: this.xdpId,
      };
    }
    this.modalService
      .open({
        title: '商品选择',
        content: SeeSelectGoodsModal,
        onOk() {},
        width: 1000,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: inputParams,
      })
      .subscribe(item => {
        if (typeof item === 'object' && item.item_id) {
          this.addedList.push(item);
          this.emitData();
        }
      });
  }

  emitData() {
    this.onSelectChange.emit(this.addedList);

    // form control
    if (this.propagateChange) {
      this.propagateChange(this.addedList);
    }
  }

  writeValue(value: any) {
    if (value) {
      this.addedList = value;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}
}
