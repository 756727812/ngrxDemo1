import { Component, OnInit, Input, HostListener } from '@angular/core';
import { CtrlWidgetBaseComponent } from '../base.component';
import { merge, omit, get } from 'lodash';
import * as moment from 'moment';
import { ModalHelper } from '@shared/services';

import { ModalAddItems } from 'app/detail/store-construction/components';
import {
  AddItemsService,
  IAddType,
  MODAL_TYPE,
} from 'app/detail/store-construction/services';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-ctrl-widget-common-double-col-goods',
  templateUrl: './common-double-col-goods.component.html',
  styleUrls: ['./common-double-col-goods.component.css'],
})
export class CtrlWidgetCommonDoubleColGoodsComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  @Input() data;
  selectedCategories: any[] = [];
  sortableItems: any[] = [];
  MODAL_TYPE = MODAL_TYPE;
  currentType: IAddType;
  limit: number = 0;

  @Input()
  set currentModalType(value: string) {
    this.currentType = this.addItemSrv.getCurrentType(value);
    this.limit = this.currentType.limit;
    // this.defaultValue = defaultForm[this._type];
  }

  constructor(
    private fb: FormBuilder,
    private modalHelper: ModalHelper,
    private addItemSrv: AddItemsService,
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  buildForm() {
    const _showTime = {
      showType: this.data.showType || 1,
      dateRange: [
        this.data.startTime ? new Date(this.data.startTime) : null,
        this.data.endTime ? new Date(this.data.endTime) : null,
      ],
    };
    const formGroup = this.fb.group({
      showTime: [_showTime],
      categoryList: [get(this.data, 'config.targets'), [Validators.required]],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    return formGroup;
  }

  getData() {
    const { showType, startTime, endTime } = this.formGroup.value.showTime;
    const targets = this.formGroup.value.categoryList
      ? this.formGroup.value.categoryList.map(v =>
          Object.assign({}, v, { id: v.categoryId }),
        )
      : [];
    const data = merge(
      {},
      omit(this.formGroup.value, 'categoryList', 'showTime'),
      {
        showType,
        startTime,
        endTime,
        config: {
          targets,
        },
      },
    );
    return data;
  }

  validationMessages = {
    categoryList: {
      required: '至少添加一个商品分组',
    },
  };

  updateFormGroupValue(newData) {}
}
