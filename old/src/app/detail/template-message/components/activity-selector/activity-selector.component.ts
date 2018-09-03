import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService, NzModalSubject } from 'ng-zorro-antd';
import { TemplateService } from '../../services/template-message.service';

@Component({
  selector: 'app-activity-selector',
  templateUrl: './activity-selector.component.html',
  styleUrls: ['./activity-selector.component.css'],
})
export class ActivitySelectorComponent implements OnInit {
  statusType: any[] = [
    { value: '', label: '活动状态' },
    { value: '1', label: '待开始' },
    { value: '2', label: '活动中' },
    { value: '3', label: '已结束' },
  ];
  selectedStatus = this.statusType[0];
  searchKeyword: string = '';

  curPage: number = 1;
  pageSize: number = 6;
  total: number = 0;
  isLoading: boolean = false;
  displayData: any[] = [];

  @Input() kolId: number;

  constructor(
    private subject: NzModalSubject,
    private dataService: TemplateService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    console.log('kolid====', this.kolId);
    this.getActivity();
  }

  getActivity(resetPage: boolean = false) {
    this.isLoading = true;
    if (resetPage) {
      this.curPage = 1;
    }
    const param = {
      page: this.curPage,
      pageSize: this.pageSize,
      kolId: this.kolId || 0,
      keyword: this.searchKeyword,
      status: this.selectedStatus.value,
      // type: 0,
    };

    // const param = {
    //   kolId:undefined,
    //   page:  this.curPage,
    //   pageSize: this.pageSize,
    //   productName: this.searchKeyword
    //     ? decodeURIComponent(this.searchKeyword)
    //     : undefined,
    //   status: this.selectedStatus.value,
    //   type:  0,
    //   startTime: undefined,
    //   endTime: undefined,
    // };

    this.dataService.getGrouponList(param).subscribe(
      res => {
        this.isLoading = false;
        this.total = res.data.count;
        this.displayData = res.data.list;
      },
      err => {
        this.isLoading = false;
      },
    );
  }

  getTypeName(type: number) {
    const typeName = {
      1: '普通拼团',
      2: '新人团',
      3: '抽奖团',
      4: '超级团',
    };
    return typeName[type] || '--';
  }

  getStatus(type: number) {
    const status = {
      1: '待开始',
      2: '活动中',
      3: '已结束',
    };
    return status[type] || '--';
  }

  selectChange(option) {
    // console.log("curPage=",val,'');
    this.selectedStatus = option;
    this.getActivity(true);
  }

  selectCurItem(item) {
    console.log('close modal item =', item);
    this.subject.next(item);
    this.subject.destroy();
  }
}
