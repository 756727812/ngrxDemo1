import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'auth-bind',
  templateUrl: './bind.component.html',
  styleUrls: ['./bind.component.less'],
})
export class BindComponent {
  steps: string[] = ['手机验证', '绑定微信', '升级成功'];
  currentStep: number;
  sellerMobile: any;

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(
      (params: Params) => (this.currentStep = ~~params['currentStep'] || 1),
    );
  }
}
