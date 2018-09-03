import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UidService } from './uid/uid.service';
import defaultRequest from './request';
import { attrAccept } from './utils';
import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { getData } from '@shared/services';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'nz-basic-upload',
  providers: [UidService],
  templateUrl: './nz-basic-upload.component.html',
  styleUrls: ['./style/index.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class NzBasicUploadComponent implements OnInit {
  _classMap;
  _prefixCls = 'ant-upload';
  _reqs = {};

  @Input() nzAction: string;
  @Input() nzAccept: string;
  @Input() nzAutoUpload = true;
  @Input()
  nzBeforeUpload: (file: File, files: FileList) => boolean | Observable<any>;
  @Input() nzCustomRequest: any = null;
  @Input() nzData: any;
  @Input() nzDisabled = false;
  @Input() nzHeaders: string | { [name: string]: string | string[] };
  @Input() nzMultiple = false;
  @Input() name: string;
  @Input() nzWithCredentials = false;
  @Input() isVideo: boolean = false;

  @Output() nzOnError = new EventEmitter<any>();
  @Output() nzOnProgress = new EventEmitter<any>();
  @Output() nzOnRemove = new EventEmitter<any>();
  @Output() nzOnStart = new EventEmitter<any>();
  @Output() nzOnSuccess = new EventEmitter<any>();

  @ViewChild('input') inputElement: ElementRef;

  constructor(private uidService: UidService, private http: HttpClient) {}

  ngOnInit() {
    this.setClassMap();
  }

  setClassMap(): void {
    this._classMap = {
      [`${this._prefixCls}`]: true,
      [`${this._prefixCls}-disabled`]: this.nzDisabled,
    };
  }

  onChange = e => {
    const files: FileList = e.target.files;
    if (!files) {
      return;
    }
    this.uploadFiles(files);
  };

  uploadFiles(files: FileList) {
    const postFiles = Array.prototype.slice.call(files);

    postFiles.forEach(file => {
      file.uid = this.uidService.getUid();
      this.nzOnStart.emit(file);
      if (this.nzAutoUpload) {
        this.upload(file, postFiles);
      }
    });
  }

  upload(file, fileList) {
    if (!this.nzBeforeUpload) {
      this.post(file);
    } else {
      const before = this.nzBeforeUpload(file, fileList);
      if (before instanceof Observable) {
        before.subscribe(
          (processedFile: any) => {
            const processedFileType = Object.prototype.toString.call(
              processedFile,
            );
            if (processedFileType === '[object Boolean]' && !processedFile) {
              return;
            }
            if (
              processedFileType === '[object File]' ||
              processedFileType === '[object Blob]'
            ) {
              if (this.isVideo) {
                this.getTokenAndUploadVideo(file);
              } else {
                this.post(processedFile);
              }
            } else if (processedFile) {
              this.post(file);
            }
          },
          err => {
            // tslint:disable-next-line:no-unused-expression
            console && console.log(err);
          },
        );
      } else if (before !== false) {
        this.isVideo ? this.getTokenAndUploadVideo(file) : this.post(file);
      }
    }
  }

  getTokenAndUploadVideo(file) {
    this.http
      .get(`/api/topic/getUploadVideoToken`)
      .pipe(
        map(getData),
        switchMap(({ file_name, token }) => {
          return of({
            token,
            key: file_name,
          });
        }),
      )
      .subscribe(({ key, token }) => {
        this.nzData = {
          key,
          token,
        };
        this.post(file);
      });
  }

  abort(file) {
    if (file) {
      const { uid } = file;
      this._reqs[uid].abort();
      delete this._reqs[uid];
    } else {
      Object.keys(this._reqs).forEach(uid => {
        if (this._reqs[uid]) {
          this._reqs[uid].abort();
        }
        delete this._reqs[uid];
      });
    }
  }

  post(file) {
    const { nzOnProgress, nzAccept, nzOnSuccess } = this;
    const { uid } = file;
    if (!attrAccept(file, nzAccept)) {
      return;
    }
    const request = this.nzCustomRequest || defaultRequest;

    if (typeof this.nzData === 'function') {
      this.nzData = this.nzData(file);
    }

    this._reqs[uid] = request({
      file,
      action: this.nzAction,
      filename: this.name,
      data: this.nzData,
      headers: this.nzHeaders,
      withCredentials: this.nzWithCredentials,
      onProgress: nzOnProgress
        ? event => {
            this.nzOnProgress.emit({ event, file });
          }
        : null,
      onSuccess: (ret, xhr) => {
        delete this._reqs[uid];
        this.nzOnSuccess.emit({ ret, file, xhr });
      },
      onError: (err, ret) => {
        delete this._reqs[uid];
        this.nzOnError.emit({ err, ret, file });
      },
    });
  }

  onClick(ev) {
    if (!this.nzDisabled) {
      this.inputElement.nativeElement.value = null;
      this.inputElement.nativeElement.click();
    }
  }
}
