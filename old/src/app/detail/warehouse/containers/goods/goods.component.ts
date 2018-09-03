import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  ValidationErrors,
  FormBuilder,
} from '@angular/forms';
import * as moment from 'moment';
import { WarehouseGoodsService } from '../../services';
import { find, isArray, omit, isDate, get, pickBy, isNil } from 'lodash';

type IFormParams = {
  /** 一级品类id */
  // classId1List: number[];
  /** 二级品类id */
  // classId2List: number[];
  /** 三级品类id */
  // classId3List: number[];
  /** 在仓库存左区间 */
  warehouseStockFrom: number;
  /** 在仓库存右区间 */
  warehouseStockTo: number;
  /** 货号 */
  itemNo: string;
  /** see仓ID/商品名 */
  itemName: string;
  /** 小店铺关联商品：0全部，1已关联，2未关联 */
  type: number;
  /** 最近入库时间 */
  dateRange: [Date, Date];
  // lastWarehouseTimeFrom: Date;
  // lastWarehouseTimeTo: Date;
};
@Component({
  selector: 'warehouse-goods',
  templateUrl: './goods.component.html',
})
export class WarehouseGoodsComponent implements OnInit {
  goodsCategoryList: { [key: number]: any };
  goodsCategoryLevelOne = [];
  goodsCategoryLevelTwo = [];
  goodsCategoryLevelThree = [];
  routeParamsLv1: string[];
  routeParamsLv2: string[];
  routeParamsLv3: string[];
  $routeParams = Object.create(null);
  form: FormGroup;
  page: number;
  pageSize: number;
  goodsData = {
    list: [],
    count: 0,
  };
  typeOptions = [
    {
      label: '全部',
      value: 0,
    },
    {
      label: '已关联',
      value: 1,
    },
    {
      label: '未关联',
      value: 2,
    },
  ];
  paths = [
    { title: 'SEE仓管理' },
    { title: '仓库商品', link: '/warehouse/goods' },
  ];
  sortMap = {
    stock: null,
  };
  sortName: string;
  sortValue: 'ascend' | 'descend';

