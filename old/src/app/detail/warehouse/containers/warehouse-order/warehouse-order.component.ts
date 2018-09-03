import { Observable } from 'rxjs/Observable';
import { WarehouseOrderService } from './../../services/warehouse-order.service';
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
import * as _ from 'lodash';

@Component({
  selector: 'app-warehouse-order',
  templateUrl: './warehouse-order.component.html',
  styleUrls: ['./warehouse-order.component.css'],
})
export class WarehouseOrderComponent implements OnInit {
  isEdit: boolean = false;
  paths = [
    { title: 'SEE仓管理', link: '' },
    { title: '入库管理', link: '/warehouse/warehouseOrder' },
  ];
  searchChange$: any;
  warehouseDetail: any = {};
  isConfirmModalVisible: boolean = false;
  isNeedGuard = true;
  validateForm: FormGroup;
  supplierOptions: any[];
  id: number;
  purchaseOrderId: number;
  sellerName: string;
  sellerEmail: string;
  carrierOptions = [
    'EMS-中国国内',
    '货拉拉',
    '顺丰',
    '申通',
    '圆通',
    '中通',
    '汇通',
    '韵达',
    '宅急送',
    '天天',
    'FedEx-国际',
    'DHL',
    'TNT',
    'UPS',
    'USPS',
    '英国大包、EMS（Parcel Force）',
    '英国小包（Royal Mail）',
    '海淘一号仓',
    'CNPEX中邮快递',
    '国通快递',
    '笨鸟海淘',
    '贝海',
    '邮政-中国国内',
    '邮政-国际',
    'EMS-国际',
    '其他',
    '快捷',
    '百世快递',
    '优速物流',
    '安能',
    '德邦',
  ];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private nzMessageService: NzMessageService,
    private warehouseOrderService: WarehouseOrderService,
    private modalSrv: NzModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.sellerEmail = localStorage.getItem('seller_email');
    this.sellerName = localStorage.getItem('seller_name');

    this.buildForm();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.purchaseOrderId = params.purchaseOrderId;
      this.id = params.id;

      const { type } = this.activatedRoute.snapshot.data;
      if (type && type === 'edit') {
        this.isEdit = true;
      }
      this.isEdit
        ? this.paths.push({ title: '编辑', link: '' })
        : this.paths.push({ title: '新建', link: '' });

      if (this.isEdit) {
        this.warehouseOrderService
          .fetchWarehouseOrderDetail({ id: params.id })
          .subscribe(({ data }) => {
            this.warehouseDetail = data;
            for (const o of this.warehouseDetail.purchaseOrders) {
              for (const i of o.items) {
                i.oldQuantity = i.warehouseQuantity;
              }
            }

            /* 入库待确认和已入库的采购单信息只供展示，不需验证 */
            if (data.status > 2) {
              this.getFormControl('purchaseOrders').clearValidators();
            }

            this.validateForm.patchValue({
              remark: data.remark,
              purchaseOrders: data.purchaseOrders,
              warehouseForecasterPhone: data.warehouseForecasterPhone,
              carrier: data.carrier,
            });

            if (data.carrierInfo) {
              const carrierInfo = data.carrierInfo.split(',');
              data.carNo = carrierInfo[0];
              data.driverName = carrierInfo[1];
              data.driverPhone = carrierInfo[2];
              this.handleCarrierChange(data);
            }
          });
      }

