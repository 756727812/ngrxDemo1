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
import { NzMessageService } from 'ng-zorro-antd';
import { merge, filter, remove } from 'lodash';

interface MagicInfo {
  imgUrl?: string;
  linkType?: number;
  target?: {
    id: string;
  };
  index?: any;
  selected?: boolean;
  rectangle?: {
    x1: string;
    x2: string;
    y1: string;
    y2: string;
  };
}

const linkTypeMap = {
  '-1': '拉起客服',
  '-2': '拉起分享',
};

@Component({
  selector: 'app-layout-magic',
  templateUrl: './layout-magic.component.html',
  styleUrls: ['./layout-magic.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LayoutMagicComponent),
      multi: true,
    },
  ],
})
export class LayoutMagicComponent implements OnInit, ControlValueAccessor {
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  uploading = false;
  showUpload = false;
  cubeArray = [];
  selectedArray: any = [];
  hoverArray = [];
  startPoint = [];
  endPoint = [];
  startObj = {
    x1: '',
    y1: '',
  };
  endObj = {
    x2: '',
    y2: '',
  };
  entyArray = [];
  selectedStyles = [];
  hoverStyles = {};
  selectedIndex = 0;
  isDefault = true;

  // ngModel Access
  @Input() _value: MagicInfo[];
  @Input() _configs: MagicInfo[];
  @Input() size: string = '4';

  private _onChange: (value: MagicInfo[]) => void = () => null;
  private _onTouched: () => void = () => null;

  get value(): MagicInfo[] {
    return this._value;
  }

  set value(val: MagicInfo[]) {
    this._value = val;
    this._onChange(val);
  }
  get configs(): MagicInfo[] {
    return this._configs;
  }

  set configs(val: MagicInfo[]) {
    this._configs = val;
    this._onChange(val);
  }
  constructor(private nzMessageService: NzMessageService) {}

