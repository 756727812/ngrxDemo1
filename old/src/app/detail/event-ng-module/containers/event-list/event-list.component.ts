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
import { EventKolSelectorComponent } from '../../components/kol-selector/kol-selector.component';
import { EventChildItemsResultComponent } from '../../components/child-items-result/child-items-result.component';
import { EventAssignActResultComponent } from '../../components/assign-activity-result/assign-activity-result.component';

import * as _ from 'lodash';

enum PROGRESS_TYPE {
  GEN_CHILD_ITEMS = 1,
  GEN_ACTIVITIES = 2,
}

enum GROUP_EVENT_TYPE {
  SIMPE = 1,
  NEW_ONE = 2,
  LUCKY = 3,
  SUPER = 4,
  ATTRACT_NEW = 5,
}

const grouponTypeName = {
  [GROUP_EVENT_TYPE.SIMPE]: '普通拼团',
  [GROUP_EVENT_TYPE.NEW_ONE]: '新人团',
  [GROUP_EVENT_TYPE.LUCKY]: '抽奖团',
  [GROUP_EVENT_TYPE.SUPER]: '超级团',
  [GROUP_EVENT_TYPE.ATTRACT_NEW]: '拉新团',
};

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.less'],
})
export class EventListComponent implements OnInit {
  checkedMap = {};
  selectTemplates = {};
  keyword = '';
  _keyword = '';
  targetKols: any[] = [];
  childItemsResult: any[] = [];
  successChildItems: any[] = [];
  assignActResult: any[] = [];
  assignParams: {} = { 'templateIdList[]': '', 'kolIdList[]': '' };
  childParams;
  failAssignList: any[] = [];
  successAssignResult: any[] = [];
  reAssign: boolean = false;

  _isSpinning: boolean = false;
  _spinTip: string = '';
  _allChecked = false;
  _indeterminate = false;

  sortType: string;
  isSorted: boolean = false;

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

  pageIndex = 1;
  pageSize = 10;
  total = 1;
  dataSet = [];
  loading = true;

  get selectedCount(): number {
    let tmpCount = 0;
    const templateIds = Object.keys(this.checkedMap);
    templateIds.forEach(id => {
      if (this.checkedMap[id]) {
        tmpCount += 1;
      }
    });
    return tmpCount;
  }

  get templateIdList(): string[] {
    return Object.keys(this.selectTemplates);
  }

  get parentItemIdList(): number[] {
    const templateIds = JSON.parse(JSON.stringify(this.templateIdList));
    return templateIds.map(id => this.selectTemplates[id].parentItemId);
  }

  get kolIdList(): number[] {
    return this.targetKols.map(cur => cur.kolId);
  }

  get startTimeValid(): boolean {
    let flag = 1;
    this.templateIdList.forEach(id => {
      const startTime = this.selectTemplates[id].startTime;
      if (moment(startTime).isBefore(moment())) {
        flag = 0;
      }
    });
    return flag === 1;
  }

  clearChecked() {
    this.checkedMap = {};
    this.selectTemplates = {};
    this._refreshStatus();
  }

  formatHttpsUrl(list) {
    return list.map(item => {
      item.itemMainImg = this.replaceHttpOrHttps(item.itemMainImg);
      return item;
    });
  }

  private replaceHttpOrHttps(url: string): string {
    if (url.startsWith('http')) {
      return url.replace(/^https?\:\/\//, '//');
    }
    return url;
  }

  searchData(reset: boolean = false): void {
    if (reset) {
      this.pageIndex = 1;
    }
    this.loading = true;
    const params = {
      page: this.pageIndex,
      pageSize: this.pageSize,
      keyword: this.keyword,
    };
    if (this.isSorted) {
      params['orderByStartTime'] = this.sortType === 'ascend' ? 1 : 2;
    }
    this.eventService.fetchGroupEventList(params).subscribe(({ data }) => {
      this.loading = false;
      if (data) {
        this.total = data.count;
        this.dataSet = this.formatHttpsUrl(data.list);

        this._refreshStatus();
      }
    });
  }

  batchAssign(): void {
    // this.showAssignActResult()
    // this.batchGenActivities();
    if (!this.templateIdList.length) {
      this.nzMessageService.create('warning', '请至少选择一个模板');
      return;
    }
    /* if (!this.startTimeValid) {
      this.nzMessageService.create('warning', '拼团模板开始时间需晚于当前时间');
      return;
    } */
    this.modalService
      .open({
        title: 'KOL选择',
        content: EventKolSelectorComponent,
        onOk() {},
        width: 1000,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          confirmText: '子商品生成',
        },
      })
      .subscribe(targetKols => {
        if (typeof targetKols === 'object' && targetKols.length) {
          this.targetKols = targetKols;
          this.batchGenChildItems();
        }
      });
  }

