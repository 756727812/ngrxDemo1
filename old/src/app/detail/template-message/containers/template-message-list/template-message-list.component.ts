import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Inject,
  forwardRef,
  Input,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import {
  NzNotificationService,
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import * as _ from 'lodash';
import { TemplateService } from '../../services/template-message.service';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

type ITemplateMsgData = {
  list: any[];
  count: number;
};

// 初次装修状态，0-等待装修,1-装修中,2-装修完成,3-装修失败
enum FIRST_DECORATE_STATUS {
  WAITING = 0,
  PENDING = 1,
  FINISH = 2,
  FAIL = 3,
}

@Component({
  selector: 'app-template-message-list',
  templateUrl: './template-message-list.component.html',
  styleUrls: ['./template-message-list.component.less'],
})
export class TemplateMsgListComponent implements OnInit {
  searchKey = '';
  _keyword = '';
  loading = 0;
  page = 1;
  pageSize = 10;

  templateData: ITemplateMsgData = {
    list: [],
    count: 0,
  };

  firstDecorateStatus: any = {
    [FIRST_DECORATE_STATUS.WAITING]: '待开始',
    [FIRST_DECORATE_STATUS.PENDING]: '进行中',
    [FIRST_DECORATE_STATUS.FINISH]: '已完成',
    [FIRST_DECORATE_STATUS.FAIL]: '失败',
  };

  constructor(
    private nzMessageService: NzMessageService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    private templateService: TemplateService,
  ) {}

  ngOnInit() {
    this.getTemplateList();
  }

  addTemplate() {
    this.router.navigate(['../template-msg-form'], {
      relativeTo: this.route,
    });
  }

  ngAfterContentChecked() {
    // 自定义快速跳转
    const pagination = document.querySelector(
      '.ant-table-pagination.ant-pagination',
    );
    if (pagination) {
      this.showPaginaton = true;
      pagination.setAttribute('style', 'margin-right: 100px;');
    }
    const quickJumper = document.querySelector('.quick-jumper-container');
    if (quickJumper) {
      quickJumper.setAttribute('style', 'top: -28px;');
    }
  }

  /**** 使用自定义快速跳转 start ****/
  showPaginaton = false;

  get max_page(): number {
    return Math.ceil(this.templateData.count / this.pageSize);
  }

  quickJumperFun = newPage => {
    this.page = newPage;
    this.showPaginaton = false;
    this.getTemplateList();
  };

  /**** 使用自定义快速跳转 end ****/

  searchClick() {
    this.searchKey = this._keyword.trim();
    this.getTemplateList(true);
  }

  getTemplateList = (reset: boolean = false) => {
    this.loading = 1;
    if (reset) {
      this.page = 1;
    }
    const params = {
      page: this.page,
      pageSize: this.pageSize,
      keyword: this.searchKey,
    };

    // 获取模板消息列表
    this.templateService
      .list(params)
      .pipe(
        catchError((error: any) => {
          this.loading = 0;
          this.nzMessageService.error('获取模板消息列表失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this.loading = 0;
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('获取模板消息列表失败！');
          return;
        }

        const { list, count } = res.data;
        this.templateData = {
          count,
          list: list.map(({ customTemplateMessage, clickNum, clickRate }) => {
            return { ...customTemplateMessage, clickNum, clickRate };
          }),
        };
      });
  };

  getKolNameHover(kolName) {
    return kolName.replace(/(([^,]+,){20}).+/, '$1...');
  }
}
