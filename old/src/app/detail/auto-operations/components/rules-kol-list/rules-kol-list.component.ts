import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';

import { NzMessageService } from 'ng-zorro-antd';

import { RulesService } from '../../services/rules.service';
import { OperateStatus } from '../../enums/operate-status.enum';

@Component({
  selector: 'app-rules-kol-list',
  templateUrl: './rules-kol-list.component.html',
  styleUrls: ['./rules-kol-list.component.css'],
})
export class RulesKolListComponent implements OnInit {
  operateStatusEnum = OperateStatus;
  enableStatusData = [
    {
      label: '已禁用',
      value: 0,
    },
    {
      label: '生效中',
      value: 1,
    },
    /*{
      label: '删除',
      value: 2,
    },*/
  ];

  loading: boolean = false;
  total: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  enableStatus: number;
  matchStr: string;

  listData = [];

  constructor(
    private rulesService: RulesService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    this.getListData();
  }

  getListData(reset = false) {
    if (reset) {
      this.currentPage = 1;
    }
    this.loading = true;
    const body = {
      match_str: this.matchStr,
      current_page: this.currentPage,
      page_size: this.pageSize,
    };
    if (typeof this.enableStatus === 'number') {
      Object.assign(body, { enable_status: this.enableStatus });
    }
    this.rulesService
      .getKolList(body)
      .pipe(
        catchError((error: any) => {
          this.loading = false;
          this.nzMessageService.create('error', `查询数据失败`);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this.loading = false;

        if (res.result === 1) {
          this.currentPage = res.data.currentPage;
          this.pageSize = res.data.pageSize;
          this.total = res.data.total;
          this.listData = res.data.list;
        } else {
          this.nzMessageService.create('error', `查询数据失败`);
        }
      });
  }

  removeKol(kolId) {
    this.rulesService
      .removeKol({
        kol_id: kolId,
      })
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.create('error', `移除失败`);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this.nzMessageService.create('success', `移除成功`);
        if (res.result === 1) {
          this.getListData();
        } else {
          this.nzMessageService.create('error', `移除失败`);
        }
      });
  }
}
