declare let noty: any;

import { INotificationService } from './notification.interface';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';

export class Notification implements INotificationService {
  // 错误提示，1秒内不重复弹，防止KOL合作管理，数据中心那边有部分接口重复报相同的错。
  private lastErrorMsg: string;
  private lastErrTime: number;

  static $inject: string[] = ['NzNotificationService', 'NzMessageService'];

  constructor(
    private nzNotification: NzNotificationService,
    private message: NzMessageService,
  ) {
    this.lastErrTime = 0;
    this.lastErrorMsg = '';
  }

  info = (text, timeout = 4500) => this.n('info', text, timeout);

  success = (text = '恭喜！操作成功！') => {
    console.log(Date.now());
    this.message.success(text);
  };

  warn = (text, timeout = 4500) => this.n('warning', text, timeout);

  error = (text, timeout = 4500) => this.n('error', text, timeout);

  dataError = res => {
    const timestamp = Number(new Date().getTime());
    const err = res ? (res.hasOwnProperty('msg') ? res.msg : res) : '';
    if (
      err !== '' &&
      (err !== this.lastErrorMsg || timestamp - this.lastErrTime > 1000)
    ) {
      this.lastErrorMsg = err;
      this.lastErrTime = timestamp;
      return this.n('warning', err || '');
    }
  };

  serverError = error => this.n('error', '抱歉！服务器发生问题，请稍后再试！');

  private n: (
    type: string,
    title: string,
    timeout?: number | boolean,
  ) => any = (type, title, timeout = 4500) =>
    this.nzNotification.create(type, title, '', {
      nzDuration: Number(timeout),
    });
}
