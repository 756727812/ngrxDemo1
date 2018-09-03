import { WarehouseOrderService } from './warehouse-order.service';
import { Injectable, Inject, forwardRef } from '@angular/core';
import { _HttpClient, throwObservableError, ModalHelper } from '@shared/services';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/observable/throw';
import { ModalWarehouseItemListComponent } from 'app/detail/warehouse/components/modal-warehouse-item-list/modal-warehouse-item-list.component';
import { ModalPurchaseOrderListComponent } from 'app/detail/warehouse/components/modal-purchase-order-list/modal-purchase-order-list.component';

@Injectable()
export class PurchaseService {
	constructor(
		private http: _HttpClient,
		private modalHelper: ModalHelper,
		@Inject(forwardRef(() => WarehouseOrderService)) private warehouseOrderService: WarehouseOrderService
	) {}

	fetchPurchaseList(body) {
    return this.http.post('api/ng/inventory/purchaseOrder/list', { body })
      .map(res => {
        res.data.list.forEach(o => {
          o.statusStr = this
						.getPurchaseOrderStatus()
						.find((v) => v.value === o.status).label;
        })
        return res;
      })
      .pipe(catchError(throwObservableError));
	}

	addPurchaseOrder(body) {
		return this.http.post('api/ng/inventory/purchaseOrder/add', { body }).pipe(catchError(throwObservableError));
	}

	editPurchaseOrder(body) {
		return this.http.post('api/ng/inventory/purchaseOrder/edit', { body }).pipe(catchError(throwObservableError));
	}

	fetchPurchaseOrderWarehouseDetail(params) {
		return this.http
			.get('/api/ng/inventory/purchaseOrder/warehouseOrder', params)
			.map((res) => {
				let warehouseData = res.data;
				warehouseData.warehouseRecords.forEach((e) => {
					e.statusStr = this.warehouseOrderService
						.getWarehouseOrderStatus()
						.find((v) => v.value === e.status).label;
        });
        return warehouseData;
			})
			.pipe(catchError(throwObservableError));
	}

	fetchPurchaseOrderDetail(params) {
		return this.http
			.get('/api/ng/inventory/purchaseOrder/detail', params)
			.map((res) => {
				let purchaseData = res.data;
				purchaseData.sumQuantity = 0;
				purchaseData.statusStr = this.getPurchaseOrderStatus().find(
					(v) => v.value === purchaseData.status
        ).label;
        purchaseData.settlementMethodStr = this.getSettlementMethodOptions().find(
					(v) => v.value === purchaseData.settlementMethod
				).label;
				purchaseData.sumAmount = purchaseData.items.reduce((ac, cur) => {
					purchaseData.sumQuantity += cur.quantity;
					return ac + cur.unitPrice * cur.quantity;
				}, 0);
				return purchaseData;
			})
			.pipe(catchError(throwObservableError));
	}

	cancelPurchaseOrder(body) {
		return this.http
			.post('/api/ng/inventory/purchaseOrder/cancel', { body })
			.pipe(catchError(throwObservableError));
	}

	confirmPurchaseOrder(body) {
		return this.http
			.post('/api/ng/inventory/purchaseOrder/confirm', { body })
			.pipe(catchError(throwObservableError));
	}

	getPurchaseOrderStatus() {
		return [
			{
				value: 0,
				label: '已撤销'
			},
			{
				value: 1,
				label: '新建'
			},
			{
				value: 2,
				label: '财务已确认'
			},
			{
				value: 3,
				label: '待入库'
			},
			{
				value: 4,
				label: '部分入库'
			},
			{
				value: 5,
				label: '采购已完成'
			}
		];
	}

	getSettlementMethodOptions() {
		return [ { value: 0, label: '月结' }, { value: 1, label: '款到发货' }, { value: 2, label: '其他' } ];
	}

	openModalForAddPurchaseItem(selectedItems: any[]) {
		let selectedItemsId = selectedItems.map((item) => item.id);
		return this.modalHelper.static(ModalWarehouseItemListComponent, { selectedItemsId }, 'lg', { title: '选择商品' });
	}
}
