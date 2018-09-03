import { pick, pickBy } from 'lodash';
import { PurchaseService } from './../../services/purchase.service';
import { Component, OnInit, Input } from '@angular/core';
import { NzModalSubject, NzNotificationService } from 'ng-zorro-antd';

@Component({
	selector: 'app-modal-purchase-order-list',
	templateUrl: './modal-purchase-order-list.component.html',
	styleUrls: [ './modal-purchase-order-list.component.css' ]
})
export class ModalPurchaseOrderListComponent implements OnInit {
	@Input()
	set selectedOrdersId(value: number[]) {
		this._selectedOrdersId = value;
  }
  searchForm:any = {};
	_selectedOrdersId: number[] = [];
	purchaseOrders: any = {
		list: [],
		count: 0
  };
  warningModal = false;
  selectedOrders = [];
  page: number = 1;
  pageSize: number = 10;

	constructor(private subject: NzModalSubject, private purchaseService: PurchaseService, private _notification: NzNotificationService) {}

	ngOnInit() {
		/* this.getOrdersList(); */
	}

	getOrdersList() {
    const params = { page: this.page, pageSize: this.pageSize, statusList: [2,3,4] , ...pickBy(this.searchForm, (v) => v && v.length > 0)};
		this.purchaseService.fetchPurchaseList(params).subscribe((res) => {
      this.purchaseOrders = res.data;
			this.purchaseOrders.list.forEach((elem) => {
				elem.selected = this._selectedOrdersId.some((id) => `${id}` === `${elem['id']}`);
			});
		});
  }

	selectOrder(order) {
    if (this._selectedOrdersId.length > 0) {
      this._notification.info('提示', '仅支持添加一个采购单');
      return;
    }
    this._selectedOrdersId.push(order.id);
    order.selected = true;
    this.subject.next({
      action: 'add',
      order
    });
  }

  unselectOrder(order) {
    this._selectedOrdersId = this._selectedOrdersId.filter(el => el !== order.id);
    order.selected = false;
    this.subject.next({
      action: 'remove',
      id: order.id
    })
  }
}
