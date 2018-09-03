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
  selector: 'app-event-parent-goods-confirm',
  templateUrl: './parent-goods-confirm.component.html',
  styleUrls: ['./parent-goods-confirm.component.less'],
})
export class ParentGoodsConfirmComponent implements OnInit {
  @Input() selectGoods: any = {};
  type: string = 'cancel';

  constructor(
    private subject: NzModalSubject,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {}

  get _dataSet(): any[] {
    return Object.keys(this.selectGoods).map(id => this.selectGoods[id]);
  }

  ngOnInit() {}

  removeItem(item_id) {
    delete this.selectGoods[item_id];
  }

  assign() {
    if (!this._dataSet.length) {
      this.nzMessageService.create('warning', '请至少选择一个商品');
      return;
    }
    this.type = 'assign';
    // this.subject.next({ type: 'assign', selectGoods: this.selectGoods });
    this.subject.destroy();
  }

  exit() {
    this.subject.destroy();
  }

  ngOnDestroy() {
    this.subject.next({ type: this.type, selectGoods: this.selectGoods });
  }
}
