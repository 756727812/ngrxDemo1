import { WarehouseGoodsService } from './../../services/goods.service';
import { Component, OnInit, Input } from '@angular/core';
import { NzModalSubject } from 'ng-zorro-antd';
import { pick, pickBy } from 'lodash';

@Component({
	selector: 'app-modal-warehouse-item-list',
	templateUrl: './modal-warehouse-item-list.component.html',
	styleUrls: [ './modal-warehouse-item-list.component.css' ]
})
export class ModalWarehouseItemListComponent implements OnInit {
	@Input()
	set selectedItemsId(value: number[]) {
		this._selectedItemsId = value;
	}
	searchForm: any = {};
  page: number = 1;
  pageSize: number = 10;
	goodsData: any = {
		list: [],
		count: 0
	};
	_selectedItemsId: number[] = [];

	constructor(private subject: NzModalSubject, private goodsService: WarehouseGoodsService) {}

	ngOnInit() {
		/* this.getItemsList(); */
	}

	getItemsList() {
		const params = { page: this.page, pageSize: this.pageSize, ...pickBy(this.searchForm, (v) => v && v.length > 0) };
		this.goodsService.getWarehouseGoodsList(params).subscribe((res) => {
      this.goodsData = res.data;
			this.goodsData.list.forEach((elem) => {
				elem.selected = this._selectedItemsId.some((id) => `${id}` === `${elem['id']}`);
			});
		});
	}

	selectItem(item) {
    item.selected = true;
    this._selectedItemsId.push(item.id);
		this.subject.next({
			action: 'add',
			item
		});
	}

	unselectItem(item) {
    item.selected = false;
    this._selectedItemsId = this._selectedItemsId.filter(el => el !== item.id);
		this.subject.next({
			action: 'remove',
			item
		});
	}
}
