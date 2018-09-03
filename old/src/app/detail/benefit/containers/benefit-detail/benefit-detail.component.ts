import { Component, Injector } from '@angular/core';
import { BaseBenefitBase } from '../../base-benefit.base';

@Component({
  templateUrl: './benefit-detail.component.html',
  styleUrls: ['./benefit-detail.component.less'],
})
export class BenefitDetailComponent extends BaseBenefitBase {
  data: any = {};
  groupList = [];
  activityId: any;
  isEdit: boolean = false;

  constructor(private injector: Injector) {
    super(injector);
    this.activeRoute.queryParams.subscribe(r => {
      this.activityId = r.id;
    });
  }

  ngOnInit() {
    this.benefitService
      .activityById({
        activityId: this.activityId,
      })
      .subscribe(r => {
        const res = this.benefitService.dataListFormat(r)[0];
        this.initLoad(res);
      });
  }

  detailGroupEvent(data) {
    this.to('../goods-group', {
      id: this.activityId,
      xpdId: this.xiaodianpuId,
      ...data,
      from: 'detail',
    });
  }

  private initLoad(data) {
    this.data = data;
    this.benefitService
      .groupList({
        activityId: data.id,
      })
      .subscribe(
        data =>
          (this.groupList = data.map(r => {
            r.showGroupText = true;
            r.showSortText = true;
            r.srcName = r.groupName;
            r.srcSortId = r.sortId;
            return r;
          })),
      );
  }

  editGBenefit() {
    this.to('../benefit-edit', {
      id: this.data.id,
      xpdId: this.data.xiaodianpuId,
    });
  }
}
