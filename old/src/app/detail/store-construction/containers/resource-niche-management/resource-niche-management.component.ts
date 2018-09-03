import { Component, OnInit, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import {
  ActivatedRoute,
  Params,
  CanDeactivate,
  Router,
  ParamMap,
} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import {
  NzModalService,
  NzMessageService,
  NzModalSubject,
} from 'ng-zorro-antd';
import * as moment from 'moment';
import * as _ from 'lodash';
import { EditorService } from '../../services/editor.service';

export const myFormValidator: ValidatorFn = (
  control: FormGroup,
): ValidationErrors | null => {
  let result: ValidationErrors | null = {};

  const showType = control.get('showType');
  const showDate = control.get('showDate');
  const brandShowType = control.get('brandShowType');
  const brandIds = control.get('brandIds');
  const categoryShowType = control.get('categoryShowType');
  const categotyIds = control.get('categotyIds');

  if (
    showType &&
    showType.value === 2 &&
    (!showDate.value[0] || !showDate.value[1])
  ) {
    result.showDate = true;
    showDate.setErrors(result);
    showDate.markAsDirty();
  } else if (
    brandShowType &&
    brandShowType.value !== 1 &&
    brandIds.value.length === 0
  ) {
    result.brandIds = true;
    brandIds.setErrors(result);
    brandIds.markAsDirty();
  } else if (
    categoryShowType &&
    categoryShowType.value !== 1 &&
    categotyIds.value.length === 0
  ) {
    result.categotyIds = true;
    categotyIds.setErrors(result);
    categotyIds.markAsDirty();
  } else {
    if (showType) {
      result = null;
      showDate.setErrors(result);
    } else if (brandShowType) {
      result = null;
      brandIds.setErrors(result);
    } else if (categoryShowType) {
      result = null;
      categotyIds.setErrors(result);
    } else {
      result = null;
    }

    result = null;
  }

  return result;
};

@Component({
  selector: 'app-resource-niche-management',
  templateUrl: './resource-niche-management.component.html',
  styleUrls: ['./resource-niche-management.component.less'],
})
export class ResourceNicheManagementComponent implements OnInit {
  kolInfo: any;
  type: string;
  myForm: FormGroup;
  resourceNicheCfg = {
    HOME_DIALOG: {
      title: '首页弹窗配置',
      extra: '',
      imgLimitWidth: 560,
      imgLimitHeight: 660,
      id: -2,
    },
    SHOP_SUSPEND: {
      title: '商城悬浮框配置',
      extra: '',
      imgLimitWidth: 90,
      imgLimitHeight: 90,
      id: -3,
    },
    ITEM_DETAIL_BANNER: {
      title: '商详页banner位配置',
      extra: '',
      imgLimitWidth: 700,
      imgLimitHeight: 300,
      id: -4,
    },
  };
  showTypeData = [
    {
      label: '长期显示',
      value: 1,
    },
    {
      label: '时间段显示',
      value: 2,
    },
  ];
  brandShowTypeData = [
    {
      label: '全部显示',
      value: 1,
    },
    {
      label: '部分显示',
      value: 2,
    },
    {
      label: '部分隐藏',
      value: 3,
    },
  ];
  categoryShowTypeData = [
    {
      label: '全部显示',
      value: 1,
    },
    {
      label: '部分显示',
      value: 2,
    },
    {
      label: '部分隐藏',
      value: 3,
    },
  ];
  positionsTypeData = [
    {
      label: '首页',
      value: 1,
      checked: true,
    },
    {
      label: '搜索页',
      value: 2,
    },
    {
      label: '商详页',
      value: 3,
    },
    {
      label: '支付完成页',
      value: 4,
    },
  ];
  isLoading: boolean = false;
  isPublish: boolean = false;
  hasData: boolean = false;
  data: any;
  deactivateTips: string = '当前页面未发布，不会在前端生效，是否确认离开？';
  isSpinning: boolean = false;
  treeSelectInit: boolean = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private editorService: EditorService,
    private nzModalSubject: NzModalSubject,
    private nzModalService: NzModalService,
    private nzMessageService: NzMessageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.type = queryParams.type;
      this.kolInfo = {
        xdpId: +queryParams.xdpId,
        kolId: +queryParams.kolId,
        micropageId: +queryParams.micropageId,
      };
      this.createForm();

      this.isLoading = false;
      this.isPublish = false;
      this.hasData = false;
      this.data = {};
      this.initData();
    });

    window.onbeforeunload = e => {
      const ev = e || window.event;

      if (ev) {
        ev.returnValue = this.deactivateTips;
      }
      return this.deactivateTips;
    };
  }

  createForm() {
    let typeFormControl = {};
    switch (this.type) {
      case 'HOME_DIALOG':
        typeFormControl = {};
        break;
      case 'SHOP_SUSPEND':
        typeFormControl = {
          positions: [1, [Validators.required]],
        };
        break;
      case 'ITEM_DETAIL_BANNER':
        typeFormControl = {
          brandShowType: [1, [Validators.required]],
          brandIds: [[]],
          categoryShowType: [1, [Validators.required]],
          categotyIds: [[]],
        };
        break;
      default:
        typeFormControl = {};
    }

    this.myForm = this.fb.group({
      ...typeFormControl,
      links: [[], [Validators.required]],
      showType: [1, [Validators.required]],
      showDate: [[null, null]],
    });
  }

  initData() {
    this.editorService.setTargetUserInfo({
      xdpId: this.kolInfo.xdpId,
      kolId: this.kolInfo.kolId,
      micropageId: `${this.kolInfo.micropageId}`,
      id: this.hasData ? this.data.id : null,
    });
    this.editorService
      .fetchAllConfiguration({
        xdpId: this.kolInfo.xdpId,
      })
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.create('error', `查询配置信息失败`);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res && res.result === 1 && res.data && res.data.length > 0) {
          this.hasData = true;
          this.data = res.data[0];
          this.data.config =
            typeof this.data.config === 'undefined' ? {} : this.data.config;
          this.updateFormData();
        } else {
          this.hasData = false;
          this.data = {};
        }
      });
  }

  updateFormData() {
    let typeFormData = {};
    switch (this.type) {
      case 'HOME_DIALOG':
        typeFormData = {};
        break;
      case 'SHOP_SUSPEND':
        this.data.config.positions =
          typeof this.data.config.positions === 'undefined'
            ? []
            : this.data.config.positions;
        typeFormData = {
          positions: this.positionsTypeData.map(item => ({
            ...item,
            checked: _.includes(this.data.config.positions, item.value),
          })),
        };
        break;
      case 'ITEM_DETAIL_BANNER':
        typeFormData = {
          brandShowType:
            typeof this.data.config.brandShowType === 'undefined'
              ? 1
              : this.data.config.brandShowType,
          brandIds:
            typeof this.data.config.brandIds === 'undefined'
              ? []
              : this.data.config.brandIds,
          categoryShowType:
            typeof this.data.config.categoryShowType === 'undefined'
              ? 1
              : this.data.config.categoryShowType,
          // categotyIds: this.myForm.get('categotyIds').value,
          categotyIds:
            typeof this.data.config.categotyIds === 'undefined'
              ? []
              : this.data.config.categotyIds,
        };
        break;
      default:
        typeFormData = {};
    }

    this.myForm.setValue({
      ...typeFormData,
      links:
        typeof this.data.config.links === 'undefined'
          ? []
          : this.data.config.links,
      showType:
        typeof this.data.showType === 'undefined' ? 1 : this.data.showType,
      showDate:
        this.data.startTime && this.data.endTime
          ? [new Date(this.data.startTime), new Date(this.data.endTime)]
          : [null, null],
    });

    this.markAsPristine();
  }

  submitForm() {
    this.markAsDirty();
    if (!this.myForm.valid) {
      return;
    }
    const data = Object.assign({}, this.myForm.value);

    if (
      data.showType &&
      data.showType === 2 &&
      (!data.showDate[0] || !data.showDate[1])
    ) {
      this.nzMessageService.create('error', `请选择 开始时间和结束时间`);
      return;
    }
    if (
      data.brandShowType &&
      data.brandShowType !== 1 &&
      data.brandIds.length === 0
    ) {
      this.nzMessageService.create('error', `请选择 品牌`);
      return;
    }
    if (
      data.categoryShowType &&
      data.categoryShowType !== 1 &&
      data.categotyIds.length === 0
    ) {
      this.nzMessageService.create('error', `请选择 品类`);
      return;
    }

    if (this.type === 'SHOP_SUSPEND') {
      data.positions = data.positions.filter(item => item.checked);
      data.positions = data.positions.map(item => item.value);
    }
    if (this.type === 'ITEM_DETAIL_BANNER') {
      data.brandIds = data.brandShowType !== 1 ? data.brandIds : [];
      data.categotyIds =
        data.categoryShowType !== 1
          ? data.categotyIds.map(
              item => (typeof item === 'number' ? item : item.levelId),
            )
          : [];
    }
    const showType = data.showType;
    const startTime =
      showType === 2
        ? moment(data.showDate[0]).format('YYYY-MM-DD HH:mm:ss')
        : null;
    const endTime =
      showType === 2
        ? moment(data.showDate[1]).format('YYYY-MM-DD HH:mm:ss')
        : null;
    delete data.showType;
    delete data.showDate;
    const postData = {
      startTime,
      endTime,
      showType,
      id: this.hasData ? this.data.id : null,
      xdpId: this.kolInfo.xdpId,
      micropageId: `${this.kolInfo.micropageId}`,
      name: this.resourceNicheCfg[this.type].title,
      mainTitle: this.resourceNicheCfg[this.type].title,
      subTitle: this.resourceNicheCfg[this.type].extra,
      icon: '',
      type: this.resourceNicheCfg[this.type].id,
      userShowType: 0,
      config: data,
    };
    this.isLoading = true;
    // console.log(postData);

    this.editorService.setTargetUserInfo({
      xdpId: this.kolInfo.xdpId,
      kolId: this.kolInfo.kolId,
      micropageId: `${this.kolInfo.micropageId}`,
      id: this.hasData ? this.data.id : null,
    });
    this.editorService
      .saveElem(postData)
      .pipe(
        catchError((error: any) => {
          this.isLoading = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res && res.result === 1) {
          this.publish();
        } else {
          this.nzMessageService.create(
            'error',
            `保存失败，发布不成功，请稍后再试`,
          );
          this.isLoading = false;
        }
      });
  }

  publish() {
    this.editorService
      .release()
      .pipe(
        catchError((error: any) => {
          this.isLoading = false;
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res && res.result === 1) {
          this.isPublish = true;
          this.initData();
          this.nzMessageService.create('success', `发布成功`);
        } else {
          this.nzMessageService.create('error', `发布不成功，请稍后再试`);
        }
        this.isLoading = false;
      });
  }

  markAsDirty() {
    Object.keys(this.myForm.controls).forEach(field => {
      this.myForm.controls[field].markAsDirty();
    });
  }

  markAsPristine() {
    Object.keys(this.myForm.controls).forEach(field => {
      this.myForm.controls[field].markAsPristine();
    });
  }

  getFormControl(name) {
    return this.myForm.controls[name];
  }

  _disabledDate(current: Date): boolean {
    return (
      current &&
      moment()
        .subtract(1, 'd')
        .isAfter(moment(current))
    );
  }

  canDeactivate() {
    let canDeactivate: any = true;
    if (this.myForm.dirty) {
      canDeactivate = window.confirm(this.deactivateTips);
    }
    return canDeactivate;
  }
}
