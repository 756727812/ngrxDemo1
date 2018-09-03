import * as fromSuppliers from '../actions/suppliers.action';
import { Supplier, Accessor } from '../../models';

export interface SupplierState {
  entities: { [id: number]: Supplier };
  count: number;
  loading: boolean;
  accessors: Accessor[];
  isNeedGuard: boolean;
}

export const initialState: SupplierState = {
  entities: {},
  count: 0,
  loading: false,
  accessors: [],
  isNeedGuard: true,
};

export function reducer(
  state = initialState,
  action: fromSuppliers.SuppliersAction,
): SupplierState {
  switch (action.type) {
    case fromSuppliers.LOAD_SUPPLIER_ITEM:
    case fromSuppliers.LOAD_SUPPLIERS: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromSuppliers.LOAD_SUPPLIERS_SUCCESS: {
      const { list, count } = action.payload;

      const entities = list.reduce(
        (entities: { [id: number]: Supplier }, supplier: Supplier) => {
          return {
            ...entities,
            [supplier.id]: supplier,
          };
        },
        {},
      );

      return {
        ...state,
        entities,
        count,
        loading: false,
      };
    }

    case fromSuppliers.LOAD_SUPPLIER_ITEM_SUCCESS: {
      const supplier = action.payload;
      const entities = {
        ...state.entities,
        [supplier.id]: supplier,
      };

      return {
        ...state,
        entities,
        loading: false,
      };
    }

    case fromSuppliers.LOAD_SUPPLIERS_FAIL:
    case fromSuppliers.LOAD_SUPPLIER_ITEM_FAIL: {
      return {
        ...state,
        loading: false,
      };
    }

    case fromSuppliers.LOAD_ACCESSORS_SUCCESS: {
      const accessors = action.payload;
      return {
        ...state,
        accessors,
      };
    }

    case fromSuppliers.CREATE_SUPPLIER_SUCCESS:
    case fromSuppliers.UPDATE_SUPPLIER_SUCCESS: {
      return {
        ...state,
        isNeedGuard: false,
      };
    }
  }

  return state;
}

export const getSuppliersEntities = (state: SupplierState) => state.entities;
export const getSuppliersLoading = (state: SupplierState) => state.loading;
export const getSuppliersCount = (state: SupplierState) => state.count;
export const getAccessors = (state: SupplierState) => state.accessors;
export const getIsNeedGuard = (state: SupplierState) => state.isNeedGuard;
