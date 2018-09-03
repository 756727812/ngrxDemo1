import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromSuppliers from './suppliers.reducer';

export interface WarehouseState {
  suppliers: fromSuppliers.SupplierState;
}

export const reducers: ActionReducerMap<WarehouseState> = {
  suppliers: fromSuppliers.reducer,
};

export const getWarehouseState = createFeatureSelector<WarehouseState>(
  'warehouse',
);
