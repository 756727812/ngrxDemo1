import { Injectable, Inject, forwardRef } from '@angular/core';
import { _HttpClient, throwObservableError, ModalHelper } from '@shared/services';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/observable/throw';
import { ModalWarehouseItemListComponent } from 'app/detail/warehouse/components/modal-warehouse-item-list/modal-warehouse-item-list.component';

@Injectable()
export class WarehouseOrderService {
	constructor(private http: _HttpClient, private modalHelper: ModalHelper) {}

	fetchWarehouseOrderList(body) {
		return this.http
			.post('api/ng/inventory/warehouseOrder/list', { body })
			.map(({ data }) => {
				data.list.forEach((e) => {
					e.statusStr = this.getWarehouseOrderStatus().find((v) => v.value === e.status).label;
        });
        return data;
			})
			.pipe(catchError(throwObservableError));
	}

	fetchWarehouseOrderDetail(params) {
		return this.http.get('api/ng/inventory/warehouseOrder/detail', params).pipe(catchError(throwObservableError));
	}

	alertWarehouseOrder(body) {
		return this.http.post('api/ng/inventory/warehouseOrder/alert', { body }).pipe(catchError(throwObservableError));
	}

	deliverWarehouseOrder(body) {
		return this.http
			.post('api/ng/inventory/warehouseOrder/deliver', { body })
			.pipe(catchError(throwObservableError));
	}

	cancelWarehouseOrder(body) {
		return this.http
			.post('api/ng/inventory/warehouseOrder/cancel', { body })
			.pipe(catchError(throwObservableError));
	}

	confirmWarehouseOrder(body) {
		return this.http
			.post('api/ng/inventory/warehouseOrder/warehouse', { body })
			.pipe(catchError(throwObservableError));
	}

	addWarehouseOrder(body) {
		return this.http.post('api/ng/inventory/warehouseOrder/add', { body }).pipe(catchError(throwObservableError));
	}

	editWarehouseOrder(body) {
		return this.http.post('api/ng/inventory/warehouseOrder/edit', { body }).pipe(catchError(throwObservableError));
  }

  editWarehouseOrderRemark(body) {
		return this.http.post('api/ng/inventory/warehouseOrder/editRemark', { body }).pipe(catchError(throwObservableError));
	}

	getWarehouseOrderStatus() {
		return [
			{ value: 0, label: '已撤销' },
			{ value: 1, label: '新建' },
			{ value: 2, label: '入库在途' },
			{ value: 3, label: '入库待确认' },
			{ value: 4, label: '已入库 ' }
		];
	}
}
