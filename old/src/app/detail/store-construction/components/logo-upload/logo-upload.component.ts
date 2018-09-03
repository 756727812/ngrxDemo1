import {
  Component,
  OnInit,
  Output,
  Input,
  forwardRef,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { NzBasicUploadComponent } from '../ignore-this-after-zorro-upload-pr-complete/nz-basic-upload.component';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-logo-upload',
  templateUrl: './logo-upload.component.html',
  styleUrls: ['./logo-upload.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LogoUploadComponent),
      multi: true,
    },
  ],
})
export class LogoUploadComponent implements OnInit, ControlValueAccessor {
  @ViewChild(NzBasicUploadComponent) basicUpload: NzBasicUploadComponent;
  @Output() success: EventEmitter<any> = new EventEmitter<any>();
  @Input() label: string = '修改Logo';
  uploading = false;

  // ngModel Access
  @Input() _value: string = '';

  private _onChange: (value: string) => void = () => null;
  private _onTouched: () => void = () => null;

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    if (this._value === val || (this._value == null && val == null)) {
      return;
    }
    this._value = val;
    this._onChange(val);
  }

  constructor(private nzMessageService: NzMessageService) {}

  ngOnInit() {}

  handleEditClick() {
    if (this.basicUpload && this.basicUpload.onClick) {
      this.basicUpload.onClick(null);
    }
  }

  beforeUpload = file => {
    // TODO 取组件的 nzAccept 来对比靠谱点
    if (
      file &&
      file.type &&
      'image/jpg, image/jpeg, image/png, image/gif'.indexOf(file.type) === -1
    ) {
      this.nzMessageService.warning('请上传 jpg、jpeg 或 png 格式的图片');
      this.uploading = false;
      return false;
    }
    return true;
  };

  onProgress() {
    this.uploading = true;
  }
  onStart() {
    this.uploading = true;
  }
  onSuccess(resp) {
    try {
      this.value = resp.ret.data;
      this.success.emit(resp.ret.data);
    } catch (e) {}
    this.uploading = false;
  }
  onError() {
    this.uploading = false;
  }

  /* model access start */

  writeValue(value: string) {
    this._value = value;
  }

  registerOnChange(fn: (_: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /* model access end */
}
