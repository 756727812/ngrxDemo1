import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RulesCardsComponent, RulesInfoComponent } from './containers';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'rules-cards',
    pathMatch: 'full',
  },
  {
    path: 'rules-cards',
    component: RulesCardsComponent,
  },
  {
    path: 'rules-info/:ruleId',
    component: RulesInfoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutoOperationsRoutingModule {}
