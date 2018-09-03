import { Component, OnInit } from '@angular/core';
import { NzModalSubject } from 'ng-zorro-antd';

@Component({
  selector: 'app-rules-tips',
  templateUrl: './rules-tips.component.html',
  styleUrls: ['./rules-tips.component.less'],
})
export class RulesTipsComponent implements OnInit {
  constructor(private subject: NzModalSubject) {}

  ngOnInit() {}

  understand() {
    this.subject.next('传出数据');
    this.subject.destroy('onCancel');
  }
}
