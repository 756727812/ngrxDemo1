import { Component, OnInit } from '@angular/core';
import { PreviewItemComponent } from '../preview-item.component';

@Component({
  selector: 'app-preview-video-info',
  templateUrl: './preview-video-info.component.html',
  styleUrls: ['./preview-video-info.component.less'],
})
export class PreviewVideoInfoComponent extends PreviewItemComponent {
  coverImgUrl: string = require('./463766991307046674.png');
  constructor() {
    super();
  }

  ngOnInit() {}
}
