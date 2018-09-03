import { Component, OnInit, Input, HostListener } from '@angular/core';
import { CtrlWidgetBaseComponent } from '../base.component';
import { merge, omit, get } from 'lodash';
import { parse, stringify } from 'query-string';
import { MODAL_TYPE } from 'app/detail/store-construction/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-ctrl-widget-sales-promotion',
  templateUrl: './sales-promotion.component.html',
  styleUrls: ['./sales-promotion.component.css'],
})
export class CtrlWidgetSalesPromotionComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  @Input() data;
  MODAL_TYPE = MODAL_TYPE;
  kolInfo: any = {};

  constructor(private fb: FormBuilder) {
    super();
    this.kolInfo = parse(location.search);
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
      /*showCount: [12],*/
      targets: [this.targets, [Validators.required]],
      method: [this.method || 0],
    });
    formGroup.valueChanges.subscribe(data => {
      formGroup
        .get('targets')
        .patchValue(data.method === 1 ? [] : data.targets, { onlySelf: true });
      this.onFormValueChanged();
    });
    return formGroup;
  }

  get targets() {
    return get(this.data, 'config.targets') || [];
  }

  get method() {
    return get(this.data, 'config.method');
  }

  parserInt = value => parseInt(value, 10);

  private getTargets(method, targets) {
    return method === 1
      ? []
      : targets && targets.length
        ? targets.map(r => ({ id: r.id }))
        : [];
  }

  getData() {
    const { showType, startTime, endTime } = this.formGroup.value.showTime;
    const { method, targets } = this.formGroup.value;
    const data = merge(
      {},
      {
        showType,
        startTime,
        endTime,
        config: {
          method,
          targets: this.getTargets(method, targets),
        },
      },
    );
    return data;
  }

  updateFormGroupValue(newData) {}
}
