import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'auth-forget',
  templateUrl: './forget.component.html',
  styleUrls: ['./forget.component.less'],
})
export class ForgetComponent {
  steps: string[] = ['验证身份', '重置登录密码', '重置成功'];
  currentStep: number;
  sellerMobile: any;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.sellerMobile = params['seller_mobile'];
    });

    this.activatedRoute.params.subscribe((params: Params) => {
      this.currentStep = ~~params['currentStep'] || 1;
      this.init();
    });
  }

  init() {
    if (!this.sellerMobile && this.currentStep === 2) {
      this.currentStep = 1;
      this.router.navigate(['/forget/1']);
    }
  }
}
