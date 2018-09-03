import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { map, switchMap, catchError } from 'rxjs/operators';

import * as fromRoot from 'app/store';
import * as supplierActions from '../actions/suppliers.action';
import * as fromServices from '../../services';

@Injectable()
export class SuppliersEffects {
  constructor(
    private actions$: Actions,
    private supplierService: fromServices.SupplierService,
    private message: NzMessageService,
  ) {}

  @Effect()
  loadSuppliers$ = this.actions$.ofType(supplierActions.LOAD_SUPPLIERS).pipe(
    map((action: supplierActions.LoadSuppliers) => action.payload),
    switchMap(search => {
      return this.supplierService
        .getSuppliersList(search)
        .pipe(
          map(suppliers => new supplierActions.LoadSuppliersSuccess(suppliers)),
          catchError(error => of(new supplierActions.LoadSuppliersFail(error))),
        );
    }),
  );

  @Effect()
  loadAccessor$ = this.actions$.ofType(supplierActions.LOAD_ACCESSORS).pipe(
    switchMap(() => {
      return this.supplierService
        .getAccessorsList()
        .pipe(
          map(accessors => new supplierActions.LoadAccessorsSuccess(accessors)),
          catchError(error => of(new supplierActions.LoadAccessorsFail(error))),
        );
    }),
  );

  @Effect()
  loadSupplierItem$ = this.actions$
    .ofType(supplierActions.LOAD_SUPPLIER_ITEM)
    .pipe(
      map((action: supplierActions.LoadSupplierItem) => action.payload),
      switchMap(supplierId => {
        return this.supplierService
          .getSuppliersDetail({ supplierId })
          .pipe(
            map(
              supplier => new supplierActions.LoadSupplierItemSuccess(supplier),
            ),
            catchError(error =>
              of(new supplierActions.LoadSupplierItemFail(error)),
            ),
          );
      }),
    );

  @Effect()
  createSupplier$ = this.actions$.ofType(supplierActions.CREATE_SUPPLIER).pipe(
    map((action: supplierActions.CreateSupplier) => action.payload),
    switchMap(supplier => {
      return this.supplierService
        .addSupplier(supplier)
        .pipe(
          map(res => new supplierActions.CreateSupplierSuccess(res.data)),
          catchError(error =>
            of(new supplierActions.CreateSupplierFail(error)),
          ),
        );
    }),
  );

  @Effect()
  updateSupplier$ = this.actions$.ofType(supplierActions.UPDATE_SUPPLIER).pipe(
    map((action: supplierActions.UpdateSupplier) => action.payload),
    switchMap(supplier => {
      return this.supplierService
        .editSupplierItem(supplier)
        .pipe(
          map(res => new supplierActions.UpdateSupplierSuccess(res.data)),
          catchError(error =>
            of(new supplierActions.UpdateSupplierFail(error)),
          ),
        );
    }),
  );

  @Effect()
  handleSupplierSuccess$ = this.actions$
    .ofType(
      supplierActions.CREATE_SUPPLIER_SUCCESS,
      supplierActions.UPDATE_SUPPLIER_SUCCESS,
    )
    .pipe(
      map(
        (
          action:
            | supplierActions.UpdateSupplierSuccess
            | supplierActions.CreateSupplierSuccess,
        ) => {
          this.message.success('操作成功！');
          return new fromRoot.Go({
            path: ['/warehouse/suppliers', action.payload],
          });
        },
      ),
    );
}
