import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import {
  NzNotificationService,
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';

import { RulesTipsComponent } from '../../components/rules-tips/rules-tips.component';
import { RulesKolListComponent } from '../../components/rules-kol-list/rules-kol-list.component';
import { RulesCardAddFormComponent } from '../../components/rules-card-add-form/rules-card-add-form.component';

import { RulesService } from '../../services/rules.service';

@Component({
  selector: 'app-rules-cards',
  templateUrl: './rules-cards.component.html',
  styleUrls: ['./rules-cards.component.less'],
})
export class RulesCardsComponent implements OnInit {
  rulesListData = [];
  robotImgUrl = '/s/t/product_v2/db4/4f8/e3k/ictxv4skgwog888cc0sgwo400c.png';

  constructor(
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    private rulesService: RulesService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    this.getRulesListData();
  }

  onCardUpdate(result) {
    if (result) {
      this.getRulesListData();
    }
  }

  getRulesListData() {
    this.rulesService
      .getRuleList()
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.create('error', `查询规则数据失败`);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res.result === 1) {
          this.rulesListData = res.data;
        }
      });
  }

  viewRulesInfo(ruleId) {
    this.router.navigate(['../rules-info', ruleId], {
      relativeTo: this.route,
    });
  }

  openRulesTips() {
    this.nzModalService
      .open({
        title: '详细规则',
        content: RulesTipsComponent,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        componentParams: {},
      })
      .subscribe(result => {});
  }

  openRulesKolList() {
    this.nzModalService
      .open({
        title: '客户列表',
        content: RulesKolListComponent,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        componentParams: {},
      })
      .subscribe(result => {});
  }

  addRules() {
    this.nzModalService
      .open({
        title: '新建规则',
        content: RulesCardAddFormComponent,
        okText: '确认',
        onOk() {},
        onCancel() {},
        footer: false,
        componentParams: {},
      })
      .subscribe(result => {
        if (result.result) {
          this.getRulesListData();
        }
      });
  }
}
