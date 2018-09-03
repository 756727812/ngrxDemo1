import { Component, OnInit, Input } from '@angular/core';
import { NzModalSubject } from 'ng-zorro-antd';
import { stringify } from 'query-string';

@Component({
  selector: 'modal-show-upgrade-info',
  templateUrl: './modal-show-upgrade-info.component.html',
  styles: [
    `
    :host ::ng-deep .customize-footer {
      border-top: 1px solid #e9e9e9;
      padding: 10px 18px 0 10px;
      text-align: right;
      border-radius: 0 0 0px 0px;
      margin: 15px -16px -5px -16px;
    }
    `,
  ],
})
export class ModalShowUpgradeInfoComponent {
  newEntryPath: string;
  constructor(private subject: NzModalSubject) {}

  @Input()
  set queryParams(value: { [key: string]: string }) {
    const { kolId, wechatId, xdpId } = value;
    let path = `/kol-v2/kol-cooperation-management/${kolId}/${wechatId ||
      0}/micro-page`;

    if (xdpId) {
      path += `?${stringify({ xdpId })}`;
    }

    this.newEntryPath = path;
  }

  handleCancel(e) {
    this.subject.destroy();
  }
}