  get loading(): boolean {
    return this.goodsService.loading;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private goodsService: WarehouseGoodsService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      const { page = 1, pageSize = 30, sortName, sortValue } = params;
      this.page = page >>> 0;
      this.pageSize = pageSize;
      this.sortName = sortName;
      this.sortValue = this.sortMap[sortName] = sortValue;
      this.$routeParams = params;
      this.routeParamsLv1 = this.buildRouteParamsLv('goodsCategoryLevelOne');
      this.routeParamsLv2 = this.buildRouteParamsLv('goodsCategoryLevelTwo');
      this.routeParamsLv3 = this.buildRouteParamsLv('goodsCategoryLevelThree');
      this.buildSearchForm();
      if (this.goodsCategoryList) {
        this.formatClass2Tree();
      } else {
        this.getClass2Tree();
      }
    });
  }

  changePage() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: this.page, pageSize: this.pageSize },
      queryParamsHandling: 'merge',
    });
  }

  add() {
    this.router.navigate(['new'], {
      relativeTo: this.route,
    });
  }

  changeCategory(status: boolean, idx: number, level: number = 1) {
    enum levelMap {
      goodsCategoryLevelOne = 1,
      goodsCategoryLevelTwo,
      goodsCategoryLevelThree,
    }
    this[levelMap[level]][idx].value = status;
    if (status === false) {
      if (level === 2) {
        const children = this.goodsCategoryLevelTwo[idx].children;
        const levelThreeIds = Boolean(children)
          ? children
              .filter(child => this.routeParamsLv3.includes(child.id))
              .map(child => child.id)
          : [];
        this.goodsCategoryLevelThree
          .filter(level => levelThreeIds.includes(level.id))
          .forEach(item => {
            item.value = false;
          });
      }
      if (level === 1) {
        const children = this.goodsCategoryLevelOne[idx].children;
        const levelTwoIds = Boolean(children)
          ? children
              .filter(child => this.routeParamsLv2.includes(child.id))
              .map(child => child.id)
          : [];
        const levelThreeIds = Boolean(children)
          ? children.reduce((acc, value) => {
              isArray(value.children) &&
                value.children
                  .filter(grandson => this.routeParamsLv3.includes(grandson.id))
                  .forEach(grandson => {
                    acc.push(grandson.id);
                  });
              return acc;
            }, [])
          : [];
        this.goodsCategoryLevelTwo
          .filter(level => levelTwoIds.includes(level.id))
          .forEach(item => {
            item.value = false;
          });
        this.goodsCategoryLevelThree
          .filter(level => levelThreeIds.includes(level.id))
          .forEach(item => {
            item.value = false;
          });
      }
    }

    this.submitSearch(this.form);
  }

  sort(sortName, value) {
    this.sortName = sortName;
    this.sortValue = value;
    Object.keys(this.sortMap).forEach(key => {
      if (key !== sortName) {
        this.sortMap[key] = null;
      } else {
        this.sortMap[key] = value;
      }
    });
    this.submitSearch(this.form);
  }

  submitSearch(form: FormGroup) {
    if (form.invalid) {
      return;
    }
    let { warehouseStockFrom, warehouseStockTo } = form.value;
    const { dateRange } = form.value;
    if (
      !this.isNilOrString(warehouseStockFrom) &&
      !this.isNilOrString(warehouseStockTo) &&
      warehouseStockFrom > warehouseStockTo
    ) {
      [warehouseStockTo, warehouseStockFrom] = [
        warehouseStockFrom,
        warehouseStockTo,
      ];
    }

    const lastWarehouseTimeFrom = Number(get(dateRange, '[0]')) || undefined;
    const lastWarehouseTimeTo = Number(get(dateRange, '[1]')) || undefined;

    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        ...this.$routeParams,
        ...omit(form.value, 'dateRange'),
        lastWarehouseTimeFrom,
        lastWarehouseTimeTo,
        warehouseStockFrom: this.isNilOrString(warehouseStockFrom)
          ? undefined
          : warehouseStockFrom,
        warehouseStockTo: this.isNilOrString(warehouseStockTo)
          ? undefined
          : warehouseStockTo,
        page: 1,
        pageSize: this.pageSize,
        goodsCategoryLevelOne: this.getIdString(this.goodsCategoryLevelOne),
        goodsCategoryLevelTwo: this.getIdString(this.goodsCategoryLevelTwo),
        goodsCategoryLevelThree: this.getIdString(this.goodsCategoryLevelThree),
        sortName: this.sortName && this.sortValue ? this.sortName : undefined,
        sortValue: this.sortValue,
      },
      queryParamsHandling: 'merge',
    });
  }

  resetForm() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: 1, pageSize: this.pageSize },
    });
  }

  private getIdArray(categoryLevel: any[]): string[] {
    return isArray(categoryLevel)
      ? categoryLevel.filter(({ value }) => !!value).map(({ id }) => id)
      : undefined;
  }

  private getIdString(categoryLevel: any[]): string {
    return this.getIdArray(categoryLevel).join(',') || undefined;
  }

  private buildRouteParamsLv(key: string): string[] {
    return Boolean(this.$routeParams[key])
      ? this.$routeParams[key].split(',')
      : [];
  }

  private dateRangeCompareValidator = (
    control: FormControl,
  ): ValidationErrors => {
    if (control.value && control.value.every(v => !!v)) {
      if (control.value[0] > control.value[1]) {
        return { compare: true };
      }
    }
    return null;
  };

  private buildSearchForm() {
    if (!this.form) {
      this.form = this.fb.group({
        /** 在仓库存左区间 */
        warehouseStockFrom: [null],
        /** 在仓库存右区间 */
        warehouseStockTo: [null],
        /** 货号 */
        itemNo: [null],
        /** 商品名 */
        itemName: [null],
        /** 小店铺关联商品：0全部，1已关联，2未关联 */
        type: [0],
        /** 最近入库时间 */
        dateRange: [[null, null], [this.dateRangeCompareValidator]],
      });
    }
    this.form.patchValue({
      warehouseStockFrom: this.$routeParams.warehouseStockFrom,
      warehouseStockTo: this.$routeParams.warehouseStockTo,
      itemNo: this.$routeParams.itemNo,
      itemName: this.$routeParams.itemName,
      type: this.$routeParams.type || 0,
      dateRange: [
        this.$routeParams.lastWarehouseTimeFrom
          ? new Date(+this.$routeParams.lastWarehouseTimeFrom)
          : null,
        this.$routeParams.lastWarehouseTimeTo
          ? new Date(+this.$routeParams.lastWarehouseTimeTo)
          : null,
      ],
    });
  }

  private getWarehouseGoodsList() {
    const dateRange = this.form.get('dateRange').value.map((date, index) => {
      let d = isDate(date) ? moment(date) : undefined;
      if (!d) {
        return;
      }
      if (index === 1) {
        d = d.add(1, 'days').subtract(1, 'seconds');
      }
      return d.format('YYYY-MM-DD HH:mm:ss');
    });
    return this.goodsService
      .getWarehouseGoodsList({
        ...omit(this.form.value, 'dateRange'),
        page: this.page,
        pageSize: this.pageSize,
        lastWarehouseTimeFrom: dateRange[0],
        lastWarehouseTimeTo: dateRange[1],
        classId1List: this.getIdArray(this.goodsCategoryLevelOne),
        classId2List: this.getIdArray(this.goodsCategoryLevelTwo),
        classId3List: this.getIdArray(this.goodsCategoryLevelThree),
        sortName: this.sortName && this.sortValue ? this.sortName : undefined,
        sortValue: this.sortValue,
      })
      .subscribe(({ data }) => {
        this.goodsData = data;
      });
  }

  private getClass2Tree() {
    this.goodsService.getClass2Tree({ only_on: 0 }).subscribe(({ data }) => {
      this.goodsCategoryList = data;
      this.formatClass2Tree();
    });
  }

  private formatClass2Tree() {
    this.goodsCategoryLevelOne = this.formatObjectToArray(
      this.goodsCategoryList,
      'goodsCategoryLevelOne',
    );

    this.goodsCategoryLevelTwo = this.getGoodsCategoryLevelTwoAndThree(
      this.goodsCategoryLevelOne,
      this.routeParamsLv1,
      this.routeParamsLv2,
    );

    this.goodsCategoryLevelThree = this.getGoodsCategoryLevelTwoAndThree(
      this.goodsCategoryLevelTwo,
      this.routeParamsLv2,
      this.routeParamsLv3,
    );

    this.getWarehouseGoodsList();
  }

  private formatObjectToArray(object: any, routeParams: string | null) {
    return Object.keys(object).map(key => {
      const item = object[key];
      return {
        id: item.class_id,
        text: item.class_name,
        value: this.$routeParams[routeParams]
          ? this.$routeParams[routeParams].includes(item.class_id)
          : false,
        children: item.children
          ? this.formatObjectToArray(item.children, routeParams)
          : undefined,
      };
    });
  }

  private getGoodsCategoryLevelTwoAndThree(
    fatherCategory: any[],
    fatherRouteParams: string[],
    selfRouteParams: string[],
  ) {
    return isArray(fatherRouteParams)
      ? fatherRouteParams.reduce((acc, value) => {
          const father = find(fatherCategory, { id: value });
          if (!father) {
            return [];
          }
          return [
            ...acc,
            ...get(father, 'children', []).map(item => ({
              ...item,
              value: selfRouteParams.includes(item.id),
            })),
          ];
        }, [])
      : [];
  }

  private isNilOrString(some: any) {
    return isNil(some) || some === '';
  }
}
