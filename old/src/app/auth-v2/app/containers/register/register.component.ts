import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import * as bower from 'bowser';
import { ReportService } from '../../services';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
})
export class RegisterComponent {
  currentStep: number = 1;
  isMobile: boolean = bower.mobile;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
  ) {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.currentStep = ~~params['currentStep'] || 1;

      // 根据currentStep去report data
      const map = {
        1: 'PAGE_ENTRY.PV_ENTER_REGISTER',
        2: 'PAGE_ENTRY.PV_INFO_FORM',
        3: 'PAGE_ENTRY.PV_REGISTER_SUCC',
      };
      const pageKey = map[this.currentStep];
      if (pageKey) {
        this.reportService.reportByPageKey(pageKey);
      }
    });
  }
}
