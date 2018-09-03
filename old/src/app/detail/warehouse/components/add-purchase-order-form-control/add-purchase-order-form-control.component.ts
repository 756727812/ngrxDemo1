import { ModalPurchaseOrderListComponent } from 'app/detail/warehouse/components/modal-purchase-order-list/modal-purchase-order-list.component';
import { ModalHelper } from '@shared/services';
import { Component, OnInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PurchaseService } from '../../services';
import * as moment from 'moment';
import { pick } from 'lodash';

interface VALUE {
	items: any[];
	purchaseOrderId;
}

@Component({
	selector: 'app-add-purchase-order-form-control',
	templateUrl: './add-purchase-order-form-control.component.html',
	styleUrls: [ './add-purchase-order-form-control.component.less' ],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AddPurchaseOrderFormControlComponent),
			multi: true
		}
	]
})
export class AddPurchaseOrderFormControlComponent implements OnInit, ControlValueAccessor {
	// ngModel Access
	@Input() _value: any[] = [];
  @Input() isEdit: boolean = false;
  @Input() warehouseStatus:number;

	private _onChange: (value: VALUE[]) => void = () => null;
	private _onTouched: () => void = () => null;

	// 展示数据
	ordersData: any[] = [];

	constructor(private purchaseService: PurchaseService, private modalHelper: ModalHelper) {}

	ngOnInit() {}

	formatOrderInfo(order) {
		let result = pick(order, [ 'expiryDate', 'id', 'purchaseOrderItemId', 'warehouseQuantity' ]);
		return result;
	}

	addOrder() {
		this.openModalForAddPurchaseOrder(this._value).subscribe((data) => {
			const { action, order } = data;
			if (data.action === 'add') {
				this.purchaseService.fetchPurchaseOrderDetail({ id: order.id }).subscribe((detail) => {
					order.items = detail.items;
					this.ordersData.push(order);
					this._value.push({
						purchaseOrderId: order.id,
						items: detail.items.map((i) => ({
							quantity: i.quantity,
							inwayGoodQuantitySum: i.inwayGoodQuantitySum,
							warehouseItemId: i.warehouseItemId,
							purchaseOrderItemId: i.id,
							warehouseQuantity: 0,
							expiryDate: null
						}))
					});
					this.emitChange();
				});
			} else if (data.action === 'remove') {
				this._value = this._value.filter((el) => el.purchaseOrderId !== data.id);
				this.ordersData = this.ordersData.filter((el) => el.id !== data.id && el.purchaseOrderId !== data.id);
				this.emitChange();
			}
		});
	}

	emitChange() {
		this._onChange(this._value);
	}

	emitItemChange(item) {
		if (item.expiryDate) {
			item.expiryDate = moment(item.expiryDate).format('YYYY-MM-DD HH:mm:ss');
		} else {
			item.expiryDate = null;
		}
		this.emitChange();
	}

	quantityBlur(item) {
		item.warehouseQuantity = +item.warehouseQuantity;
		if (!item.warehouseQuantity || item.warehouseQuantity < 0) {
			item.warehouseQuantity = 0;
		}
	}

	deleteOrder(id) {
		this.ordersData = this.ordersData.filter((elem) => elem.id !== id);
		this._value = this._value.filter((elem) => elem.purchaseOrderId !== id);
	}

	openModalForAddPurchaseOrder(selectedOrders: any[]) {
		let selectedOrdersId = selectedOrders.map((item) => item.purchaseOrderId);
		return this.modalHelper.static(ModalPurchaseOrderListComponent, { selectedOrdersId }, 'lg', { title: '选择采购单' });
  }

	writeValue(purchaseOrders: any[]) {
		this.ordersData = purchaseOrders;
		purchaseOrders.forEach((elem) => {
			this._value.push({
				purchaseOrderId: elem.purchaseOrderId || elem.id,
				items: elem.items.map((i) => ({
					warehouseItemId: i.warehouseItemId,
					purchaseOrderItemId: i.id,
					warehouseQuantity: i.warehouseQuantity,
          expiryDate: i.expiryDate || null,
          oldQuantity: i.oldQuantity || null,
          quantity: i.quantity,
          inwayGoodQuantitySum: i.inwayGoodQuantitySum,
				}))
			});
		});
		this._onChange(this._value);
	}

	registerOnChange(fn: (_: VALUE[]) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}
}
