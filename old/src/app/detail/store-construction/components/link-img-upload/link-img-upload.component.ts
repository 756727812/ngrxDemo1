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
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import {NzBasicUploadComponent} from '../ignore-this-after-zorro-upload-pr-complete/nz-basic-upload.component';
import {isEqual, some, isEmpty, merge, times, filter} from 'lodash';
import {
  NzRangePickerComponent,
  NzModalService,
  NzMessageService,
} from 'ng-zorro-antd';
import {DatePipe} from '@angular/common';
import {CtrlPaneService} from '../../services/ctrl-pane.service';
import {CODES} from 'app/utils';
import {getItem} from '@utils/storage';

enum ShowType {
  ALWAYS = 1,
  RANGE = 2,
}

enum LINK_TYPE {
  GOODS = 0,
  ARTICLE = 1,
  GROUPON = 2,
  MICRO_PAGE = 3,
  MAGIC_CUSTOM = -1,
  MAGIC_SHARE = -2,
}

interface BannerLink {
  name?: string;
  imgUrl?: string;
  linkType?: number;
  /*link类型0=商品 1=商品合集 2=团购商品 3=微页面*/
  target?: {
    itemName?: string;
    articleTitle?: string;
    id: string;
    micropageName?: string;
  };
  rectangle?: object;
  showType?: number;
  /*1=长期显示,2=时间段显示*/
  startTime?: string;
  /*开始时间*/
  endTime?: string;
  /*结束时间*/

  // 临时属性
  _dateRange?: Date[];
  _id?: number;
  index?: any;
}

const MS_ONE_DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-link-img-upload',
  templateUrl: './link-img-upload.component.html',
  styleUrls: ['./link-img-upload.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LinkImgUploadComponent),
      multi: true,
    },
    DatePipe,
    CtrlPaneService,
  ],
})
export class LinkImgUploadComponent implements OnInit, ControlValueAccessor {
  @ViewChild(NzBasicUploadComponent) basicUpload: NzBasicUploadComponent;
  @ViewChildren(NzRangePickerComponent) datePickers: NzRangePickerComponent[];

  @Input() multiple: boolean = true;
  @Input() standaloneTime: boolean = true;
  @Input() sIndex: any = null; // 魔方用，如果传入值则上传文件列表只显示索引为该值的文件，其它文件不显示
  @Input() limit: number = 6;
  @Input() limitSize: number = 0;
  @Input() limitWidth: number;
  @Input() limitHeight: number;
  @Input() kolId: number;
  @Input() xdpId: number;
  @Input() isMagic: boolean = false;

  uploading = false;
  counter = 0;
  goodsIdList = [];
  LINK_TYPE = LINK_TYPE;
  sortableOptions: any;

  // ngModel Access
  @Input() _value: BannerLink[];
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLoading = new EventEmitter<any>();

  _disabledDate(current: Date): boolean {
    return current && current.getTime() < Date.now() - MS_ONE_DAY;
  }

  // {
  //   imgUrl: null,
  //   linkType: null,
  //   target: null,
  //   showType: null,
  //   startTime: null /*开始时间*/,
  //   endTime: null /*结束时间*/,
  // };

  private _onChange: (value: BannerLink[]) => void = () => null;
  private _onTouched: () => void = () => null;

  nzShowTime = {};

  get value(): BannerLink[] {
    return this._value;
  }

  set value(val: BannerLink[]) {
    this._value = val;
    this._emitNgModelChange();
  }

  get isAdmin() {
    return [CODES.Super_Admin, CODES.Elect_Admin].includes(
      getItem('seller_privilege') >>> 0,
    );
  }

  constructor(
    private datePipe: DatePipe,
    private modelService: NzModalService,
    private ctrlPaneService: CtrlPaneService,
    private nzMessageService: NzMessageService,
  ) {
    this.sortableOptions = {
      onUpdate: () => {
        // console.log(this._value);
        this._emitNgModelAndValueChange();
      },
    };
  }

