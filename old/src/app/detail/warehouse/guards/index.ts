import { SupplierExistsGuard } from './supplier-exists.guard';
import { AccessorExistsGuard } from './accessors-exists.guard';

export const guards: any[] = [SupplierExistsGuard, AccessorExistsGuard];

export * from './supplier-exists.guard';
export * from './accessors-exists.guard';
