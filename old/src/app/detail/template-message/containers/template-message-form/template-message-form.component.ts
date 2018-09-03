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
  Output,
  EventEmitter,
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
import { formatSrc } from 'app/utils';
import { TemplateService } from '../../services/template-message.service';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { SeeKolSelectorSingleColComponent } from '@shared/components/kol-selector-single-col/kol-selector-single-col.component';
import { GoodsSelectorComponent } from '../../components/goods-selector/goods-selector.component';
import { ActivitySelectorComponent } from '../../components/activity-selector/activity-selector.component';
import { PageSelectorComponent } from '../../components/page-selector/page-selector.component';

// 跳转类型 0-商城首页，1-购物车页，2-商品，3-活动，4-页面
enum JUMP_ADDRESS_TYPE {
  FIRST_PAGE = 0,
  SHOPPING_CART = 1,
  GOODS = 2,
  ACTIVITY = 3,
  PAGE = 4,
}

// 跳转地址弹窗
const jumpAddressInfo = {
  [JUMP_ADDRESS_TYPE.GOODS]: {
    component: GoodsSelectorComponent,
    modalSize: 700,
    keyOfItemId: 'id',
    keyOfItemName: 'itemName',
  },
  [JUMP_ADDRESS_TYPE.ACTIVITY]: {
    component: ActivitySelectorComponent,
    modalSize: 700,
    keyOfItemId: 'id',
    keyOfItemName: 'activityName',
  },
  [JUMP_ADDRESS_TYPE.PAGE]: {
    component: PageSelectorComponent,
    modalSize: 500,
    keyOfItemId: 'id',
    keyOfItemName: 'name',
  },
};

@Component({
  selector: 'app-template-message-form',
  templateUrl: './template-message-form.component.html',
  styleUrls: ['./template-message-form.component.less'],
})
export class TemplateMsgFormComponent implements OnInit {
  get kolIds(): number[] {
    return this.getFormField('kolList').map(kol => kol.id);
  }

  constructor(
    private nzNotification: NzNotificationService,
    private modalService: NzModalService,
    private nzMessageService: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    private templateService: TemplateService,
    private fb: FormBuilder,
  ) {}
  formGroup: FormGroup;
  submitted: boolean = false;
  hasSent: boolean = false;
  multipleKols: boolean = false;
  singleAddressInfo: any = {};
  titleTextCount: number = 0;
  titleTextLimitCount: number = 7;
  contentTextCount: number = 0;
  contentTextLimitCount: number = 100;

  ngOnInit() {
    this.initFormGroup();
  }

  initFormGroup() {
    const formGroupParams = {
      kolList: [[], Validators.required],
      title: ['', Validators.required],
      content: ['', Validators.required],
      jumpType: [0, Validators.required],
    };

    this.formGroup = this.fb.group(formGroupParams);

    this.formGroup.get('kolList').valueChanges.forEach((value: any[]) => {
      this.multipleKols = value.length > 1;
      this.singleAddressInfo = {};
    });
    this.formGroup.get('title').valueChanges.forEach((value: string) => {
      this.titleTextCount = this.enLength(value) / 2;
    });
    this.formGroup.get('content').valueChanges.forEach((value: string) => {
      this.contentTextCount = this.enLength(value) / 2;
    });
  }

  enLength(value) {
    return value.replace(/[\u4e00-\u9fa5]/g, 'xx').length;
  }

  getFormField(fieldName) {
    return this.formGroup.get(fieldName).value;
  }

  setFormField(fieldName, newValue) {
    return this.formGroup.patchValue({ [fieldName]: newValue });
  }

  selectKOLs() {
    const selectedKolIds = this.kolIds;
    this.modalService
      .open({
        title: 'KOL选择',
        content: SeeKolSelectorSingleColComponent,
        onOk() {},
        width: 550,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: {
          selectedKolIds,
        },
      })
      .subscribe(targetKols => {
        if (typeof targetKols === 'object' && targetKols.length) {
          this.setFormField(
            'kolList',
            targetKols.map(kol => {
              return {
                id: kol.kolId,
                name: kol.kolName,
                weixinAuthInfoId: kol.weixinAuthInfoId,
              };
            }),
          );
        }
      });
  }

  selectJumpAddress(type: JUMP_ADDRESS_TYPE) {
    const { weixinAuthInfoId: xdpId, id: kolId } = this.getFormField(
      'kolList',
    )[0];
    this.modalService
      .open({
        title: '跳转地址',
        content: jumpAddressInfo[type].component,
        onOk() {},
        width: jumpAddressInfo[type].modalSize,
        onCancel() {},
        footer: false,
        maskClosable: false,
        componentParams: { xdpId, kolId },
      })
      .subscribe(output => {
        if (typeof output === 'object') {
          this.singleAddressInfo = {
            type,
            id: output[jumpAddressInfo[type].keyOfItemId],
            name: output[jumpAddressInfo[type].keyOfItemName],
          };
        }
      });
  }

  limitName(name: string) {
    return name.replace(/(.{25}).+/, '$1...');
  }

  routToList() {
    this.router.navigate(['../template-msg-list'], {
      relativeTo: this.route,
    });
  }

  cancelEdit() {
    this.routToList();
  }

  singleAddressError() {
    return !this.multipleKols && !this.singleAddressInfo.type;
  }

  enLenLimitError(value, chlimit) {
    return this.enLength(value) > chlimit * 2;
  }

  extraValid() {
    if (
      this.singleAddressError() ||
      this.enLenLimitError(this.getFormField('title'), 7) ||
      this.enLenLimitError(this.getFormField('content'), 100)
    ) {
      return false;
    }
    return true;
  }

  submit() {
    this.submitted = true;
    if (!this.formGroup.valid || !this.extraValid()) {
      this.nzMessageService.warning('请完善并检查所填信息！');
      return;
    }

    this.hasSent = true;
    const { title, content, jumpType } = this.formGroup.value;
    let body: any = {
      title,
      content,
      jumpType,
      kolIds: this.kolIds,
    };
    if (!this.multipleKols) {
      const { type, id } = this.singleAddressInfo;
      body = { ...body, jumpType: type, jumpId: id };
    }

    // 提交模板消息
    this.templateService
      .send(body)
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.error('提交模板消息失败！');
          this.hasSent = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('提交模板消息失败！');
          return;
        }

        this.nzMessageService.success('提交模板消息成功！');
        this.routToList();
      });
  }
}