  private _setValue(val: BannerLink[]) {
    this._value = val
      ? val.map(item => {
        const obj = {...item};
        if (!obj._id) {
          // tslint:disable-next-line
          obj._id = this.counter++;

          if (this.standaloneTime) {
            obj._dateRange = [null, null];
            const {startTime, endTime} = obj;
            if (startTime) {
              obj._dateRange[0] = new Date(startTime);
            }
            if (endTime) {
              obj._dateRange[1] = new Date(endTime);
            }
          }
          delete obj.startTime;
          delete obj.endTime;
        }
        return obj;
      })
      : [];
  }

  formatDate(date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }

  ngOnInit() {
  }

  beforeUpload = file => {
    return Observable.create(observer => {
      // TODO 取组件的 nzAccept 来对比靠谱点
      if (
        file &&
        file.type &&
        'image/jpg, image/jpeg, image/png, image/gif'.indexOf(file.type) === -1
      ) {
        this.nzMessageService.warning(
          '请上传 jpg、jpeg、png 或 gif 格式的图片',
        );
        this.uploading = false;
        observer.next(false);
        observer.complete();
      } else if (
        file &&
        file.size &&
        this.limitSize &&
        file.size / 1024 > this.limitSize
      ) {
        this.nzMessageService.warning(
          `图片最大允许 ${this.limitSize}KB，当前文件大小：${file.size /
            1024}KB `,
        );
        this.uploading = false;
        observer.next(false);
        observer.complete();
      } else if (file && this.limitWidth && this.limitHeight) {
        this.checkImgSize(file, this.limitWidth, this.limitHeight)
          .then(result => {
            if (!result) {
              this.nzMessageService.warning(
                `请上传 ${this.limitWidth}x${this.limitHeight} 尺寸的图片`,
              );
              this.uploading = false;
              observer.next(false);
              observer.complete();
            } else {
              observer.next(true);
              observer.complete();
            }
          })
          .catch(err => {
            this.nzMessageService.warning(err);
            this.uploading = false;
            observer.next(false);
            observer.complete();
          });
      } else {
        observer.next(true);
        observer.complete();
      }
    });
  };

