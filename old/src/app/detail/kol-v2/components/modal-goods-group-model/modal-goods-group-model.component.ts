import { Component, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { NzModalSubject, NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { noWhitespaceValidator } from '@shared/validators';
import {
  RULE_VAL,
  ORDER_OPTIONS,
  ORDER_TYPE_VAL,
} from 'app/detail/goods/group/const';
import { GoodsGroupService } from '../../services';
import { isNil } from 'lodash';
import * as moment from 'moment';

const RULE_OPTIONS = [
  { id: RULE_VAL.CATEGORY, name: '品类' },
  { id: RULE_VAL.BRAND, name: '品牌' },
  { id: RULE_VAL.PRICE, name: '商品售价' },
  { id: RULE_VAL.DATE, name: '商品创建时间' },
];

const POSITIVE_INTEGER = /^[1-9][0-9]*$/;

@Component({
  selector: 'modal-goods-group-model',
  templateUrl: 'modal-goods-group-model.component.html',
  styleUrls: ['modal-goods-group-model.component.less'],
})
export class ModalGoodsGroupMoedlComponent {
  /** 1 - 自动；2 - 手动 */
  _type: number;
  _kolId: number;
  ruleOptions = RULE_OPTIONS;
  orderTypeOptions = ORDER_OPTIONS;
  form: FormGroup;
  brandOptions$: Observable<any[]>;
  categoryOptions$: Observable<any[]>;

  @Input()
  set type(type: 1 | 2) {
    if (!type) {
      return;
    }
    this._type = type;
    if (type === 1) {
      // 自动
      this.buildFormForAuto();
    } else if (type === 2) {
      // 手动
      this.buildFormForManual();
    }
  }

  @Input()
  set kolId(kolId: number) {
    if (!kolId) {
      return;
    }
    this._kolId = kolId;

    this.brandOptions$ = this.goodsGroupService.getBrandList({ kolId });
    this.categoryOptions$ = this.goodsGroupService.getCategoryList({ kolId });
  }

  constructor(
    private fb: FormBuilder,
    private subject: NzModalSubject,
    private goodsGroupService: GoodsGroupService,
    private modalService: NzModalService,
  ) {}

  submitForm($event: UIEvent, form: FormGroup) {
    $event.preventDefault();
    Object.values(form.controls).forEach(c => c.markAsDirty());
    const { invalid } = form;
    if (invalid) {
      return;
    }

    const doSubmit = () => {
      this.subject.next({
        action: 'ADD',
        value: this.getSubmitParams(),
      });
      this.subject.destroy('onOk');
    };

    if (this._type === 2) {
      return doSubmit();
    }

    const ruleId = this.form.get('rule').value;
    if (ruleId === RULE_VAL.PRICE || ruleId === RULE_VAL.DATE) {
      this.postConfirmRangeCond().then(isSoOnSubmit => {
        isSoOnSubmit && doSubmit();
      });
    } else {
      doSubmit();
    }
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  isFormControlHasError(name: string, validator: string = 'required') {
    const formControl = this.form.get(name);
    return formControl.dirty && formControl.hasError(validator);
  }

  getFormControlValue(name: string) {
    return this.form.get(name).value;
  }

  formatterYuan = value => `￥${value}`;

  parserYuan = value => value.replace('￥', '');

  private getRangeTimeParams() {
    const [startTime, endTime] = this.form.get('dateRange').value;
    return {
      startTime: moment(startTime)
        .startOf('day')
        .format(),
      endTime: moment(endTime)
        .endOf('day')
        .format(),
    };
  }

  private async postConfirmRangeCond() {
    const params = { kolId: this._kolId };
    const ruleId = this.form.get('rule').value;
    let confirmMsg;
    if (ruleId === RULE_VAL.DATE) {
      Object.assign(params, this.getRangeTimeParams());
      confirmMsg = '该时间区间内不包含当前小电铺内任何商品，确认创建该商品分组';
    } else if (ruleId === RULE_VAL.PRICE) {
      const { priceFrom, priceTo } = this.form.value;
      Object.assign(params, { priceFrom, priceTo });
      confirmMsg = '该售价区间内不包含当前小电铺内任何商品，确认创建该商品分组';
    } else {
      if (process.env.NODE_ENV === 'development') {
        throw new Error('此分组规则不该查找范围条件是否存在商品');
      }
    }

    return new Promise(resolve => {
      this.goodsGroupService.getCommidityList(params).subscribe(data => {
        if (data) {
          return resolve(true);
        }
        this.modalService.confirm({
          title: '确认提示',
          content: confirmMsg,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    });
  }

  private getSubmitParams() {
    if (this._type === 2) {
      return {
        categoryName: this.form.get('categoryName').value,
      };
    }
    /*
     groupType 2：手动，1：自动
     keyIdList 品牌Id或者品类Id数组 Array[integer]
     categoryName	分组名称 string
     priceFrom 价格区间，起始区间 integer
     priceTo 价格区间，结束区间 integer
     orderType 自动分组时有效，1=按新品排序，2=按销量排序，3=按浏览量排序 integer
     policyType 自动分组的类型。1：按品类，2：品牌，3：价格区间，4：创建时间 integer
     startTime 商品创建时间，开始区间 date-time
     endTime 商品创建区间，结束区间 date-time
     */

    const {
      rule: policyType,
      categoryVal,
      brandVal,
      orderType,
      categoryName,
      priceFrom,
      priceTo,
    } = this.form.value;
    console.log(this.form.value);
    const ret: any = {
      policyType,
      categoryName,
      orderType,
      groupType: this._type,
    };
    switch (policyType) {
      case RULE_VAL.CATEGORY:
        ret.keyIdList = categoryVal;
        break;
      case RULE_VAL.BRAND:
        ret.keyIdList = brandVal;
        break;
      case RULE_VAL.PRICE:
        Object.assign(ret, { priceFrom, priceTo });
        break;
      case RULE_VAL.DATE:
        Object.assign(ret, this.getRangeTimeParams());
        break;
      default:
        if (process.env.NODE_ENV === 'development') {
          throw new Error('分组规则不合法');
        }
        break;
    }
    return ret;
  }

  private buildFormForManual() {
    this.form = this.fb.group({
      categoryName: [null, [Validators.required, noWhitespaceValidator]],
    });
  }

  private buildFormForAuto() {
    this.form = this.fb.group({
      categoryName: [null, [Validators.required, noWhitespaceValidator]],
      rule: [null, [Validators.required]],
      orderType: [ORDER_TYPE_VAL.NEW_FIRST, [Validators.required]],
      priceFrom: [null],
      priceTo: [null],
      dateRange: [[null, null]],
      categoryVal: [null],
      brandVal: [null],
    });

    const dynamicFC = [
      'priceFrom',
      'priceTo',
      'dateRange',
      'categoryVal',
      'brandVal',
    ];

    this.form.get('rule').valueChanges.subscribe(value => {
      dynamicFC.forEach(fc => this.form.get(fc).clearValidators());

      if (value === 3) {
        this.form
          .get('priceFrom')
          .setValidators([
            this.priceValidator,
            Validators.pattern(POSITIVE_INTEGER),
          ]);
        this.form
          .get('priceTo')
          .setValidators([
            this.priceValidator,
            Validators.pattern(POSITIVE_INTEGER),
          ]);
      } else if (value === 1) {
        this.form.get('categoryVal').setValidators(this.ruleValidator(value));
      } else if (value === 2) {
        this.form.get('brandVal').setValidators(this.ruleValidator(value));
      } else if (value === 4) {
        this.form.get('dateRange').setValidators(this.ruleValidator(value));
      }

      dynamicFC.forEach(fc => this.form.get(fc).updateValueAndValidity());
    });
  }

  private priceValidator = (control: FormControl): ValidationErrors => {
    if (!this.form) {
      return null;
    }

    if (this.form.get('rule').value !== 3) {
      return null;
    }
    if (isNil(control.value)) {
      return { required: true };
    }
    const priceFrom = this.form.get('priceFrom').value;
    const priceTo = this.form.get('priceTo').value;

    if (priceFrom && priceTo && priceFrom > priceTo) {
      return { compare: true };
    }
    return null;
  };

  private ruleValidator = (rule: number) => (
    control: FormControl,
  ): ValidationErrors => {
    if (!this.form) {
      return null;
    }
    if (this.form.get('rule').value === rule) {
      if (
        (Array.isArray(control.value) && control.value.some(isNil)) ||
        isNil(control.value)
      ) {
        return { required: true };
      }
    }
    return null;
  };
}
