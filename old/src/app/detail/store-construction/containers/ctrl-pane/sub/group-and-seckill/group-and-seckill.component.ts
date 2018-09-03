import { Component, OnInit, Input } from '@angular/core';
import { CtrlWidgetBaseComponent } from '../base.component';
import { merge, isNil, omit, get } from 'lodash';

import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import {
  iconArray,
  getIconUrlByName,
} from 'app/detail/store-construction/components/icon-radio-group/icon-radio-group.component';
import {
  AddItemsService,
  IAddType,
  MODAL_TYPE,
} from 'app/detail/store-construction/services';
import { NzModalService } from 'ng-zorro-antd';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
const defaultForm = {
  [MODAL_TYPE.GROUP_BUY]: {
    mainTitle: '爆款拼团',
    subTitle: 'popular fight group',
    styleType: 3,
    method: 0,
    showCount: 16,
    icon: getIconUrlByName('stars'),
    addTitle: '添加拼团活动',
    addDesc: '可拖拽拼团活动卡片调整排列顺序',
    tips: '将获取小电铺的拼团活动并自动排序展示',
  },
  [MODAL_TYPE.GROUP_LOTTERY]: {
    mainTitle: '抽奖团',
    subTitle: 'lottery buy',
    icon: getIconUrlByName('gift'),
    addTitle: '添加拼团活动',
    addDesc: '抽奖团在首页只显示一个，可拖拽拼团活动卡片选择在首页展示的抽奖团',
    styleType: 1,
    method: 0,
    showCount: 3,
    tips: '将获取小电铺的抽奖团活动并自动排序展示',
  },
  [MODAL_TYPE.SPEED_KILL]: {
    mainTitle: '惊喜秒杀',
    subTitle: 'flash sale',
    icon: getIconUrlByName('flash'),
    addTitle: '添加秒杀活动',
    addDesc: '可拖拽秒杀活动卡片调整排列顺序',
    styleType: 1,
    method: 0,
    showCount: 8,
    tips: '将获取小电铺的秒杀活动并自动排序展示',
  },
};

