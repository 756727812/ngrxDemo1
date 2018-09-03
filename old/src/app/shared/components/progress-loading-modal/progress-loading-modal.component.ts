import { Component, OnInit, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NzMessageService, NzModalSubject } from 'ng-zorro-antd';

@Component({
  selector: 'progress-loading-modal',
  templateUrl: './progress-loading-modal.component.html',
  styleUrls: ['./progress-loading-modal.component.less'],
})
export class ProgressLoadingModalComponent implements OnInit {
  @Input() asyncProgressFun: () => Promise<string | number>;

  progress: number = 0;
  timer: any;
  hasDestroy: boolean = false;

  constructor(
    private messageService: NzMessageService,
    private subject: NzModalSubject,
  ) {}

  ngOnInit() {
    if (!this.asyncProgressFun) {
      return;
    }
    this.hasDestroy = false;
    this.getProgress();
  }

  ngOnDestroy() {
    this.hasDestroy = true;
    clearTimeout(this.timer);
  }

  async getProgress() {
    try {
      const asyncProgress = await this.asyncProgressFun();
      if (this.hasDestroy) {
        return;
      }
      this.progress = +(+asyncProgress).toFixed(1);
      if (+asyncProgress !== 100) {
        this.timer = setTimeout(() => {
          this.getProgress();
        }, 200);
        return;
      }
      // 展现100%状态
      this.timer = setTimeout(() => {
        this.subject.next('complete');
        this.subject.destroy();
      }, 300);
    } catch (error) {
      this.messageService.create('error', '获取进度失败！');
    }
  }
}
