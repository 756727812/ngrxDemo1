import { Component, Input } from '@angular/core';
import * as urlParse from 'url-parse';
import { confirmImgHost } from '@utils';

export type IQrs = {
  type: 'NORMAL' | 'XCX_CARD';
  imgUrl: string;
  label: string;
  downLoadTitle: string;
};

@Component({
  selector: 'display-xcx-qrcode',
  template: `
    <ul class="qr">
      <li *ngFor="let qr of _qrs">
        <div class="img-ct">
          <img [src]="qr.imgUrl" [class.xcxCardImg]="qr.type === 'XCX_CARD'" alt="">
        </div>
        <div class="qr-note" *ngIf="qr.label">{{ qr.label }}</div>
        <div class="warn" *ngIf="qr.warn">
          <span class="text">{{ qr.warn }}</span>
        </div>
        <a class="btn-download" [href]="qr.imgUrl" target="_blank" download="{{qr.downLoadTitle}}">下载</a>
      </li>
    </ul>
  `,
  styleUrls: ['display-xcx-qrcode.component.less'],
})
export class DisplayXcxQrcodeComponent {
  _qrs: IQrs[];
  @Input()
  set qrs(qrs: IQrs[]) {
    if (!qrs) {
      return;
    }
    this._qrs = qrs.map(qr => ({
      ...qr,
      imgUrl:
        qr.type === 'XCX_CARD'
          ? this.getXCXCardImg(qr.imgUrl)
          : confirmImgHost(qr.imgUrl) ||
            '//static.seecsee.com/seego_backend/images/placeholder.png',
    }));
  }

  constructor() {}

  private getXCXCardImg(imgUrl): string {
    if (!!imgUrl) {
      const imgURL = urlParse(imgUrl);
      return `${confirmImgHost(
        imgURL.pathname,
      )}?imageMogr2/thumbnail/!1080x864r/gravity/Center/crop/1080x864/format/jpg`;
    }
    return '';
  }
}
