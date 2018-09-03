import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as fromContainers from './containers';
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'user-manage',
  },
  {
    path: 'user-manage',
    component: fromContainers.UserManagementComponent,
  },
  {
    path: 'financial',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'manage',
      },
      {
        path: 'manage',
        component: fromContainers.FinancialManagementComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuhaodianRoutingModule {}
