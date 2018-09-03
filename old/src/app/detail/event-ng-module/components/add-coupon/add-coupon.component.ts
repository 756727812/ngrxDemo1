import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Input,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-add-coupon',
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.less'],
})
export class EventAddCouponComponent implements OnInit {
  couponList: any[] = [];
  statusMap: string[] = [
    '',
    '审核中',
    '审核拒绝',
    '发放中',
    '已领完',
    '已结束',
    '还未到领取时间',
  ];
  pageSize: number = 5;

  constructor(
    private subject: NzModalSubject,
    private eventService: EventService,
    private _message: NzMessageService,
  ) {}

  ngOnInit() {
    this.getCoupons();
  }

  getCoupons() {
    try {
      const params = {
        kolId:
          window.location.href.search('portal.xiaodianpu.com') === -1
            ? 130
            : 7460,
        page: 1,
        type: 3,
        pageSize: 99999,
      };
      this.eventService
        .getCouponList(params)
        .pipe(
          // TODO functional
          catchError((error: any) => {
            // debugger;
            // TODO 所有都要抛出
            return Observable.of(null);
          }),
        )
        .subscribe(res => {
          // debugger;
          if (res && res.data) {
            this.couponList = res.data.list;
          }
        });
    } catch (e) {}
  }

  addCouponItem(item) {
    this.subject.next(item);
    this.subject.destroy();
  }
}
