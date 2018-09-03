import { Component, Input } from '@angular/core';
import { UserIdentifyInfo } from '../../models';
@Component({
  selector: 'time-line',
  templateUrl: './userIdentifyInfo.component.html',
  styleUrls: ['./userIdentifyInfo.component.less'],
})
export class UserIdentifyInfoComponent {
  @Input() identifyInfo: UserIdentifyInfo;
  constructor() {}
}
