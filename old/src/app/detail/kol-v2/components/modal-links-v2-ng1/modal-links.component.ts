import { Component, Input, OnInit } from '@angular/core';
import { NzModalSubject, NzMessageService } from 'ng-zorro-antd';
// import { ModalLinkService } from '../../services/modal-link.service';
import { ModalLink } from '../../models';
import { accessChecker } from '@utils';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import { catchError, map } from 'rxjs/operators';
import { throttle } from 'lodash';
import { confirmImgHost } from '../../../../utils';
@Component({
  selector: 'modal-links-v2',
  templateUrl: 'modal-links.component.html',
  styleUrls: ['modal-links.component.less'],
})
export class ModalLinksComponentV2 implements OnInit {
  @Input() modalLink: ModalLink;

  isKolInCrm: boolean; // 当前kol是否录入crm

  paths = {
    xcxPath: {
      label: '小程序路径',
      path: '',
    },
    xcxCode: {
      type: 'NORMAL',
      imgUrl: '',
      label: '小程序码',
      downLoadTitle: '小程序码',
    },
    xcxCard: {
      type: 'NORMAL',
      imgUrl: '',
      label: '小程序卡片配图',
      downLoadTitle: '小程序卡片配图',
    },
  };

  sideMenu = [
    {
      name: '日常内容推文',
      id: 0,
    },
    {
      name: '广告内容推文',
      id: 1,
    },
    {
      name: '日常贴片推文',
      id: 2,
    },
    {
      name: '广告贴片推文',
      id: 3,
    },
  ];

  cacheData = {};
  activeId: number = -1;
  timer: any;

  constructor(
    private subject: NzModalSubject,
    // private modalLinkService: ModalLinkService,
    private http: _HttpClient,
    private messageService: NzMessageService,
  ) {}

  ngOnInit() {
    this.getIsKolInCrm();
  }

  get isAdmin() {
    return accessChecker.isAdmin();
  }

  getXCXCardImg(imgUrl) {
    return imgUrl
      ? `${confirmImgHost(
          imgUrl,
        )}?imageMogr2/thumbnail/!1080x864r/gravity/Center/crop/1080x864/format/jpg`
      : null;
  }

  getIsKolInCrm(): void {
    this.http
      .get('/api/ng/data/check/kolExist', {
        kolId: this.modalLink.kolId,
      })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      )
      .subscribe(data => {
        this.isKolInCrm = data[0].is_exist;
        if (!this.isAdmin && this.isKolInCrm) {
          this.activeId = 0;
          this.getUrl();
        }
      });
  }

  private clearPath(): void {
    this.paths.xcxPath.path = '';
    this.paths.xcxCode.imgUrl = '';
    this.paths.xcxCard.imgUrl = '';
  }

  private setPath(data: any): void {
    if (!data) {
      return;
    }
    this.paths.xcxPath.path = data.uniqueUrl || '';
    this.paths.xcxCode.imgUrl = data.acodeUrl || '';
    this.paths.xcxCard.imgUrl = this.getXCXCardImg(data.itemUrl) || '';
    this.cacheData[this.activeId] = JSON.parse(JSON.stringify(this.paths));
  }

  downloadImg(path, name): void {
    const image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function() {
      const suffix = '.png';
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      const url = canvas.toDataURL('image/png');

      // 生成一个a元素
      const a = document.createElement('a');
      // 创建一个单击事件
      const event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null,
      );
      // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
      a.download = name + suffix;
      // 将生成的URL设置为a.href属性
      a.href = url;
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), name + suffix);
      } else {
        a.dispatchEvent(event);
      }
    };

    image.src = path + '?v=' + new Date().getTime();
  }

  getUrl(isClear: boolean = true): void {
    const params = {
      ...this.modalLink,
      usageType: this.activeId || 0,
    };
    isClear && this.clearPath();
    // this.modalLinkService.getUrl(params).subscribe((data: any) => {
    //   this.setPath(data);
    // });
    this.http
      .get('api/ng/pathUrl/getUrl', { ...params })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      )
      .subscribe(data => {
        this.setPath(data);
      });
  }

  /**
   * 左侧点击
   * @param {number} id
   */
  handleClickSide(id: number): void {
    this.activeId = id;
    if (this.cacheData[this.activeId]) {
      this.paths = JSON.parse(JSON.stringify(this.cacheData[this.activeId]));
    } else {
      this.getUrl();
    }
  }

  flush(): void {
    this.getIsKolInCrm();
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  showMsg() {
    if (this.timer) {
      this.messageService.warning('请两秒后再试!');
      return;
    }
    this.messageService.success('复制成功!');
    this.getUrl(false);
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.timer = null;
    }, 2000);
  }
  // showMsg = throttle(
  //   () => {
  //     this.messageService.success('复制成功!');
  //     this.getUrl(false);
  //   },
  //   2000,
  //   { trailing: false },
  // );
}
