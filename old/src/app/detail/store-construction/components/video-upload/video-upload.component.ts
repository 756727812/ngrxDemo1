import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzBasicUploadComponent } from '../ignore-this-after-zorro-upload-pr-complete/nz-basic-upload.component';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { EditorService } from '../../services';
import { HttpHeaders } from '@angular/common/http';
import * as fromStore from '../../store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VideoUploadComponent),
      multi: true,
    },
  ],
})
export class VideoUploadComponent implements OnInit, ControlValueAccessor {
  @ViewChild(NzBasicUploadComponent) basicUpload: NzBasicUploadComponent;
  @Output() success: EventEmitter<any> = new EventEmitter<any>();
  @Input() label: string = '修改视频';
  uploading = false;
  isVideo: boolean = true;

  cover: string = require('./61074124177010300.png');

  nzHeaders = new HttpHeaders().set('Content-Type', 'multipart/form-data');

  // ngModel Access
  @Input() _value: string = '';

  private _onChange: (value: string) => void = () => null;
  private _onTouched: () => void = () => null;
  nzCustomRequest: any;

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

  constructor(
    private nzMessageService: NzMessageService,
    private editService: EditorService,
    private modelService: NzModalService,
  ) {}

  ngOnInit() {
    this.nzCustomRequest = this.editService;
  }

  handleEditClick() {
    /* if (this.basicUpload && this.basicUpload.onClick) {
      this.basicUpload.onClick(null);
    }*/
    this.modelService.confirm({
      content: '确认删除该视频？',
      onOk: () => {
        this.value = '';
        this.success.emit('');
      },
    });
  }

  beforeUpload = file => {
    // TODO 取组件的 nzAccept 来对比靠谱点
    if (!file || !file.type) {
      this.nzMessageService.warning('请上传mp4的视频');
      this.uploading = false;
      return false;
    }

    if (!file.type.startsWith('video/mp4')) {
      this.nzMessageService.warning('请上传mp4的视频');
      this.uploading = false;
      return false;
    }

    if (file.size > 10485760) {
      this.nzMessageService.warning('上传失败，视频大于10MB');
      this.uploading = false;
      return false;
    }

    return Observable.create((obs: any) => {
      const video = document.createElement('video');
      video.setAttribute('crossorigin', 'anonymous');
      video.addEventListener(
        'loadedmetadata',
        () => {
          if (!video.videoHeight || !video.videoWidth) {
            this.nzMessageService.warning('请上传mp4的视频');
            this.uploading = false;
            obs.next(false);
            obs.complete();
          } else {
            obs.next(file);
            obs.complete();
          }
        },
        false,
      );
      video.addEventListener(
        'error',
        () => {
          this.nzMessageService.warning('请上传 mp4 的视频');
          this.uploading = false;
          obs.next(false);
          obs.complete();
        },
        false,
      );
      video.src = URL.createObjectURL(file);
    });
  };

  onProgress() {
    this.uploading = true;
  }
  onStart() {
    this.uploading = true;
  }
  onSuccess(resp) {
    try {
      this.value = `https://video.seecsee.com/${resp.ret.key}`;
      this.success.emit(resp.ret);
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
