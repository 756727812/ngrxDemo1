import { PreviewItemComponent } from './../preview-item.component';
import { Component, OnInit } from '@angular/core';
import { get } from 'lodash';

@Component({
  selector: 'app-preview-basic-info',
  templateUrl: './preview-basic-info.component.html',
  styleUrls: ['./preview-basic-info.component.less'],
})
export class PreviewBasicInfoComponent extends PreviewItemComponent {
  constructor() {
    super();
  }

  get bannerLinkInfo() {
    return get(this.config, 'links.0');
  }

  ngOnInit() {}
}
