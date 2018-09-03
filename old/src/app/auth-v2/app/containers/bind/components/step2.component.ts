import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'bind-step-two',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.less'],
})
export class BindStepTwoComponent {
  iFrameUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://seecsee.com/authority/loginByQRCode?platform=1&action=binding&host=${encodeURIComponent(
        window.location.protocol + '//' + window.location.host,
      )}`,
    );
  }
}
