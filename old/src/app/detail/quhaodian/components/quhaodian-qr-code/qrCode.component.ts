import { Component, Input } from '@angular/core';
@Component({
  selector: 'qr-code-show',
  templateUrl: './qrCode.component.html',
  styleUrls: ['./qrCode.component.less'],
})
export class QrCodeComponent {
  @Input() index: number;
  constructor() {}
}
