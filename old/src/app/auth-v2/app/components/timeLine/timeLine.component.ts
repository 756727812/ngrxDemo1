import { Component, Input } from '@angular/core';

@Component({
  selector: 'time-line',
  templateUrl: './timeLine.component.html',
  styleUrls: ['./timeLine.component.less'],
})
export class TimeLineComponent {
  @Input() currentStep: number;
  @Input() steps: string[];
  constructor() {}
}
