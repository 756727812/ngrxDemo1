import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import {
  ActivatedRoute,
  Params,
  CanDeactivate,
  Router,
  Event as NavigationEvent,
  NavigationEnd,
} from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';
import echarts from 'echarts';
import { EventAssignActResultComponent } from '../../components/assign-activity-result/assign-activity-result.component';

import * as _ from 'lodash';

@Component({
  selector: 'app-event-logs',
  templateUrl: './event-logs.component.html',
  styleUrls: ['./event-logs.component.less'],
})
export class EventLogsComponent implements OnInit {
  keyword = '';
  _keyword = '';
  assignActResult: any[] = [];
  assignParams: {} = { 'templateIdList[]': '', 'kolIdList[]': '' };
  failAssignList: any[] = [];
  successAssignResult: any[] = [];
  reAssign: boolean = false;

  _isSpinning: boolean = false;
  _spinTip: string = '';

  sortType: string = 'descend';
  isSorted: boolean = true;

  constructor(
    private el: ElementRef,
    private eventService: EventService,
    private modalService: NzModalService,
    // private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {}

  ngOnInit() {
    this.searchData();
  }

  dataSet = [];
  loading = true;

  searchData(reset: boolean = false): void {
    this.loading = true;
    const params = {
      keyword: this.keyword,
    };
    if (this.isSorted) {
      params['orderByCreateTime'] = this.sortType === 'ascend' ? 1 : 2;
    }
    this.eventService.fetchLogs(params).subscribe(({ data }) => {
      this.loading = false;
      this.dataSet = data;
    });
  }

  sortAssignResult(result: any[]): any[] {
    // 母列表项排序
    const assignActResult: any[] = result.sort((a, b) => {
      const failComp = b.generateResult - a.generateResult;
      if (failComp !== 0) {
        return failComp;
      }
      return a.kolName - b.kolName;
    });
    // 子列表项排序
    assignActResult.forEach(result => {
      if (result.generateResultItemList) {
        result.generateResultItemList.sort((a, b) => {
          const failComp = b.generateResult - a.generateResult;
          if (failComp !== 0) {
            return failComp;
          }
          return moment(b.startTime).isBefore(a.startTime);
        });
      }
    });
    return assignActResult;
  }

  showAssignActResult(): void {
    this.modalService
      .open({
        title: '指派结果',
        content: EventAssignActResultComponent,
        onOk() {},
        width: 1000,
        onCancel() {},
        footer: false,
        componentParams: {
          assignActResult: this.assignActResult,
          isView: true,
        },
      })
      .subscribe(res => {});
  }

  searchClick() {
    this.keyword = this._keyword.trim();
    this.searchData(true);
  }

  sortByTime(value) {
    if (value) {
      this.isSorted = true;
      this.searchData(true);
    } else {
      this.isSorted = false;
      this.searchData(true);
    }
  }

  getTaskDetail(taskId: number) {
    this._spinTip = '正在获取指派详情...';
    this._isSpinning = true;
    this.eventService.fetchLogDetail(taskId).subscribe(res => {
      this._isSpinning = false;
      if (res && res.data) {
        this.assignActResult = this.sortAssignResult(res.data);
        this.showAssignActResult();
      }
    });
  }
}
