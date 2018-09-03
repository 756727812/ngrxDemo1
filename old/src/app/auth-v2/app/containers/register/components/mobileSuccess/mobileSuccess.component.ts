import { Component } from '@angular/core';

@Component({
  selector: 'mobile-register-success',
  templateUrl: './mobileSuccess.component.html',
  styleUrls: ['./mobileSuccess.component.less'],
})
export class mobileRegisterSuccessComponent {
  isSeeData: boolean = false;

  constructor() {
    this.isSeeData = sessionStorage.getItem('__isSeeData__') === '1';
  }

  onCopySuccess() {
    alert('复制成功');
  }
}
