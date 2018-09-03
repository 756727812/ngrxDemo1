import { Observable } from 'rxjs/Observable';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import { SupplierService, PurchaseService } from '../../services';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { omit, map } from 'lodash';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.css'],
})
export class PurchaseOrderComponent implements OnInit {
  isEdit: boolean = false;
  paths = [
    { title: 'SEE仓管理', link: '' },
    { title: '采购管理', link: '/warehouse/purchaseOrder' },
  ];
  searchChange$: any;
  purchaseOrderData: any;
  supplierOptions: any[] = [];
  supplierInfo: any;
  sellerName: string;
  isNeedGuard = true;
  sellerEmail: string;
  id: number;
  isConfirmModalVisible: boolean = false;
  validateForm: FormGroup;
  buyerOptions = [
    'SEE MOBILE TECHNOLOGY',
    '香港万有引力科技有限公司',
    '深圳冰与火科技有限公司',
    '深圳碳原子科技有限公司',
  ];
  currencyOptions = [
    '人民币',
    '美元',
    '欧元',
    '英镑',
    '日元',
    '港币',
    '新台币',
  ];

  voucherOptions: any = [
    {
      value: '发票',
      label: '发票',
    },
    {
      value: 'Invoice',
      label: 'Invoice',
    },
    {
      value: '采购订单截图',
      label: '采购订单截图',
    },
    {
      value: '合同/结算单',
      label: '合同/结算单',
    },
    {
      value: '其他文件',
      label: '其他文件(请备注说明)',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private nzMessageService: NzMessageService,
    private modalSrv: NzModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.sellerEmail = localStorage.getItem('seller_email');
    this.sellerName = localStorage.getItem('seller_name');
    this.activatedRoute.params.subscribe((params: Params) => {
      const { type } = this.activatedRoute.snapshot.data;
      this.id = params.id;
      if (type && type === 'edit') {
        this.isEdit = true;
      }
      this.isEdit
        ? this.paths.push({ title: '编辑', link: '' })
        : this.paths.push({ title: '新建', link: '' });

      if (this.isEdit || type === 'copy') {
        this.purchaseService
          .fetchPurchaseOrderDetail({ id: params.id })
          .subscribe(data => {
            this.supplierInfo = data.supplier;
            this.purchaseOrderData = data;
            setTimeout(() => {
              if (Number(data.settlementMethod) === 1) {
                this.getFormControl('expectPaymentTime').setValidators([
                  Validators.required,
                ]);
                this.validateForm.patchValue({
                  expectPaymentTime: new Date(data.expectPaymentTime),
                });
              }
              this.validateForm.patchValue({
                remark: data.remark,
                settlementMethod: data.settlementMethod,
                buyer: data.buyer,
                currency: data.currency,
                items: data.items,
                otherAmount: data.otherAmount,
                supplier: data.supplier,
                supplierId: data.supplier.id,
                voucher: this.voucherOptions.map(v => {
                  v.checked = data.voucher.indexOf(v.value) > -1;
                  return v;
                }),
              });
            }, 0);
          });
      }
    });

    this.searchChange$ = new Subject();
    this.searchChange$
      .filter(searchText => searchText)
      .debounceTime(500)
      .subscribe(searchText => {
        this.supplierService
          .querySupplierList({ keyword: searchText })
          .subscribe(({ data }) => {
            this.supplierOptions = data;
          });
      });

    this.validateForm = this.fb.group({
      settlementMethod: [null, Validators.required],
      remark: [''],
      supplier: [null, Validators.required],
      voucher: [this.voucherOptions, this.voucherValidator],
      buyer: [null, Validators.required],
      currency: ['', Validators.required],
      items: [[], this.purchaseItemValidator],
      otherAmount: [0],
      expectPaymentTime: [null],
    });
  }

  handleSettlementMethodChange(data: any = {}) {
    if (this.getFormControl('settlementMethod').value === 1) {
      this.getFormControl('expectPaymentTime').setValidators([
        Validators.required,
      ]);
      this.getFormControl('expectPaymentTime').setValue(null);
      /* this.getFormControl('expectPaymentTime').markAsDirty(); */
    } else {
      this.getFormControl('expectPaymentTime').clearValidators();
      this.getFormControl('expectPaymentTime').updateValueAndValidity();
    }
  }

  handleNumberBlur(name) {
    this.getFormControl(name).setValue(
      Math.abs(+this.getFormControl(name).value || 0).toFixed(2),
    );
  }

  voucherValidator(control: FormControl) {
    if (control.value.filter(el => el.checked).length === 0) {
      return { required: true, error: true };
    }
  }

  purchaseItemValidator(control: FormControl) {
    const value = control.value;
    if (!value.length || value.length === 0) {
      return { required: true, error: true };
    }
    for (const item of value) {
      if (!item.unit || !item.quantity || !item.unitPrice) {
        return { omit: true, error: true };
      }
    }
  }

  _submitForm() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
    }
    if (this.validateForm.invalid) {
      return;
    }
    let params;
    if (!this.isEdit) {
      params = Object.assign({}, omit(this.validateForm.value, ['supplier']));
      params.supplierId = this.validateForm.value.supplier.id;
      params.supplierName = this.validateForm.value.supplier.companyName;
      params.items = params.items.map(elem => ({
        quantity: elem.quantity,
        unit: elem.unit,
        unitPrice: elem.unitPrice,
        warehouseItemId: elem.warehouseItemId || elem.id,
      }));
      params.voucher = this.getCheckboxGroupValue(
        this.validateForm.value.voucher,
      );
      if (params.settlementMethod === 1) {
        params.expectPaymentTime = moment(params.expectPaymentTime).format(
          'YYYY-MM-DD HH:mm:ss',
        );
      }
      this.purchaseService.addPurchaseOrder(params).subscribe(res => {
        this.nzMessageService.success('创建成功');
        this.isNeedGuard = false;
        this.router.navigateByUrl(
          `warehouse/purchaseOrder/${res.data.id}/detail`,
        );
      });
    } else {
      params = { remark: this.validateForm.value.remark, id: this.id };
      this.purchaseService.editPurchaseOrder(params).subscribe(res => {
        this.nzMessageService.success('编辑成功');
        this.isNeedGuard = false;
        this.router.navigateByUrl(`warehouse/purchaseOrder/${this.id}/detail`);
      });
    }
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    }
    if (control.value !== this.validateForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
  };

  private canDeactivate() {
    if (!this.isNeedGuard) {
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

  get sumAmount() {
    return (
      this.getFormControl('items').value.reduce((ac, item) => {
        return ac + (item.unitPrice * item.quantity || 0);
      }, 0) + ~~this.getFormControl('otherAmount').value
    );
  }

  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  isFormControlHasError(name: string, validator: string = 'required') {
    const formControl = this.getFormControl(name);
    return formControl.dirty && formControl.hasError(validator);
  }

  getCheckboxGroupValue(value: any[]) {
    return map(value.filter(v => v.checked), 'value').join(',');
  }
}
