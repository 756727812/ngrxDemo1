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
import { isEmpty, merge, head, get } from 'lodash';
import * as angular from 'angular';
import { EditorService } from '../../../../services';
import { ImgLinkModel } from '../../../../models/editor.model';
import { getItem } from '@utils/storage';
import { CODES } from 'app/utils';

export declare interface CtrlColImgData {
  id?: number;
  type: number;
  showType: string;
  marginType: number;
  userShowType: number;
  startTime: string;
  endTime: string;
  links: ImgLinkModel[];
}

@Component({
  selector: 'app-col-img',
  templateUrl: './col-img.component.html',
  styleUrls: ['./col-img.component.less'],
})
export class CtrlWidgetColImgComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  @Input() data: CtrlColImgData;

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
      marginType: get(data, 'config.marginType') || 1,
      links: get(data, 'config.links') || [],
      showTime: {
        showType: data.showType || 1,
        dateRange: [
          data.startTime ? new Date(data.startTime) : null,
          data.endTime ? new Date(data.endTime) : null,
        ],
      },
      userShowType: data.userShowType || 0,
    };
  }

  updateFormGroupValue(newData) {
    this.formGroup.setValue(this.getFormGroupFromInputData(newData));
  }

  buildForm() {
    const initData = this.getFormGroupFromInputData();
    const formGroup = this.fb.group({
      marginType: [initData.marginType || 1],
      links: [initData.links, [Validators.required]],
      showTime: [initData.showTime],
      userShowType: [initData.userShowType],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    // formGroup.get('marginType').valueChanges.subscribe(() => {
    //   setTimeout(() => {
    //     this.emitSave();
    //   });
    // });
    return formGroup;
  }

  getData() {
    // debugger;
    const config = merge({}, this.formGroup.value);
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
}
