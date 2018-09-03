import { WarehouseOrderService } from './warehouse-order.service';
import { WarehouseGoodsService } from './goods.service';
import { PurchaseService } from './purchase.service';
import { SupplierService } from './supplier.service';

export const services = [
  PurchaseService,
  WarehouseGoodsService,
  SupplierService,
  WarehouseOrderService
];

export * from './purchase.service';
export * from './goods.service';
export * from './supplier.service';
export * from './warehouse-order.service';
