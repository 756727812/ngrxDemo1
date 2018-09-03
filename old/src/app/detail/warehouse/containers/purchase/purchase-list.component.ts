import { SupplierService } from './../../services/supplier.service';
import { Subject } from 'rxjs/Subject';
import { PurchaseService } from './../../services/purchase.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import { omit, pickBy } from 'lodash';
import * as moment from 'moment';

@Component({
	selector: 'app-purchase-list',
	templateUrl: './purchase-list.component.html',
	styleUrls: [ './purchase-list.component.css' ]
})
export class PurchaseListComponent implements OnInit {
	searchForm: any = {};
	purchaseOrderData = {
		list: [],
		count: 0
	};
	page = 1;
	pageSize = 30;
	paths = [ { title: 'SEE仓管理', link: '' }, { title: '采购管理', link: '' } ];
	$routeParams: any = Object.create(null);
	kolAdminList$;
	supplierChange$;

	supplierOptions: any[];
	statusOptions: any[] = [];
	supplierTypeOptions: any[] = [];
	settlementMethodOptions: any[] = [];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private purchaseService: PurchaseService,
		private supplierService: SupplierService
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
      this.$routeParams = params;
      this.page = params.page || 1;
			this.buildSearchForm();
			this.purchaseService.fetchPurchaseList(this.searchForm).subscribe(({ data }) => {
				data.list.forEach((elem) => {
					elem.items = elem.items.split('\n');
				});
				this.purchaseOrderData = data;
			});
		});

		/* 供应商筛选 */
		this.supplierChange$ = new Subject();
		this.supplierChange$.filter((searchText) => searchText).debounceTime(500).subscribe((searchText) => {
			this.supplierService.querySupplierList({ keyword: searchText }).subscribe(({ data }) => {
				this.supplierOptions = data;
			});
		});

		this.statusOptions = this.purchaseService.getPurchaseOrderStatus();
		this.supplierTypeOptions = this.supplierService.getSupplierTypeOptions();
		this.settlementMethodOptions = this.purchaseService.getSettlementMethodOptions();
	}

	private buildSearchForm() {
		this.searchForm = {
			purchaseOrderNo: this.$routeParams.purchaseOrderNo,
			itemNo: this.$routeParams.itemNo,
			itemName: this.$routeParams.itemName,
			supplier: this.$routeParams.supplier,
			status: this.$routeParams.status,
			applicant: this.$routeParams.applicant,
			supplierType: this.$routeParams.supplierType,
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
			startCreateTime: this.searchForm.dateRange && this.searchForm.dateRange[0] ? moment(this.searchForm.dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : null,
			endCreateTime: this.searchForm.dateRange && this.searchForm.dateRange[1] ? moment(this.searchForm.dateRange[1]).add(1, 'days').subtract(1, 'seconds').format('YYYY-MM-DD HH:mm:ss') : null,
			page: 1
		};
		params = pickBy(params, (el) => el != null && el.toString().length > 0);
		this.router.navigate([ '.' ], {
			relativeTo: this.route,
			queryParams: params
		});
	}

	pageChange() {
		this.router.navigate([ '.' ], {
			relativeTo: this.route,
			queryParams: { page: this.page, pageSize: this.pageSize },
			queryParamsHandling: 'merge'
		});
	}

	getStatusStr(status) {
		return this.purchaseService.getPurchaseOrderStatus().find((v) => v.value === status).label;
	}

	newPurchaseOrder() {
		this.router.navigate(['new'], {
      relativeTo: this.route,
    });
	}

	resetForm() {
		this.router.navigate([ '.' ], {
			relativeTo: this.route,
			queryParams: null
		});
	}
}
