import { pick } from 'lodash';
import { WarehouseOrderService } from './../../services/warehouse-order.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
	selector: 'app-warehouse-order-detail',
	templateUrl: './warehouse-order-detail.component.html',
	styleUrls: [ './warehouse-order-detail.component.less' ]
})
export class WarehouseOrderDetailComponent implements OnInit {
	id: string = '';
	warehouseDetail: any = {};
	isDeliverModalVisible = false;
  isConfirmModalVisible = false;
  sellerName = '';
  isItemNoNeedWarn = false;
	confirmer;
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
		'德邦'
	];
	deliverForm: any = {
		carrier: this.carrierOptions[0]
	};

	constructor(
		private activatedRoute: ActivatedRoute,
		private warehouseOrderService: WarehouseOrderService,
		private router: Router,
		private nzMessageService: NzMessageService
	) {}

	ngOnInit() {
    this.sellerName = localStorage.getItem('seller_name');
		this.activatedRoute.paramMap.subscribe((params) => {
			this.id = params.get('id');
			this.warehouseOrderService.fetchWarehouseOrderDetail({ id: params.get('id') }).subscribe((res) => {
        this.warehouseDetail = res.data;
        this.isItemNoNeedWarn = this.warehouseDetail.purchaseOrders.some((order) => order.items.some(i => i.realItemNo !== i.itemNo));
        if (res.data.carrierInfo) {
          const carrierInfo = res.data.carrierInfo.split(',');
          this.warehouseDetail.carNo = carrierInfo[0];
          this.warehouseDetail.driverName = carrierInfo[1];
          this.warehouseDetail.driverPhone = carrierInfo[2];
        }
				this.warehouseDetail.statusStr = this.warehouseOrderService
					.getWarehouseOrderStatus()
					.find((v) => v.value === this.warehouseDetail.status).label;
			});
		});
	}

	navigateToEdit() {
		this.router.navigate([ '../', 'edit' ], { relativeTo: this.activatedRoute });
  }

  handleNumberBlur(event) {
    event.target.value = Math.abs(+event.target.value).toFixed(0) || '';
  }

	_submitDeliverForm(isValid) {
		if (isValid) {
			const params: any = { id: this.id, ...pick(this.deliverForm, [ 'carrier', 'carrierInfo' ]) };

			if (this.deliverForm.carrier === '货拉拉') {
				params.carrierInfo = Object.values(
					pick(this.deliverForm, [ 'carNo', 'driverName', 'driverPhone' ])
				).join(',');
			}
			this.warehouseOrderService.deliverWarehouseOrder(params).subscribe((res) => {
				this.nzMessageService.success('发货成功');
				this.ngOnInit();
				this.isDeliverModalVisible = false;
			});
		}
	}

	cancel() {
		this.warehouseOrderService.cancelWarehouseOrder({ id: this.id }).subscribe((res) => {
			this.nzMessageService.success('撤销成功');
			this.ngOnInit();
		});
	}

	confirm() {
		const params = { id: this.id, confirmer: this.confirmer, warehouseOrderDetailRes: this.warehouseDetail };
		this.warehouseOrderService.confirmWarehouseOrder(params).subscribe((res) => {
			this.nzMessageService.success('确认成功');
			this.ngOnInit();
			this.isConfirmModalVisible = false;
		});
  }

	alert() {
		this.warehouseOrderService
			.alertWarehouseOrder({ id: this.id, alert: +!this.warehouseDetail.alert })
			.subscribe((res) => {
				this.nzMessageService.success('设置警告成功');
				this.ngOnInit();
			});
	}
}
