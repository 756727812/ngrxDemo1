import { Component, Injector } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import {
  productNameValidator,
  groupNameValidator,
  dateGroupValidator,
  singleDateValidator,
} from '../../validators/validators';
import { Observable } from 'rxjs/Observable';
import { BaseBenefitBase } from '../../base-benefit.base';

@Component({
  templateUrl: './benefit-add.component.html',
  styleUrls: ['./benefit-add.component.less'],
})
export class BenefitAddComponent extends BaseBenefitBase {
  aForm: FormGroup;
  groupName: string = '';
  groupId: number;
  groupList = [];
  step: number = 1;
  activityId: number;
  kolInfo: any;
  data: any = {};
  isEdit: boolean = true;

  constructor(private fb: FormBuilder, private injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.initLoad();
  }

  initLoad() {
    this.createForm();
    this.loadData();
  }

  private createForm() {
    this.aForm = this.fb.group({
      activityName: ['', [productNameValidator]],
      xiaodianpuId: [`${this.xiaodianpuId}`, [Validators.required]],
      userType: ['0'],
      costBearer: [0],
      overRange: ['0'],
      date: this.fb.group(
        {
          startTime: [null, [singleDateValidator()]],
          endTime: [null, [singleDateValidator(true)]],
        },
        {
          validator: dateGroupValidator,
        },
      ),
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.step < 2) {
      return confirm('确定要退出创建活动吗？');
    }
    return true;
  }

  private validaForm() {
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
  }

  private getParams() {
    const { activityName, userType, costBearer, overRange } = this.aForm.value;
    let { startTime, endTime } = this.aForm.get('date').value;
    const { money, rules, type } = this.aForm.get('rulesForm').value;
    let { targetPrice, offPrice, capping } = money;
    capping = capping ? 0 : 1;
    startTime = this.utils.dateFormat(startTime);
    endTime = this.utils.dateFormat(endTime);
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
    return {
      activityName,
      userType,
      costBearer,
      overRange,
      // targetPrice,
      // offPrice,
      thresholdType,
      fullOffRuleCreateDTOS,
      capping,
      startTime,
      endTime,
      xiaodianpuId: this.xiaodianpuId,
    };
  }

  _submitForm() {
    this.step = 1;
    this.validaForm();
    if (this.aForm.invalid) {
      return;
    }
    const params = this.getParams();
    this.benefitService.createBenefit(params).subscribe(
      data => {
        this.activityId = data;
        this.notify.success('信息提示', '活动信息已保存!');
        this.step = 2;
      },
      e => {
        this.notify.warning('信息提示', '活动信息保存失败!');
      },
    );
  }

  addGroup(ctrl) {
    if (this.groupList.length >= 4) {
      this.notify.warning('信息提示', '当前只能创建四个活动分组！');
      return;
    }
    const input = ctrl.control as FormControl;
    input.setValidators([groupNameValidator]);
    input.markAsDirty();
    input.updateValueAndValidity();
    if (input.invalid) return;
    if (!this.activityId) {
      this.notify.success('信息提示', '暂无活动信息，请重新创建活动！');
      this.step = 1;
      return;
    }

    for (const m of this.groupList) {
      if (m.groupName === this.groupName) {
        this.notify.warning('信息提示', '活动分组名称重复，请重新输入!');
        return;
      }
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
        this.notify.error('信息提示', '活动分组创建失败，请重新输入!');
      },
    );
  }

  discard() {
    this.activityId
      ? this.benefitService
          .discardActivity({
            activityId: this.activityId,
          })
          .subscribe(_ => {
            setTimeout(() => {
              this.detailPage();
            }, 5000);
            this.notify.success('信息提示', '活动取消成功~');
          })
      : this.detailPage();
  }

  private editGroup(m, fn) {
    const { id, groupName, sortId } = m;
    this.benefitService
      .editGroup({
        id,
        groupName,
        sortId,
      })
      .subscribe(_ => fn(true), () => fn(false));
  }

  loadData() {
    this.activityId &&
      this.benefitService
        .groupList({
          activityId: this.activityId,
        })
        .subscribe(
          data =>
            (this.groupList = data.map(r => {
              r.showGroupText = true;
              r.showSortText = true;
              r.srcName = r.groupName;
              r.srcId = r.sortId;
              return r;
            })),
        );
  }

  get groupIsEmpty() {
    return this.groupList.some(r => r.count === 0);
  }

  detailPage() {
    if (this.groupIsEmpty) {
      return this.notify.warning('信息提示', '分组商品不能为空！');
    }
    this.to('../benefit-list', {
      id: this.activityId,
      xpdId: this.xiaodianpuId,
    });
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
      xpdId: this.xiaodianpuId,
      ...data,
      from: 'add',
    });
  }

  reloadEvent() {
    this.loadData();
  }

  OkAction(data) {
    this.detailGroupEvent(data);
  }
}