@Component({
  selector: 'app-ctrl-widget-group-and-seckill',
  templateUrl: './group-and-seckill.component.html',
  styleUrls: ['./group-and-seckill.component.less'],
})
export class CtrlWidgetGroupAndSeckillComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  parserInt = value => parseInt(value, 10);
  _type: string;
  currentType: IAddType;
  limit: number = 0;
  defaultValue: any = {};
  @Input() data;
  @Input()
  set currentModalType(value: string) {
    this._type = value;
    this.currentType = this.addItemSrv.getCurrentType(value);
    this.limit = this.currentType.limit;
    this.defaultValue = defaultForm[this._type];
  }

  // TODO 最好还是 ngmodel 绑定，然后对应表单组件做好 value 保护，保证空数组
  get promotionListLen() {
    return get(this.formGroup, 'controls.promotionList.value.length', 0);
  }

  get isGroupBuy() {
    return this._type === MODAL_TYPE.GROUP_BUY;
  }
  get isSkill() {
    return this._type === MODAL_TYPE.SPEED_KILL;
  }
  get isLotteryGroup() {
    return this._type === MODAL_TYPE.GROUP_LOTTERY;
  }
  get isAdmin() {
    return [CODES.Super_Admin, CODES.Elect_Admin].includes(
      getItem('seller_privilege') >>> 0,
    );
  }
  constructor(private fb: FormBuilder, private addItemSrv: AddItemsService) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getFormGroupFromInputData(data = this.data) {
    const defaultValue = this.defaultValue;
    const showType = data.showType || 1;
    const method = data.config.method || 0;
    return {
      // TODO 用 get(this.data, 'mainTitle', defaultValue.mainTitle)
      mainTitle: get(data, 'mainTitle', defaultValue.mainTitle),
      subTitle: get(data, 'subTitle', defaultValue.subTitle),
      styleType: get(data, 'config.styleType', defaultValue.styleType),
      showCount: get(data, 'config.showCount', defaultValue.showCount),
      method: get(data, 'config.method', defaultValue.method),
      icon: get(data, 'icon', defaultValue.icon),
      promotionList: get(data, 'config.targets', []),
      activityTime: {
        startTime:
          method === 2 && data.config.startTime ? data.config.startTime : null,
        endTime:
          method === 2 && data.config.endTime ? data.config.endTime : null,
      },
      showTime: {
        showType,
        startTime: showType === 2 && data.startTime ? data.startTime : null,
        endTime: showType === 2 && data.endTime ? data.endTime : null,
      },
    };
  }

  updateFormGroupValue(newData) {
    this.formGroup.setValue(this.getFormGroupFromInputData(newData));
  }

  buildForm() {
    const showType = this.data.showType || 1;
    const _showTime = {
      showType,
      startTime:
        showType === 2 && this.data.startTime ? this.data.startTime : null,
      endTime: showType === 2 && this.data.endTime ? this.data.endTime : null,
    };
    const initData = this.getFormGroupFromInputData();
    const formGroup = this.fb.group({
      mainTitle: [
        initData.mainTitle,
        [
          /*this.buildRequiredWith('subTitle'),*/
          this.verifyInputMaxLength(6).bind(this),
        ],
      ],
      subTitle: [
        initData.subTitle,
        [
          /*this.buildRequiredWith('mainTitle'),*/
          this.verifyInputMaxLength(12).bind(this),
        ],
      ],
      styleType: [initData.styleType, this.verifyStyleType],
      showCount: [initData.showCount],
      method: [initData.method],
      icon: [initData.icon],
      promotionList: [initData.promotionList, [this.verifyCommon.bind(this)]],
      activityTime: [initData.activityTime, [this.verifyCommon.bind(this)]],
      showTime: [initData.showTime],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    return formGroup;
  }

  getData() {
    const { showType, startTime, endTime } = this.formGroup.value.showTime;
    const targets = this.formGroup.value.promotionList;
    const {
      startTime: aStartTime,
      endTime: aEndTime,
    } = this.formGroup.value.activityTime;
    const data = merge(
      {},
      omit(this.formGroup.value, 'promotionList', 'showTime', 'activityTime'),
      {
        showType,
        startTime,
        endTime,
        config: {
          targets,
          styleType:
            this.isGroupBuy || this.isSkill
              ? this.formGroup.value.styleType
              : undefined,
          method: this.formGroup.value.method,
          showCount: this.formGroup.value.showCount,
          startTime: aStartTime,
          endTime: aEndTime,
        },
      },
    );
    return data;
  }

  resetForm() {
    const {
      mainTitle,
      subTitle,
      icon,
      styleType,
      method,
      showCount,
    } = this.defaultValue;
    this.formGroup.patchValue({
      mainTitle,
      subTitle,
      icon,
      method,
      showCount,
      styleType: this.isGroupBuy || this.isSkill ? styleType : undefined,
    });
    this.emitSave();
  }

  // verifyPromotionList(control: FormControl): { [s: string]: boolean } {
  //   if (!this.formGroup || this.formGroup.value.method === 2) {
  //     return null;
  //   }
  //   if (control.value && control.value.length === 0) {
  //     return { required: true };
  //   }
  //   return null;
  // }
  // verifyActivityTime(control: FormControl): { [s: string]: boolean } {
  //   if (!this.formGroup || this.formGroup.value.method === 0) {
  //     return null;
  //   }
  //   const { startTime, endTime } = control.value;
  //   if (
  //     this.formGroup.value.method === 2 &&
  //     (isNil(startTime) || isNil(endTime))
  //   ) {
  //     return { required: true };
  //   }
  //   return null;
  // }
  // “手动添加”和“活动模式”统一验证
  verifyCommon(control: FormControl): { [s: string]: boolean } {
    if (!this.formGroup) {
      return null;
    }
    if (this.formGroup.value.method === 0) {
      if (control.value && control.value.length === 0) {
        return { required: true };
      }
      return null;
      // tslint:disable-next-line:no-else-after-return
    } else if (this.formGroup.value.method === 2) {
      const { startTime, endTime } = control.value;
      if (isNil(startTime) || isNil(endTime)) {
        return { required: true };
      }
      return null;
    }
    return null;
  }

  private verifyStyleType = (control: FormControl): ValidationErrors => {
    if (!this.formGroup) {
      return null;
    }
    if (this.isGroupBuy && !control.value) {
      return { required: true };
    }
    return null;
  };

  validationMessages = {
    mainTitle: {
      maxLengthFor6: '输入长度不能超过6个字',
    },
    subTitle: {
      maxLengthFor12: '输入长度不能超过12个字',
    },
    // icon: {
    //   required: '请选择标题图标',
    // },
    // promotionList: {
    //   required: '请添加至少一个活动',
    // },
    // showTime: {
    //   required: '请选择模块显示时间',
    // },
  };
}
