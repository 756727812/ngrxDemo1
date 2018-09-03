import { CNCurrencyPipe } from './currency/cn-currency.pipe';
import { CouponStatusPipe } from '@shared/pipes/coupon-status/coupon-status.pipe';
import { SeckillStatusPipe } from '@shared/pipes/seckill-status/seckill-status.pipe';
import { GrouponStatusPipe } from '@shared/pipes/groupon-status/groupon-status.pipe';
import { GrouponTypePipe } from '@shared/pipes/groupon-type/groupon-type.pipe';
import { ChineseNumberPipe } from '@shared/pipes/chinese-number/chinese-number.pipe';
import { CurStrPipe } from '@shared/pipes/cut-str.pipe';

export const pipes: any[] = [
  CNCurrencyPipe,
  CouponStatusPipe,
  SeckillStatusPipe,
  GrouponStatusPipe,
  GrouponTypePipe,
  ChineseNumberPipe,
  CurStrPipe,
];

export * from './currency/cn-currency.pipe';
export * from './coupon-status/coupon-status.pipe';
export * from './seckill-status/seckill-status.pipe';
export * from './groupon-status/groupon-status.pipe';
export * from './groupon-type/groupon-type.pipe';
export * from './chinese-number/chinese-number.pipe';