  batchGenChildItems(): void {
    this._spinTip = '正在批量生成子商品...';
    this._isSpinning = true;

    const params: any = {};
    params['parentItemIdList[]'] = this.parentItemIdList.join(',');
    params['kolIdList[]'] = this.kolIdList.join(',');

    this.childParams = params;

    this.eventService
      .postBatchGenChildItems(params)
      .pipe(
        catchError((error: any) => {
          // debugger;
          this._isSpinning = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this._isSpinning = false;
        this.showChildItemsResult();
      });
  }

  showChildItemsResult(): void {
    this.modalService
      .open({
        title: '生成子商品结果',
        content: EventChildItemsResultComponent,
        onOk() {},
        width: 900,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          childItemsResult: this.childItemsResult,
          childParams: this.childParams,
        },
      })
      .subscribe(successChildItems => {
        if (typeof successChildItems !== 'object') {
          return;
        }
        if (successChildItems.length) {
          this.successChildItems = successChildItems;
          this.batchGenActivities();
        }
      });
  }

  findKolIndex(kolName: string): number {
    return _.findIndex(this.targetKols, o => o.kolName === kolName);
  }

  sortAssignResult(result: any[]): any[] {
    // 母列表项排序
    const assignActResult: any[] = result.sort((a, b) => {
      const failComp = b.generateResult - a.generateResult;
      if (failComp !== 0) {
        return failComp;
      }
      return this.findKolIndex(a.kolName) - this.findKolIndex(b.kolName);
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

  batchGenActivities(): void {
    this._spinTip = '正在批量指派营销活动...';
    this._isSpinning = true;

    const params = {
      'templateIdList[]': this.templateIdList.join(','),
      'kolIdList[]': this.kolIdList.join(','),
    };
    this.assignParams = params;

    this.eventService
      .postBatchAssignActivities(params)
      .pipe(
        catchError((error: any) => {
          // debugger;
          this._isSpinning = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        // debugger;
        this._isSpinning = false;
        this.showAssignActResult();
      });
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
        maskClosable: false,
        componentParams: {
          assignActResult: this.assignActResult,
          assignParams: this.assignParams,
          targetKols: this.targetKols,
        },
      })
      .subscribe(assignOutput => {
        // if (typeof assignOutput !== 'object') {return;}
        // const {failList,successResult} = assignOutput;
        // this.failAssignList = failList;
        // this.successAssignResult = successResult;
        // this.reGenActivities();
        // console.log('assignOutput', assignOutput);
      });
  }

  reGenActivities(): void {
    this._spinTip = '正在重新指派失败的营销活动...';
    this._isSpinning = true;
    this.eventService
      .postReAssignActivities({
        reGenerateGrouponActivityDtoStr: JSON.stringify(this.failAssignList),
      })
      .pipe(
        catchError((error: any) => {
          // debugger;
          this._isSpinning = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        // debugger;
        this._isSpinning = false;
        if (res && res.data) {
          const result = this.mergeAssignResult(
            res.data,
            this.successAssignResult,
          );
          console.log('res.data', res.data);
          console.log('this.successAssignResult', this.successAssignResult);
          console.log('result', result);
          this.assignActResult = this.sortAssignResult(result);
          this.showAssignActResult();
        }
      });
  }

  mergeAssignResult(resData: any[], successResult: any[]) {
    return successResult.map(result => {
      const targets = resData.filter(cur => cur.kolId === result.kolId);
      if (targets.length) {
        let generateResultItemList = result.generateResultItemList;
        targets.forEach(target => {
          generateResultItemList = generateResultItemList.concat(
            target.generateResultItemList,
          );
        });
        const allGenerateCount = generateResultItemList.length;
        const generateSuccessCount = generateResultItemList.filter(
          cur => !cur.generateResult,
        ).length;
        return {
          ...result,
          generateResultItemList,
          allGenerateCount,
          generateSuccessCount,
          generateResult: allGenerateCount === generateSuccessCount ? 0 : 1,
        };
      }
      return result;
    });
  }

  createTemplate() {
    this.router.navigate(['../form'], {
      relativeTo: this.route,
    });
  }

  searchClick() {
    this.keyword = this._keyword.trim();
    this.searchData(true);
  }

  _displayDataChange($event) {
    this._refreshStatus();
  }

  _refreshStatus() {
    const allChecked =
      this.dataSet.length &&
      this.dataSet.every(value => this.checkedMap[value.templateId] === true);
    const allUnChecked = this.dataSet.every(
      value => !this.checkedMap[value.templateId],
    );
    this._allChecked = allChecked;
    this._indeterminate = !allChecked && !allUnChecked;

    // update selectTemplates
    this.dataSet.forEach(item => {
      if (this.checkedMap[item.templateId] === true) {
        this.selectTemplates[item.templateId] = {
          parentItemId: item.itemId,
          startTime: item.startTime,
        };
      } else {
        delete this.selectTemplates[item.templateId];
      }
    });
  }

  _checkAll(value) {
    if (value) {
      this.dataSet.forEach(item => {
        this.checkedMap[item.templateId] = true;
      });
    } else {
      this.dataSet.forEach(item => {
        this.checkedMap[item.templateId] = false;
      });
    }
    this._refreshStatus();
  }

  getGrouponTypeName(type: number) {
    const typeName = grouponTypeName[type];
    return String(typeName) + '模板';
  }

  sortByTime(value) {
    if (value) {
      this.isSorted = true;
      this.searchData(true);
    } else {
      this.isSorted = false;
    }
  }

  selectTmpl(event, templateId) {
    if (event.target.tagName === 'INPUT') {
      return;
    }
    this.checkedMap[templateId] = !this.checkedMap[templateId];
    this._refreshStatus();
  }
}
