import { Component, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'display-xcx-path',
  template: `
    <div class="left">{{ label }}</div>
    <div class="center-wrap">
      <input type="text" readonly value="{{ path }}" class="link" />
    </div>
    <div class="right">
      <a class="btn-download" ngxClipboard [cbContent]="path" (click)="showMsg()">复制</a>
    </div>
  `,
  styleUrls: ['display-xcx-path.component.less'],
  host: { class: 'comp-main' },
})
export class DisplayXcxPathComponent {
  @Input() label: string;
  @Input() path: string;

  constructor(private messageService: NzMessageService) {}

  showMsg() {
    this.messageService.success('复制成功！');
  }
}
