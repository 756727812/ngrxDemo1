import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import {NzLocaleService} from 'ng-zorro-antd'

@Component({
  selector: 'nz-upload-list-item-icon',
  templateUrl: './nz-upload-list-item-icon.component.html',
  styleUrls: [
    './style/index.component.less'
  ],
  encapsulation: ViewEncapsulation.None,
})
export class NzUploadListItemIconComponent implements OnInit {

  _prefixCls = 'ant-upload';

  @Input() nzFile;
  @Input() nzListType;
  @Output() nzOnPreview = new EventEmitter<any>();

  _uploadingText = this._locale.translate('Upload.uploading');

  constructor(private _locale: NzLocaleService) {
  }

  ngOnInit() {
  }

}