  // 检验图片长宽
  checkImgSize(file, limitWidth, limitHeight) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== limitWidth || img.height !== limitHeight) {
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        resolve('图片尺寸校验出错');
      };
      img.src = window.URL.createObjectURL(file);
    });
  }

  clearDateRange(i) {
    this._value[i]._dateRange = [null, null];
    this._emitNgModelAndValueChange();
  }

  // 触发 ngModel 变化，改变外部值
  private _emitNgModelChange() {
    this._onChange(this.format());
  }

  private _emitNgModelAndValueChange() {
    this._emitNgModelChange();
    this.valueChange.emit(); // 这是通知外部，组件值已经改变
  }

  private format() {
    return this._value.map(item => {
      const obj = merge({}, item);
      const [dateStart, dateEnd] = item._dateRange || [null, null];
      Object.assign(obj, {
        startTime: dateStart ? this.formatDate(dateStart) : null,
        endTime: dateEnd ? this.formatDate(dateEnd) : null,
      });
      obj.showType = dateStart || dateEnd ? ShowType.RANGE : ShowType.ALWAYS;
      Object.keys(obj).forEach(key => {
        if (/^_/.test(key)) {
          delete obj[key];
        }
      });
      if (obj.target) {
        delete obj.target.itemName;
        delete obj.target.articleTitle;
      }
      return obj;
    });
  }

  handleDateRangeNgModelChange(item, dateRange) {
    setTimeout(() => {
      this._emitNgModelAndValueChange();
    }, 400);
  }

  openDatePicker(index) {
    const picker = this.datePickers.find((v, i) => i === index);
    if (picker) {
      picker._openCalendar();
    }
  }

  openGoodsPicker(index) {
    const svc$ =
      this.kolId && this.xdpId
        ? this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.GOODS_LINK,
            [],
            this.kolId,
            this.xdpId,
          )
        : this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.GOODS_LINK,
          );

    svc$.subscribe(value => {
      if (value && value.item_id) {
        if (this._value[index]) {
          Object.assign(this._value[index], {
            linkType: LINK_TYPE.GOODS,
            target: {
              id: value.item_id,
              itemName: value.item_name,
            },
          });
          this._emitNgModelAndValueChange();
        }
      }
    });
  }

  openArticlePicker(index) {
    const svc$ =
      this.kolId && this.xdpId
        ? this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.ARTICLE,
            [],
            this.kolId,
            this.xdpId,
          )
        : this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.ARTICLE,
          );

    svc$.subscribe(value => {
      if (value && value.article_id) {
        if (this._value[index]) {
          Object.assign(this._value[index], {
            linkType: LINK_TYPE.ARTICLE,
            target: {
              id: value.article_id,
              articleTitle: value.title,
            },
          });
          this._emitNgModelAndValueChange();
        }
      }
    });
  }

  openGrouponPicker(index) {
    const svc$ =
      this.kolId && this.xdpId
        ? this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.GROUPON,
            [],
            this.kolId,
            this.xdpId,
          )
        : this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.GROUPON,
          );

    svc$.subscribe(value => {
      if (value && value.id) {
        if (this._value[index]) {
          Object.assign(this._value[index], {
            linkType: LINK_TYPE.GROUPON,
            target: {
              id: value.id,
              activityName: value.activityName,
            },
          });
          this._emitNgModelAndValueChange();
        }
      }
    });
  }

  openMicroPagePicker(index) {
    const svc$ =
      this.kolId && this.xdpId
        ? this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.MICRO_PAGE,
            [],
            this.kolId,
            this.xdpId,
          )
        : this.ctrlPaneService.openModalForAdd(
            CtrlPaneService.MODAL_TYPE.MICRO_PAGE,
          );

    svc$.subscribe(value => {
      if (value && value.id) {
        if (this._value[index]) {
          Object.assign(this._value[index], {
            linkType: LINK_TYPE.MICRO_PAGE,
            target: {
              id: value.id,
              micropageName: value.name || value.micropageName,
            },
          });
          this._emitNgModelAndValueChange();
        }
      }
    });
  }

  removeLinkTarget(index) {
    if (this._value[index]) {
      Object.assign(this._value[index], {
        linkType: null,
        target: null,
      });
      this._emitNgModelAndValueChange();
      this.modelService.info({
        content: '确认移除跳转地址？移除后，点击发布生效',
      });
    }
  }

  pullShare(e: MouseEvent, itemName: any, index: number) {
    if (this._value[index]) {
      Object.assign(this._value[index], {
        linkType: -2,
        target: {
          itemName,
        },
      });
      this._emitNgModelAndValueChange();
    }
  }

  pullCustom(e: MouseEvent, itemName: any, index: number) {
    if (this._value[index]) {
      Object.assign(this._value[index], {
        linkType: -1,
        target: {
          itemName,
        },
      });
      this._emitNgModelAndValueChange();
    }
  }

  handleEditClick() {
    if (this.basicUpload && this.basicUpload.onClick) {
      this.basicUpload.onClick(null);
    }
  }

  handleRemoveClick(i) {
    this.modelService.confirm({
      content: '确认删除当前宣传图？删除后，点击发布生效',
      onOk: () => {
        this.value = [...this._value.slice(0, i), ...this._value.slice(i + 1)];
        this.valueChange.emit();
      },
    });
  }

  onProgress() {
    this.uploading = true;
    this.onLoading.emit(true);
  }

  onStart() {
    this.uploading = true;
    this.onLoading.emit(true);
  }

  onSuccess(resp) {
    try {
      const newObj: BannerLink = {
        // tslint:disable-next-line
        _id: this.counter++,
        imgUrl: resp.ret.data,
        showType: ShowType.ALWAYS,
        _dateRange: [null, null],
        index: this.sIndex,
      };
      if (this.sIndex !== null) {
        let isRep = false;
        this._value.forEach((item, i) => {
          if (item.index === this.sIndex) {
            this._value[i] = {...item, ...newObj};
            isRep = true;
          }
        });
        this.value = isRep ? this._value : [...this._value, newObj];
      } else {
        this.value = [...this._value, newObj];
      }
      this.valueChange.emit(resp.ret.data);
    } catch (e) {
    }
    this.uploading = false;
    this.onLoading.emit(false);
  }

  onError() {
    this.uploading = false;
    this.onLoading.emit(false);
  }

  /* model access start */

  writeValue(val: BannerLink[]) {
    const _val = filter(val, item => {
      return item.imgUrl ? true : false;
    });
    this._setValue(val);
  }

  registerOnChange(fn: (_: BannerLink[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /* model access end */
}
