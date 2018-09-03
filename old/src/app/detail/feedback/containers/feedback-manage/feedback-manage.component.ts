import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { FeedbackService } from '../../services';
import * as moment from 'moment';
@Component({
  selector: 'feedback-management',
  templateUrl: 'feedback-manage.component.html',
  styleUrls: ['./feedback-manage.component.less'],
})
export class FeedbackManageComponent implements OnInit {
  page: number = 1;
  pageSize: number = 30;
  total: number = 0;
  feedbackList = [];
  keyword: string = '';
  loading: boolean = false;
  type: number = 1;
  dateRange = [];
  start: string = '';
  end: string = '';
  tabs = [
    {
      name: '小电铺用户反馈',
      type: 1,
    },
    {
      name: 'Seego后台用户反馈',
      type: 2,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private feedbackService: FeedbackService,
  ) {}

  ngOnInit() {
    this.getFeedbackList();
  }

  selectTab(index: any): void {
    this.type = index + 1;
    this.page = 1;
    this.dateRange = [];
    this.start = '';
    this.end = '';
    this.getFeedbackList();
  }

  getFeedbackList(): void {
    this.loading = true;
    this.feedbackService
      .getFeedbackList({
        start: this.start,
        end: this.end,
        export: false,
        feedBackFrom: this.type,
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe(
        (res: any) => {
          this.feedbackList = res.data.list;
          this.total = res.data.count;
          this.loading = false;
        },
        () => {
          this.loading = false;
        },
      );
  }
  changePage(): void {
    this.getFeedbackList();
  }

  search() {
    if (this.dateRange.length) {
      this.start = moment(this.dateRange[0]).format('YYYY-MM-DD');
      this.end = moment(this.dateRange[1]).format('YYYY-MM-DD');
    } else {
      this.start = '';
      this.end = '';
    }
    this.getFeedbackList();
  }

  reset() {
    this.dateRange = [];
    this.start = '';
    this.end = '';
    this.page = 1;
    this.getFeedbackList();
  }

  export() {
    const path =
      window.location.protocol +
      '//' +
      window.location.host +
      '/api/ng/feedback/user-feedback-export';
    const query = `start=${this.start}&end=${
      this.end
    }&export=true&feedBackFrom=${this.type}&page=${this.page}&pageSize=${
      this.pageSize
    }`;
    window.location.href = path + '?' + query;
  }
}
