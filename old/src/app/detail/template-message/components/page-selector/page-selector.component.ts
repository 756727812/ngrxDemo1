import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService, NzModalSubject } from 'ng-zorro-antd';
import { TemplateService } from '../../services/template-message.service';

@Component({
  selector: 'app-page-selector',
  templateUrl: './page-selector.component.html',
  styleUrls: ['./page-selector.component.css'],
})
export class PageSelectorComponent implements OnInit {
  curPage: number = 1;
  pageSize: number = 10;
  total: number = 0;
  isLoading: boolean = false;
  displayData: any[] = [];
  searchKeyword: string = '';

  @Input() kolId: number;
  @Input() xdpId: number;

  constructor(
    private subject: NzModalSubject,
    private dataService: TemplateService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    console.log('kolid====', this.kolId);
    this.getPage();
  }

  getPage(resetPage: boolean = false) {
    this.isLoading = true;
    if (resetPage) {
      this.curPage = 1;
    }
    // page=1&currentPageNo=1&pageSize=8&page_size=8&kolId=130&kol_id=130&name=xxx&xdpId=209
    const param = {
      page: this.curPage,
      pageSize: this.pageSize,
      kolId: this.kolId || 0,
      xdpId: this.xdpId || 209,
      name: this.searchKeyword,
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

    this.dataService.getPageList(param).subscribe(
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

  selectCurItem(item) {
    console.log('close modal item =', item);
    this.subject.next(item);
    this.subject.destroy();
  }
}
