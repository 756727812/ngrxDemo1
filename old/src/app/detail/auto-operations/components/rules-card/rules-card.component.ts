import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import {
  NzNotificationService,
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';

import { RulesService } from '../../services/rules.service';

import { RulesStatus } from '../../enums/rules-status.enum';

@Component({
  selector: 'app-rules-card',
  templateUrl: './rules-card.component.html',
  styleUrls: ['./rules-card.component.less'],
})
export class RulesCardComponent implements OnInit {
  rulesStatus = RulesStatus;
  isUpdateRulesNameFormShow: boolean = false;
  newRulesName: string = '';
  @Input() data: any;
  @Output() onUpdate = new EventEmitter<boolean>();
  ruleNameTextLimitCount: number = 8;
  ruleNameTextCount: number = 0;
  textLimitTipsShow: boolean = false;

  settingImgUrl = '/s/t/product_v2/82d/d40/21m/6ylmvy8wo0woo44w0ss0gs8cgs.png';
  settingHoverImgUrl =
    '/s/t/product_v2/504/41e/g4l/p29o1s0048s88g0o8k0o8wccwk.png';
  lockImgUrl = '/s/t/product_v2/3d0/075/ixv/77thios4osc400408kgk0w0w4c.png';
  lockHoverImgUrl =
    '/s/t/product_v2/501/169/8jz/rbnx0o4scgsgswcw8so0oswkws.png';
  unLockImgUrl = '/s/t/product_v2/32d/d3b/uq7/98m6dwosg8g8gkk8kos0kowsk.png';
  unLockHoverImgUrl =
    '/s/t/product_v2/310/054/lri/wu5u9s0oso04gks8wgowo8oscw.png';

  constructor(
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    private rulesService: RulesService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {}

  viewRulesInfo(ruleId) {
    this.router.navigate(['../rules-info', ruleId], {
      relativeTo: this.route,
    });
  }

  setUpdateRulesNameFormShow(data: boolean) {
    this.isUpdateRulesNameFormShow = data;
    if (data) {
      this.newRulesName = this.data.rule_name;
      this.ruleNameTextCount = this.newRulesName.length;
      this.textLimitTipsShow = false;
    }
  }

  updateRulesStatus(newStatus) {
    this.updateRules({
      rule_id: this.data.rule_id,
      rule_name: this.data.rule_name,
      status: newStatus,
    });
  }

  updateRulesName() {
    if (this.checkTextLimitFail()) {
      this.textLimitTipsShow = true;
      return;
    }
    this.updateRules({
      rule_id: this.data.rule_id,
      rule_name: this.newRulesName,
      status: this.data.status,
    });
  }

  updateRules(data) {
    this.rulesService
      .updateRule(data)
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.create('error', `设置失败`);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res.result === 1) {
          this.nzMessageService.create('success', `设置成功`);
          this.onUpdate.emit(true);
        } else {
          this.nzMessageService.create('error', `设置失败`);
        }
      });
  }

  onNewRuleNameUpdate(value) {
    this.ruleNameTextCount = value.length;
    this.textLimitTipsShow = this.checkTextLimitFail() ? true : false;
  }

  checkTextLimitFail() {
    return (
      this.newRulesName.length > this.ruleNameTextLimitCount ||
      this.newRulesName.length === 0
    );
  }
}
