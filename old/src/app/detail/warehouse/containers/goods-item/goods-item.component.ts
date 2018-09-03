import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  ValidationErrors,
  FormBuilder,
} from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { isObject, omit, pick, get } from 'lodash';
import { HeaderPath } from '@shared/components';
import { WarehouseGoodsService } from '../../services';

const DEFAULT_SELLER = '外仓库（624977698@qq.com）';

@Component({
  selector: 'warehouse-goods-item',
  templateUrl: 'goods-item.component.html',
  styles: [
    `
      :host ::ng-deep .ant-table-placeholder {
        display: none;
      }
    `,
  ],
})
export class WarehouseGoodsItemComponent implements OnInit, OnDestroy {
  headerTitle = '新建商品';
  paths: HeaderPath[] = [
    { title: 'SEE仓管理' },
    { title: '仓库商品', link: '/warehouse/goods' },
    { title: '新建' },
  ];
  form: FormGroup;
  classOptions: any[] = null;
  editMode = false;
  detailMode = false;
  id: string;
  defaultSeller = DEFAULT_SELLER;
  isVisible = false;
  isNeedGuard = true;
  itemTray = null;

  get loading() {
    return this.goodsService.loading;
  }

  get classOptionString(): string {
    if (!this.form || !this.classOptions) {
      return '';
    }
    const option = this.form.get('classOption').value;
    if (Array.isArray(option) && option.length === 3 && !!option[2]) {
      return option.map(o => o.label).join(' - ');
    }
    return '';
  }

  constructor(
    private fb: FormBuilder,
    private goodsService: WarehouseGoodsService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private modalSrv: NzModalService,
  ) {}

  ngOnInit() {
    this.bindWarningBeforeUnload();
    this.buildForm();

    this.route.params.subscribe((params: Params) => {
      const { type } = this.route.snapshot.data;
      if (type === 'new') {
        this.addOneRow();
      }
      if (params.id) {
        this.id = params.id;
        this.headerTitle = `商品详情<small>SEE仓ID：${this.id}</small>`;
        this.paths[2].title = '查看详情';
        if (type === 'edit') {
          this.editMode = true;
        }
        if (type === 'detail') {
          this.detailMode = true;
        }
      }
      this.getClass2Tree();
    });
  }

  ngOnDestroy() {
    window.onbeforeunload = null;
  }

  private bindWarningBeforeUnload() {
    if (process.env.NODE_ENV === 'production' && !this.detailMode) {
      window.onbeforeunload = e => {
        const evt = e || window.event;
        if (evt) {
          evt.returnValue = '您可能有数据没有保存';
        }
        return '您可能有数据没有保存';
      };
    }
  }

  private canDeactivate() {
    if (this.detailMode || !this.isNeedGuard) {
      return true;
    }
    return Observable.create(observer => {
      this.modalSrv.confirm({
        content: '要离开吗？系统可能不会保存你所做的更改。',
        okText: '留下',
        cancelText: '离开',
        onOk: () => {
          observer.next(false);
        },
        onCancel: () => {
          observer.next(true);
        },
      });
    });
  }

  navigateToEdit() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  addOneRow({
    itemNo = null,
    specificationName = null,
    weight = null,
    length = null,
    width = null,
    height = null,
  }: {
    itemNo?: string;
    specificationName?: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  } = {}) {
    (<FormArray>this.form.get('skuArrayList')).push(
      new FormGroup({
        itemNo: new FormControl(itemNo, [
          Validators.required,
          this.noWhitespaceValidator,
          this.itemNoDuplicatedValidator,
        ]),
        specificationName: new FormControl(specificationName, [
          Validators.required,
          this.noWhitespaceValidator,
        ]),
        weight: new FormControl(weight),
        length: new FormControl(length),
        width: new FormControl(width),
        height: new FormControl(height),
      }),
    );
  }

  deleteRow(index: number) {
    (<FormArray>this.form.get('skuArrayList')).removeAt(index);
  }

  log(a) {
    console.log(a);
  }

