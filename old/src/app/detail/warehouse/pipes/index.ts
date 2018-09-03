import { SupplierTypePipe } from './supplier-type/supplier-type.pipe';
import { PaymentMethodPipe } from './payment-method/payment-method.pipe';

export const pipes = [SupplierTypePipe, PaymentMethodPipe];

export * from './supplier-type/supplier-type.pipe';
export * from './payment-method/payment-method.pipe';
