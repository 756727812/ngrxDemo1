import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { filter, pickBy, isNil } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { SupplierService } from '../../services';
import { Supplier, Accessor } from '../../models';

type IFormParams = {
  /** 公司信息 */
  keyword?: string;
  /** 联系人 */
  contact?: string;
  /** 类型 0=品牌商,1=一级代理商,2=二级代理商,3=贸易商 */
  type?: number;
  /** see对接人 */
  seeAccesser?: string;
};

export const TYPE_OPTIONS = [
  {
    label: '全部',
    value: null,
  },
  {
    label: '品牌商',
    value: 0,
  },
  {
    label: '一级代理商',
    value: 1,
  },
  {
    label: '二级代理商',
    value: 2,
  },
  {
    label: '贸易商',
    value: 3,
  },
];

@Component({
  selector: 'suppliers',
  templateUrl: 'suppliers.component.html',
})
export class SuppliersComponent implements OnInit {
  paths = [{ title: 'SEE仓管理' }, { title: '供应商' }];
  searchForm: FormGroup;
  formData: IFormParams = Object.create(null);
  page: number;
  pageSize: number;
  typeOptions = TYPE_OPTIONS;
  kolAdminList$: Observable<Accessor[]>;
  suppliers$: Observable<Supplier[]>;
  count$: Observable<number>;
  loading$: Observable<boolean>;

  constructor(
    private store: Store<fromStore.WarehouseState>,
    private route: ActivatedRoute,
    private router: Router,
    private supplierService: SupplierService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.buildForm();

    this.suppliers$ = this.store.select(fromStore.getAllSuppliers);
    this.count$ = this.store.select(fromStore.getSuppliersCount);
    this.kolAdminList$ = this.store.select(fromStore.getAccessorsList);
    this.loading$ = this.store.select(fromStore.getSuppliersLoading);

    this.route.queryParams.subscribe((params: Params) => {
      const {
        keyword,
        type = null,
        seeAccesser = null,
        page = 1,
        pageSize = 30,
      } = params;
      this.page = page >>> 0;
      this.pageSize = pageSize;
      this.searchForm.patchValue({
        keyword,
        type,
        seeAccesser,
      });
      this.store.dispatch(
        new fromStore.LoadSuppliers({
          keyword,
          type,
          seeAccesser,
          page,
          pageSize,
        }),
      );
    });
  }

  submitForm($event: UIEvent, value: IFormParams) {
    $event.preventDefault();
    this.searchForm.markAsDirty();
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        ...pickBy(
          this.searchForm.value,
          value => !isNil(value) && value !== 'null',
        ),
        page: 1,
        pageSize: this.pageSize,
      },
    });
  }

  resetForm() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: 1, pageSize: this.pageSize },
    });
  }

  add() {
    this.router.navigate(['new'], {
      relativeTo: this.route,
    });
  }

  changePage() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: this.page, pageSize: this.pageSize },
      queryParamsHandling: 'merge',
    });
  }

  private buildForm() {
    this.searchForm = this.fb.group({
      keyword: [null],
      type: [null],
      seeAccesser: [null],
    });
    return this.searchForm;
  }
}
