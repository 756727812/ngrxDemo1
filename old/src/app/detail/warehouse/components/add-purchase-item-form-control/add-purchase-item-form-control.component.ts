import { Component, OnInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PurchaseService } from '../../services';

@Component({
	selector: 'app-add-purchase-item-form-control',
	templateUrl: './add-purchase-item-form-control.component.html',
	styleUrls: [ './add-purchase-item-form-control.component.css' ],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AddPurchaseItemFormControlComponent),
			multi: true
		}
	]
})
export class AddPurchaseItemFormControlComponent implements OnInit, ControlValueAccessor {
	// ngModel Access
	@Input() _value: any[] = [];
	@Input('sDisabled') disabled: boolean = false;

	private _onChange: (value: any[]) => void = () => null;
	private _onTouched: () => void = () => null;

	constructor(private purchaseService: PurchaseService) {}

	ngOnInit() {}

	addItem() {
		console.log(1);
		this.purchaseService.openModalForAddPurchaseItem(this._value).subscribe((data) => {
			const { item, action } = data;
			if (action === 'add') {
        item.unit = '件'
				this._value.push(item);
			} else if (action === 'remove') {
				this._value = this._value.filter((el) => el.id !== item.id);
			}
			this._onChange(this._value);
		});
	}

	deleteItem(id) {
		this._value = this._value.filter((elem) => elem.id !== id);
		this._onChange(this._value);
	}

	emitChange() {
		this._onChange(this._value);
	}

	handleNumberBlur(item, fieldName) {
		if (fieldName === 'unitPrice') {
			item[fieldName] = Math.abs(+item[fieldName] || 0).toFixed(2);
		} else if (fieldName === 'quantity') {
			item[fieldName] = Math.round(Math.abs(+item[fieldName])) || '';
		} else {
			item[fieldName] = Math.abs(+item[fieldName] || 0);
		}
	}

	get quantitySum() {
		return this._value.reduce((prevV, curV, idx) => {
			return prevV + ~~curV['quantity'];
		}, 0);
	}

	getItemPriceSum(item: any) {
		return parseFloat((item.quantity * item.unitPrice).toFixed(1)) || 0;
	}

	get priceSum() {
		let sum = this._value.reduce((prevV, curV, idx) => {
			return prevV + curV['quantity'] * curV['unitPrice'];
		}, 0);
		return parseFloat(sum.toFixed(10));
	}

	writeValue(value: any[]) {
		this._value = value;
	}

	registerOnChange(fn: (_: any[]) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}
}
