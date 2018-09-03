import { Component } from '@angular/core';

@Component({
  selector: 'register-step-two',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.less'],
})
export class RegisterStepTwoComponent {
  activeTab: number = 1;
  constructor() {}
}
