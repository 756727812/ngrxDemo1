import { SupplierService } from './../../services/supplier.service';
import { Subject } from 'rxjs/Subject';
import { WarehouseOrderService } from './../../services/warehouse-order.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { omit, pickBy } from 'lodash';
import * as moment from 'moment';

@Component({
	selector: 'app-warehouse-order-list',
	templateUrl: './warehouse-order-list.component.html',
	styleUrls: [ './warehouse-order-list.component.css' ]
})
export class WarehouseOrderListComponent implements OnInit {
	searchForm: any;
	paths = [ { title: 'SEE仓管理', link: '' }, { title: '入库管理', link: '' } ];
	$routeParams: any = Object.create(null);
	supplierChange$;
	warehouseOrderData: any = {
		list: [],
		count: 0
	};
	page = 1;
	pageSize = 30;
	statusOptions: any[] = [];
	supplierOptions: any[];

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private warehouseOrderService: WarehouseOrderService,
		private supplierService: SupplierService,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.$routeParams = params;
      this.page = params.page || 1;
			this.buildSearchForm();
			this.warehouseOrderService.fetchWarehouseOrderList(this.searchForm).subscribe((data) => {
				this.warehouseOrderData = data;
				this.warehouseOrderData.list.forEach((elem) => {
					elem.items = elem.items.split('\n');
        });
			});
		});

		/* 供应商筛选 */
		this.supplierChange$ = new Subject();
		this.supplierChange$.filter((searchText) => searchText).debounceTime(500).subscribe((searchText) => {
			this.supplierService.querySupplierList({ keyword: searchText, limit: 10 }).subscribe(({ data }) => {
				this.supplierOptions = data;
			});
		});

		this.statusOptions = this.warehouseOrderService.getWarehouseOrderStatus();
	}

	private buildSearchForm() {
		this.searchForm = {
			itemNo: this.$routeParams.itemNo,
			itemName: this.$routeParams.itemName,
			orderNo: this.$routeParams.orderNo,
			supplier: this.$routeParams.supplier,
      status: this.$routeParams.status,
      warehouseForecaster: this.$routeParams.warehouseForecaster,
			alert: this.$routeParams.alert,
			settlementMethod: this.$routeParams.settlementMethod,
			startCreateTime: this.$routeParams.startCreateTime,
			endCreateTime: this.$routeParams.endCreateTime,
			dateRange: [
				this.$routeParams.startCreateTime ? new Date(this.$routeParams.startCreateTime) : null,
				this.$routeParams.endCreateTime ? new Date(this.$routeParams.endCreateTime) : null
			],
			page: this.page,
			pageSize: this.pageSize
		};
		console.log(this.searchForm);
	}

	submitSearch() {
		let params = {
			...this.$routeParams,
			...omit(this.searchForm, 'dateRange'),
			startCreateTime:
				this.searchForm.dateRange && this.searchForm.dateRange[0]
					? moment(this.searchForm.dateRange[0]).format('YYYY-MM-DD HH:mm:ss')
					: null,
			endCreateTime:
				this.searchForm.dateRange && this.searchForm.dateRange[1]
					? moment(this.searchForm.dateRange[1]).add(1, 'days').subtract(1, 'seconds').format('YYYY-MM-DD HH:mm:ss')
					: null,
			page: 1
		};
		params = pickBy(params, (el) => el != null && el.toString().length > 0);
		this.router.navigate([ '.' ], {
			relativeTo: this.activatedRoute,
			queryParams: params
		});
	}

	pageChange() {
		this.router.navigate([ '.' ], {
			relativeTo: this.activatedRoute,
			queryParams: { page: this.page, pageSize: this.pageSize },
			queryParamsHandling: 'merge'
		});
	}

	resetForm() {
		this.router.navigate([ '.' ], {
			relativeTo: this.activatedRoute,
			queryParams: null
		});
	}

	newWarehouseOrder() {
		this.router.navigate(['new'], {
      relativeTo: this.activatedRoute,
    });
	}
}
