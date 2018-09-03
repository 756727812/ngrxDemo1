import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
  ViewChildren,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import {
  NzNotificationService,
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
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
export function sortableImgValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const itemList = control.value;
    return itemList.every(item => item.imgUrl)
      ? null
      : { missingImgs: { value: control.value } };
  };
}

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SortableImgComponent),
  multi: true,
};

@Component({
  selector: 'sortable-img',
  templateUrl: './sortable-img.component.html',
  styleUrls: ['./sortable-img.component.less'],
  providers: [VALUE_ACCESSOR],
})
export class SortableImgComponent implements ControlValueAccessor {
  @Input() disabledEdit: boolean = false;
  sortableOptions: any;
  sortableItems = [];
  onChange;
  onTouched;
  @Output('change') handleChange: EventEmitter<any> = new EventEmitter<any>();

  imgFileList = {};

  constructor(private nzMessageService: NzMessageService) {
    this.sortableOptions = {
      onUpdate: (event: any) => {
        this.emitData();
      },
    };
  }

  imgValid = (imgData: ImgData) => {
    const { type, sizeMB } = imgData;
    const typeValid = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/gif',
    ].includes(type);
    const sizeValid = sizeMB < 1;
    if (!typeValid) {
      this.nzMessageService.warning('图片格式不正确！');
    }
    if (typeValid && !sizeValid) {
      this.nzMessageService.warning('图片应小于1M！');
    }
    return typeValid && sizeValid;
  };

  updateImgUrl() {
    this.sortableItems.forEach(item => {
      const fileList = this.imgFileList[item._imgId].data;
      item.imgUrl =
        fileList.length && fileList[0].status === 'done'
          ? fileList[0].url || fileList[0].response.data
          : '';
    });
  }

  emitData() {
    const outputData = this.omitImgId(this.sortableItems);
    if (this.onChange) {
      this.onChange(outputData);
    }
    this.handleChange.emit(outputData);
  }

  omitImgId(sortableItems) {
    return sortableItems.map(item => _.omit(item, ['_imgId']));
  }

  uploadImgSuccess(value, id) {
    this.imgFileList[id].data = _.cloneDeep(value.fileList);
    this.updateImgUrl();
    this.emitData();
  }

  uploadImgError(value, id) {
    this.imgFileList[id].data = _.cloneDeep(value.fileList);
    this.updateImgUrl();
    this.emitData();
  }

  removeImg(value, id) {
    this.imgFileList[id].data = _.cloneDeep(value.fileList);
    this.updateImgUrl();
    this.emitData();
  }

  writeValue(obj: any): void {
    this.sortableItems = Array.isArray(obj)
      ? _.cloneDeep(obj).map((item, index) => {
          item._imgId = index;
          return item;
        })
      : [];

    const imgFileList = {};
    this.sortableItems.forEach(({ imgUrl, _imgId }) => {
      if (imgUrl) {
        imgFileList[_imgId] = {
          id: _imgId,
          data: [
            {
              uid: -1,
              status: 'done',
              url: formatSrc(imgUrl),
            },
          ],
        };
      } else {
        imgFileList[_imgId] = {
          id: _imgId,
          data: [],
        };
      }
    });
    this.imgFileList = imgFileList;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
