import { Component, OnInit, Inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'daily-welfare-list',
  templateUrl: './daily-welfare-list.template.html',
  styles: ['.ant-layout{padding:30px;background-color:#fff}'],
})
export class dailyWelfareList implements OnInit {
  loadingword: any;
  data: any[];
  pageSize = 20;
  page = 1;
  total = 0;
  loading = 1;

  constructor(
    @Inject('dataService') private dataService: see.IDataService,
    @Inject('Notification') private Notification: see.INotificationService,
    @Inject('seeModal') private seeModal: see.ISeeModalService,
    private message: NzMessageService,
  ) {
    this.loadingword = '刷新数据';
    this.data = [];
  }

  ngOnInit() {
    this.getWelfareList();
  }

  getWelfareList() {
    console.log('getWelfareList');
    this.dataService
      .luckydraw_list({ pageSize: this.pageSize, page: this.page })
      .then(res => {
        this.total = res.data.count;
        this.data = res.data.list;
        this.loading = 0;
      });
  }
  searchNextPage() {
    this.loading = 1;
    this.getWelfareList();
  }
  discard(id) {
    const activityId = id;
    this.seeModal.confirm('提示', '确定废弃该活动吗？', () => {
      this.dataService.luckydraw_discard(activityId).then(res => {
        if (res.result === 1) {
          this.Notification.success();
          this.getWelfareList();
        }
      });
    });
  }
}
