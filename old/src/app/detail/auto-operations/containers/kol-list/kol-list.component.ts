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
import { RulesService } from '../../services/rules.service';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { KolSelectorSingleColComponent } from '../../components/kol-selector/kol-selector.component';

type IMemberData = {
  list: any[];
  total: number;
};

// 初次装修状态，0-等待装修,1-装修中,2-装修完成,3-装修失败
enum FIRST_DECORATE_STATUS {
  WAITING = 0,
  PENDING = 1,
  FINISH = 2,
  FAIL = 3,
}

@Component({
  selector: 'app-kol-list',
  templateUrl: './kol-list.component.html',
  styleUrls: ['./kol-list.component.less'],
})
export class KolListComponent implements OnInit {
  @Input() ruleId: number;
  @Input() status: number;
  @Input() isElectAdmin: boolean;
  @Input() shopHeadPic: string = '';

  searchKey = '';
  _keyword = '';
  loading = 0;
  kol_id: number;
  modalVisible: boolean = false;
  initFileList: any[] = [];

  memberData: IMemberData = {
    list: [],
    total: 0,
  };

  get seckillList(): any[] {
    return this.memberData.list;
  }

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
    private rulesService: RulesService,
  ) {}

  ngOnInit() {
    this.getMemberList();
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
    return Math.ceil(this.memberData.total / this.pageSize);
  }

  quickJumperFun = newPage => {
    this.page = newPage;
    this.showPaginaton = false;
    this.getMemberList();
  };

  /**** 使用自定义快速跳转 end ****/

  page = 1;
  pageSize = 20;

  selectKOLs() {
    this.modalService
      .open({
        title: 'KOL选择',
        content: KolSelectorSingleColComponent,
        onOk() {},
        // width: 1000,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          confirmText: '提交',
          ruleId: this.ruleId,
        },
      })
      .subscribe(targetKols => {
        if (typeof targetKols === 'object' && targetKols.length) {
          this.addMember(targetKols);
        }
      });
  }

  addMember(targetKols) {
    const body = targetKols.map(kol =>
      Object.assign({}, _.pick(kol, ['category_id', 'kol_id', 'xdp_id']), {
        head_img: '',
        rule_id: this.ruleId,
        status: this.status,
      }),
    );

    // 添加成员
    this.rulesService
      .addmember(body)
      .pipe(
        catchError((error: any) => {
          this.loading = 0;
          this.nzMessageService.error('添加成员失败！');
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
          this.nzMessageService.error('添加成员失败！');
          return;
        }

        this.nzMessageService.success('添加成员成功！');
        this.getMemberList(true);
      });
  }

  _isSpinning: boolean = false;

  searchClick() {
    this.searchKey = this._keyword.trim();
    this.getMemberList(true);
  }

  removeKol(kol_id) {
    this.kol_id = kol_id;
    this.modalVisible = true;
  }

  removeOk = () => {
    this.modalVisible = false;
    // 移出kol
    this.rulesService
      .removeKol_body({ kol_id: this.kol_id })
      .pipe(
        catchError((error: any) => {
          this.loading = 0;
          this.nzMessageService.error('移出KOL失败！');
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
          this.nzMessageService.error('移出KOL失败！');
          return;
        }

        this.nzMessageService.success('移出KOL成功！');
        this.getMemberList(true);
      });
  };

  removeCancel = () => {
    this.modalVisible = false;
    this.nzMessageService.success('操作已取消');
  };

  reset(kol_id) {
    const body = {
      kol_id,
      rule_id: this.ruleId,
    };
    // 恢复默认头图接口
    this.rulesService
      .reback(body)
      .pipe(
        catchError((error: any) => {
          this.loading = 0;
          this.nzMessageService.error('恢复默认头图失败！');
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
          this.nzMessageService.error('恢复默认头图失败！');
          return;
        }

        this.nzMessageService.success('恢复默认头图成功！');
        this.getMemberList(true);
      });
  }

  tryagain(kol_id) {
    const body = {
      kol_id,
      rule_id: this.ruleId,
    };
    // 重试装修接口
    this.rulesService
      .tryagain(body)
      .pipe(
        catchError((error: any) => {
          this.loading = 0;
          this.nzMessageService.error('重试装修失败！');
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
          this.nzMessageService.error('重试装修失败！');
          return;
        }

        this.getMemberList(true);
      });
  }

  uploadHeadImg(kol_id) {
    this.kol_id = kol_id;
    $('#img-upload-div .ant-upload-select div.ant-upload')
      .eq(0)
      .trigger('click');
  }

  imgValid = imgData => {
    const { type, sizeMB } = imgData;
    const typeValid = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/gif',
    ].includes(type);
    const sizeValid = sizeMB < 1;
    if (!typeValid) {
      this.nzMessageService.warning('图片格式不正确！');
    }
    if (typeValid && !sizeValid) {
      this.nzMessageService.warning('图片应小于1M！');
    }
    return typeValid && sizeValid;
  };

  uploadHeadImgToRule(head_img) {
    const body = {
      head_img,
      kol_id: this.kol_id,
      rule_id: this.ruleId,
    };
    // 上传kol头图
    this.rulesService
      .uploadkolheadimage(body)
      .pipe(
        catchError((error: any) => {
          this.loading = 0;
          this.nzMessageService.error('上传KOL头图失败！');
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
          this.nzMessageService.error('上传KOL头图失败！');
          return;
        }

        this.nzMessageService.success('上传KOL头图成功！');
        this.getMemberList(true);
      });
  }

  uploadImgSuccess(value) {
    this.uploadHeadImgToRule(value.imgUrl);
    this.initFileList = [];
  }

  uploadImgError(value) {
    console.log('uploadImgError:', value);
    this.initFileList = [];
  }

  getMemberList = (reset: boolean = false) => {
    this.loading = 1;
    if (reset) {
      this.page = 1;
    }
    const body = {
      rule_id: this.ruleId,
      current_page: this.page,
      page_size: this.pageSize,
      match_str: this.searchKey,
    };

    // 获取规则成员列表
    this.rulesService
      .kolforrule(body)
      .pipe(
        catchError((error: any) => {
          this.loading = 0;
          this.nzMessageService.error('获取规则成员列表失败！');
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
          this.nzMessageService.error('获取规则成员列表失败！');
          return;
        }

        this.memberData = res.data;
      });
  };
}
