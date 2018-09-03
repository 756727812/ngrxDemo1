import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { CtrlWidgetBaseComponent } from '../base.component';
import { isEmpty, merge, head, get, size } from 'lodash';
import * as angular from 'angular';
import { EditorService } from '../../../../services';
import { ImgLinkModel, ShowType } from '../../../../models/editor.model';
import { getItem } from '@utils/storage';
import { CODES } from 'app/utils';

export declare interface CtrlCarouselData {
  showType: ShowType;
  userShowType: number;
  id?: number;
  type: number;
  links: ImgLinkModel[];
  startTime: string;
  endTime: string;
  config: any;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.less'],
})
export class CtrlWidgetCarouselComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  @Input() data: CtrlCarouselData;

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
  get linksLen() {
    return size(this.formGroup.controls.links.value);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getFormGroupFromInputData(data = this.data) {
    return {
      links: get(data, 'config.links')||[],
      showTime: {
        showType: data.showType,
        startTime: data.startTime,
        endTime: data.endTime,
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
      links: [initData.links, [Validators.required]],
      showTime: [initData.showTime],
      userShowType: [initData.userShowType],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    return formGroup;
  }

  getData() {
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

    delete config.showTime;

    return data;
  }
}