  ngOnInit() {
    for (let i = 0; i < Number(this.size); i += 1) {
      for (let j = 0; j < Number(this.size); j += 1) {
        this.cubeArray.push([j, i]);
      }
    }
  }
  mousedown(val) {
    // console.log('mouseDown', val);
    if (this.startPoint.length) {
      this.clickHover();
    } else {
      this.startPoint = val;
      this.startObj = {
        x1: val[0],
        y1: val[1],
      };
      const config = { x1: val[0], y1: val[1], x2: val[0] + 1, y2: val[1] + 1 };
      this.hoverArray = [config];
      this.drawArea(config, 0);
      this.entyArray.push(val.join());
    }
  }
  mouseenter(val) {
    // console.log('mouseEnter', val);
    if (this.startPoint.length) {
      const config = {
        x1: this.startObj.x1 < val[0] ? this.startObj.x1 : val[0],
        y1: this.startObj.y1 < val[1] ? this.startObj.y1 : val[1],
        x2: (this.startObj.x1 > val[0] ? this.startObj.x1 : val[0]) + 1,
        y2: (this.startObj.y1 > val[1] ? this.startObj.y1 : val[1]) + 1,
      };
      const ischecked = this.intersection(config);
      if (ischecked) {
        this.hoverArray = [config];
        this.drawArea(config, 0);
        this.entyArray.push(val.join());
        // console.log('config', config);
      }
    }
  }
  mouseleave() {
    this.hoverArray = [];
    this.startPoint = [];
    this.endPoint = [];
  }
  // 判断矩形是否有交集
  intersection(config) {
    let isChecked = true;
    const checkArray = [];
    if (this.selectedArray.length) {
      this.selectedArray.forEach((item, i) => {
        const minx = Math.max(config.x1, item.rectangle.x1);
        const miny = Math.max(config.y1, item.rectangle.y1);
        const maxx = Math.min(config.x2, item.rectangle.x2);
        const maxy = Math.min(config.y2, item.rectangle.y2);
        if (minx >= maxx || miny >= maxy) {
          // 不相交
          checkArray[i] = true;
        } else {
          checkArray[i] = false;
        }
      });
    }
    return (isChecked = checkArray.indexOf(false) > -1 ? false : true);
  }
  removeCover(i) {
    // 移除布局
    this.startPoint = [];
    this.endPoint = [];
    this.selectedStyles = [];
    const deletIndex = this.selectedArray[i].index;
    this.selectedArray.length > 1
      ? i === 0
        ? this.selectedArray.shift()
        : this.selectedArray.splice(i, 1)
      : (this.selectedArray = []);
    this.selectedArray.forEach((item, index) => {
      this.drawArea(item.rectangle, 1);
    });
    this.removeConfig(deletIndex);
    /////
    this._emitNgModelChange();
    this.valueChange.emit();
  }
  removeConfig(i) {
    // 移除图片
    this.configs = remove(this._configs, item => {
      return item.index !== i;
    });
    if (this.isDefault) {
      this.selectedArray = this.configs;
    }
    // 默认选择第一个
    if (this.selectedArray.length) {
      this.selectedCover(0);
    }
  }
  clickHover() {
    this.selectedArray.push({
      rectangle: { ...this.hoverArray[0] },
      selected: false,
      index: '',
      imgUrl: '',
    });
    this.startPoint = this.endPoint = [];
    this.drawArea(this.hoverArray[0], 1);
    this.hoverArray = [];
    this.value = this.selectedArray;
    this.valueChange.emit();
    this.selectedCover(this.value.length - 1);
  }
  /*绘制选中区域*/
  drawArea(obj, type) {
    const _unitSize = (344 - Number(this.size)) / Number(this.size);
    const left = _unitSize * obj.x1;
    const top = _unitSize * obj.y1;
    const width = _unitSize * (obj.x2 - obj.x1);
    const height = _unitSize * (obj.y2 - obj.y1);
    const style = {
      top: `${top}px`,
      left: `${left}px`,
      width: obj.x2 === 4 ? `${width}px` : `${width - 1}px`,
      height: obj.y2 === 4 ? `${height}px` : `${height - 1}px`,
      lineHeight: `${height}px`,
      rw: Math.round((750 / Number(this.size)) * (obj.x2 - obj.x1)),
      rh: Math.round((750 / Number(this.size)) * (obj.y2 - obj.y1)),
      cw: width,
      ch: height,
    };
    if (type === 1) {
      this.selectedStyles.push(style);
    } else {
      this.hoverStyles = style;
    }
  }
  selectedCover(i) {
    this.showUpload = true;
    this.startPoint = this.endPoint = [];
    this.hoverArray = [];
    this.selectedArray.filter(item => {
      item.selected = false;
    });
    const _item = this.selectedArray[i];
    _item.selected = true;
    _item.index = [
      _item.rectangle.x1,
      _item.rectangle.y1,
      _item.rectangle.x2,
      _item.rectangle.y2,
    ].join('');
    this.selectedIndex = _item.index;
    // this._emitNgModelChange();
  }
  // 触发 ngModel 变化，改变外部值
  private _emitNgModelChange() {
    this._onChange(this.selectedArray);
    this.showUpload = this.selectedArray.length;
  }
  // 获取图片信息
  getConfigs() {
    this.isDefault = false;
    this.selectedArray.forEach((item, i) => {
      const _index = [
        item.rectangle.x1,
        item.rectangle.y1,
        item.rectangle.x2,
        item.rectangle.y2,
      ].join('');
      if (item.selected === true) {
        this.selectedArray[i] = merge(
          item,
          filter(this.configs, { index: _index })[0],
        );
      }
    });
    this.value = this.selectedArray;
    this.valueChange.emit();
  }
  getLoadingStatus(status) {
    this.uploading = status;
  }
  private _setValue(val: MagicInfo[]) {
    this.selectedStyles = [];
    this._value = val
      ? val.map((item, i) => {
          const obj: any = { ...item };
          if ([-1, -2].indexOf(obj.linkType) > -1) {
            obj.target = {
              itemName: linkTypeMap[obj.linkType],
            };
          }
          if (!obj.index) {
            obj.index = [
              obj.rectangle.x1,
              obj.rectangle.y1,
              obj.rectangle.x2,
              obj.rectangle.y2,
            ].join('');
            obj.selected = false;
            // this.drawArea(item.rectangle, 1);
          }
          this.drawArea(item.rectangle, 1);
          return obj;
        })
      : [];
    this.selectedArray = this._value;
    this._configs = this._value;
    this.value = this.selectedArray;
    // 怪异现象：初始化进入魔方，删除布局后出现整个布局情况。用个标记记录是否是初始化
    this.isDefault = true;
  }

  /* model access start */

  writeValue(value: MagicInfo[]) {
    this._setValue(value);
  }

  registerOnChange(fn: (_: MagicInfo[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /* model access end */
}
