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

import { TableExport } from 'tableexport';

let timer: any;
let retryTime: number = 0;

@Component({
  selector: 'app-event-child-items-result',
  templateUrl: './child-items-result.component.html',
  styleUrls: ['./child-items-result.component.less'],
})
export class EventChildItemsResultComponent implements OnInit {
  @Input() childItemsResult: any[] = [];
  @Input() childParams;

  successChildItems: any[] = [];
  failChildItems: any[] = [];

  tableExportInstance: any;

  _isSpinning: boolean = true;
  _spinTip: string = '正在批量生成子商品...';

  constructor(
    private subject: NzModalSubject,
    private eventService: EventService,
    private _message: NzMessageService,
  ) {}

  ngOnInit() {
    // this._isSpinning = false;
    retryTime = 0;
    this.getChild();
  }

  initResult() {
    if (this.childItemsResult.length) {
      this.successChildItems = this.childItemsResult.filter(
        item => !item.generateResult,
      );
      this.failChildItems = this.childItemsResult.filter(
        item => item.generateResult,
      );
    }
    this.configExportInstance();
  }

  batchAssignActivities() {
    if (this.successChildItems.length) {
      this.subject.next(this.successChildItems);
      this.subject.destroy();
    } else {
      this._message.create('warning', '没有成功生成的子商品条目');
    }
  }

  ngOnDestroy() {
    clearTimeout(timer);
  }

  configExportInstance() {
    const dom = document.querySelector('.child-items-table');
    if (dom) {
      setTimeout(() => {
        const nowStr = moment().format('YYYYMMDD_HHmmss');
        this.tableExportInstance = new TableExport(dom, {
          formats: ['xlsx'],
          filename: `问题母商品列表-${nowStr}`,
          exportButtons: false,
        });
        this.tableExportInstance.reset();
      });
    }
  }

  exportFailItems() {
    try {
      if (this.tableExportInstance) {
        const dataInfo = this.tableExportInstance.getExportData()[
          'child-items-table'
        ].xlsx;
        const { data, fileExtension, filename, merges, mimeType } = dataInfo;
        this.tableExportInstance.export2file(
          data,
          mimeType,
          filename,
          fileExtension,
          merges,
        );
      }
    } catch (e) {}
  }

  getChild() {
    this.eventService
      .postBatchGenChildItems_asyn(this.childParams)
      .pipe(
        catchError((error: any) => {
          // debugger;
          this._isSpinning = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.msg.toLowerCase() === 'pending') {
          timer = setTimeout(() => {
            this.getChild();
          }, 1000);
        } else if (res.msg.toLowerCase() === 'success' && res.data) {
          if (res.data.length) {
            this._isSpinning = false;
            this.childItemsResult = res.data.sort(
              (a, b) => b.generateResult - a.generateResult,
            );
            this.initResult();
          } else {
            if (retryTime < 3) {
              timer = setTimeout(() => {
                this.getChild();
              }, 1000);
              retryTime += 1;
            }
          }
        }
      });
  }
}
