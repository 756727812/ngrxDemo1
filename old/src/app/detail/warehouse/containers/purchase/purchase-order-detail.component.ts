import { PurchaseService } from './../../services/purchase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
	selector: 'app-purchase-order-detail',
	templateUrl: './purchase-order-detail.component.html',
	styleUrls: [ './purchase-order-detail.component.less' ]
})
export class PurchaseOrderDetailComponent implements OnInit {
	tabs: any[] = [
		{
			name: '采购单'
		},
		{
			name: '入库情况'
		}
	];
	type: number = 0;
	id: string = '';
	loading: boolean = false;
  confirmer: string = '';
  sellerName: string = '';
	warehouseData: any;
	purchaseData: any = {
		supplier: {},
		items: {}
	};
	isConfirmModalVisible: boolean = false;
	isCancelModalVisible: boolean = false;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private purchaseService: PurchaseService,
		private nzMessageService: NzMessageService
	) {}

	ngOnInit() {
    this.sellerName = localStorage.getItem('seller_name');
		this.activatedRoute.paramMap.subscribe((params) => {
			this.id = params.get('id');
			this.purchaseService.fetchPurchaseOrderWarehouseDetail({ id: params.get('id') }).subscribe((data) => {
        this.warehouseData = data;
			});
			this.purchaseService.fetchPurchaseOrderDetail({ id: params.get('id') }).subscribe((data) => {
        this.purchaseData = data;
			});
		});
	}

	cancel() {
		this.purchaseService.cancelPurchaseOrder({ id: this.id }).subscribe((res) => {
			this.isCancelModalVisible = false;
			this.nzMessageService.success('撤销成功');
			this.ngOnInit();
		});
	}

	confirm() {
		this.purchaseService.confirmPurchaseOrder({ id: this.id, confirmer: this.confirmer }).subscribe((res) => {
			this.isConfirmModalVisible = false;
			this.nzMessageService.success('财务确认成功');
			this.ngOnInit();
		});
	}

	navigateToEdit() {
		this.router.navigate([ '../', 'edit' ], { relativeTo: this.activatedRoute });
	}

	navigateToWarehouse() {
		this.router.navigate([ '../../../', 'warehouseOrder', 'new', this.purchaseData.id ], { relativeTo: this.activatedRoute });
	}

	selectTab($evt) {
		this.type = $evt;
	}
}
