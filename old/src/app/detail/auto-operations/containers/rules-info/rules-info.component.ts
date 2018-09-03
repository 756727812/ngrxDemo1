import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Inject,
  forwardRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import {
  NzNotificationService,
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import * as _ from 'lodash';

import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

const seller_privilege: string = (document.cookie.match(
  '(^|; )seller_privilege=([^;]*)',
) || 0)[2];

@Component({
  selector: 'app-rules-info',
  templateUrl: './rules-info.component.html',
  styleUrls: ['./rules-info.component.less'],
})
export class RulesInfoComponent implements OnInit {
  constructor(
    private nzNotification: NzNotificationService,
    private modalService: NzModalService,
    private nzMessageService: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ruleId: number;
  isElectAdmin: boolean = +seller_privilege === 10;
  ruleName: string = '';
  shopHeadPic: string = '';
  status: number;

  ngOnInit() {
    this.ruleId = +this.route.snapshot.paramMap.get('ruleId');
  }

  getRuleName(ruleName) {
    this.ruleName = ruleName;
  }

  getShopHeadPic(shopHeadPic) {
    this.shopHeadPic = shopHeadPic;
  }

  getStatus(status) {
    this.status = status;
  }
}