  submitForm(form: FormGroup) {
    this.form.markAsDirty();
    Object.keys(this.form.controls).forEach(key =>
      this.form.get(key).markAsDirty(),
    );
    (<FormArray>this.form.get('skuArrayList')).controls.forEach(
      (c: FormGroup) => {
        c.markAsDirty();
        Object.keys(c.controls).forEach(key => {
          c.get(key).markAsDirty();
        });
      },
    );
    if (form.invalid) {
      return;
    }
    if (this.editMode) {
      this.handleOk(null, form);
    } else {
      this.isVisible = true;
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  handleOk(event: UIEvent, form: FormGroup) {
    const { tray, classOption: [classId1, classId2, classId3] } = form.value;
    const params: { [k: string]: any } = {
      ...omit(form.value, 'classOption'),
      classId1: classId1.value || classId1 || null,
      classId2: classId2.value || classId2 || null,
      classId3: classId3.value || classId3 || null,
      tray: tray >>> 0,
    };
    if (this.editMode) {
      this.editItem({
        ...omit(params, 'skuArrayList'),
        ...omit(params.skuArrayList[0], 'itemNo'),
        id: this.id,
      });
    } else {
      this.addItem(params);
    }
    this.isVisible = false;
  }

  getFormControl(name) {
    return this.form.get(name);
  }

  getFormArrayControl(formArrayKey: number, name: string) {
    return (<FormArray>this.form.get('skuArrayList'))
      .at(formArrayKey)
      .get(name);
  }

  itemNoDuplicatedValidator = (
    control: FormControl,
  ): { [key: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    }
    if (
      (<FormArray>this.form.get('skuArrayList')).controls.filter(
        item => item.get('itemNo').value === control.value,
      ).length > 1
    ) {
      return { error: true, duplicated: true };
    }
  };

  private buildForm() {
    this.form = this.fb.group({
      tray: [false],
      itemName: [null, [Validators.required, this.noWhitespaceValidator]],
      classOption: [[], Validators.required],
      skuArrayList: this.fb.array([], Validators.required),
    });
    return this.form;
  }

  private noWhitespaceValidator = (control: FormControl): ValidationErrors => {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { required: true };
  };

  private submitSuccess(msg: string) {
    this.message.success(msg);
    this.isNeedGuard = false;
    this.router.navigate(['../'], {
      relativeTo: this.route,
    });
  }

  private addItem(formValue) {
    return this.goodsService
      .addWarehouseGoods(formValue)
      .subscribe(() => this.submitSuccess('新建商品成功'));
  }

  private editItem(formValue) {
    return this.goodsService
      .editWarehouseGoods(formValue)
      .subscribe(() => this.submitSuccess('编辑商品成功'));
  }

  private getItemDetail(warehouseItemId) {
    return this.goodsService
      .getWarehouseGoodsDetail({ warehouseItemId })
      .subscribe(
        ({
          data: {
            tray,
            classId1,
            classId2,
            classId3,
            itemName,
            itemNo,
            specificationName,
            weight,
            length,
            width,
            height,
          },
        }) => {
          const classMap1: any = this.classOptions.find(
            o => Number(o.value) === Number(classId1),
          );
          const classMap2: any =
            classMap1 && classMap1.children
              ? classMap1.children.find(
                  o => Number(o.value) === Number(classId2),
                )
              : null;
          const classMap3: any =
            classMap2 && classMap2.children
              ? classMap2.children.find(
                  o => Number(o.value) === Number(classId3),
                )
              : null;
          const keys = ['value', 'label', 'isLeaf'];
          let classOption;
          if (classMap1 && classMap2 && classMap3) {
            classOption = [
              pick(classMap1, keys),
              classMap2 ? pick(classMap2, keys) : null,
              classMap3 ? pick(classMap3, keys) : null,
            ];
          } else {
            classOption = [];
            this.message.warning('当前品类已下架，请重新选择');
          }
          this.itemTray = tray;
          this.form.patchValue({
            tray,
            itemName,
            classOption,
          });
          this.addOneRow({
            itemNo,
            specificationName,
            weight,
            length,
            width,
            height,
          });
        },
      );
  }

  // private getClassMapById(classArray: any, id: string | number, isLeaf = false) {
  //   const result = classArray.find(item => Number(item.value) === Number(id));
  //   if (result) {
  //     return result;
  //   }
  //   return get
  // }

  private getClass2Tree() {
    return this.goodsService
      .getClass2Tree({ only_on: this.detailMode ? 0 : 1 })
      .subscribe(({ data }) => {
        // 只能挂含三级品类的品类
        this.classOptions = this.genClassArray(data)
          .filter(cls1 => Array.isArray(cls1.children))
          .map(cls1 => {
            return {
              ...cls1,
              children: cls1.children.filter(cls2 =>
                Array.isArray(cls2.children),
              ),
            };
          });
        // ng-zorro
        setTimeout(() => {
          this.form.get('classOption').markAsPristine();
        });
        if (this.editMode || this.detailMode) {
          this.getItemDetail(this.id);
        }
        return this.classOptions;
      });
  }

  private genClassArray(someObject: Object): any[] {
    return Object.values(someObject).map(item => ({
      value: item.class_id,
      label: item.class_name,
      // 接口的 is_leaf 不可靠
      isLeaf: !item.children,
      children: isObject(item.children)
        ? this.genClassArray(item.children)
        : undefined,
    }));
  }
}
