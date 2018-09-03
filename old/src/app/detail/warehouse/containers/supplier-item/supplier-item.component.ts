import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { HeaderPath } from '@shared/components';
import * as fromStore from '../../store';
import { SupplierService } from '../../services';
import { Supplier, Accessor } from '../../models';

@Component({
  selector: 'supplier-item',
  templateUrl: 'supplier-item.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierItemComponent implements OnInit, OnDestroy {
  headerTitle = '新建供应商';
  paths: HeaderPath[] = [
    { title: 'SEE仓管理' },
    { title: '供应商', link: '/warehouse/suppliers' },
    { title: '新建' },
  ];
  editMode = false;
  detailMode = false;
  id: string;
  supplier$: Observable<Supplier>;
  loading$: Observable<boolean>;
  routeData$ = this.route.data;
  accessors$: Observable<Accessor[]>;
  isNeedGuard$: Observable<boolean>;

  constructor(
    private store: Store<fromStore.WarehouseState>,
    private route: ActivatedRoute,
    private router: Router,
    private modalSrv: NzModalService,
  ) {}

  ngOnInit() {
    this.bindWarningBeforeUnload();

    this.supplier$ = this.store.select(fromStore.getSelectedSupplier);
    this.loading$ = this.store.select(fromStore.getSuppliersLoading);
    this.accessors$ = this.store.select(fromStore.getAccessorsList);
    this.isNeedGuard$ = this.store.select(fromStore.getIsNeedGuardState);

    this.route.params.subscribe((params: Params) => {
      if (params.id) {
        this.id = params.id;
        this.headerTitle = '供应商详情';
        this.paths[2].title = '查看详情';
      }
    });
  }

  ngOnDestroy() {
    window.onbeforeunload = null;
  }

  private bindWarningBeforeUnload() {
    if (process.env.NODE_ENV === 'production' && !this.detailMode) {
      window.onbeforeunload = e => {
        const evt = e || window.event;
        if (evt) {
          evt.returnValue = '您可能有数据没有保存';
        }
        return '您可能有数据没有保存';
      };
    }
  }

  navigateToEdit() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onCreate(event: Supplier) {
    this.store.dispatch(new fromStore.CreateSupplier(event));
  }

  onUpdate(event: Supplier) {
    this.store.dispatch(new fromStore.UpdateSupplier(event));
  }

  private canDeactivate() {
    if (this.detailMode) {
      return true;
    }
    return Observable.create(observer => {
      this.isNeedGuard$.subscribe(value => {
        if (value) {
          this.modalSrv.confirm({
            content: '要离开吗？系统可能不会保存你所做的更改。',
            okText: '留下',
            cancelText: '离开',
            onOk: () => {
              observer.next(false);
            },
            onCancel: () => {
              observer.next(true);
            },
          });
        } else {
          observer.next(true);
        }
      });
    });
  }
}
