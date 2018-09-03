import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'total-info',
  templateUrl: './total-info.component.html',
  styleUrls: ['./total-info.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalInfoComponent {
  @Input() text: any = 0;
  @Input() type: string = 'total'; // total | checked
}