      /* 通过采购单创建 */
      if (this.purchaseOrderId) {
        this.purchaseService
          .fetchPurchaseOrderDetail({ id: this.purchaseOrderId })
          .subscribe(data => {
            const purchaseOrder = Object.assign({}, data);
            purchaseOrder.items.forEach(i => {
              i.warehouseQuantity = 0;
            });
            this.validateForm.patchValue({
              purchaseOrders: [purchaseOrder],
            });
          });
      }
    });

    this.searchChange$ = new Subject();
    this.searchChange$
      .filter(searchText => searchText)
      .debounceTime(500)
      .subscribe(searchText => {
        this.supplierService
          .querySupplierList({ keyword: searchText, limit: 10 })
          .subscribe(({ data }) => {
            this.supplierOptions = data;
          });
      });
  }

  buildForm() {
    this.validateForm = this.fb.group({
      warehouseForecasterPhone: [null, Validators.required],
      carrier: [''],
      remark: [''],
      purchaseOrders: [[], this.purchaseOrderValidator.bind(this)],
    });
    return this.validateForm;
  }

  purchaseOrderValidator(control: FormControl) {
    /* if (this.warehouseDetail.status > 2) {
      return {};
    } */
    const value = control.value;
    if (!value.length || value.length === 0) {
      return { required: true, error: true };
    }

    for (const order of value) {
      for (const i of order.items) {
        if (i.warehouseQuantity == null || i.warehouseQuantity === '') {
          return { required: true, error: true };
        }
        if (
          i.warehouseQuantity >
          i.quantity -
            (this.isEdit
              ? i.inwayGoodQuantitySum - i.oldQuantity
              : i.inwayGoodQuantitySum)
        ) {
          return { quantity: true, error: true };
        }
      }
    }
  }

  numberBlur(controlName) {
    this.getFormControl(controlName).setValue(
      +this.getFormControl(controlName).value || '',
    );
  }

  _submitForm() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
    }
    if (this.validateForm.invalid) {
      return;
    }
    let params = Object.assign({}, this.validateForm.value);
    if (params.carrier === '货拉拉') {
      params.carrierInfo = [
        params.carNo,
        params.driverName,
        params.driverPhone,
      ].join(',');
    }
    console.log(this.validateForm.value);
    if (!this.isEdit) {
      this.warehouseOrderService.addWarehouseOrder(params).subscribe(res => {
        this.nzMessageService.success('创建成功');
        this.isNeedGuard = false;
        this.router.navigateByUrl('warehouse/warehouseOrder');
      });
    } else {
      if ([1, 2].includes(this.warehouseDetail.status)) {
        params.id = this.id;
        this.warehouseOrderService.editWarehouseOrder(params).subscribe(res => {
          this.nzMessageService.success('编辑成功');
          this.isNeedGuard = false;
          this.router.navigateByUrl(
            `warehouse/warehouseOrder/${this.id}/detail`,
          );
        });
      } else {
        params = { id: this.id, remrak: params.remark };
        this.warehouseOrderService
          .editWarehouseOrderRemark(params)
          .subscribe(res => {
            this.nzMessageService.success('编辑成功');
            this.isNeedGuard = false;
            this.router.navigateByUrl(
              `warehouse/warehouseOrder/${this.id}/detail`,
            );
          });
      }
    }
  }

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

  handleCarrierChange(data: any = {}) {
    if (this.getFormControl('carrier').value === '货拉拉') {
      this.validateForm.addControl(
        'carNo',
        new FormControl(data.carNo || '', [Validators.required]),
      );
      this.validateForm.addControl(
        'driverName',
        new FormControl(data.driverName || '', [Validators.required]),
      );
      this.validateForm.addControl(
        'driverPhone',
        new FormControl(data.driverPhone || '', [Validators.required]),
      );
      console.log(this.validateForm.controls);
      this.validateForm.removeControl('carrierInfo');
    } else {
      this.validateForm.removeControl('carNo');
      this.validateForm.removeControl('driverName');
      this.validateForm.removeControl('driverPhone');
      this.validateForm.addControl(
        'carrierInfo',
        new FormControl(data.carrierInfo || '', [Validators.required]),
      );
    }
  }

  isFormControlHasError(name: string, validator: string = 'required') {
    const formControl = this.getFormControl(name);
    return formControl.dirty && formControl.hasError(validator);
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    }
    if (control.value !== this.validateForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
  };

  getFormControl(name) {
    return this.validateForm.controls[name];
  }
}
