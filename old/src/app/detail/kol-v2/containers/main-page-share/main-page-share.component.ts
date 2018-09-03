import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  NzModalService,
  NzMessageService,
  NzNotificationService,
  UploadFile,
} from 'ng-zorro-antd';
import { StoreConfigService } from '../../services';
import * as _ from 'lodash';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { formatSrc } from 'app/utils';
import * as fromStore from '../../store';
import { Store } from '@ngrx/store';

// 1=默认设置 2=个性化设置
enum CONFIG_TYPE {
  DEFAULT = 1,
  CUSTOM = 2,
}

type ImgData = {
  width: number;
  height: number;
  name: string;
  size: number;
  type: string;
  sizeKB?: number;
  sizeMB?: number;
};

@Component({
  selector: 'main-page-share',
  templateUrl: 'main-page-share.component.html',
  styleUrls: ['main-page-share.component.less'],
})
export class MainPageShareComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private notificationService: NzNotificationService,
    private msg: NzMessageService,
    private fb: FormBuilder,
    private storeConfigService: StoreConfigService,
    private store: Store<fromStore.KolState>,
  ) {}

  configType: string = 'default';
  defaultTips: string = '默认：豆腐块分享图是该页面顶部截图，文案是该电铺名称';
  customTips: string =
    '仅限商城转发图文更换，不包括商品详情页（商详分享自动截取商品图片）';

  titleTips: string = '不超过28个字符，超过部分...显示';
  imageTips: string = '图片尺寸建议750*600';

  imgUrl: string = '';
  initImg: any[] = [];

  formGroup: FormGroup;

  submitted: boolean = false;

  kolInfo: fromStore.IKolData;

  ngOnInit() {
    this.initPageData();
  }

  async initPageData() {
    await this.getKolInfoFromStore();
    this.initFormGroup();
    this.getShareConfig();
  }

  getKolInfoFromStore() {
    return new Promise((resolve, reject) => {
      this.store
        .select(fromStore.getCurrentKolDataSelector)
        .subscribe(kolInfo => {
          this.kolInfo = kolInfo;
          resolve();
        });
    });
  }

  initFormGroup() {
    const formGroup = this.fb.group({
      shareText: ['', Validators.required],
    });
    this.formGroup = formGroup;

    this.formGroup
      .get('shareText')
      .valueChanges.debounceTime(50)
      .distinctUntilChanged()
      .subscribe(data => this.formatShareText(data));
  }

  formatShareText(newVal) {
    if (newVal.replace(/\.{1,3}/, '').length > 28) {
      const shareText = newVal.replace(/(.{28})(.+)/, '$1...');
      if (shareText !== newVal) {
        this.formGroup.patchValue({ shareText }, { emitEvent: false });
      }
    }
  }

  getShareConfig() {
    // 获取首页分享当前配置
    this.storeConfigService
      .getKolShare(this.kolInfo.xdpId)
      .pipe(
        catchError((error: any) => {
          this.msg.error('获取首页分享配置失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        const { shareImgUrl, title, type } = res.data;
        if (type === CONFIG_TYPE.CUSTOM) {
          this.formGroup.patchValue({ shareText: title }, { emitEvent: false });
          this.imgUrl = shareImgUrl;
          this.initImg = [
            {
              uid: -1,
              name: this.getImageName(shareImgUrl),
              status: 'done',
              url: formatSrc(shareImgUrl),
            },
          ];
          this.configType = 'custom';
        }
      });
  }

  getImageName(url: string): string {
    return /\/[^\/]+$/.exec(url)[0].slice(1);
  }

  uploadImgSuccess(value) {
    this.initImg = _.cloneDeep(value.fileList);
    this.imgUrl = value.imgUrl;
  }

  uploadImgError(value) {
    this.initImg = _.cloneDeep(value.fileList);
    console.log('uploadImgError:', value);
  }

  removeImg(value) {
    this.initImg = _.cloneDeep(value.fileList);
    this.imgUrl = '';
  }

  imgValid = (imgData: ImgData) => {
    return true;
  };

  submit() {
    this.submitted = true;
    const shareImgUrl = this.imgUrl;
    const title = this.formGroup.get('shareText').value;
    if (!shareImgUrl || !title) {
      this.msg.warning('请完善信息！');
      return;
    }

    const body = {
      shareImgUrl,
      title,
      xdpId: this.kolInfo.xdpId,
      type: CONFIG_TYPE.CUSTOM,
    };
    // 个性化设置api请求
    this.storeConfigService
      .saveKolShare(body)
      .pipe(
        catchError((error: any) => {
          this.msg.error('个性化设置失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.msg.error('个性化设置失败！');
          return;
        }
        this.msg.success('个性化设置成功！');
      });
  }

  onCfgTypeChange(configType) {
    this.configType = configType;
    if (configType === 'default') {
      const body = {
        xdpId: this.kolInfo.xdpId,
        type: CONFIG_TYPE.DEFAULT,
      };
      // 默认设置api请求
      this.storeConfigService
        .saveKolShare(body)
        .pipe(
          catchError((error: any) => {
            this.msg.error('默认设置失败！');
            return Observable.of(null);
          }),
        )
        .subscribe(res => {
          if (res.result !== 1) {
            console.log('error:', res.msg);
            this.msg.error('默认设置失败！');
            return;
          }
          this.msg.success('默认设置成功！');
        });
    }
  }
}
