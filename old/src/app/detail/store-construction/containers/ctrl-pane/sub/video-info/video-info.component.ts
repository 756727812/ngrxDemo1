import { Component, Input } from '@angular/core';
import { CtrlWidgetBaseComponent } from '../base.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadFile } from 'ng-zorro-antd';
import { cloneDeep, get, merge, omit } from 'lodash';
import { formatSrc } from 'app/utils';

function getFileName(s) {
  return (s && s.lastIndexOf('/') + 1) || '';
}

@Component({
  selector: 'app-video-info',
  templateUrl: './video-info.component.html',
  styleUrls: ['./video-info.component.less'],
})
export class CtrlWidgetVideoInfoComponent extends CtrlWidgetBaseComponent {
  @Input() data;
  constructor(private fb: FormBuilder) {
    super();
  }

  imgUrl: string = '';
  initImg: any[] = [];

  ngOnInit() {
    super.ngOnInit();
    if (get(this.data, 'config.coverImgUrl')) {
      this.initImg = [
        {
          uid: -1,
          status: 'done',
          name: getFileName(get(this.data, 'config.coverImgUrl')),
          url: get(this.data, 'config.coverImgUrl') || '',
        },
      ];
    }
  }

  buildForm(): FormGroup {
    const _showTime = {
      showType: this.data.showType || 1,
      dateRange: [
        this.data.startTime ? new Date(this.data.startTime) : null,
        this.data.endTime ? new Date(this.data.endTime) : null,
      ],
    };
    const formGroup = this.fb.group({
      videoUrl: [get(this.data, 'config.videoUrl') || '', Validators.required],
      showStyle: [get(this.data, 'config.showStyle') || 1],
      coverImgUrl: [get(this.data, 'config.coverImgUrl') || ''],
      showTime: [_showTime],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    return formGroup;
  }

  getData() {
    const { showType, startTime, endTime } = this.formGroup.value.showTime;
    const { videoUrl, showStyle, coverImgUrl } = this.formGroup.value;
    const data = {
      showType,
      startTime,
      endTime,
      config: {
        videoUrl,
        showStyle,
        coverImgUrl,
      },
    };
    return data;
  }
  uploadImgSuccess(value) {
    this.initImg = cloneDeep(value.fileList);
    this.imgUrl = formatSrc(value.imgUrl);
    this.formGroup.patchValue(
      {
        coverImgUrl: value.imgUrl,
      },
      {
        onlySelf: true,
      },
    );
    this.emitSave();
  }

  uploadImgError(value) {
    this.initImg = cloneDeep(value.fileList);
  }

  removeImg(value) {
    this.initImg = cloneDeep(value.fileList);
    this.imgUrl = '';
    this.formGroup.patchValue(
      {
        coverImgUrl: value.imgUrl,
      },
      {
        onlySelf: true,
      },
    );
    this.emitSave();
  }

  imgValid(mgData) {
    return true;
  }

  updateFormGroupValue(newData) {}

  private getVideoPoster() {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.setAttribute('crossorigin', 'anonymous');
      const that = this;
      video.addEventListener(
        'loadedmetadata',
        function loadedmetadata() {
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          }, 300);
        },
        false,
      );
      video.src = this.formGroup.value['videoUrl'];
    });
  }

  private uploadVideoPoster(data) {
    // const headers = new HttpHeaders();
    // headers.set('Content-Type', 'multipart/form-data');
    // var formData = new FormData();
    // formData.append('image', dataURItoBlob(data));
    // this.http
    //   .post('/api/auth/upload', formData, { headers })
    //   .pipe(map(getData))
    //   .subscribe(({ data: coverImgUrl }) => {
    //     this.formGroup.patchValue({ coverImgUrl });
    //     this.initImg = [
    //       {
    //         uid: 1,
    //         status: 'done',
    //         name: 'cover.png',
    //         url: coverImgUrl,
    //       },
    //     ];
    //     this.emitSave();
    //   });
  }
}
