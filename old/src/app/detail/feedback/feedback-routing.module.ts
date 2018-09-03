import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as fromContainers from './containers';
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'manage',
  },
  {
    path: 'manage',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: fromContainers.FeedbackManageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedbackRoutingModule {}
