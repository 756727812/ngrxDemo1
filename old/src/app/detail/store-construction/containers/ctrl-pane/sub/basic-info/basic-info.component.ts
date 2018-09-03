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
import { merge, head, get } from 'lodash';
import * as angular from 'angular';
import { EditorService } from '../../../../services';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import * as fromStore from '../../../../store';

export declare interface CtrlBasicInfoData {
  id?: number;
  type: number;
  name: string;
  introduct: string;
  logoImgUrl: string;
  links: any[];
  propagate?: any;
  topColor: string;
  couponColor: string;
  couponFontColor: string;
  txInvestImg: string;
  txInvestShow: number;
  txInvest: {
    show: number;
    imgUrl: string;
  };
}

@Component({
  selector: 'app-ctrl-widget-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.less'],
})
export class CtrlWidgetBasicInfoComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  @Input() data: CtrlBasicInfoData;
  isHowToUseVisible: boolean = false;
  get bannerLinksLen() {
    return (get(this.formGroup, 'value.bannerLinks') as any[]).length;
  }

  get isAdmin() {
    return [CODES.Super_Admin, CODES.Elect_Admin].includes(
      getItem('seller_privilege') >>> 0,
    );
  }

  constructor(
    private fb: FormBuilder,
    private store: Store<fromStore.StoreConstructionState>,
    private editorService: EditorService,
  ) {
    super();
  }

  handleBlock(flag: any) {
    console.log('handleBlock', flag);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  buildForm() {
    const bannerLink = head(get(this.data, 'config.links'));
    const formGroup = this.fb.group({
      name: [get(this.data, 'config.name'), []],
      introduct: [get(this.data, 'config.introduct'), []],
      logoImgUrl: [get(this.data, 'config.logoImgUrl')],
      topColor: [get(this.data, 'config.topColor')],
      show: [get(this.data, 'config.show')],
      couponColor: [get(this.data, 'config.couponColor')],
      couponFontColor: [get(this.data, 'config.couponFontColor')],
      txInvestImg: [get(this.data, 'config.txInvest.imgUrl')],
      txInvestShow: [get(this.data, 'config.txInvest.show') !== 0 ? 1 : 0],
      bannerLinks: [bannerLink ? [bannerLink] : []],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    formGroup.get('txInvestShow').valueChanges.subscribe(() => {
      setTimeout(() => {
        this.emitSave();
      });
    });
    formGroup.get('show').valueChanges.subscribe(() => {
      setTimeout(() => this.emitSave());
    });
    return formGroup;
  }

  getData() {
    const config = merge({}, this.formGroup.value);
    config.links = config.bannerLinks || [];
    config.txInvest = {
      imgUrl: config.txInvestImg,
      show: config.txInvestShow,
    };
    delete config.bannerLinks;
    const ret = {
      ...this.data,
      config,
    };
    return ret;
  }

  validationMessages = {
    name: {},
  };

  updateFormGroupValue(newData) {}

  resetToDefaultValue(type) {
    const config = {};
    switch (type) {
      case 'tc':
        config['topColor'] = '';
        break;
      case 'cc':
        config['couponColor'] = '';
        break;
      case 'cfc':
        config['couponFontColor'] = '';
        break;
      case 'img':
        config['txInvestImg'] = '';
        break;
    }
    this.formGroup.patchValue(config);
    setTimeout(() => {
      this.emitSave();
    });
    // this.buildForm();
  }
  resetColor(type) {
    const config = {};
    config[type] = this.formGroup.value[type];
    this.formGroup.patchValue(config);
    setTimeout(() => {
      this.emitSave();
    });
  }
}
