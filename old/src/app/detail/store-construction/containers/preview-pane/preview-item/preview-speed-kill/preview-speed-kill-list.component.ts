import { PreviewItemComponent } from './../preview-item.component';
import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-preview-speed-kill-list',
  templateUrl: './preview-speed-kill-list.component.html',
  styleUrls: [
    './preview-speed-kill-list.component.less',
    '../preview-item.component.css',
  ],
})
export class PreviewSpeedKillListComponent extends PreviewItemComponent {
  constructor() {
    super();
  }

  formatTime(str) {
    return moment(str).format('MM月DD日HH:mm')
  }
}
