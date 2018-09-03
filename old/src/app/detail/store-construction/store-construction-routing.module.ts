import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditorComponent } from './containers';
import { CanDeactivateGuard } from '../../shared/guards';

export const routes: Routes = [
  {
    path: '',
    component: EditorComponent,
    pathMatch: 'full',
    canDeactivate: [CanDeactivateGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreConstructionRoutingModule {}
