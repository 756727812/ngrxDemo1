import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import * as _ from 'lodash';
import { formatSrc } from 'app/utils';

type ImgData = {
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  type?: string;
  sizeKB?: number;
  sizeMB?: number;
  url?: string;
};

// 自定义验证器
export function seeImgUploadValidatorNg1(status: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const imgList = control.value;
    return imgList.length && imgList.every(img => img.status === status)
      ? null
      : { imgsWrongStatus: { value: control.value } };
  };
}

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SeeImgUploadComponentNg1),
  multi: true,
};

@Component({
  selector: 'ng1-see-img-upload',
  templateUrl: 'img-upload.component.html',
  styleUrls: ['img-upload.component.less'],
  providers: [VALUE_ACCESSOR],
})
export class SeeImgUploadComponentNg1 implements OnInit, ControlValueAccessor {
  @Input() disabledEdit: boolean = false;
  @Input() imgCount: number = 1; // 上传图片数量
  @Input() uploadText: string = 'Upload'; // 上传文字提示
  @Input() showPopupMsg: boolean = true; // 展示上传成功或失败的消息提示
  @Input() apiUrl: string = '/api/auth/upload'; // 后端api路径
  @Input() imgValid: (imgData: ImgData) => boolean = () => true; // 上传前的校验，返回false阻止上传

  /**
   * 初始状态就已存在的文件列表
   *   example:
        initFileList = [{
          uid: -1,
          name: 'xxx.png',
          status: 'done',
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        }];
   *
   */
  @Input('initFileList')
  set initFileList(value: any[]) {
    this.fileList = _.cloneDeep(value);
  }

  @Output() onUploadSuccess = new EventEmitter<any>(); // 成功回调
  @Output() onUploadError = new EventEmitter<any>(); // 失败回调
  @Output() onRemoveImg = new EventEmitter<any>(); // 移除图片回调

  constructor(private msg: NzMessageService) {}

  fileList = [];
  previewImage = '';
  previewVisible = false;

  curOriginFile: File;

  propagateChange: any;

  ngOnInit() {}

  ngAfterViewChecked() {
    this.fixImgPreviewBtnType();
  }

  fixImgPreviewBtnType() {
    const btns = document.querySelectorAll(
      '.nz-file-upload nz-modal button.ant-modal-close',
    );
    const len = btns.length;
    for (let i = 0; i < len; i = i + 1) {
      const curType = btns.item(i).getAttribute('type');
      if (curType !== 'button') {
        btns.item(i).setAttribute('type', 'button');
      }
    }
  }

  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  async onFileChange(value) {
    const { file, fileList } = value;
    const { name, uid } = file;
    if (file.status === 'done') {
      if (file.response.result === 1 && file.response.data.length) {
        if (this.showPopupMsg) {
          this.msg.success('图片上传成功！');
        }
        const imgData: ImgData = await this.readImageData(this.curOriginFile);
        imgData.url = formatSrc(file.response.data);
        const curImg = _.find(fileList, { uid });
        Object.assign(curImg, imgData);
        Object.assign(file, imgData);
        this.onUploadSuccess.emit({
          uid,
          name,
          file,
          fileList,
          imgUrl: file.response.data,
        });
        this.formControlData(fileList);
        console.log('img-upload success:', file.response.data);
      } else {
        // 接口调通，后端返回出错
        if (this.showPopupMsg) {
          this.msg.warning('图片上传失败！');
        }
        this.setImgErrStatus(file.uid);
        this.onUploadError.emit({
          file,
          fileList,
          errMsg: file.response.msg,
        });
        this.formControlData(fileList);
        console.log('img-upload error:', file.response.msg);
      }
    }
    if (file.status === 'error') {
      // 接口调不通
      if (this.showPopupMsg) {
        this.msg.warning('图片上传失败！');
      }
      this.onUploadError.emit({
        file,
        fileList,
        errMsg: file.error,
      });
      this.formControlData(fileList);
      console.log('img-upload error:', file.error);
    }
    if (file.status === 'removed') {
      this.onRemoveImg.emit({
        uid,
        name,
        file,
        fileList,
      });
      this.formControlData(fileList);
      console.log('img-upload remove:', file);
    }
  }

  // form control
  formControlData(outputData) {
    if (this.propagateChange) {
      this.propagateChange(outputData);
    }
  }

  setImgErrStatus(uid) {
    const curImg = _.find(this.fileList, { uid });
    curImg.status = 'error';
  }

  readImageData(file, getSizeFun = this.getMoreSize) {
    return new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        const image = new Image();
        const data: ImgData = {};
        reader.readAsDataURL(file);
        reader.onload = function(event: Event) {
          image.src = event.target['result'];
          image.onload = function() {
            data['width'] = (<any>this).width;
            data['height'] = (<any>this).height;
            data['type'] = file.type;
            data['name'] = file.name;
            data['size'] = file.size;
            Object.assign(data, getSizeFun(file.size));
            resolve(data);
          };
          image.onerror = function() {
            reject('不正确的格式: ' + file.type);
          };
        };
      } else {
        reject('请选择文件');
      }
    });
  }

  getMoreSize(size) {
    return {
      sizeKB: size / 1024,
      sizeMB: size / 1024 / 1024,
    };
  }

  /* beforeUpload = async (file: File) => {
    try {
      const imgData: ImgData = await this.readImageData(file);
      const isValid: boolean = this.imgValid(imgData);

      console.log('imgData', imgData);
      console.log('isValid', isValid);

      return isValid;
    } catch (error) {
      console.log('readImageData error:', error);
      return false;
    }
  }; */

  beforeUpload = (file: File) => {
    this.curOriginFile = file;
    const imgData: ImgData = _.pick(file, ['type', 'name', 'size']);
    Object.assign(imgData, this.getMoreSize(file.size));
    const isValid: boolean = this.imgValid(imgData);
    return isValid;
  };

  writeValue(value: any) {
    if (value) {
      this.fileList = value;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}
}
