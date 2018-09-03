import { NzModalService } from 'ng-zorro-antd';
import { Component, Injector } from '@angular/core';
import { ModalChooseGoodsComponent } from '../../components/modal-choose-goods/modal-choose-goods.component';
import { BaseBenefitBase } from '../../base-benefit.base';
import { FormBuilder, FormGroup } from '@angular/forms';
import { productIdValidator } from '../../validators/validators';
import { getProductIds } from '../../services/utils.service';

@Component({
  templateUrl: './goods-group.component.html',
  styleUrls: ['./goods-group.component.less'],
})
export class BenefitGoodGroupComponent extends BaseBenefitBase {
  groupId: number;
  groupName: string;
  data: any[] = [];
  count: number = 0;
  page: number = 1;
  pageSize: number = 30;
  _indeterminate: boolean = false;
  _allChecked: boolean = false;
  activityId: number;
  isEdit: boolean = false;
  aForm: FormGroup;
  pageSizeSelectorValues: number[] = [30, 50, 80, 100];

  isLoading: boolean = false;

  constructor(
    private injector: Injector,
    private fb: FormBuilder,
    private modalService: NzModalService,
  ) {
    super(injector);
    this.activeRoute.queryParams.subscribe(r => {
      const { id, groupId, groupName } = r;
      this.groupId = +groupId;
      this.activityId = +id;
      this.groupName = groupName;
    });
  }

  ngOnInit() {
    this.getActInfo();
    this.initForm();
  }

  private initForm() {
    this.aForm = this.fb.group({
      parentId: ['', productIdValidator],
      productId: ['', productIdValidator],
      productName: [''],
    });
  }

  resetForm(e: MouseEvent) {
    e.preventDefault();
    this.aForm = this.fb.group({
      parentId: ['', productIdValidator],
      productId: ['', productIdValidator],
      productName: [''],
    });
    this.submitForm();
  }

  submitForm() {
    const { parentId, productId, productName } = this.aForm.value;
    const data = {
      productName,
      parentId: getProductIds(parentId),
      productId: getProductIds(productId),
      pageSize: this.pageSize,
      groupId: this.groupId,
    };
    this.loadData(data);
  }

  private getActInfo() {
    this.benefitService
      .activityById({ activityId: this.activityId })
      .subscribe(r => {
        const data = this.benefitService.dataListFormat(r)[0];
        this.isEdit = data.status < 2 && data.status >= 0;
        this.loadData();
      });
  }

  private loadData(data?: {
    productName: number;
    parentId: any[];
    productId: any[];
  }) {
    const params = Object.assign(
      {},
      {
        page: this.page,
        pageSize: this.pageSize,
        groupId: this.groupId,
      },
      data,
    );
    this.isLoading = true;
    this.benefitService.queryByGroupId(params).subscribe(({ count, list }) => {
      this.data = list;
      this.count = count || 0;
      this.isLoading = false;
    }, () => (this.isLoading = false));
  }

  reback() {
    this.to('../benefit-edit', {
      id: this.activityId,
      xpdId: this.xiaodianpuId,
    });
  }

  _refreshStatus() {
    const allChecked = this.data.every(
      value => value.disabled || value.checked,
    );
    const allUnChecked = this.data.every(
      value => value.disabled || !value.checked,
    );
    this._allChecked = allChecked;
    this._indeterminate = !allChecked && !allUnChecked;
  }

  _checkAll(value) {
    if (value) {
      this.data.forEach(data => {
        if (!data.disabled) {
          data.checked = true;
        }
      });
    } else {
      this.data.forEach(data => (data.checked = false));
    }
    this._refreshStatus();
  }

  pageChange() {
    this.submitForm();
  }

  removeGroupProduct(data) {
    const params = {
      groupId: this.groupId,
      productId: data.productId,
    };
    this.isLoading = true;
    this.benefitService.removeGroupProduct(params).subscribe(r => {
      this.notify.success('信息提示', '商品移出成功!');
      this.submitForm();
    }, () => (this.isLoading = false));
  }

  addGoods() {
    const modal: any = this.modalService.open({
      title: '添加商品',
      style: {
        'min-width': '1000px',
      },
      componentParams: {
        groupId: this.groupId,
        activityId: this.activityId,
        xiaodianpuId: this.xiaodianpuId,
      },
      content: ModalChooseGoodsComponent,
      footer: false,
      maskClosable: false,
    });
    modal.subscribe(data => {
      if (data.type) {
        if (data.type === 'toList') {
          modal.destroy('onCancel');
          this.ngOnInit();
        }
      }
      if (data === 'onHidden') {
        this.ngOnInit();
      }
    });
  }

  groupTractBy(index, item) {
    return item.productId;
  }

  sortGroup(data, m) {
    if (data === -2) {
      return this.notify.warning('信息提示', '长度不能超过10位！');
    }
    if (data === -1) {
      return this.notify.warning('信息提示', '需填写大于等于0的整数！');
    }

    if (m.orderNum === data) return;
    m.orderNum = data;
    this.data = this.utils.sortBy(this.data, 'orderNum');
    this.isLoading = true;
    this.benefitService
      .updateOrderNum({
        productId: m.productId,
        orderNum: data,
        groupId: this.groupId,
      })
      .subscribe(_ => {
        this.notify.success('信息提示', '分组商品排序修改成功！');
        this.isLoading = false;
      }, () => (this.isLoading = false));
  }
}
