import { Component, OnInit, Input } from '@angular/core';
import { CtrlWidgetBaseComponent } from 'app/detail/store-construction/containers/ctrl-pane/sub/base.component';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { merge, omit, get } from 'lodash';
import { CtrlPaneService } from 'app/detail/store-construction/services/ctrl-pane.service';
import { CouponStatusPipe } from '@shared/pipes';
import {
  MODAL_TYPE,
  AddItemsService,
} from 'app/detail/store-construction/services';

@Component({
  selector: 'app-ctrl-widget-coupon-form',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.less'],
  providers: [CtrlPaneService, CouponStatusPipe],
})
export class CtrlWidgetCouponComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  parserInt = value => parseInt(value, 10);
  sortableOptions: any;
  _type: MODAL_TYPE = MODAL_TYPE.COUPON;
  limit: number = 0;
  @Input() data;
  constructor(
    private fb: FormBuilder,
    private ctrlPaneSrv: CtrlPaneService,
    private couponStatusPipe: CouponStatusPipe,
    private addItemSrv: AddItemsService,
  ) {
    super();
    this.sortableOptions = {
      onUpdate: (event: any) => {
        this.emitSave();
      },
    };

    const currentType = this.addItemSrv.getCurrentType(this._type);
    this.limit = currentType.limit;
  }

  // TODO 最好还是 ngmodel 绑定，然后对应表单组件做好 value 保护，保证空数组
  get promotionListLen() {
    return get(this.formGroup, 'value.promotionList.length', 0);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  buildForm() {
    const showType = this.data.showType || 1;
    const _showTime = {
      showType,
      startTime:
        showType === 2 && this.data.startTime ? this.data.startTime : null,
      endTime: showType === 2 && this.data.endTime ? this.data.endTime : null,
    };
    const _method = get(this.data, 'config.method') || 0;
    const formGroup = this.fb.group({
      promotionList: [
        get(this.data, 'config.targets', []),
        [this.verifyPromotionList.bind(this)],
      ],
      showTime: [_showTime],
      method: [_method],
      showCount: [get(this.data, 'config.showCount') || 4],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    // formGroup.get('method').valueChanges.subscribe(() => {
    //   setTimeout(() => {
    //     this.emitSave();
    //   });
    // });
    return formGroup;
  }

  getData() {
    const { showType, startTime, endTime } = this.formGroup.value.showTime;
    const method = this.formGroup.value.method || 0;
    const targets = method === 1 ? [] : this.formGroup.value.promotionList;
    const showCount = this.formGroup.value.showCount || 4;
    const data = merge(
      {},
      omit(this.formGroup.value, 'promotionList', 'showTime'),
      {
        showType,
        startTime,
        endTime,
        config: {
          targets,
          method,
          showCount,
        },
      },
    );
    return data;
  }

  validationMessages = {
    // showTime: {
    //   required: '请选择模块显示时间',
    // },
    // promotionList: {
    //   required: '请选择至少一个优惠券',
    // },
  };

  updateFormGroupValue(newData) {}
}
