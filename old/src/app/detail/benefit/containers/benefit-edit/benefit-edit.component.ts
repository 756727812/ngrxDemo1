import { Component, Injector } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
import { NzModalService, NzModalSubject } from 'ng-zorro-antd';
import {
  moneyValidator,
  productNameValidator,
  groupNameValidator,
  dateGroupValidator,
  singleDateValidator,
} from '../../validators/validators';
import { BaseBenefitBase } from '../../base-benefit.base';
import { accuracy } from '../../services/utils.service';

@Component({
  templateUrl: './benefit-edit.component.html',
  styleUrls: ['./benefit-edit.component.less'],
})
export class BenefitEditComponent extends BaseBenefitBase {
  aForm: FormGroup;
  groupId: string = '1';
  groupName: string;
  activityId: number;
  page: number = 1;
  pageSize: number = 50;
  step: number = 1;
  groupList = [];
  data: any;
  isEdit: boolean = true;
  isEditGroup: boolean = true;
  isDisabled: boolean = false;
  rulesData: any = null;
  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private modalSubject: NzModalSubject,
    private injector: Injector,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.createForm();
    const activityId = this.activeRoute.snapshot.queryParamMap.get('id');
    this.benefitService
      .activityById({
        activityId,
      })
      .subscribe(r => {
        const res = this.benefitService.dataListFormat(r)[0];
        this.initLoad(res);
      });
  }

  padZero(type) {
    const c = this.aForm.get(`money.${type}`);
    const rValue = c.value;
    const tValue = +rValue;
    if (!tValue || (tValue && tValue <= 0)) {
      c.patchValue('');
      c.markAsDirty();
      return;
    }

    if (!accuracy.test(rValue)) {
      c.setErrors({ accuracy: true });
      c.markAsDirty();
    }
  }

  private createForm() {
    this.aForm = this.fb.group({
      activityName: ['', [productNameValidator]],
      userType: [`0`],
      costBearer: [0],
      overRange: ['0'],
      // money: this.fb.group({
      //   targetPrice: [1, [Validators.required]],
      //   offPrice: [1, [Validators.required]],
      //   capping: [0],
      // }, { validator: moneyValidator }),
      date: this.fb.group(
        {
          startTime: [null],
          endTime: [null],
        },
        {
          validator: dateGroupValidator,
        },
      ),
    });
  }

  private initLoad(data) {
    this.data = data;
    this.isDisabled = data.status > 1;
    this.isEdit = data.status <= 0;
    this.isEditGroup = data.status < 2 && data.status >= 0;
    const {
      activityName,
      userType,
      costBearer,
      overRange,
      targetPrice,
      offPrice,
      capping,
      startTime,
      endTime,
    } = data;
    const fdata = {
      activityName,
      userType,
      costBearer,
      overRange,
      targetPrice,
      offPrice,
      capping,
      startTime,
      endTime,
    };
    Object.keys(fdata).forEach(key => {
      if (key === 'startTime' || key === 'endTime') {
        const ctrl = this.aForm.get(`date.${key}`);
        if (key === 'endTime') {
          ctrl.setValidators([singleDateValidator(true)]);
        } else {
          if (data.status < 1) {
            ctrl.setValidators([singleDateValidator()]);
          }
        }
        ctrl.setValue(new Date(data[key]));
      } else if (
        key === 'targetPrice' ||
        key === 'offPrice' ||
        key === 'capping'
      ) {
        // let value = data[key];
        // if (key === 'capping') {
        //   value = !value;
        // }
        // this.aForm.get(`money.${key}`).setValue(value);
      } else {
        this.aForm.get(key).setValue(data[key]);
      }
    });
    this.rulesData = {
      thresholdType: data.thresholdType,
      rules: data.rules,
      capping: data.capping,
      isEdit: this.isEdit,
    };
    this.activityId = data.id;
    this.loadData();
  }

  private loadData() {
    this.benefitService
      .groupList({
        page: this.page,
        pageSize: this.pageSize,
        activityId: this.activityId,
      })
      .subscribe(data => {
        this.groupList = data.map(r => {
          r.showGroupText = true;
          r.showSortText = true;
          r.srcName = r.groupName;
          r.srcId = r.sortId;
          return r;
        });
      });
  }

  private getParams() {
    const { activityName } = this.aForm.value;
    const { startTime, endTime } = this.aForm.get('date').value;
    // const { targetPrice, offPrice, capping } = this.aForm.get('money').value;
    const { money, rules, type } = this.aForm.get('rulesForm').value;
    let { targetPrice, offPrice, capping } = money;
    capping = capping ? 0 : 1;
    targetPrice = ~~(targetPrice * 100);
    offPrice = ~~(offPrice * 100);
    const thresholdType = type;
    let fullOffRuleCreateDTOS = [];
    if (type === 0) {
      fullOffRuleCreateDTOS.push({
        thresholdValue: targetPrice,
        discountValue: offPrice,
        discountType: type,
      });
    } else if (type === 1) {
      fullOffRuleCreateDTOS = rules;
    }
    const params: any = {
      activityName,
      endTime: this.utils.dateFormat(endTime),
      id: this.activityId,
    };
    if (this.data.status === 0) {
      // params.targetPrice = ~~(targetPrice * 100);
      // params.offPrice = ~~(offPrice * 100);
      params.capping = capping;
      params.startTime = this.utils.dateFormat(startTime);
      params.thresholdType = thresholdType;
      params.fullOffRuleCreateDTOS = fullOffRuleCreateDTOS;
    }
    return params;
  }

  _submitForm() {
    for (const i in this.aForm.controls) {
      this.aForm.controls[i].markAsDirty();
    }

    for (const i in (this.aForm.get('date') as FormGroup).controls) {
      this.aForm.get(`date.${i}`).markAsDirty();
    }

    // for (const i in (this.aForm.get('money') as FormGroup).controls) {
    //   this.aForm.get(`money.${i}`).markAsDirty();
    // }

    for (const i in (this.aForm.get('rulesForm') as FormGroup).controls) {
      this.aForm.get(`rulesForm.${i}`).markAsDirty();
    }

    for (const i in (this.aForm.get('rulesForm.money') as FormGroup).controls) {
      this.aForm.get(`rulesForm.money.${i}`).markAsDirty();
    }

    (this.aForm.get('rulesForm.rules') as FormArray).controls.forEach(item => {
      item.markAsDirty();
      item.get('thresholdValue').markAsDirty();
      item.get('discountValue').markAsDirty();
    });

    if (this.aForm.invalid) {
      return;
    }

    this.benefitService.edityActivity(this.getParams()).subscribe(
      r => {
        this.notify.success('信息提示', '活动信息已保存!');
      },
      e => {
        this.notify.success('信息提示', '活动信息保存失败!');
      },
    );
  }

  get loading() {
    return this.benefitService.loading;
  }

  addGroup(ctrl) {
    const input = ctrl.control as FormControl;
    input.setValidators([groupNameValidator]);
    input.markAsDirty();
    input.updateValueAndValidity();
    if (input.invalid) return;
    if (this.groupList.length >= 4) {
      this.notify.warning('信息提示', '当前只能创建四个活动分组！');
      return;
    }

    const group = {
      groupName: this.groupName,
      sortId: 0,
      activityId: this.activityId,
    };
    this.benefitService.createGroup(group).subscribe(
      data => {
        this.groupId = data;
        this.groupName = '';
        input.clearValidators();
        this.loadData();
      },
      e => {
        // ...
      },
    );
  }

  discardActivity() {
    this.activityId &&
      this.benefitService
        .discardActivity({
          activityId: 100 || this.activityId,
        })
        .subscribe(_ => this.notify.success('信息提示', '活动取消成功~'));
  }

  groupEditEvent({ data, msg }) {
    const { id, groupName, sortId } = data;
    this.benefitService
      .editGroup({
        id,
        groupName,
        sortId,
      })
      .subscribe(
        _ => {
          this.loadData();
          this.notify.success('信息提示', `${msg}修改成功!`);
        },
        () => {
          this.notify.warning('信息提示', `${msg}修改失败!`);
        },
      );
  }

  groupRemoveEvent(groupId) {
    this.benefitService
      .deleteGroup({
        groupId,
      })
      .subscribe(r => {
        this.notify.success('信息提示', '分组删除成功');
        this.loadData();
      });
  }

  detailGroupEvent(data) {
    this.to('../goods-group', {
      id: this.activityId,
      ...data,
      xpdId: this.xiaodianpuId,
    });
  }

  reloadEvent() {
    this.loadData();
  }

  OkAction(data) {
    this.detailGroupEvent(data);
  }

  get groupIsEmpty(): boolean {
    return this.groupList.some(r => r.count === 0);
  }

  confirmProducts() {
    if (this.isDisabled) {
      this.to('../benefit-list', {
        id: this.activityId,
        xpdId: this.xiaodianpuId,
      });
      return;
    }
    if (this.groupIsEmpty) {
      return this.notify.warning('信息提示', '分组商品不能为空！');
    }
    this.to('../benefit-list', {
      id: this.activityId,
      xpdId: this.xiaodianpuId,
    });
  }
}
