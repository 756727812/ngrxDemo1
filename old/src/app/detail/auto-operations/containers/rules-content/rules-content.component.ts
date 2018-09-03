import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Inject,
  forwardRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import {
  NzNotificationService,
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import * as _ from 'lodash';
import { formatSrc } from 'app/utils';
import { seeImgUploadValidator } from '@shared/components/img-upload/img-upload.component';
import { sortableImgValidator } from '../../components/sortable-img/sortable-img.component';
import { RulesService } from '../../services/rules.service';
import { catchError } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

type ImgData = {
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  type?: string;
  sizeKB?: number;
  sizeMB?: number;
  url?: string;
};

let t;

@Component({
  selector: 'app-rules-content',
  templateUrl: './rules-content.component.html',
  styleUrls: ['./rules-content.component.less'],
})
export class RulesContentComponent implements OnInit {
  @Input() ruleId: number;
  @Input() isElectAdmin: boolean;
  @Output() getRuleName: EventEmitter<any> = new EventEmitter<any>();
  @Output() getShopHeadPic: EventEmitter<any> = new EventEmitter<any>();
  @Output() getStatus: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private nzNotification: NzNotificationService,
    private modalService: NzModalService,
    private nzMessageService: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    private rulesService: RulesService,
    private fb: FormBuilder,
  ) {}

  // sideBarImgUrl = '/s/p/product_v2/3e7/7f2/hc5/fvop0080gckgwgsgswk000gc0w.png';
  sideBarImgUrl = '/s/t/product_v2/0c4/4b4/qqd/xrdd4go0wogc8sgsowsgw0os4c.png';
  formGroup: FormGroup;
  submitted: boolean = false;
  busy: boolean = false;
  hasClickTreeSelect: boolean = false;
  allBtnTypeFixed: boolean = false;
  treeSelectOptions: any[] = [];
  ruletreebyidData: any[] = [];
  navHeadPicControls = {};
  // 皮肤模板
  skinOptions: any[] = [
    { value: 1, label: '默认红' },
    { value: 2, label: '少女粉' },
    { value: 3, label: '文艺黄' },
    { value: 4, label: '高冷黑' },
  ];
  // 爆品拼团
  groupBuyingNumOptions: number[] = [6, 8, 10, 12, 14, 16, 18, 20];
  _groupBuyingNumOptions: any[] = [];
  formGoupPersonNumOptions: number[] = [2, 4, 6, 8, 10, 50, 100];
  _formGoupPersonNumOptions: any[] = [];
  groupBuyingTurnTimeOptions: number[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
  ];
  _groupBuyingTurnTimeOptions: any[] = [];
  // 新品拼团
  groupBuyingNumOptions_new: number[] = [6, 8, 10, 12, 14, 16, 18, 20];
  _groupBuyingNumOptions_new: any[] = [];
  formGoupPersonNumOptions_new: number[] = [2, 4, 6, 8, 10, 50, 100];
  _formGoupPersonNumOptions_new: any[] = [];
  groupBuyingTurnTimeOptions_new: number[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
  ];
  _groupBuyingTurnTimeOptions_new: any[] = [];

  ngOnInit() {
    this.initFormGroup();
    this.getAllPageData();
    this.initOptions();
  }

  ngAfterViewChecked() {
    if (!this.allBtnTypeFixed) {
      this.allBtnTypeFixed = this.fixImgPreviewBtnType();
    }
  }

  fixImgPreviewBtnType(): boolean {
    const btns = document.querySelectorAll(
      'app-rules-content nz-modal button.ant-modal-close',
    );
    const len = btns.length;
    for (let i = 0; i < len; i = i + 1) {
      const curType = btns.item(i).getAttribute('type');
      if (curType !== 'button') {
        btns.item(i).setAttribute('type', 'button');
      }
    }
    return len === 11;
  }

  initFormGroup() {
    const formGroupParams = {
      // 智能选品
      goodsTypes: [[], Validators.required],
      goodsPrice: ['', Validators.required],
      goodsStock: ['', Validators.required],
      singleProfit: ['', Validators.required],
      // 智能装修
      skin: [null, Validators.required],
      shopHeadPic: [[], seeImgUploadValidator('done')],
      navIcons: [[], sortableImgValidator()],
      // 爆品拼团
      groupBuyingTitle: [[], seeImgUploadValidator('done')],
      groupBuyingNum: [null, Validators.required],
      groupBuyingDisplay: [1, Validators.required],
      profitLimit: ['', Validators.required],
      groupBuyingPrice: ['', Validators.required],
      groupBuyingSupplyPrice: ['', Validators.required],
      formGoupTime: ['', Validators.required],
      formGoupPersonNum: [null, Validators.required],
      groupBuyingTime: ['', Validators.required],
      groupBuyingTurnTime: [null, Validators.required],
      // 新品拼团
      groupBuyingTitle_new: [[], seeImgUploadValidator('done')],
      groupBuyingNum_new: [null, Validators.required],
      groupBuyingDisplay_new: [1, Validators.required],
      profitLimit_new: ['', Validators.required],
      groupBuyingPrice_new: ['', Validators.required],
      groupBuyingSupplyPrice_new: ['', Validators.required],
      formGoupTime_new: ['', Validators.required],
      formGoupPersonNum_new: [null, Validators.required],
      groupBuyingTime_new: ['', Validators.required],
      groupBuyingTurnTime_new: [null, Validators.required],
      // 商品流
      groupOrders: [[], Validators.required],
      newGoodsPercent: [1, Validators.required],
      selfGoodsPercent: [1, Validators.required],
    };

    this.formGroup = this.fb.group(formGroupParams);

    // 数值的输入格式化
    [
      // 两位小数
      'goodsPrice',
      'singleProfit',
      'profitLimit',
      'groupBuyingPrice',
      'groupBuyingSupplyPrice',
      'profitLimit_new',
      'groupBuyingPrice_new',
      'groupBuyingSupplyPrice_new',
      // 整数
      'goodsStock',
      'formGoupTime',
      'groupBuyingTime',
      'formGoupTime_new',
      'groupBuyingTime_new',
    ].forEach(name => {
      this.formatControl(name);
    });
  }

  formatControl(name) {
    this.formGroup
      .get(name)
      .valueChanges.debounceTime(1)
      .distinctUntilChanged()
      .subscribe(data => {
        this.formatNumberValue(data, name);
      });
  }

  formatNumberValue(newVal, name) {
    let formatVal = newVal;
    const isInt = [
      'goodsStock',
      'formGoupTime',
      'groupBuyingTime',
      'formGoupTime_new',
      'groupBuyingTime_new',
    ].includes(name);
    if (isInt) {
      // 整数
      formatVal = formatVal.replace(/\./g, '');
    } else {
      //  两位小数
      formatVal = formatVal.replace(/(\.\d\d)(.+)/, '$1');
    }

    formatVal = formatVal.replace(/[^\d\.-]/g, '');

    if (formatVal !== newVal) {
      this.formGroup.patchValue({ [name]: formatVal }, { emitEvent: false });
    }
  }

  intervalFormat(inputName) {
    // 重复检查格式化，作为在valueChanges失效时的补充
    t = setInterval(() => {
      this.formatNumberValue(this.formGroup.get(inputName).value, inputName);
    }, 500);
  }

  stopInterval() {
    clearInterval(t);
  }

  biggerThanZero(name) {
    const valueStr = this.formGroup.get(name).value;
    const val = parseFloat(valueStr);
    if (String(val) === 'NaN') {
      return false;
    }
    return val > 0;
  }

  timeValid(name) {
    const valueStr = this.formGroup.get(name).value;
    const val = parseFloat(valueStr);
    if (String(val) === 'NaN') {
      return false;
    }
    return val > 0 && val < 96;
  }

  initOptions() {
    // 爆品拼团
    this._groupBuyingNumOptions = this.groupBuyingNumOptions.map(n => {
      return { value: n, label: n };
    });
    this._formGoupPersonNumOptions = this.formGoupPersonNumOptions.map(n => {
      return { value: n, label: n };
    });
    this._groupBuyingTurnTimeOptions = this.groupBuyingTurnTimeOptions.map(
      n => {
        return { value: n, label: n };
      },
    );
    // 新品拼团
    this._groupBuyingNumOptions_new = this.groupBuyingNumOptions_new.map(n => {
      return { value: n, label: n };
    });
    this._formGoupPersonNumOptions_new = this.formGoupPersonNumOptions_new.map(
      n => {
        return { value: n, label: n };
      },
    );
    this._groupBuyingTurnTimeOptions_new = this.groupBuyingTurnTimeOptions_new.map(
      n => {
        return { value: n, label: n };
      },
    );
  }

  async getAllPageData() {
    await this.getRuleData();
    this.getSelectedTreeNodes();
    this.getSubpageData();
    this.getGroupBuyingData();
  }

  getRuleData() {
    return new Promise((resolve, reject) => {
      this.busy = true;
      // 根据ruleId获取规则详细信息
      this.rulesService
        .ruleinfobyid({ rule_id: this.ruleId })
        .pipe(
          catchError((error: any) => {
            this.busy = false;
            this.nzMessageService.error('获取规则详细信息失败！');
            return Observable.of(null);
          }),
        )
        .subscribe(res => {
          this.busy = false;
          if (!res) {
            return;
          }
          if (res.result !== 1) {
            console.log('error:', res.msg);
            this.nzMessageService.error('获取规则详细信息失败！');
            return;
          }

          const {
            status,
            rule_name = '',
            price_min = '',
            stock_min = '',
            profit_min = '',
            head_img = '',
            group_order = '',
            group_new_weight = '',
            group_own_weight = '',
            skin_id = '',
          } = res.data;
          // 向父组件rules-info传递rule_name、head_img字段
          this.getRuleName.emit(rule_name);
          this.getShopHeadPic.emit(head_img);
          this.getStatus.emit(status);

          // 格式化表单字段
          const initShopHeadPic = this.initPicFile(head_img);
          const patchParam = {
            // 智能选品
            goodsPrice: this.isNumberType(price_min)
              ? (+price_min / 100).toFixed(2)
              : '',
            goodsStock: this.isNumberType(stock_min) ? String(+stock_min) : '',
            singleProfit: this.isNumberType(profit_min)
              ? (+profit_min * 100).toFixed(2)
              : '',
            // 智能装修
            skin: this.isNumberType(skin_id)
              ? this.getTargetOption(this.skinOptions, skin_id)
              : null,
            shopHeadPic: initShopHeadPic,
            // 商品流
            newGoodsPercent: this.isNumberType(group_new_weight)
              ? group_new_weight
              : 1,
            selfGoodsPercent: this.isNumberType(group_own_weight)
              ? group_own_weight
              : 1,
          };
          this.formGroup.patchValue(patchParam);

          this.getGroupInfo(group_order);

          resolve();
        });
    });
  }

  getGroupInfo(group_order) {
    if (!group_order) {
      return;
    }
    // 获取商品分组配置原数据
    this.rulesService
      .findgrouprankoriginaldata()
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.error('获取商品分组配置原数据失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('获取商品分组配置原数据失败！');
          return;
        }

        const groupInfos = res.data;
        const groupOrders = JSON.parse(group_order).map(group => {
          const targetGroup = _.find(groupInfos, { id: group.id });
          if (!targetGroup) {
            return group;
          }
          group.name = targetGroup['name'];
          return group;
        });
        groupOrders.sort((groupA, groupB) => groupA.rank - groupB.rank);

        // 商品流
        this.formGroup.patchValue({ groupOrders });
      });
  }

  // 智能选品 - 商品品类
  getSelectedTreeNodes() {
    // 获得当前规则选中三级分类
    this.rulesService
      .ruletreebyid({ rule_id: this.ruleId })
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.error('获取选中三级分类失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('获取选中三级分类失败！');
          return;
        }

        this.ruletreebyidData = res.data;

        this.getClasstree();
      });
  }

  clickTreeSelect() {
    this.hasClickTreeSelect = true;
  }

  getClasstree() {
    // 树状图接口
    this.rulesService
      .classtree()
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.error('获取树状图数据失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('获取树状图数据失败！');
          return;
        }

        const treeSelectOptions = [];
        res.data.forEach(node => {
          const baseIds = [];
          [1, 2, 3].forEach(level => {
            const levelId = node[`class_id_${level}`];
            baseIds.push(levelId);
            const id = baseIds.join('-');
            if (_.findIndex(treeSelectOptions, { id }) === -1) {
              const label = node[`class_name_${level}`];
              treeSelectOptions.push({ id, label, levelId, level });
            }
          });
        });

        this.updateTreeNodes(treeSelectOptions);
      });
  }

  updateTreeNodes(options) {
    this.ruletreebyidData.forEach(node => {
      const { category_id } = node;
      const targetNode = _.find(options, { levelId: category_id });
      if (targetNode) {
        targetNode['selected'] = true;
      }
    });

    // 智能选品 - 商品品类
    this.treeSelectOptions = options;
  }

  getSubpageData() {
    // 根据ruleId获取商品子页面原数据
    this.rulesService
      .findsubpageruleid({ rule_id: this.ruleId })
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.error('获取商品子页面原数据失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('获取商品子页面原数据失败！');
          return;
        }

        const apiNavData = res.data;
        this.getNavHeadPics(apiNavData);
        const navIcons = this.getNavIcons(apiNavData);
        this.formGroup.patchValue({ navIcons });
      });
  }

  getNavIcons(apiNavData) {
    if (!apiNavData) {
      return;
    }
    const newArr = apiNavData.map(nav => {
      return {
        imgUrl: nav.icon_image,
        name: nav.image_name,
        rank: nav.rank,
        subpage_id: nav.subpage_id,
      };
    });
    newArr.sort((navA, navB) => navA.rank - navB.rank);
    return newArr;
  }

  getNavHeadPics(apiNavData) {
    if (!apiNavData) {
      return;
    }
    const navHeadPicControls = {};
    apiNavData.forEach((nav, index) => {
      const controlName = `navHeadPic_${index}`;
      navHeadPicControls[nav.image_name] = controlName;
      this.formGroup.addControl(
        controlName,
        new FormControl(
          this.initPicFile(nav.head_image),
          seeImgUploadValidator('done'),
        ),
      );
    });
    this.navHeadPicControls = navHeadPicControls;
  }

  // 获取拼团基础信息
  getGroupBuyingData() {
    this.rulesService
      .findgroupinfo({ rule_id: this.ruleId })
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.error('获取拼团基础信息失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('获取拼团基础信息失败！');
          return;
        }

        res.data.forEach(
          ({
            group_type,
            mod_banner = '',
            mod_goods_num = '',
            mod_show_type = '',
            spu_profit_min = '',
            spu_sale_discount = '',
            spu_supply_discount = '',
            success_timeout = '',
            success_user_num = '',
            event_period = '',
            goods_interval = '',
          }) => {
            const suffix = group_type === 1 ? '_new' : '';
            const patchParam = {
              ['groupBuyingTitle' + suffix]: this.initPicFile(mod_banner),
              ['groupBuyingNum' + suffix]: this.isNumberType(mod_goods_num)
                ? this.getTargetOption(
                    this['_groupBuyingNumOptions' + suffix],
                    mod_goods_num,
                  )
                : null,
              ['groupBuyingDisplay' + suffix]: this.isNumberType(mod_show_type)
                ? mod_show_type
                : 1,
              ['profitLimit' + suffix]: this.isNumberType(spu_profit_min)
                ? (+spu_profit_min * 100).toFixed(2)
                : '',
              ['groupBuyingPrice' + suffix]: this.isNumberType(
                spu_sale_discount,
              )
                ? (+spu_sale_discount * 100).toFixed(2)
                : '',
              ['groupBuyingSupplyPrice' + suffix]: this.isNumberType(
                spu_supply_discount,
              )
                ? (+spu_supply_discount * 100).toFixed(2)
                : '',
              ['formGoupTime' + suffix]: this.isNumberType(success_timeout)
                ? String(success_timeout)
                : '',
              ['formGoupPersonNum' + suffix]: this.isNumberType(
                success_user_num,
              )
                ? this.getTargetOption(
                    this['_formGoupPersonNumOptions' + suffix],
                    success_user_num,
                  )
                : null,
              ['groupBuyingTime' + suffix]: this.isNumberType(event_period)
                ? String(event_period)
                : '',
              ['groupBuyingTurnTime' + suffix]: this.isNumberType(
                goods_interval,
              )
                ? this.getTargetOption(
                    this['_groupBuyingTurnTimeOptions' + suffix],
                    goods_interval,
                  )
                : null,
            };
            this.formGroup.patchValue(patchParam);
          },
        );
      });
  }

  isNumberType(value): boolean {
    return typeof value === 'number';
  }

  getTargetOption(options, value) {
    const targetOption = _.find(options, { value });
    return targetOption || null;
  }

  initPicFile(url) {
    if (!url) {
      return [];
    }
    return [
      {
        uid: -1,
        status: 'done',
        url: formatSrc(url),
      },
    ];
  }

  imgValid = (imgData: ImgData) => {
    const { type, sizeMB } = imgData;
    const typeValid = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/gif',
    ].includes(type);
    const sizeValid = sizeMB < 1;
    if (!typeValid) {
      this.nzMessageService.warning('图片格式不正确！');
    }
    if (typeValid && !sizeValid) {
      this.nzMessageService.warning('图片应小于1M！');
    }
    return typeValid && sizeValid;
  };

  formNumberValid() {
    const biggerThanZeroArr = [
      'goodsPrice',
      'singleProfit',
      'profitLimit',
      'groupBuyingPrice',
      'groupBuyingSupplyPrice',
      'profitLimit_new',
      'groupBuyingPrice_new',
      'groupBuyingSupplyPrice_new',
      'goodsStock',
    ];
    for (let i = 0; i < biggerThanZeroArr.length; i = i + 1) {
      if (!this.biggerThanZero(biggerThanZeroArr[i])) {
        return false;
      }
    }

    const timeValidArr = [
      'formGoupTime',
      'groupBuyingTime',
      'formGoupTime_new',
      'groupBuyingTime_new',
    ];
    for (let i = 0; i < timeValidArr.length; i = i + 1) {
      if (!this.timeValid(timeValidArr[i])) {
        return false;
      }
    }

    return true;
  }

  getFormIsValid: () => boolean = () => {
    if (!this.formGroup.valid || !this.formNumberValid()) {
      return false;
    }
    return true;
  };

  submit() {
    this.submitted = true;
    if (!this.getFormIsValid()) {
      this.nzMessageService.warning('请完善信息！');
      return;
    }

    const formValues = this.formGroup.value;
    console.log('formValues:', formValues);

    const rule_id = this.ruleId;
    // 智能选品 - 商品品类
    const ruleCateList = !this.hasClickTreeSelect
      ? []
      : formValues.goodsTypes.map(node => {
          return {
            rule_id,
            category_id: node.levelId,
          };
        });
    const rule = {
      rule_id,
      // 智能选品
      price_min: +formValues.goodsPrice * 100, // 商品最低单价（分）
      stock_min: +formValues.goodsStock, // 商品最小库存
      profit_min: +formValues.singleProfit / 100, // 商品最小利润率

      // 智能装修 - 皮肤模板
      skin_id: formValues.skin.value,
      // 智能装修 - 店铺头图
      head_img: this.removeUrlHost(formValues.shopHeadPic[0].url),

      // 商品流
      group_order: JSON.stringify(
        formValues.groupOrders.map((group, index) => {
          return {
            id: group.id, // 分组id
            rank: index + 1, // 排序
          };
        }),
      ),
      group_new_weight: formValues.newGoodsPercent, // 新品占比
      group_own_weight: formValues.selfGoodsPercent, // 自营商品占比
    };
    // 智能装修 - 导航图
    const subPageList = formValues.navIcons.map((nav, index) => {
      return {
        rule_id,
        subpage_id: nav.subpage_id,
        icon_image: this.removeUrlHost(nav.imgUrl), // 导航icon
        image_name: nav.name, // 导航名称
        head_image: this.removeUrlHost(
          formValues[this.navHeadPicControls[nav.name]][0].url,
        ), // 各导航分组的头图
        rank: index + 1, // 排序
      };
    });

    // 爆款团, 新品团
    const ruleGroupList = [0, 1].map(group_type => {
      const suffix = group_type === 1 ? '_new' : '';
      return {
        rule_id,
        group_type, // 拼团类型: 0-爆款团,1-新品团
        mod_banner: this.removeUrlHost(
          formValues['groupBuyingTitle' + suffix][0].url,
        ),
        mod_goods_num: formValues['groupBuyingNum' + suffix].value,
        mod_show_type: formValues['groupBuyingDisplay' + suffix],
        spu_profit_min: +formValues['profitLimit' + suffix] / 100,
        spu_sale_discount: +formValues['groupBuyingPrice' + suffix] / 100,
        spu_supply_discount:
          +formValues['groupBuyingSupplyPrice' + suffix] / 100,
        success_timeout: +formValues['formGoupTime' + suffix],
        success_user_num: formValues['formGoupPersonNum' + suffix].value,
        event_period: +formValues['groupBuyingTime' + suffix],
        goods_interval: formValues['groupBuyingTurnTime' + suffix].value,
      };
    });

    // 提交规则
    this.rulesService
      .submitdecorate({
        ruleCateList,
        rule,
        subPageList,
        ruleGroupList,
      })
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.error('提交规则失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('提交规则失败！');
          return;
        }

        this.nzMessageService.success('提交规则成功！');

        // 向父组件rules-info更新字段
        this.getShopHeadPic.emit(formValues.shopHeadPic[0].url);
        this.getStatus.emit(status);
      });
  }

  cancelEdit() {
    this.router.navigate(['../../rules-cards'], {
      relativeTo: this.route,
    });
  }

  removeUrlHost(url) {
    /*
      1. 去除url的host，转成相对路径  2. 去掉query参数，即图片格式转化裁剪等
          eg: "//image.seecsee.com/s/p/product_v2/00c/c48/m4h/0m0mhsks8oowc00cwo4o0os080.jpg?imageMogr2/strip/format/jpg"
              >>>>转换成： "/s/p/product_v2/00c/c48/m4h/0m0mhsks8oowc00cwo4o0os080.jpg"
      前缀（域名）和后缀是调用formatSrc方法时加的。
    */
    return (url || '').replace(/(^.+?\.com)?(\/[^\?]+)(\?.*$)?/, '$2');
  }
}
