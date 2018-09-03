import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { CtrlWidgetBaseComponent } from '../base.component';
import { isEmpty, merge, head, get, findIndex, max } from 'lodash';
import * as angular from 'angular';
import { EditorService } from '../../../../services';
import { ImgLinkModel } from '../../../../models/editor.model';
import { getItem } from '@utils/storage';
import { CODES } from 'app/utils';

export declare interface CtrlMagicCubeData {
  id?: number;
  type: number;
  showType: string;
  userShowType: number;
  startTime: string;
  endTime: string;
  links: ImgLinkModel[];
}
@Component({
  selector: 'app-magic-cube',
  templateUrl: './magic-cube.component.html',
  styleUrls: ['./magic-cube.component.less'],
})
export class CtrlWidgetMagicCubeComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  @Input() data: CtrlMagicCubeData;

  constructor(private fb: FormBuilder, private editorService: EditorService) {
    super();
  }

  get existLink(): boolean {
    return !isEmpty(get(this.data, 'config.links'));
  }
  get isAdmin() {
    return [CODES.Super_Admin, CODES.Elect_Admin].includes(
      getItem('seller_privilege') >>> 0,
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getFormGroupFromInputData(data = this.data) {
    return {
      links: get(data, 'config.links') || [],
      showTime: {
        showType: data.showType || 1,
        dateRange: [
          data.startTime ? new Date(data.startTime) : null,
          data.endTime ? new Date(data.endTime) : null,
        ],
      },
      userShowType: data.userShowType || 0,
      marginType: get(data, 'config.marginType') || 1,
    };
  }

  updateFormGroupValue(newData) {
    this.formGroup.setValue(this.getFormGroupFromInputData(newData));
  }

  buildForm() {
    const initData = this.getFormGroupFromInputData();
    const formGroup = this.fb.group({
      links: [initData.links, [this.verifyPromotionList.bind(this)]],
      showTime: [initData.showTime],
      userShowType: [initData.userShowType],
      marginType: [initData.marginType],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    return formGroup;
  }
  verifyPromotionList(control: FormControl): { [s: string]: boolean } {
    if (!this.formGroup) {
      return null;
    }
    if (control.value) {
      if (control.value.length === 0) {
        return { required: true };
        // tslint:disable-next-line:no-else-after-return
      } else {
        if (findIndex(control.value, { imgUrl: '' }) > -1) {
          return { required: true };
        }
        // 判断一行是否填满
        // tslint:disable-next-line:one-variable-per-declaration
        let area = 0;
        const maxy = [];
        control.value.forEach(item => {
          if (item.rectangle) {
            area =
              area +
              (item.rectangle.x2 - item.rectangle.x1) *
                (item.rectangle.y2 - item.rectangle.y1);
            maxy.push(item.rectangle.y2);
          } else {
            const a = item.index.split('');
            area = area + (a[2] - a[0]) * (a[3] - a[1]);
            maxy.push(a[3]);
          }
        });
        // todo 动态获取魔方布局数
        if (area < max(maxy) * 4) {
          return { required: true };
        }
        return null;
      }
      // tslint:disable-next-line:no-else-after-return
    } else {
      return { required: true };
    }
  }
  getData() {
    const recommend = this.getRecommend();
    const config = merge(recommend, { magicSize: 4 }, this.formGroup.value);
    const data = {
      ...this.data,
      config,
    };
    const showTime = config.showTime;
    data.userShowType = config.userShowType;
    data.showType = showTime.showType;
    data.startTime = showTime.startTime;
    data.endTime = showTime.endTime;
    return data;
  }

  // 取是否显示推荐模块(支付完成页的魔方)
  getRecommend() {
    const recommend = localStorage.getItem('post_pay_recommend') || '0';
    return { recommend };
  }
  // validationMessages = {
  //   links: {
  //     required: '确保选定区域组合，占满整行，且不允许跨行',
  //   },
  // };
}
