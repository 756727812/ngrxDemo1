import {
  Directive,
  HostBinding,
  ElementRef,
  HostListener,
  Input,
} from '@angular/core';
import { matchSelector, hasClass } from '@utils/dom';
import { ReportService } from '@shared/services';

@Directive({
  selector: '[report]',
})
export class ReportDirective {
  _reportKey: string;
  @HostBinding('attr.report') dataOriginal;
  @HostBinding('attr.report-ext1') reportExt1;
  @HostBinding('attr.report-ext2') reportExt2;
  @HostBinding('attr.report-ext3') reportExt3;

  @Input()
  set report(reportKey: string) {
    this._reportKey = reportKey;
  }

  constructor(
    private element: ElementRef,
    private reportService: ReportService,
  ) {}

  @HostListener('click', ['$event.target'])
  onClick(element: HTMLElement) {
    const disabled =
      matchSelector(element, '[disabled]') || hasClass(element, 'disabled');

    const extOptions: any = {
      ext1: this.reportExt1,
      ext2: this.reportExt2,
      ext3: this.reportExt3,
    };
    if (this._reportKey && !disabled) {
      this.reportService.reportByKey(this._reportKey, extOptions);
    }
  }
}
