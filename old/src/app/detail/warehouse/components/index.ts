import { PurchaseOrderItemComponent } from './purchase-order-item/purchase-order-item.component';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';
import { AddPurchaseItemFormControlComponent } from './add-purchase-item-form-control/add-purchase-item-form-control.component';
import { ModalWarehouseItemListComponent } from './modal-warehouse-item-list/modal-warehouse-item-list.component';
import { AddPurchaseOrderFormControlComponent } from './add-purchase-order-form-control/add-purchase-order-form-control.component';
import { ModalPurchaseOrderListComponent } from './modal-purchase-order-list/modal-purchase-order-list.component';

export const components = [
  AddPurchaseItemFormControlComponent,
  AddPurchaseOrderFormControlComponent,
  ModalWarehouseItemListComponent,
  ModalPurchaseOrderListComponent,
  SupplierFormComponent,
  PurchaseOrderItemComponent
];

export * from './add-purchase-item-form-control/add-purchase-item-form-control.component';
export * from './add-purchase-order-form-control/add-purchase-order-form-control.component';
export * from './modal-warehouse-item-list/modal-warehouse-item-list.component';
export * from './modal-purchase-order-list/modal-purchase-order-list.component';
export * from './supplier-form/supplier-form.component';
export * from './purchase-order-item/purchase-order-item.component';
