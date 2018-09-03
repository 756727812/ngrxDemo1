import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { NzBasicUploadComponent } from '../ignore-this-after-zorro-upload-pr-complete/nz-basic-upload.component';
import { isEqual, some, isEmpty, merge, times } from 'lodash';
import {
  NzRangePickerComponent,
  NzModalService,
  NzMessageService,
} from 'ng-zorro-antd';
import { DatePipe } from '@angular/common';
import { CtrlPaneService } from '../../services/ctrl-pane.service';

const DEFAULT_NOTE = {
  img: '建议上传图片宽度700PX，支持格式：png、jpeg、jpg',
  carouselImg: '建议上传图片尺寸为 700*300，支持格式：png、jpeg、jpg',
};

@Component({
  selector: 'app-common-len-form-label',
  templateUrl: './common-len-form-label.component.html',
  styleUrls: ['./common-len-form-label.component.less'],
})
export class LinkImgUploadFormLabelComponent implements OnInit {
  @Input() label: string = '添加图片';
  @Input() limit: number | string | boolean = 6;
  @Input() length: number | string = 0;
  @Input() note: string;
  constructor() {}
  ngOnInit() {}
  get noteResult() {
    return DEFAULT_NOTE[this.note] || this.note;
  }
}
