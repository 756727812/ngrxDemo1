import { PurchaseListComponent } from './containers/purchase/purchase-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from '@shared/guards';
import * as fromContainers from './containers';
import * as fromGuards from './guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'goods',
  },
  {
    path: 'goods',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: fromContainers.WarehouseGoodsComponent,
      },
      {
        path: 'new',
        component: fromContainers.WarehouseGoodsItemComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          type: 'new',
        },
      },
      {
        path: ':id/edit',
        component: fromContainers.WarehouseGoodsItemComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          type: 'edit',
        },
      },
      {
        path: ':id',
        component: fromContainers.WarehouseGoodsItemComponent,
        data: {
          type: 'detail',
        },
      },
    ],
  },
  {
    path: 'purchaseOrder',
    children: [
      {
        path: '',
        component: fromContainers.PurchaseListComponent,
        pathMatch: 'full',
      },
      {
        path: 'new',
        canDeactivate: [CanDeactivateGuard],
        component: fromContainers.PurchaseOrderComponent,
        pathMatch: 'full',
      },
      {
        path: ':id/edit',
        component: fromContainers.PurchaseOrderComponent,
        data: {
          type: 'edit',
        },
        canDeactivate: [CanDeactivateGuard],
        pathMatch: 'full',
      },
      {
        path: ':id/copy',
        component: fromContainers.PurchaseOrderComponent,
        data: {
          type: 'copy',
        },
        canDeactivate: [CanDeactivateGuard],
        pathMatch: 'full',
      },
      {
        path: ':id/detail',
        component: fromContainers.PurchaseOrderDetailComponent,
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'warehouseOrder',
    children: [
      {
        path: '',
        component: fromContainers.WarehouseOrderListComponent,
        pathMatch: 'full',
      },
      {
        path: 'new/:purchaseOrderId',
        component: fromContainers.WarehouseOrderComponent,
        canDeactivate: [CanDeactivateGuard],
      },
      {
        path: 'new',
        component: fromContainers.WarehouseOrderComponent,
        canDeactivate: [CanDeactivateGuard],
      },
      {
        path: ':id/edit',
        component: fromContainers.WarehouseOrderComponent,
        pathMatch: 'full',
        canDeactivate: [CanDeactivateGuard],
        data: {
          type: 'edit',
        },
      },
      {
        path: ':id/detail',
        component: fromContainers.WarehouseOrderDetailComponent,
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'exWarehouseOrder',
    children: [
      {
        path: '',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'suppliers',
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [fromGuards.AccessorExistsGuard],
        component: fromContainers.SuppliersComponent,
      },
      {
        path: 'new',
        canActivate: [fromGuards.AccessorExistsGuard],
        canDeactivate: [CanDeactivateGuard],
        component: fromContainers.SupplierItemComponent,
        data: {
          type: 'new',
        },
      },
      {
        path: ':id/edit',
        canActivate: [
          fromGuards.SupplierExistsGuard,
          fromGuards.AccessorExistsGuard,
        ],
        canDeactivate: [CanDeactivateGuard],
        component: fromContainers.SupplierItemComponent,
        data: {
          type: 'edit',
        },
      },
      {
        path: ':id',
        canActivate: [fromGuards.SupplierExistsGuard],
        component: fromContainers.SupplierItemComponent,
        data: {
          type: 'detail',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehouseRoutingModule {}
