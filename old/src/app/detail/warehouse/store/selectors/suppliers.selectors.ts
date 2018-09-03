import { createSelector } from '@ngrx/store';

import * as fromRoot from 'app/store';
import * as fromFeature from '../reducers';
import * as fromSuppliers from '../reducers/suppliers.reducer';

import { Supplier } from '../../models';

export const getSuppliersState = createSelector(
  fromFeature.getWarehouseState,
  (state: fromFeature.WarehouseState) => state.suppliers,
);

export const getSuppliersEntities = createSelector(
  getSuppliersState,
  fromSuppliers.getSuppliersEntities,
);

export const getSelectedSupplier = createSelector(
  getSuppliersEntities,
  fromRoot.getRouterState,
  (entities, router): Supplier => {
    return router.state && entities[router.state.params.id];
  },
);

export const getAllSuppliers = createSelector(
  getSuppliersEntities,
  entities => {
    return Object.keys(entities)
      .map(id => entities[parseInt(id, 10)])
      .sort((a, b) => b.id - a.id);
  },
);

export const getSuppliersCount = createSelector(
  getSuppliersState,
  fromSuppliers.getSuppliersCount,
);

export const getSuppliersLoading = createSelector(
  getSuppliersState,
  fromSuppliers.getSuppliersLoading,
);

export const getAccessorsList = createSelector(
  getSuppliersState,
  fromSuppliers.getAccessors,
);

export const getIsNeedGuardState = createSelector(
  getSuppliersState,
  fromSuppliers.getIsNeedGuard,
);
