import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Injector, OnInit } from '@angular/core';
import { BaseBenefitBase } from '../../base-benefit.base';
import {
  userTypes,
  costTypes,
  statusTypes,
  discountRules,
} from '../../services/benefit.constant';

@Component({
  selector: 'benefit-list',
  templateUrl: './benefit-list.component.html',
  styleUrls: ['./benefit-list.component.less'],
})
export class BenefitListComponent extends BaseBenefitBase implements OnInit {
  sForm: FormGroup;
  count = 0;
  page: number = 1;
  pageSize: number = 30;
  data = [];
  dataList = [];
  dateFormat: string = 'YYYY-MM-DD HH:mm:ss';
  from: string = '';
  userTypes = userTypes;
  costTypes = costTypes;
  statusTypes = statusTypes;
  discountRules = discountRules;
  barFilter = {
    userType: undefined,
    status: undefined,
    costBearer: undefined,
  };

  constructor(private fb: FormBuilder, private injector: Injector) {
    super(injector);
    this.activeRoute.data.subscribe(r => (this.from = r['from']));
  }

  ngOnInit() {
    this.initLoad();
  }

  private initLoad() {
    this.initForm();
    this.listData();
  }

  markettools($event: Event) {
    $event.stopPropagation();
    this.router.navigateByUrl(
      `/kol-v2/kol-cooperation-management/${this.kolInfo.kolId}/${
        this.kolInfo.wechatId
      }/marketing-tools`,
    );
  }

  addActivity($event: Event) {
    $event.stopPropagation();
    const { from } = this.activeRoute.snapshot.data;
    if (from === 'v2') {
      const { xpdId } = this.activeRoute.snapshot.params;
      this.to('../benefit-add', { xpdId: this.xiaodianpuId });
    }
  }

  private initForm() {
    this.sForm = this.fb.group({
      activityName: ['', []],
      id: [''],
      startTime: [],
      endTime: [],
      thresholdType: [],
    });
  }

  submitForm() {
    const c = this.sForm.get('id');
    const v = (c.value || '').trim();
    if (v) {
      const vv = +v;
      const reset = () => {
        c.patchValue('');
        this.notify.warning(
          '信息提示',
          '活动编号只能输入数字且长度不超过10位！',
        );
      };
      const ret = !vv || (vv && vv <= 0) || v.length > 10;
      if (ret) reset();
    }

    this.listData();
  }

  reset() {
    this.sForm.reset();
    this.page = 1;
    this.listData();
  }

  listData() {
    const { startTime, endTime } = this.sForm.value;
    if (startTime && endTime) {
      if (+startTime >= +endTime) {
        this.notify.warning('信息提示', '活动结束时间需要大于活动开始时间!');
        return;
      }
    }
    this.benefitService
      .searchByCondition(this.getParams)
      .subscribe(({ count, list }) => {
        const data = this.benefitService.dataListFormat(list);
        this.data = data;
        this.dataList = data;
        this.count = count || 0;
      });
  }

  get getParams() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      xiaodianpuId: this.xiaodianpuId,
      ...this.sForm.value,
      ...this.barFilter,
    };
  }

  pageChange() {
    this.listData();
  }

  editBenefit(item) {
    if (item.status > 1) {
      this.notify.warning('信息提示', '此活动已结束不能进行编辑操作！', {
        nzDuration: 5000,
      });
      return;
    }
    this.to('../benefit-edit', { id: item.id, xpdId: item.xiaodianpuId });
  }

  detailBenefit(item) {
    this.to('../benefit-edit', { id: item.id, xpdId: item.xiaodianpuId });
  }

  discard(item) {
    item.id &&
      this.benefitService
        .discardActivity({
          activityId: item.id,
        })
        .subscribe(_ => {
          setTimeout(() => {
            this.listData();
          }, 5000);
          this.notify.success('信息提示', '活动已取消~');
        });
  }
}
