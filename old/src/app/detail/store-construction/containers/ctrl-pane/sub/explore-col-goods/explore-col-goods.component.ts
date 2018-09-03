import { MODAL_TYPE } from 'app/detail/store-construction/services/add-items.service';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { CtrlWidgetBaseComponent } from '../base.component';
import { merge, get, size } from 'lodash';
import * as moment from 'moment';
import { ModalHelper } from '@shared/services';

import { ModalAddItems } from 'app/detail/store-construction/components';
import { NzModalService } from 'ng-zorro-antd';
import {
  AddItemsService,
  IAddType,
} from 'app/detail/store-construction/services';
import {
  iconArray,
  getIconUrlByName,
} from 'app/detail/store-construction/components/icon-radio-group/icon-radio-group.component';

import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-ctrl-widget-explore-col-goods',
  templateUrl: './explore-col-goods.component.html',
  styleUrls: ['./explore-col-goods.component.css'],
})
export class CtrlWidgetExploreColGoodsComponent extends CtrlWidgetBaseComponent
  implements OnInit {
  parserInt = value => parseInt(value, 10);
  _type: string;
  currentType: IAddType;
  limit: number = 0;
  defaultValue: any = {
    mainTitle: '爆款推荐',
    subTitle: 'Explosion recommended',
    icon: getIconUrlByName('good'),
    styleType: 1,
    method: 0,
    showCount: 10,
    orderRule: 0,
    tips: '符合规则的商品将自动展示在商城对应模块内',
  };
  orderRules = [
    {
      label: '新品优先',
      value: 0,
    },
    {
      label: '销量优先',
      value: 1,
    },
  ];
  @Input() data;
  @Input()
  set currentModalType(value: string) {
    this._type = value;
    this.currentType = this.addItemSrv.getCurrentType(value);
    this.limit = this.currentType.limit;
    // this.defaultValue = defaultForm[this._type];
  }
  sortableItems: any[] = [];
  MODAL_TYPE = MODAL_TYPE;
  constructor(
    private fb: FormBuilder,
    private modalHelper: ModalHelper,
    private addItemSrv: AddItemsService,
    private confirmServ: NzModalService,
  ) {
    super();
  }

  get goodsLen() {
    return size(this.formGroup.controls.goodsList.value);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  buildForm() {
    // TODO 去这一个转换。选择商品列表换成java？
    const targets = get(this.data, 'config.targets', []);
    const _goodsList = targets.map(v => ({
      item_id: v.id,
      item_name: v.itemName,
      imgurl: v.mainImgUrl,
      item_price: v.dailyPrice,
      ori_price: v.oriPrice,
      added: true,
    }));
    const _showTime = {
      showType: this.data.showType || 1,
      dateRange: [
        this.data.startTime ? new Date(this.data.startTime) : null,
        this.data.endTime ? new Date(this.data.endTime) : null,
      ],
    };
    const formGroup = this.fb.group({
      mainTitle: [
        Object.hasOwnProperty.call(this.data, 'mainTitle')
          ? this.data.mainTitle
          : this.defaultValue.mainTitle,
        [
          /*this.buildRequiredWith('subTitle')*/
        ],
      ],
      subTitle: [
        Object.hasOwnProperty.call(this.data, 'subTitle')
          ? this.data.subTitle
          : this.defaultValue.subTitle,
        [
          /*this.buildRequiredWith('mainTitle')*/
        ],
      ],
      icon: [
        Object.hasOwnProperty.call(this.data, 'icon')
          ? this.data.icon
          : this.defaultValue.icon,
      ],
      styleType: [
        get(this.data, 'config.styleType', this.defaultValue.styleType),
      ],
      method: [get(this.data, 'config.method', this.defaultValue.method)],
      showCount: [
        get(this.data, 'config.showCount', this.defaultValue.showCount),
      ],
      orderRule: [
        get(this.data, 'config.orderRule', this.defaultValue.orderRule),
      ],
      goodsList: [_goodsList || [], [this.verifyPromotionList.bind(this)]],
      showTime: [_showTime],
    });
    formGroup.valueChanges.subscribe(data => this.onFormValueChanged(data));
    // formGroup.get('styleType').valueChanges.subscribe(() => {
    //   setTimeout(() => {
    //     this.emitSave();
    //   });
    // });
    return formGroup;
  }

  getData() {
    const data = merge({}, this.formGroup.value);
    data.showType = data.showTime.showType;
    data.showTime && data.showTime.dateRange && data.showTime.dateRange[0]
      ? (data.startTime = moment(data.showTime.dateRange[0]).format(
          'YYYY-MM-DD kk:mm:ss',
        ))
      : void 0;
    data.showTime && data.showTime.dateRange && data.showTime.dateRange[1]
      ? (data.endTime = moment(data.showTime.dateRange[1]).format(
          'YYYY-MM-DD kk:mm:ss',
        ))
      : void 0;
    data.config = {
      styleType: this.formGroup.value.styleType,
      method: this.formGroup.value.method,
      showCount: this.formGroup.value.showCount,
      orderRule: this.formGroup.value.orderRule,
      targets: data.goodsList.map(v => ({
        id: v.item_id,
        itemName: v.item_name,
        mainImgUrl: v.imgurl,
        dailyPrice: v.item_price,
        oriPrice: v.ori_price,
      })),
    };
    console.log(data);
    return data;
  }
  openChange(e) {
    console.log(e);
  }
  resetForm() {
    const {
      mainTitle,
      subTitle,
      icon,
      styleType,
      method,
      showCount,
      orderRule,
    } = this.defaultValue;
    this.formGroup.patchValue({
      mainTitle,
      subTitle,
      icon,
      styleType,
      method,
      showCount,
      orderRule,
    });
    this.emitSave();
  }

  showModalForHotGoods() {
    this.modalHelper
      .static(
        ModalAddItems,
        {
          kolId: 130,
          type: 'hotGoods',
        },
        'md',
        {
          title: '添加商品',
          footer: false,
        },
      )
      .subscribe(result => {
        this.sortableItems.push(result);
      });
  }
  onSortableItemsChange(values: any[]) {
    this.sortableItems = values;
  }

  onSortableItemsAdd() {
    this.showModalForHotGoods();
  }

  updateFormGroupValue(newData) {
    this.formGroup.setValue(this.getFormGroupFromInputData(newData));
  }

  getFormGroupFromInputData(data = this.data) {
    const defaultValue = this.defaultValue;
    const showType = data.showType || 1;
    const targets = get(data, 'config.targets', []);
    const _goodsList = targets.map(v => ({
      item_id: v.id,
      item_name: v.itemName,
      imgurl: v.mainImgUrl,
      item_price: v.dailyPrice,
      ori_price: v.oriPrice,
      added: true,
    }));
    return {
      mainTitle: get(data, 'mainTitle', defaultValue.mainTitle),
      subTitle: get(data, 'subTitle', defaultValue.subTitle),
      icon: get(data, 'icon', defaultValue.icon),
      styleType: get(data, 'config.styleType', defaultValue.styleType),
      method: get(data, 'config.method', defaultValue.method),
      showCount: get(data, 'config.showCount', defaultValue.showCount),
      orderRule: get(data, 'config.orderRule', defaultValue.orderRule),
      goodsList: _goodsList,
      showTime: {
        showType,
        startTime: showType === 2 && data.startTime ? data.startTime : null,
        endTime: showType === 2 && data.endTime ? data.endTime : null,
      },
    };
  }
}
