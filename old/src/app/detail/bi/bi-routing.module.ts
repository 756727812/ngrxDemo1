import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  BiSummaryComponent,
  BiTradeComponent,
  BiGoodsComponent,
  BiAdminComponent,
} from './containers';
import { CanDeactivateGuard } from '../../shared/guards';

// BI 是我写过最糟糕的代码，原谅我 --zhenyong

export const routes: Routes = [
  {
    path: 'summary',
    component: BiSummaryComponent,
  },
  {
    path: 'trade',
    component: BiTradeComponent,
  },
  {
    path: 'goods',
    component: BiGoodsComponent,
  },
  {
    path: 'admin',
    component: BiAdminComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BiRoutingModule {}
