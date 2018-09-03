import { Action } from '@ngrx/store';

import { Supplier, Accessor } from '../../models';

// load suppliers list
export const LOAD_SUPPLIERS = '[Warehouse] Load Suppliers';
export const LOAD_SUPPLIERS_FAIL = '[Warehouse] Load Suppliers Fail';
export const LOAD_SUPPLIERS_SUCCESS = '[Warehouse] Load Suppliers Success';

export class LoadSuppliers implements Action {
  readonly type = LOAD_SUPPLIERS;
  constructor(
    public payload: any = {
      pageSize: 20,
    },
  ) {}
}

export class LoadSuppliersFail implements Action {
  readonly type = LOAD_SUPPLIERS_FAIL;
  constructor(public payload: any) {}
}

export class LoadSuppliersSuccess implements Action {
  readonly type = LOAD_SUPPLIERS_SUCCESS;
  constructor(
    public payload: {
      count: number;
      list: Supplier[];
    },
  ) {}
}

// load supplier item
export const LOAD_SUPPLIER_ITEM = '[Warehouse] Load Supplier Item';
export const LOAD_SUPPLIER_ITEM_FAIL = '[Warehouse] Load Supplier Item Fail';
export const LOAD_SUPPLIER_ITEM_SUCCESS =
  '[Warehouse] Load Supplier Item Success';

export class LoadSupplierItem implements Action {
  readonly type = LOAD_SUPPLIER_ITEM;
  constructor(public payload: string) {}
}

export class LoadSupplierItemFail implements Action {
  readonly type = LOAD_SUPPLIER_ITEM_FAIL;
  constructor(public payload: any) {}
}

export class LoadSupplierItemSuccess implements Action {
  readonly type = LOAD_SUPPLIER_ITEM_SUCCESS;
  constructor(public payload: Supplier) {}
}

// create supplier
export const CREATE_SUPPLIER = '[Warehouse] Create Supplier';
export const CREATE_SUPPLIER_FAIL = '[Warehouse] Create Supplier Fail';
export const CREATE_SUPPLIER_SUCCESS = '[Warehouse] Create Supplier Success';

export class CreateSupplier implements Action {
  readonly type = CREATE_SUPPLIER;
  constructor(public payload: Supplier) {}
}

export class CreateSupplierFail implements Action {
  readonly type = CREATE_SUPPLIER_FAIL;
  constructor(public payload: any) {}
}

export class CreateSupplierSuccess implements Action {
  readonly type = CREATE_SUPPLIER_SUCCESS;
  constructor(public payload: any) {}
}

// update supplier
export const UPDATE_SUPPLIER = '[Warehouse] Update Supplier';
export const UPDATE_SUPPLIER_FAIL = '[Warehouse] Update Supplier Fail';
export const UPDATE_SUPPLIER_SUCCESS = '[Warehouse] Update Supplier Success';

export class UpdateSupplier implements Action {
  readonly type = UPDATE_SUPPLIER;
  constructor(public payload: Supplier) {}
}

export class UpdateSupplierFail implements Action {
  readonly type = UPDATE_SUPPLIER_FAIL;
  constructor(public payload: any) {}
}

export class UpdateSupplierSuccess implements Action {
  readonly type = UPDATE_SUPPLIER_SUCCESS;
  constructor(public payload: any) {}
}

// load accessors
export const LOAD_ACCESSORS = '[Warehouse] Load Accessors';
export const LOAD_ACCESSORS_SUCCESS = '[Warehouse] Load Accessors Success';
export const LOAD_ACCESSORS_FAIL = '[Warehouse] Load Accessors Fail';

export class LoadAccessors implements Action {
  readonly type = LOAD_ACCESSORS;
}

export class LoadAccessorsSuccess implements Action {
  readonly type = LOAD_ACCESSORS_SUCCESS;
  constructor(public payload: Accessor[]) {}
}

export class LoadAccessorsFail implements Action {
  readonly type = LOAD_ACCESSORS_FAIL;
  constructor(public payload: any) {}
}

// action types
export type SuppliersAction =
  | LoadSuppliers
  | LoadSuppliersFail
  | LoadSuppliersSuccess
  | LoadSupplierItem
  | LoadSupplierItemSuccess
  | LoadSupplierItemFail
  | CreateSupplier
  | CreateSupplierFail
  | CreateSupplierSuccess
  | UpdateSupplier
  | UpdateSupplierFail
  | UpdateSupplierSuccess
  | LoadAccessors
  | LoadAccessorsSuccess
  | LoadAccessorsFail;
